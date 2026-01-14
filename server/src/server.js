const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { get, run, query } = require('./db');

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Логирование всех запросов для отладки
app.use((req, res, next) => {
  console.log(`🌐 ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы (для загруженных обложек)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Создана папка uploads:', uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Импорт роутов
console.log('📂 Текущая директория:', __dirname);
const chaptersRouter = require('./routes/chapters');
const uploadsRouter = require('./routes/uploads');

// ==================== ОСНОВНЫЕ ENDPOINTS ====================

// Простой health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Narrative API работает!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Информация о API
app.get('/api', (req, res) => {
  res.json({
    name: 'Narrative API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      books: {
        getAll: 'GET /api/books',
        getMyBooks: 'GET /api/my-books',
        create: 'POST /api/books',
        getOne: 'GET /api/books/:id',
        update: 'PUT /api/books/:id',
        delete: 'DELETE /api/books/:id'
      },
      uploads: {
        uploadCover: 'POST /api/upload/cover'
      }
    }
  });
});

// ==================== АВТОРИЗАЦИЯ ====================

// Вход
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
    
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Неверный пароль'
      });
    }
    
    const { password_hash, ...userWithoutPassword } = user;
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'narrative_secret_key_2024',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Авторизация успешна',
      user: userWithoutPassword,
      token: token
    });
    
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username, name } = req.body;
  
  console.log('📝 Попытка регистрации:', { email, username });
  
  if (!email || !password || !username) {
    return res.status(400).json({
      success: false,
      error: 'Email, пароль и имя пользователя обязательны'
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Некорректный email'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Пароль должен содержать минимум 6 символов'
    });
  }
  
  try {
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
    
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    
    const result = await run(
      `INSERT INTO users (email, username, password_hash, name, bio) 
       VALUES (?, ?, ?, ?, ?)`,
      [email, username, passwordHash, name || username, 'Новый автор на Narrative']
    );
    
    const newUser = await get(
      'SELECT id, email, username, name, bio, avatar_url, subscribers_count, created_at FROM users WHERE id = ?',
      [result.id]
    );
    
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'narrative_secret_key_2024',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Регистрация успешна!',
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

// Профиль пользователя
app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    
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

// ==================== КНИГИ ====================

// Все книги (публичные)
app.get('/api/books', async (req, res) => {
  try {
    const books = await query(`
      SELECT 
        b.*,
        u.username as author_username,
        u.name as author_name
      FROM books b
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.status = 'published'
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

// Мои книги (только авторизованного пользователя)
app.get('/api/my-books', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    
    console.log('📚 Получение книг для пользователя ID:', decoded.userId);
    
    // Получаем книги пользователя
    const books = await query(`
      SELECT b.*
      FROM books b
      WHERE b.author_id = ?
      ORDER BY b.created_at DESC
    `, [decoded.userId]);
    
    console.log(`✅ Найдено ${books.length} книг`);
    
    // Добавляем количество глав для каждой книги
    const booksWithChapters = await Promise.all(books.map(async (book) => {
      const chapterResult = await get(
        'SELECT COUNT(*) as count FROM chapters WHERE book_id = ?',
        [book.id]
      );
      
      return {
        ...book,
        chapter_count: chapterResult?.count || 0
      };
    }));
    
    res.json({
      success: true,
      count: booksWithChapters.length,
      books: booksWithChapters
    });
    
  } catch (error) {
    console.error('Ошибка получения моих книг:', error);
    
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

// Создание книги
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
    
    console.log('📘 Создание книги:', { title, genre, status });
    
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
    
    console.log('✅ Книга создана с ID:', newBook.id);
    
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

// Получение одной книги
app.get('/api/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    
    const book = await get(`
      SELECT 
        b.*,
        u.username as author_username,
        u.name as author_name
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
    
    res.json({
      success: true,
      book: book
    });
    
  } catch (error) {
    console.error('Ошибка получения книги:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Обновление книги
app.put('/api/books/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    const bookId = req.params.id;
    const { title, description, genre, status, cover_url } = req.body;
    
    console.log('📝 Обновление книги ID:', bookId);
    
    // Проверяем права
    const book = await get(
      'SELECT id FROM books WHERE id = ? AND author_id = ?',
      [bookId, decoded.userId]
    );
    
    if (!book) {
      return res.status(403).json({
        success: false,
        error: 'Нет прав на редактирование этой книги'
      });
    }
    
    if (!title || !genre) {
      return res.status(400).json({
        success: false,
        error: 'Название и жанр обязательны'
      });
    }
    
    await run(
      `UPDATE books 
       SET title = ?,
           description = ?,
           genre = ?,
           status = ?,
           cover_url = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description || '', genre, status || 'draft', cover_url || null, bookId]
    );
    
    const updatedBook = await get(
      'SELECT * FROM books WHERE id = ?',
      [bookId]
    );
    
    res.json({
      success: true,
      message: 'Книга обновлена успешно!',
      book: updatedBook
    });
    
  } catch (error) {
    console.error('Ошибка обновления книги:', error);
    
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

// Удаление книги
app.delete('/api/books/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    const bookId = req.params.id;
    
    console.log('🗑️  Удаление книги ID:', bookId);
    
    // Проверяем права
    const book = await get(
      'SELECT id FROM books WHERE id = ? AND author_id = ?',
      [bookId, decoded.userId]
    );
    
    if (!book) {
      return res.status(403).json({
        success: false,
        error: 'Нет прав на удаление этой книги'
      });
    }
    
    // Удаляем сначала главы (если есть каскадное удаление)
    await run('DELETE FROM chapters WHERE book_id = ?', [bookId]);
    
    // Удаляем книгу
    await run('DELETE FROM books WHERE id = ?', [bookId]);
    
    res.json({
      success: true,
      message: 'Книга удалена успешно'
    });
    
  } catch (error) {
    console.error('Ошибка удаления книги:', error);
    
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

// ==================== ДЕБАГ И ТЕСТ ====================

// Простой тестовый endpoint
app.get('/api/debug/books', async (req, res) => {
  try {
    console.log('🛠️  Тестовый запрос на получение книг');
    
    const books = await query(`
      SELECT id, title, genre, status, author_id, cover_url
      FROM books 
      ORDER BY id DESC
      LIMIT 10
    `);
    
    res.json({
      success: true,
      message: 'Тестовый запрос работает',
      books: books,
      count: books.length
    });
    
  } catch (error) {
    console.error('❌ Ошибка тестового запроса:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Тестовый endpoint для создания книги без авторизации
app.post('/api/debug/create-book', async (req, res) => {
  try {
    const { title, description, genre, author_id = 1 } = req.body;
    
    console.log('🛠️  Тестовое создание книги:', { title, author_id });
    
    if (!title || !genre) {
      return res.status(400).json({
        success: false,
        error: 'Название и жанр обязательны'
      });
    }
    
    const result = await run(
      `INSERT INTO books (author_id, title, description, genre, status) 
       VALUES (?, ?, ?, ?, 'draft')`,
      [author_id, title, description || '', genre]
    );
    
    const newBook = await get(
      'SELECT * FROM books WHERE id = ?',
      [result.id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Тестовая книга создана',
      book: newBook
    });
    
  } catch (error) {
    console.error('❌ Ошибка тестового создания книги:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Подключаем роуты глав и загрузок
app.use('/api', chaptersRouter);
app.use('/api', uploadsRouter);

// 404 обработчик
app.use((req, res) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
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
  console.log('='.repeat(60));
  console.log(`🚀  Сервер Narrative запущен на порту ${PORT}`);
  console.log(`📍  http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('📝  Основные эндпоинты:');
  console.log('   ✅  GET    /api/health           - Проверка сервера');
  console.log('   ✅  GET    /api/debug/books      - Тест книг');
  console.log('   🔐  POST   /api/auth/login       - Вход');
  console.log('   📝  POST   /api/auth/register    - Регистрация');
  console.log('   📚  GET    /api/my-books         - Мои книги');
  console.log('   📖  POST   /api/books            - Создать книгу');
  console.log('   🖼️   POST   /api/upload/cover     - Загрузить обложку');
  console.log('='.repeat(60));
  console.log('🔄  Логи сервера...');
});