import React, { useEffect, useState } from 'react';
import { Article } from '../../types/article.types';
import { fetchValidatedArticles, fetchPendingArticles, validateArticle, rejectArticle } from '../../services/articles.service';

const ArticleManagement: React.FC = () => {
    const [pendingArticles, setPendingArticles] = useState<Article[]>([]);
    const [validatedArticles, setValidatedArticles] = useState<Article[]>([]);

    useEffect(() => {
        const loadArticles = async () => {
            const pending = await fetchPendingArticles();
            const validated = await fetchValidatedArticles();
            setPendingArticles(pending);
            setValidatedArticles(validated);
        };

        loadArticles();
    }, []);

    const handleValidate = async (articleId: string) => {
        await validateArticle(articleId);
        setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
        setValidatedArticles([...validatedArticles, pendingArticles.find(article => article.id === articleId)!]);
    };

    const handleReject = async (articleId: string) => {
        await rejectArticle(articleId);
        setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
    };

    return (
        <div>
            <h1>Article Management</h1>
            <h2>Pending Articles</h2>
            <ul>
                {pendingArticles.map(article => (
                    <li key={article.id}>
                        {article.title}
                        <button onClick={() => handleValidate(article.id)}>Validate</button>
                        <button onClick={() => handleReject(article.id)}>Reject</button>
                    </li>
                ))}
            </ul>
            <h2>Validated Articles</h2>
            <ul>
                {validatedArticles.map(article => (
                    <li key={article.id}>{article.title}</li>
                ))}
            </ul>
        </div>
    );
};

export default ArticleManagement;