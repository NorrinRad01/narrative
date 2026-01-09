const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  constructor() {
    this.baseURL = API_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Добавляем токен если есть
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      try {
        const data = await response.json();
        return data;
      } catch {
        return { message: await response.text() };
      }
      
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Проверка здоровья API
  async checkHealth() {
    return this.request('/health');
  }

  // Авторизация
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Регистрация
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Книги
  async getBooks() {
    return this.request('/books');
  }

  async createBook(bookData) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  }

  async getBook(id) {
    return this.request(`/books/${id}`);
  }

  // Пользователи
  async getUser(id) {
    return this.request(`/users/${id}`);
  }

  async getProfile() {
    return this.request('/auth/profile');
  }
}

export const api = new ApiClient();