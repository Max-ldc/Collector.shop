import React, { useEffect, useState } from 'react';
import { Article, ArticleStatus } from '../../types/article.types';
import { fetchValidatedArticles, fetchPendingArticles, validateArticle, rejectArticle } from '../../services/articles.service';

const AdminDashboard: React.FC = () => {
    const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
    const [validatedArticles, setValidatedArticles] = useState<Article[]>([]);

    useEffect(() => {
        const loadArticles = async () => {
            try {
                const pending = await fetchPendingArticles();
                const validated = await fetchValidatedArticles();
                setPendingArticles(pending);
                setValidatedArticles(validated);
            } catch (error) {
                console.error("Failed to load articles", error);
            }
        };

        loadArticles();
    }, []);

    const handleValidate = async (articleId: string) => {
        try {
            await validateArticle(articleId);
            const articleToMove = pendingArticles.find(article => article.id === articleId);
            if (articleToMove) {
                setValidatedArticles([...validatedArticles, { ...articleToMove, status: ArticleStatus.VALIDATED }]);
                setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
            }
        } catch (error) {
            console.error("Failed to validate article", error);
        }
    };

    const handleReject = async (articleId: string) => {
        try {
            await rejectArticle(articleId);
            setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
        } catch (error) {
            console.error("Failed to reject article", error);
        }
    };

    const styles = {
        container: {
            padding: '2rem',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        section: {
            marginBottom: '2rem',
            backgroundColor: '#fff',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        },
        sectionHeader: {
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
            color: '#333'
        },
        list: {
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem'
        },
        card: {
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
            ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
        },
        cardHeader: {
            marginBottom: '1rem'
        },
        title: {
            margin: '0 0 0.5rem 0',
            fontSize: '1.2rem',
            color: '#2c3e50'
        },
        price: {
            color: '#27ae60',
            fontWeight: 'bold',
            fontSize: '1.1rem'
        },
        description: {
            color: '#7f8c8d',
            fontSize: '0.9rem',
        },
        actions: {
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
        },
        btn: {
            flex: 1,
            padding: '0.75rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold' as const,
            transition: 'background-color 0.2s'
        },
        validateBtn: {
            backgroundColor: '#2ecc71',
            color: 'white'
        },
        rejectBtn: {
            backgroundColor: '#e74c3c',
            color: 'white'
        },
        emptyState: {
            color: '#95a5a6',
            fontStyle: 'italic',
            textAlign: 'center' as const,
            padding: '2rem'
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={{ color: '#2c3e50', marginBottom: '2rem' }}>Tableau de bord administrateur</h1>

            <div style={styles.section}>
                <h2 style={styles.sectionHeader}>Articles en attente</h2>
                {pendingArticles.length === 0 ? (
                    <p style={styles.emptyState}>Aucun article en attente de validation.</p>
                ) : (
                    <ul style={styles.list}>
                        {pendingArticles.map(article => (
                            <li key={article.id} style={styles.card}>
                                <div style={styles.cardHeader}>
                                    <h3 style={styles.title}>{article.title}</h3>
                                    <div style={styles.price}>{article.price} €</div>
                                    <p style={styles.description}>{article.description}</p>
                                    <small style={{ color: '#999' }}>Vendeur ID: {article.sellerId}</small>
                                </div>
                                <div style={styles.actions}>
                                    <button
                                        style={{ ...styles.btn, ...styles.validateBtn }}
                                        onClick={() => handleValidate(article.id)}
                                    >
                                        Valider
                                    </button>
                                    <button
                                        style={{ ...styles.btn, ...styles.rejectBtn }}
                                        onClick={() => handleReject(article.id)}
                                    >
                                        Rejeter
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionHeader}>Articles validés</h2>
                {validatedArticles.length === 0 ? (
                    <p style={styles.emptyState}>Aucun article validé pour le moment.</p>
                ) : (
                    <ul style={styles.list}>
                        {validatedArticles.map(article => (
                            <li key={article.id} style={styles.card}>
                                <div>
                                    <h3 style={styles.title}>{article.title}</h3>
                                    <div style={styles.price}>{article.price} €</div>
                                    <p style={styles.description}>{article.description}</p>
                                </div>
                                <div style={{ marginTop: '1rem', color: '#27ae60', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ marginRight: '0.5rem' }}>✓</span> Validé
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;