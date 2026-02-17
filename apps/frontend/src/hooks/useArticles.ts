import { useEffect, useState, useCallback } from 'react';
import { fetchValidatedArticles } from '../services/articles.service';
import { Article } from '../types/article.types';

export const useArticles = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedArticles = await fetchValidatedArticles();
            setArticles(fetchedArticles);
            setError(null);
        } catch (_err) {
            setError('Failed to fetch articles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    return { articles, loading, error, fetchArticles };
};

export default useArticles;