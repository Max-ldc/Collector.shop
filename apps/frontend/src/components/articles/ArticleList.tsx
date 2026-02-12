import React, { useEffect } from 'react';
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
        <div>
            <h1>Validated Articles</h1>
            <div className="article-list">
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </div>
    );
};

export default ArticleList;