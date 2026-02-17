import http from 'k6/http';
import { check, fail } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';

// ---------------------------------------------------------------------------
// Configuration – Variables d'environnement
// ---------------------------------------------------------------------------
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const KEYCLOAK_URL = __ENV.KEYCLOAK_URL || 'http://localhost:8080';
const KC_REALM = __ENV.KC_REALM || 'collector-realm';
const KC_CLIENT_ID = __ENV.KC_CLIENT_ID || 'collector-frontend';

const SELLER_USERNAME = __ENV.SELLER_USERNAME || 'seller';
const SELLER_PASSWORD = __ENV.SELLER_PASSWORD || 'seller';
const ADMIN_USERNAME = __ENV.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'afccesi_bloc3';

// ---------------------------------------------------------------------------
// Options – 1 VU, 1 itération (test fonctionnel, pas de charge)
// ---------------------------------------------------------------------------
export const options = {
    scenarios: {
        e2e_functional: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '2m',
        },
    },
    thresholds: {
        // Le test échoue (exit code 99) si un seul check ne passe pas
        checks: ['rate==1.00'],
    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Authentification Keycloak via Direct Access Grants (grant_type: password).
 * Retourne l'access_token ou null en cas d'échec.
 */
function authenticate(username, password) {
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KC_REALM}/protocol/openid-connect/token`;

    const res = http.post(
        tokenUrl,
        {
            grant_type: 'password',
            client_id: KC_CLIENT_ID,
            username,
            password,
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    );

    const ok = check(res, {
        [`Auth ${username} – status 200`]: (r) => r.status === 200,
        [`Auth ${username} – access_token present`]: (r) => {
            try { return !!r.json('access_token'); } catch { return false; }
        },
    });

    if (!ok) {
        console.error(`❌ Auth failed for "${username}": ${res.status} — ${res.body}`);
        return null;
    }

    console.log(`🔑 Token obtained for "${username}"`);
    return res.json('access_token');
}

/**
 * Supprime un article par son ID (nettoyage).
 * Tente avec le token seller, puis admin en fallback.
 */
function cleanupArticle(articleId, sellerToken, adminToken) {
    if (!articleId) return;

    console.log(`🧹 Cleanup: deleting article ${articleId}…`);

    // Essai avec le token admin d'abord
    let delRes = http.request('DELETE', `${BASE_URL}/articles/${articleId}`, null, {
        headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (delRes.status !== 200 && delRes.status !== 204) {
        // Fallback: essai avec le token seller
        console.warn(`   Admin delete returned ${delRes.status}, retrying as seller…`);
        delRes = http.request('DELETE', `${BASE_URL}/articles/${articleId}`, null, {
            headers: { Authorization: `Bearer ${sellerToken}` },
        });
    }

    if (delRes.status === 200 || delRes.status === 204) {
        console.log(`   ✅ Article ${articleId} deleted successfully.`);
    } else {
        console.error(`   ⚠️  Cleanup failed (status ${delRes.status}): ${delRes.body}`);
    }
}

// ---------------------------------------------------------------------------
// Setup – Authentification des deux utilisateurs
// ---------------------------------------------------------------------------
export function setup() {
    console.log('══════════════════════════════════════════════════════');
    console.log('  E2E Functional Test – Collector.shop');
    console.log(`  Backend : ${BASE_URL}`);
    console.log(`  Keycloak: ${KEYCLOAK_URL}`);
    console.log('══════════════════════════════════════════════════════\n');

    const sellerToken = authenticate(SELLER_USERNAME, SELLER_PASSWORD);
    const adminToken = authenticate(ADMIN_USERNAME, ADMIN_PASSWORD);

    if (!sellerToken || !adminToken) {
        fail('❌ Authentication failed — cannot proceed with E2E test');
    }

    return { sellerToken, adminToken };
}

// ---------------------------------------------------------------------------
// Scénario E2E – Parcours fonctionnel complet
// ---------------------------------------------------------------------------
export default function (data) {
    const { sellerToken, adminToken } = data;
    let articleId = null;

    try {
        // ──────────────────────────────────────────────────────
        // Step 1 : Créer un article (seller)
        // ──────────────────────────────────────────────────────
        console.log('\n📝 Step 1 — POST /articles (seller)');

        const uniqueTag = `e2e-${Date.now()}`;
        const payload = {
            title: `E2E Test Article ${uniqueTag}`,
            description: `Article créé automatiquement par le test E2E. Ref: ${uniqueTag}`,
            price: 42.99,
            category: 'Figurines',
        };

        const createRes = http.post(
            `${BASE_URL}/articles`,
            JSON.stringify(payload),
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${sellerToken}`,
                },
            },
        );

        const createOk = check(createRes, {
            'Step 1 – POST /articles → 201': (r) => r.status === 201,
            'Step 1 – id returned': (r) => { try { return !!r.json('id'); } catch { return false; } },
            'Step 1 – status is PENDING': (r) => { try { return r.json('status') === 'PENDING'; } catch { return false; } },
        });

        if (!createOk) {
            console.error(`   ❌ Creation failed: ${createRes.status} — ${createRes.body}`);
            return;
        }

        articleId = createRes.json('id');
        console.log(`   ✅ Article created: id=${articleId}`);

        // ──────────────────────────────────────────────────────
        // Step 2 : Vérifier dans /articles/pending (admin)
        // ──────────────────────────────────────────────────────
        console.log('\n🔍 Step 2 — GET /articles/pending (admin)');

        const pendingRes = http.get(`${BASE_URL}/articles/pending`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });

        check(pendingRes, {
            'Step 2 – GET /articles/pending → 200': (r) => r.status === 200,
            'Step 2 – article found in pending list': (r) => {
                try {
                    const articles = r.json();
                    return Array.isArray(articles) && articles.some((a) => a.id === articleId);
                } catch { return false; }
            },
        });

        // ──────────────────────────────────────────────────────
        // Step 3 : Valider l'article (admin)
        // ──────────────────────────────────────────────────────
        console.log('\n✔️  Step 3 — PATCH /articles/:id/validate (admin)');

        const validateRes = http.patch(
            `${BASE_URL}/articles/${articleId}/validate`,
            null,
            { headers: { Authorization: `Bearer ${adminToken}` } },
        );

        check(validateRes, {
            'Step 3 – PATCH /articles/:id/validate → 200': (r) => r.status === 200,
        });

        // ──────────────────────────────────────────────────────
        // Step 4 : Vérifier dans /articles (public)
        // ──────────────────────────────────────────────────────
        console.log('\n🌐 Step 4 — GET /articles (public)');

        const publicRes = http.get(`${BASE_URL}/articles`);

        check(publicRes, {
            'Step 4 – GET /articles → 200': (r) => r.status === 200,
            'Step 4 – article visible in public list': (r) => {
                try {
                    const articles = r.json();
                    return Array.isArray(articles) && articles.some((a) => a.id === articleId);
                } catch { return false; }
            },
        });

        // ──────────────────────────────────────────────────────
        // Step 5 : Supprimer l'article (admin — l'article validé
        //          peut nécessiter des droits admin pour le DELETE)
        // ──────────────────────────────────────────────────────
        console.log('\n🗑️  Step 5 — DELETE /articles/:id (admin)');

        const deleteUrl = `${BASE_URL}/articles/${articleId}`;
        console.log(`   → DELETE ${deleteUrl}`);

        // Tentative avec le token admin
        let deleteRes = http.request('DELETE', deleteUrl, null, {
            headers: {
                Authorization: `Bearer ${adminToken}`,
                Accept: 'application/json',
            },
        });

        // Fallback : réessai avec le token seller si le premier échoue
        if (deleteRes.status !== 200 && deleteRes.status !== 204) {
            console.warn(`   ⚠️  Admin DELETE returned ${deleteRes.status}, retrying with seller token…`);
            deleteRes = http.request('DELETE', deleteUrl, null, {
                headers: {
                    Authorization: `Bearer ${sellerToken}`,
                    Accept: 'application/json',
                },
            });
        }

        const deleteOk = check(deleteRes, {
            'Step 5 – DELETE /articles/:id → 200 or 204': (r) => r.status === 200 || r.status === 204,
        });

        if (!deleteOk) {
            console.error(`   ❌ DELETE failed: status=${deleteRes.status}`);
            console.error(`   ❌ Response body: ${deleteRes.body}`);
            console.error(`   ❌ Request URL was: ${deleteUrl}`);
            console.error(`   ℹ️  This is likely a backend routing issue — the deployed container may need redeployment.`);
        }

        // ──────────────────────────────────────────────────────
        // Step 6 : Vérifier la suppression (public)
        // ──────────────────────────────────────────────────────
        console.log('\n🔎 Step 6 — GET /articles (verify deletion)');

        const verifyRes = http.get(`${BASE_URL}/articles`);

        // Ne vérifier la suppression que si le DELETE a réussi
        if (deleteOk) {
            check(verifyRes, {
                'Step 6 – GET /articles → 200': (r) => r.status === 200,
                'Step 6 – article no longer in public list': (r) => {
                    try {
                        const articles = r.json();
                        return Array.isArray(articles) && !articles.some((a) => a.id === articleId);
                    } catch { return false; }
                },
            });
        } else {
            // DELETE a échoué — on vérifie juste que le GET fonctionne
            check(verifyRes, {
                'Step 6 – GET /articles → 200': (r) => r.status === 200,
            });
            console.warn('   ⚠️  Skipping deletion verification — DELETE endpoint returned an error.');
        }

        // Si on arrive ici, le nettoyage est déjà fait (step 5)
        articleId = null;

        console.log('\n🏁 E2E scenario completed successfully.');

    } finally {
        // Filet de sécurité : si le scénario échoue avant step 5,
        // on tente quand même de supprimer l'article créé
        if (articleId) {
            console.warn('\n⚠️  Scenario did not reach cleanup step — forcing deletion…');
            cleanupArticle(articleId, sellerToken, adminToken);
        }
    }
}

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------
export function teardown(_data) {
    console.log('\n══════════════════════════════════════════════════════');
    console.log('  E2E Test terminé. Vérifiez les artefacts ci-dessous.');
    console.log('══════════════════════════════════════════════════════');
}

// ---------------------------------------------------------------------------
// Rapport de résultats (artefacts CI/CD)
// ---------------------------------------------------------------------------
export function handleSummary(data) {
    // Construire un rapport lisible par étape
    const checks = data.metrics.checks;
    const passed = checks ? checks.values.passes : 0;
    const failed = checks ? checks.values.fails : 0;
    const total = passed + failed;

    const header = [
        '═══════════════════════════════════════════════════',
        '  E2E Functional Test Report — Collector.shop',
        `  Date    : ${new Date().toISOString()}`,
        `  Backend : ${BASE_URL}`,
        `  Result  : ${failed === 0 ? '✅ ALL PASSED' : '❌ FAILURES DETECTED'}`,
        `  Checks  : ${passed}/${total} passed`,
        '═══════════════════════════════════════════════════',
    ].join('\n');

    return {
        stdout: `\n${header}\n\n${textSummary(data, { indent: '  ', enableColors: true })}`,
        'e2e-results/report.txt': `${header}\n\n${textSummary(data, { indent: '  ', enableColors: false })}`,
        'e2e-results/report.json': JSON.stringify(data, null, 2),
    };
}
