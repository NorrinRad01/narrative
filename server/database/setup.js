const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

// Создаем папку database если нет
const dbDir = path.join(__dirname, '..', 'database')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const dbPath = path.join(dbDir, 'narrative.db')
const db = new sqlite3.Database(dbPath)

// Создаем таблицы
db.serialize(() => {
  console.log('🔄 Создаем таблицы...')
  
  // Таблица пользователей
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      bio TEXT DEFAULT '',
      avatar_url TEXT,
      subscribers_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Таблица книг
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      genre TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      cover_url TEXT,
      word_count INTEGER DEFAULT 0,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      is_18plus BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `)
  
  // Таблица постов (лента)
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER,
      content TEXT NOT NULL,
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE SET NULL
    )
  `)
  
  console.log('✅ Таблицы созданы!')
  
  // Создаем тестового пользователя
  const bcrypt = require('bcryptjs')
  const salt = bcrypt.genSaltSync(10)
  const testPassword = bcrypt.hashSync('password123', salt)
  
  db.run(`
    INSERT OR IGNORE INTO users (username, email, password_hash, name, bio)
    VALUES (?, ?, ?, ?, ?)
  `, ['author_test', 'author@narrative.com', testPassword, 'Тестовый Автор', 'Люблю писать книги!'])
  
  console.log('👤 Тестовый пользователь создан:')
  console.log('📧 Email: author@narrative.com')
  console.log('🔑 Пароль: password123')
  
  // Создаем тестовую книгу
  db.run(`
    INSERT OR IGNORE INTO books (author_id, title, description, genre, status)
    VALUES (?, ?, ?, ?, ?)
  `, [1, 'Тень Империи', 'Эпическая сага о магии и приключениях', 'Фэнтези', 'published'])
  
  console.log('📚 Тестовая книга создана: "Тень Империи"')
})

db.close((err) => {
  if (err) {
    console.error('❌ Ошибка закрытия БД:', err)
  } else {
    console.log('✅ База данных настроена!')
    console.log(`📁 Файл БД: ${dbPath}`)
  }
})