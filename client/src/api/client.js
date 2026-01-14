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

  // Главы
  async getBookChapters(bookId) {
    return this.request(`/books/${bookId}/chapters`);
  }

  async createChapter(bookId, chapterData) {
    return this.request(`/books/${bookId}/chapters`, {
      method: 'POST',
      body: JSON.stringify(chapterData),
    });
  }

  async updateChapter(chapterId, chapterData) {
    return this.request(`/chapters/${chapterId}`, {
      method: 'PUT',
      body: JSON.stringify(chapterData),
    });
  }

  async deleteChapter(chapterId) {
    return this.request(`/chapters/${chapterId}`, {
      method: 'DELETE',
    });
  }

  async reorderChapters(bookId, chapters) {
    return this.request(`/books/${bookId}/chapters/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ chapters }),
    });
  }

  // Загрузка файлов
  async uploadCover(file) {
    const formData = new FormData();
    formData.append('cover', file);
    
    const token = localStorage.getItem('token');
    
    return fetch(`${this.baseURL}/upload/cover`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Не устанавливаем Content-Type, FormData сделает это сам
      },
      body: formData,
    })
    .then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error('Upload Error:', error);
      throw error;
    });
  }
  async updateBook(id, bookData) {
  return this.request(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(bookData),
  });
}

async deleteBook(id) {
  return this.request(`/books/${id}`, {
    method: 'DELETE',
  });
}

async getBookCounts() {
  const books = await this.getBooks();
  return {
    all: books.length,
    drafts: books.filter(b => b.status === 'draft').length,
    published: books.filter(b => b.status === 'published').length,
    archived: books.filter(b => b.status === 'archived').length
  };
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