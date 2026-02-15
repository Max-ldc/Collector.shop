import React from 'react';
import { Article } from '../../types/article.types';

interface ArticleCardProps {
    article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    const cardStyle: React.CSSProperties = {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
    };

    const headerStyle: React.CSSProperties = {
        padding: '1.2rem',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#f8f9fa'
    };

    const bodyStyle: React.CSSProperties = {
        padding: '1.2rem',
        flex: 1
    };

    const footerStyle: React.CSSProperties = {
        padding: '1rem 1.2rem',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        color: '#6c757d'
    };

    const titleStyle: React.CSSProperties = {
        margin: '0',
        fontSize: '1.25rem',
        color: '#34495e',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const priceStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#27ae60',
        margin: '0.5rem 0 0 0'
    };

    const categoryStyle: React.CSSProperties = {
        display: 'inline-block',
        padding: '0.25rem 0.5rem',
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        borderRadius: '4px',
        fontSize: '0.8rem',
        marginBottom: '0.5rem'
    };

    return (
        <div
            style={cardStyle}
            className="article-card"
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
            }}
        >
            <div style={headerStyle}>
                <h2 style={titleStyle} title={article.title}>{article.title}</h2>
                <p style={priceStyle}>{article.price} €</p>
            </div>
            <div style={bodyStyle}>
                <span style={categoryStyle}>{article.category}</span>
                <p style={{ color: '#555', lineHeight: '1.5' }}>{article.description}</p>
            </div>
            <div style={footerStyle}>
                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    );
};

export default ArticleCard;