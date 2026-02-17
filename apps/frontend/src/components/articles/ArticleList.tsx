import React from 'react';
import { useArticles } from '../../hooks/useArticles';
import ArticleCard from './ArticleCard';

const ArticleList: React.FC = () => {
    const { articles, loading, error } = useArticles();

    if (loading) {
        return <div>Loading articles...</div>;
    }

    if (error) {
        return <div>Error loading articles: {error}</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ color: '#2c3e50', marginBottom: '2rem', textAlign: 'center' }}>Articles en vente</h1>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem'
            }}>
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
};

export default ArticleList;