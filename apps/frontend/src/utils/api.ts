import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Function to handle API responses
const handleResponse = (response) => {
    return response.data;
};

// Function to handle errors
const handleError = (error) => {
    if (error.response) {
        throw new Error(error.response.data.message || 'An error occurred');
    } else {
        throw new Error('Network error');
    }
};

// GET request
export const get = async (url) => {
    try {
        const response = await apiClient.get(url);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};

// POST request
export const post = async (url, data) => {
    try {
        const response = await apiClient.post(url, data);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};

// PUT request
export const put = async (url, data) => {
    try {
        const response = await apiClient.put(url, data);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};

// DELETE request
export const del = async (url) => {
    try {
        const response = await apiClient.delete(url);
        return handleResponse(response);
    } catch (error) {
        handleError(error);
    }
};