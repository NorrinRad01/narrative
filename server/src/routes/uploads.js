const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Папка для загрузок
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
console.log('📁 Папка для загрузок:', uploadsDir);

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'cover-' + uniqueName + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения (jpeg, jpg, png, webp, gif)'));
    }
  }
});

// Загрузка обложки
router.post('/upload/cover', upload.single('cover'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    const fullUrl = `http://localhost:3001${fileUrl}`;
    
    console.log('✅ Файл загружен:', req.file.filename);
    
    res.json({
      success: true,
      url: fullUrl,
      filename: req.file.filename
    });
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

module.exports = router;