const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { get, run, query } = require('../db');

// Получение всех глав книги
router.get('/books/:bookId/chapters', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const chapters = await query(
      'SELECT * FROM chapters WHERE book_id = ? ORDER BY order_index ASC',
      [bookId]
    );
    
    res.json({
      success: true,
      chapters: chapters
    });
    
  } catch (error) {
    console.error('Ошибка получения глав:', error);
    res.status(500).json({
      success: false,
      error: 'Внутренняя ошибка сервера'
    });
  }
});

// Создание новой главы
router.post('/books/:bookId/chapters', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    const { bookId } = req.params;
    const { title, content = '' } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Название главы обязательно'
      });
    }
    
    // Проверяем, что книга принадлежит пользователю
    const book = await get(
      'SELECT id FROM books WHERE id = ? AND author_id = ?',
      [bookId, decoded.userId]
    );
    
    if (!book) {
      return res.status(403).json({
        success: false,
        error: 'У вас нет прав для добавления глав в эту книгу'
      });
    }
    
    // Получаем порядковый номер для новой главы
    const lastChapter = await get(
      'SELECT MAX(order_index) as max_order FROM chapters WHERE book_id = ?',
      [bookId]
    );
    
    const orderIndex = (lastChapter.max_order || 0) + 1;
    const wordCount = content.trim().split(/\s+/).length;
    
    const result = await run(
      `INSERT INTO chapters (book_id, title, content, order_index, word_count)
       VALUES (?, ?, ?, ?, ?)`,
      [bookId, title, content, orderIndex, wordCount]
    );
    
    const newChapter = await get(
      'SELECT * FROM chapters WHERE id = ?',
      [result.id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Глава создана успешно',
      chapter: newChapter
    });
    
  } catch (error) {
    console.error('Ошибка создания главы:', error);
    
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

// Обновление главы
router.put('/chapters/:chapterId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    const { chapterId } = req.params;
    const { title, content } = req.body;
    
    // Проверяем права на главу (через book -> author)
    const chapterWithBook = await get(`
      SELECT c.*, b.author_id 
      FROM chapters c
      JOIN books b ON c.book_id = b.id
      WHERE c.id = ?
    `, [chapterId]);
    
    if (!chapterWithBook) {
      return res.status(404).json({
        success: false,
        error: 'Глава не найдена'
      });
    }
    
    if (chapterWithBook.author_id !== decoded.userId) {
      return res.status(403).json({
        success: false,
        error: 'У вас нет прав для редактирования этой главы'
      });
    }
    
    const wordCount = content ? content.trim().split(/\s+/).length : chapterWithBook.word_count;
    
    await run(
      `UPDATE chapters 
       SET title = COALESCE(?, title),
           content = COALESCE(?, content),
           word_count = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, content, wordCount, chapterId]
    );
    
    const updatedChapter = await get(
      'SELECT * FROM chapters WHERE id = ?',
      [chapterId]
    );
    
    res.json({
      success: true,
      message: 'Глава обновлена успешно',
      chapter: updatedChapter
    });
    
  } catch (error) {
    console.error('Ошибка обновления главы:', error);
    
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

// Удаление главы
router.delete('/chapters/:chapterId', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    const { chapterId } = req.params;
    
    // Проверяем права
    const chapterWithBook = await get(`
      SELECT c.*, b.author_id 
      FROM chapters c
      JOIN books b ON c.book_id = b.id
      WHERE c.id = ?
    `, [chapterId]);
    
    if (!chapterWithBook) {
      return res.status(404).json({
        success: false,
        error: 'Глава не найдена'
      });
    }
    
    if (chapterWithBook.author_id !== decoded.userId) {
      return res.status(403).json({
        success: false,
        error: 'У вас нет прав для удаления этой главы'
      });
    }
    
    await run('DELETE FROM chapters WHERE id = ?', [chapterId]);
    
    // Обновляем порядок оставшихся глав
    await run(`
      UPDATE chapters 
      SET order_index = order_index - 1 
      WHERE book_id = ? AND order_index > ?
    `, [chapterWithBook.book_id, chapterWithBook.order_index]);
    
    res.json({
      success: true,
      message: 'Глава удалена успешно'
    });
    
  } catch (error) {
    console.error('Ошибка удаления главы:', error);
    
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

// Обновление порядка глав
router.put('/books/:bookId/chapters/reorder', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    const { bookId } = req.params;
    const { chapters } = req.body;
    
    if (!chapters || !Array.isArray(chapters)) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат данных'
      });
    }
    
    // Проверяем права на книгу
    const book = await get(
      'SELECT id FROM books WHERE id = ? AND author_id = ?',
      [bookId, decoded.userId]
    );
    
    if (!book) {
      return res.status(403).json({
        success: false,
        error: 'У вас нет прав для редактирования этой книги'
      });
    }
    
    // Обновляем порядок каждой главы
    for (const chapter of chapters) {
      await run(
        'UPDATE chapters SET order_index = ? WHERE id = ? AND book_id = ?',
        [chapter.order_index, chapter.id, bookId]
      );
    }
    
    res.json({
      success: true,
      message: 'Порядок глав обновлен'
    });
    
  } catch (error) {
    console.error('Ошибка обновления порядка глав:', error);
    
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

module.exports = router;