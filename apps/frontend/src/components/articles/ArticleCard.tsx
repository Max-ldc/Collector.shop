import React from 'react';
import { Article } from '../../types/article.types';

interface ArticleCardProps {
    article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    return (
        <div className="article-card">
            <h2>{article.title}</h2>
            <p>{article.content}</p>
            <span>Author ID: {article.authorId}</span>
            <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span>
        </div>
    );
};

export default ArticleCard;