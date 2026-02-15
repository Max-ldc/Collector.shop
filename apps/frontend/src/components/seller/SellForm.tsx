import React, { useState } from 'react';
import { articlesService } from '../../services/articles.service';
import './SellForm.css';

const SellForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (title.length < 5) {
            setError('Le titre doit contenir au moins 5 caractères.');
            return;
        }

        if (!title || !description || !price || !category) {
            setError('Tous les champs sont obligatoires.');
            return;
        }

        try {
            await articlesService.submitArticle({
                title,
                description,
                price: Number(price),
                category,
            });
            setSuccess('Article soumis avec succès !');
            setTitle('');
            setDescription('');
            setPrice('');
            setCategory('');
        } catch (err: any) {
            console.error(err);
            setError('Échec lors de la soumission de l\'article. Veuillez réessayer.');
        }
    };

    return (
        <div className="sell-form-container">
            <form onSubmit={handleSubmit}>
                <h2>Vendre un article</h2>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <div className="form-group">
                    <label htmlFor="title">Titre :</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Titre de votre article"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Catégorie :</label>
                    <input
                        type="text"
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        placeholder="Ex: Électronique, Vêtements, etc."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="price">Prix (€) :</label>
                    <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description :</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        placeholder="Décrivez votre article en détail..."
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Soumettre l'article
                </button>
            </form>
        </div>
    );
};

export default SellForm;