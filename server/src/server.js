const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path'); // ДОБАВИЛИ
const { get, run, query } = require('./db');

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (для загруженных обложек)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Импорт роутов
console.log(__dirname);
const chaptersRouter = require('./routes/chapters');
const uploadsRouter = require('./routes/uploads');

// Простые маршруты для теста
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Narrative API работает!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    database: 'SQLite'
  });
});

// Информация о API
app.get('/api', (req, res) => {
  res.json({
    name: 'Narrative API',
    version: '1.0.0',
    description: 'API для социальной сети авторов',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      books: {
        getAll: 'GET /api/books',
        create: 'POST /api/books',
        getOne: 'GET /api/books/:id'
      },
      chapters: {
        getChapters: 'GET /api/books/:id/chapters',
        createChapter: 'POST /api/books/:id/chapters',
        updateChapter: 'PUT /api/chapters/:id',
        deleteChapter: 'DELETE /api/chapters/:id',
        reorderChapters: 'PUT /api/books/:id/chapters/reorder'
      },
      uploads: {
        uploadCover: 'POST /api/upload/cover'
      },
      users: {
        getOne: 'GET /api/users/:id'
      },
      health: 'GET /api/health'
    }
  });
});

// РЕАЛЬНАЯ АВТОРИЗАЦИЯ - ВХОД
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Попытка входа:', { email });
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email и пароль обязательны'
    });
  }
  
  try {
    // Ищем пользователя в базе данных
    const user = await get(
      'SELECT id, email, username, name, password_hash, bio, avatar_url, subscribers_count, created_at FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    // Проверяем пароль
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Неверный пароль'
      });
    }
    
    // Удаляем пароль из объекта пользователя
    const { password_hash, ...userWithoutPassword } = user;
    
    // Создаем JWT токен
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'narrative_secret_key_2024',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Авторизация успешна',
      user: userWithoutPassword,
      token: token,
      expiresIn: 604800 // 7 дней в секундах
    });
    
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// РЕАЛЬНАЯ РЕГИСТРАЦИЯ
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username, name } = req.body;
  
  console.log('📝 Попытка регистрации:', { email, username });
  
  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      error: 'Email, пароль и имя пользователя обязательны'
    });
  }
  
  // Валидация email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Некорректный email'
    });
  }
  
  // Валидация пароля
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Пароль должен содержать минимум 6 символов'
    });
  }
  
  try {
    // Проверяем, нет ли уже такого пользователя
    const existingUser = await get(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Пользователь с таким email или именем уже существует'
      });
    }
    
    // Хэшируем пароль
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    
    // Создаем пользователя
    const result = await run(
      `INSERT INTO users (email, username, password_hash, name, bio) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, username, passwordHash, name || username, 'Новый автор на Narrative']
    );
    
    // Получаем созданного пользователя
    const newUser = await get(
      'SELECT id, email, username, name, bio, avatar_url, subscribers_count, created_at FROM users WHERE id = ?',
      [result.id]
    );
    
    // Создаем токен
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'narrative_secret_key_2024',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Регистрация успешна! Добро пожаловать в Narrative!',
      user: newUser,
      token: token
    });
    
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// ПОЛУЧЕНИЕ ПРОФИЛЯ ПОЛЬЗОВАТЕЛЯ
app.get('/api/auth/profile', async (req, res) => {
  try {
    // Получаем токен из заголовка
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    // Проверяем токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    
    // Получаем пользователя
    const user = await get(
      'SELECT id, email, username, name, bio, avatar_url, subscribers_count, created_at FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    res.json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// ПОЛУЧЕНИЕ ВСЕХ КНИГ
app.get('/api/books', async (req, res) => {
  try {
    const books = await query(`
      SELECT 
        b.*,
        u.username as author_username,
        u.name as author_name
      FROM books b
      LEFT JOIN users u ON b.author_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      count: books.length,
      books: books
    });
    
  } catch (error) {
    console.error('Ошибка получения книг:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// СОЗДАНИЕ НОВОЙ КНИГИ (С ОБЛОЖКОЙ)
app.post('/api/books', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    const { title, description, genre, status = 'draft', cover_url } = req.body;
    
    if (!title || !genre) {
      return res.status(400).json({
        success: false,
        error: 'Название и жанр обязательны'
      });
    }
    
    const result = await run(
      `INSERT INTO books (author_id, title, description, genre, status, cover_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [decoded.userId, title, description || '', genre, status, cover_url || null]
    );
    
    const newBook = await get(
      'SELECT * FROM books WHERE id = ?',
      [result.id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Книга создана успешно!',
      book: newBook
    });
    
  } catch (error) {
    console.error('Ошибка создания книги:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// ПОЛУЧЕНИЕ ОДНОЙ КНИГИ (С ГЛАВАМИ)
app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    
    const book = await get(`
      SELECT 
        b.*,
        u.username as author_username,
        u.name as author_name,
        u.bio as author_bio
      FROM books b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.id = ?
    `, [bookId]);
    
    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Книга не найдена'
      });
    }
    
    // Получаем главы книги
    const chapters = await query(
      'SELECT * FROM chapters WHERE book_id = ? ORDER BY order_index ASC',
      [bookId]
    );
    
    res.json({
      success: true,
      book: book,
      chapters: chapters
    });
    
  } catch (error) {
    console.error('Ошибка получения книги:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// ПОЛУЧЕНИЕ ИНФОРМАЦИИ О ПОЛЬЗОВАТЕЛЕ
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await get(
      'SELECT id, username, name, bio, avatar_url, subscribers_count, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    // Получаем книги пользователя
    const userBooks = await query(
      'SELECT id, title, description, genre, status, cover_url, likes_count, created_at FROM books WHERE author_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({
      success: true,
      user: user,
      books: userBooks,
      booksCount: userBooks.length
    });
    
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Подключаем роуты глав и загрузок
app.use('/api', chaptersRouter);
app.use('/api', uploadsRouter);

// 404 обработчик
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Маршрут не найден',
    path: req.path,
    method: req.method,
    suggestion: 'Проверьте /api для списка доступных маршрутов'
  });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error('❌ Ошибка сервера:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀  Сервер Narrative запущен!`);
  console.log(`📍  Локальный:  http://localhost:${PORT}`);
  console.log(`📚  API:        http://localhost:${PORT}/api`);
  console.log(`🏥  Health:     http://localhost:${PORT}/api/health`);
  console.log(`📁  Uploads:    http://localhost:${PORT}/uploads`);
  console.log('='.repeat(50));
  console.log('📝  Доступные эндпоинты:');
  console.log('   🔐  POST   /api/auth/login          - Вход');
  console.log('   📝  POST   /api/auth/register       - Регистрация');
  console.log('   👤  GET    /api/auth/profile        - Профиль');
  console.log('   📚  GET    /api/books               - Все книги');
  console.log('   📖  POST   /api/books               - Создать книгу');
  console.log('   📖  GET    /api/books/:id           - Книга с главами');
  console.log('   📖  GET    /api/books/:id/chapters  - Главы книги');
  console.log('   📝  POST   /api/books/:id/chapters  - Создать главу');
  console.log('   🖼️   POST   /api/upload/cover        - Загрузить обложку');
  console.log('   👥  GET    /api/users/:id           - Профиль пользователя');
  console.log('='.repeat(50));
  console.log('🔄  Логи сервера будут отображаться ниже...');
});