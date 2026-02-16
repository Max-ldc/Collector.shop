import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { SharedArray } from 'k6/data';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// ---------------------------------------------------------------------------
// Configuration – Variables d'environnement
// ---------------------------------------------------------------------------
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const KEYCLOAK_URL = __ENV.KEYCLOAK_URL || 'http://localhost:8080';
const KC_REALM = __ENV.KC_REALM || 'collector';
const KC_CLIENT_ID = __ENV.KC_CLIENT_ID || 'collector-frontend';
const KC_USERNAME = __ENV.KC_USERNAME || 'seller';
const KC_PASSWORD = __ENV.KC_PASSWORD || 'seller';

// ---------------------------------------------------------------------------
// Thresholds & Scénario de charge (SLO)
// ---------------------------------------------------------------------------
export const options = {
    stages: [
        { duration: '30s', target: 50 },   // Ramp-up  : 0 → 50 VUs en 30s
        { duration: '2m', target: 50 },   // Plateau  : 50 VUs pendant 2 min
        { duration: '20s', target: 0 },   // Ramp-down: 30 → 0 VUs en 20s
    ],
    thresholds: {
        // SLO 1 – 95% des requêtes POST /articles sous 500ms
        'http_req_duration{type:create_article}': ['p(95)<500'],
        // SLO 2 – Moins de 1% d'erreurs HTTP
        'http_req_failed': ['rate<0.01'],
    },
};

// ---------------------------------------------------------------------------
// Données aléatoires pour le payload dynamique
// ---------------------------------------------------------------------------
const categories = [
    'Figurines', 'Cartes', 'Vinyles', 'BD', 'Comics',
    'Timbres', 'Montres', 'Pièces', 'Jouets', 'Art',
];

const adjectives = [
    'Rare', 'Vintage', 'Collector', 'Édition Limitée', 'Authentique',
    'Ancien', 'Mint Condition', 'Sealed', 'Premium', 'Exclusive',
];

const nouns = [
    'Batman #1', 'Pokémon Dracaufeu', 'Vinyle Abbey Road',
    'Figurine Star Wars', 'Timbre Napoléon', 'Montre Omega',
    'Pièce Louis XIV', 'Jouet Playmobil', 'Litho Banksy',
    'Carte Magic', 'Manga Akira Vol.1', 'Médaille Olympique',
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateArticlePayload() {
    const uniqueId = `${Date.now()}-${randomIntBetween(1000, 99999)}`;
    return {
        title: `${randomItem(adjectives)} ${randomItem(nouns)} #${uniqueId}`,
        description: `Article de collection unique généré pour le test de charge. Ref: ${uniqueId}. Cet objet est en excellent état et provient d'une collection privée.`,
        price: parseFloat((Math.random() * 990 + 10).toFixed(2)), // 10.00 – 1000.00
        category: randomItem(categories),
    };
}

// ---------------------------------------------------------------------------
// Phase d'authentification (setup – exécutée une seule fois par VU)
// ---------------------------------------------------------------------------
export function setup() {
    const tokenUrl = `${KEYCLOAK_URL}/realms/${KC_REALM}/protocol/openid-connect/token`;

    const res = http.post(tokenUrl, {
        grant_type: 'password',
        client_id: KC_CLIENT_ID,
        username: KC_USERNAME,
        password: KC_PASSWORD,
    }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const success = check(res, {
        'Keycloak auth – status 200': (r) => r.status === 200,
        'Keycloak auth – access_token present': (r) => {
            try { return !!r.json('access_token'); } catch { return false; }
        },
    });

    if (!success) {
        console.error(`❌ Authentification Keycloak échouée (status ${res.status})`);
        console.error(`   Response body: ${res.body}`);
        fail('Impossible de récupérer un access token Keycloak');
    }

    const body = res.json();
    console.log(`✅ Token obtenu pour "${KC_USERNAME}" (expire dans ${body.expires_in}s)`);

    return {
        accessToken: body.access_token,
        refreshToken: body.refresh_token,
    };
}

// ---------------------------------------------------------------------------
// Scénario principal – POST /articles
// ---------------------------------------------------------------------------
export default function (data) {
    const payload = generateArticlePayload();

    const params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.accessToken}`,
        },
        tags: { type: 'create_article' },  // tag pour le threshold ciblé
    };

    const res = http.post(`${BASE_URL}/articles`, JSON.stringify(payload), params);

    check(res, {
        'POST /articles – status 201': (r) => r.status === 201,
        'POST /articles – id retourné': (r) => {
            try { return !!r.json('id'); } catch { return false; }
        },
    });

    // Simule un temps de réflexion réaliste entre requêtes (1-3s)
    sleep(randomIntBetween(1, 3));
}

// ---------------------------------------------------------------------------
// Teardown (optionnel – résumé post-test)
// ---------------------------------------------------------------------------
export function teardown(data) {
    console.log('🏁 Test de charge terminé.');
    console.log('   Vérifiez les métriques Grafana / Prometheus pour l\'analyse complète.');
}
