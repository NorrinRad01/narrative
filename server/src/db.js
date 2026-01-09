const sqlite3 = require('sqlite3').verbose()
const path = require('path')

let db = null

function getDB() {
  if (db) return db
  
  const dbPath = path.join(__dirname, '..', 'database', 'narrative.db')
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Ошибка подключения к БД:', err)
    } else {
      console.log('✅ Подключено к SQLite базе данных')
      // Включаем поддержку foreign keys
      db.run('PRAGMA foreign_keys = ON')
    }
  })
  
  return db
}

// Функция для выполнения SQL запросов
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDB()
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// Функция для выполнения одной операции (INSERT, UPDATE, DELETE)
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDB()
    database.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve({ id: this.lastID, changes: this.changes })
      }
    })
  })
}

// Функция для получения одной записи
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDB()
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

module.exports = {
  getDB,
  query,
  run,
  get
}