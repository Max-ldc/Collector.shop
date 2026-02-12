import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { articlesService } from '../../services/articles.service';

const SellForm: React.FC = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title || !content) {
            setError('Title and content are required.');
            return;
        }

        try {
            await articlesService.createArticle({
                title,
                content,
                status: 'pending',
                authorId: user?.id,
            });
            setSuccess('Article submitted successfully!');
            setTitle('');
            setContent('');
        } catch (err) {
            setError('Failed to submit article. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Sell Your Article</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            <div>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>
            <div>
                <label htmlFor="content">Content:</label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Submit Article</button>
        </form>
    );
};

export default SellForm;