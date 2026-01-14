const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'database', 'narrative.db');
console.log('📂 Проверяем базу данных:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Ошибка подключения к БД:', err);
    process.exit(1);
  }
  
  console.log('✅ Подключено к SQLite базе данных');
  
  // Проверяем таблицы
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Ошибка получения таблиц:', err);
      return;
    }
    
    console.log('\n📋 Таблицы в базе данных:');
    console.log('='.repeat(50));
    tables.forEach(table => console.log(`  - ${table.name}`));
    console.log('='.repeat(50));
    
    // Проверяем каждую таблицу
    checkTable('users');
    checkTable('books');
    checkTable('chapters');
  });
});

function checkTable(tableName) {
  db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
    if (err) {
      console.log(`\n❌ Таблица ${tableName} не существует или ошибка:`);
      console.log('  ' + err.message);
      
      // Если таблицы нет, создаем её
      if (err.message.includes('no such table')) {
        createTable(tableName);
      }
      return;
    }
    
    console.log(`\n📊 Структура таблицы ${tableName}:`);
    console.log('-'.repeat(50));
    columns.forEach(col => {
      console.log(`  ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Показываем сколько записей
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, result) => {
      if (!err) {
        console.log(`  📈 Записей: ${result.count}`);
      }
    });
  });
}

function createTable(tableName) {
  console.log(`\n🔧 Создаем таблицу ${tableName}...`);
  
  const tables = {
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        bio TEXT,
        avatar_url TEXT,
        subscribers_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `,
    books: `
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        genre TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        cover_url TEXT,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `,
    chapters: `
      CREATE TABLE IF NOT EXISTS chapters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        order_index INTEGER NOT NULL,
        word_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
      )
    `
  };
  
  if (tables[tableName]) {
    db.run(tables[tableName], (err) => {
      if (err) {
        console.error(`❌ Ошибка создания таблицы ${tableName}:`, err.message);
      } else {
        console.log(`✅ Таблица ${tableName} создана`);
        
        // Если это таблица users, создаем тестового пользователя
        if (tableName === 'users') {
          createTestUser();
        }
      }
    });
  } else {
    console.log(`❌ Неизвестная таблица: ${tableName}`);
  }
}

function createTestUser() {
  console.log('\n👤 Создаем тестового пользователя...');
  const bcrypt = require('bcryptjs');
  const passwordHash = bcrypt.hashSync('test123', 10);
  
  db.run(
    `INSERT INTO users (email, username, password_hash, name, bio, subscribers_count) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    ['test@example.com', 'testauthor', passwordHash, 'Тестовый Автор', 'Автор тестовых книг', 1200],
    function(err) {
      if (err) {
        console.error('❌ Ошибка создания тестового пользователя:', err.message);
      } else {
        console.log(`✅ Тестовый пользователь создан с ID: ${this.lastID}`);
        createTestBooks(this.lastID);
      }
    }
  );
}

function createTestBooks(userId) {
  console.log('\n📚 Создаем тестовые книги...');
  
  const testBooks = [
    {
      title: 'Моя первая книга',
      description: 'Это тестовая книга для демонстрации',
      genre: 'Фэнтези',
      status: 'draft'
    },
    {
      title: 'Приключения в мире магии',
      description: 'Фэнтези роман о юном волшебнике',
      genre: 'Фэнтези',
      status: 'published'
    },
    {
      title: 'Любовь под звездами',
      description: 'Романтическая история',
      genre: 'Романтика',
      status: 'published'
    }
  ];
  
  let created = 0;
  testBooks.forEach((book, index) => {
    db.run(
      `INSERT INTO books (author_id, title, description, genre, status, created_at) 
       VALUES (?, ?, ?, ?, ?, datetime('now', ?))`,
      [userId, book.title, book.description, book.genre, book.status, `-${index} days`],
      function(err) {
        if (err) {
          console.error(`❌ Ошибка создания книги "${book.title}":`, err.message);
        } else {
          console.log(`✅ Книга "${book.title}" создана с ID: ${this.lastID}`);
        }
        
        created++;
        if (created === testBooks.length) {
          console.log('\n🎉 Проверка базы данных завершена!');
          console.log('🔄 Перезапустите сервер и попробуйте снова.');
          db.close();
        }
      }
    );
  });
}