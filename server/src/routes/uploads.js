const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

// Создаем папку для загрузок если нет
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Создана папка uploads:', uploadsDir);
}

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'cover-' + uniqueSuffix + ext);
  }
});

// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения (jpeg, jpg, png, webp, gif)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB максимум
  fileFilter: fileFilter
});

// Загрузка обложки книги
router.post('/upload/cover', upload.single('cover'), async (req, res) => {
  try {
    console.log('📤 Запрос на загрузку обложки');
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // Удаляем загруженный файл если нет авторизации
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({
        success: false,
        error: 'Требуется авторизация'
      });
    }
    
    // Проверяем токен (но не требую строгой проверки для теста)
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'narrative_secret_key_2024');
    } catch (jwtError) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Файл не был загружен'
      });
    }
    
    console.log('✅ Файл загружен:', req.file.filename);
    
    // Формируем URL для доступа к файлу
    const fileUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Обложка успешно загружена',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: fileUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка загрузки файла:', error);
    
    // Удаляем файл при ошибке
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Недействительный токен'
      });
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Размер файла не должен превышать 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Ошибка загрузки файла: ' + error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Ошибка при загрузке файла'
    });
  }
});

// Статическое обслуживание файлов
router.use('/uploads', express.static(uploadsDir));

module.exports = router;