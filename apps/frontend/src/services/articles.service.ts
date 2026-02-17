import axios from 'axios';
import { Article } from '../types/article.types';
import keycloak from '../keycloak';

// Modifié pour utiliser l'URL de base de l'environnement ou se rabattre sur le local
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_URL}/articles`;

// Add interceptor to include token in requests
axios.interceptors.request.use(async config => {
  if (keycloak.authenticated) {
    try {
      await keycloak.updateToken(30); // Refresh token if it expires in < 30s
      if (keycloak.token) {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
      }
    } catch (error) {
      console.error('Failed to refresh token', error);
      keycloak.login();
    }
  }
  return config;
});

export const fetchValidatedArticles = async (): Promise<Article[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const submitArticle = async (article: Partial<Article>): Promise<Article> => {
  const response = await axios.post(API_URL, article);
  return response.data;
};

export const fetchPendingArticles = async (): Promise<Article[]> => {
  const response = await axios.get(`${API_URL}/pending`);
  return response.data;
};


export const validateArticle = async (articleId: string): Promise<Article> => {
  const response = await axios.patch(`${API_URL}/${articleId}/validate`);
  return response.data;
};

export const rejectArticle = async (articleId: string): Promise<void> => {
  await axios.delete(`${API_URL}/${articleId}`);
};

export const articlesService = {
  fetchValidatedArticles,
  submitArticle,
  fetchPendingArticles,
  validateArticle,
  rejectArticle,
};

export default articlesService;