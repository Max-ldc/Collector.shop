import axios from 'axios';
import { Article } from '../types/article.types';

// Modifié pour utiliser l'URL de base de l'environnement ou se rabattre sur le local
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_URL}/articles`;

export const fetchValidatedArticles = async (): Promise<Article[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const submitArticle = async (article: Article): Promise<Article> => {
  const response = await axios.post(API_URL, article);
  return response.data;
};

export const fetchPendingArticles = async (): Promise<Article[]> => {
  const response = await axios.get(`${API_URL}/pending`);
  return response.data;
};


export const validateArticle = async (articleId: string): Promise<Article> => {
  const response = await axios.put(`${API_URL}/validate/${articleId}`);
  return response.data;
};

export const rejectArticle = async (articleId: string): Promise<Article> => {
  const response = await axios.delete(`${API_URL}/reject/${articleId}`);
  return response.data;
};

export const articlesService = {
  fetchValidatedArticles,
  submitArticle,
  fetchPendingArticles,
  validateArticle,
  rejectArticle,
};

export default articlesService;