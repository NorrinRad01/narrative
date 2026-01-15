import { useState, useRef } from 'react'
import { 
  X, Book, Type, FileText, Tag, Image as ImageIcon, 
  Eye, Heart, MessageSquare, Bookmark, Sparkles,
  Clock, User, Award, Star, ChevronRight,
  Upload, Trash2, Loader, CheckCircle
} from 'lucide-react'

// Компонент Preview карточки
function BookPreview({ formData, genres, coverPreview, status }) {
  const genreLabel = genres.find(g => g.value === formData.genre)?.label || "Фэнтези"
  
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
      {/* Верхняя часть с автором */}
      <div className="p-6 pb-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-70"></div>
              <div className="relative h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl border-2 border-white shadow-md">
                <User className="h-6 w-6" />
              </div>
            </div>
            <div className="ml-3">
              <h4 className="font-bold text-gray-900">Тестовый Автор</h4>
              <p className="text-sm text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Только что</span>
                <span className="mx-2">•</span>
                <span className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full flex items-center">
                  <Award className="h-3 w-3 mr-1" />
                  Автор
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 text-amber-500">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="text-sm font-bold ml-1">5.0</span>
            </div>
            <p className="text-xs text-gray-500">⭐ 4.8 рейтинг</p>
          </div>
        </div>
      </div>
      
      {/* Контент книги */}
      <div className="p-6 pt-4">
        <div className="flex items-start space-x-6 mb-4">
          {/* Обложка */}
          <div className={`w-32 h-48 rounded-xl shadow-lg flex flex-col items-center justify-center p-4 overflow-hidden ${
            coverPreview 
              ? '' 
              : 'bg-gradient-to-br from-blue-100 to-purple-100'
          }`}>
            {coverPreview ? (
              <img 
                src={coverPreview} 
                alt="Обложка книги" 
                className="w-full h-full object-cover"
              />
            ) : formData.title ? (
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 line-clamp-3">
                  {formData.title}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  {genreLabel}
                </div>
              </div>
            ) : (
              <>
                <Book className="h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Обложка книги
                </p>
              </>
            )}
          </div>
          
          {/* Информация о книге */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                {formData.title || "Название книги"}
              </h3>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full whitespace-nowrap">
                {genreLabel}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mb-3">
              <span className="text-gray-600 flex items-center">
                <Sparkles className="h-4 w-4 mr-1" />
                Новинка
              </span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">12+</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-600">0 глав</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700 leading-relaxed">
                {formData.description || "Описание книги появится здесь. Расскажите читателям, о чём ваша история и почему её стоит прочитать..."}
              </p>
              {!formData.description && (
                <p className="text-sm text-gray-500 mt-2 italic">
                  ✏️ Начните вводить описание слева
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Статистика */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">0</div>
            <div className="text-xs text-gray-600">Глав</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">0</div>
            <div className="text-xs text-gray-600">Лайков</div>
          </div>
          <div className="text-center p-3 bg-pink-50 rounded-lg">
            <div className="text-lg font-bold text-pink-600">0</div>
            <div className="text-xs text-gray-600">Комментариев</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">0</div>
            <div className="text-xs text-gray-600">Прочитали</div>
          </div>
        </div>
        
        {/* Действия */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
              <Heart className="h-5 w-5" />
              <span className="font-medium">0</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">0</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
              <Bookmark className="h-5 w-5" />
              <span className="font-medium">0</span>
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center">
              Читать
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
        
        {/* Статус публикации */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Статус:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              status === 'published' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {status === 'published' ? '📢 Опубликовано' : '📝 Черновик'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Мобильный Preview (упрощённый)
function BookPreviewMobile({ formData, genres, coverPreview, status }) {
  const genreLabel = genres.find(g => g.value === formData.genre)?.label || "Фэнтези"
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mt-6">
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold mr-2">
          ТА
        </div>
        <div>
          <p className="font-medium text-sm">Тестовый Автор</p>
          <p className="text-xs text-gray-500">Только что</p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3 mb-3">
        {coverPreview && (
          <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              src={coverPreview} 
              alt="Обложка" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">
            {formData.title || "Название книги"}
          </h3>
          
          <div className="flex items-center mb-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded mr-2">
              {genreLabel}
            </span>
            <span className="text-xs text-gray-500">
              {status === 'published' ? '📢' : '📝'}
            </span>
          </div>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-3">
        {formData.description || "Описание появится здесь..."}
      </p>
    </div>
  )
}

// Основной компонент модалки
export default function CreateBookModal({ isOpen, onClose, onBookCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: 'fantasy',
    status: 'draft'
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [coverPreview, setCoverPreview] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const genres = [
    { value: 'fantasy', label: 'Фэнтези' },
    { value: 'scifi', label: 'Научная фантастика' },
    { value: 'detective', label: 'Детектив' },
    { value: 'romance', label: 'Романтика' },
    { value: 'horror', label: 'Ужасы' },
    { value: 'adventure', label: 'Приключения' },
    { value: 'drama', label: 'Драма' },
    { value: 'mystery', label: 'Мистика' }
  ]

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Проверка типа файла
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      alert('Пожалуйста, выберите изображение (JPEG, PNG, WebP или GIF)')
      return
    }
    
    // Проверка размера (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }
    
    // Создаем preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setCoverPreview(e.target.result)
    }
    reader.readAsDataURL(file)
    
    setCoverFile(file)
  }

  const handleUploadCover = async () => {
    if (!coverFile) {
      console.log('Нет файла для загрузки');
      return null;
    }
    
    setUploading(true);
    setError('');
    
    try {
      console.log('📤 Начинаем загрузку файла:', coverFile.name);
      console.log('📊 Размер файла:', coverFile.size);
      console.log('📄 Тип файла:', coverFile.type);
      
      const formData = new FormData();
      formData.append('cover', coverFile);
      
      // Добавляем токен если есть
      const token = localStorage.getItem('token');
      console.log('🔑 Токен:', token ? 'Есть' : 'Нет');
      
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('🌐 Отправляем запрос на http://localhost:3001/api/upload/cover');
      
      const response = await fetch('http://localhost:3001/api/upload/cover', {
        method: 'POST',
        headers: headers,
        body: formData
      });
      
      console.log('📥 Ответ сервера:', response.status);
      console.log('📥 Статус:', response.statusText);
      
      const result = await response.json();
      console.log('📦 Результат:', result);
      
      if (!response.ok) {
        throw new Error(result.error || `Ошибка загрузки: ${response.status}`);
      }
      
      // Извлекаем URL из разных форматов ответа
      let coverUrl = '';
      if (result.url) {
        coverUrl = result.url; // Полный URL
      } else if (result.file && result.file.url) {
        coverUrl = result.file.url;
      } else if (result.relativeUrl) {
        coverUrl = `http://localhost:3001${result.relativeUrl}`;
      } else if (result.filename) {
        coverUrl = `http://localhost:3001/uploads/${result.filename}`;
      }
      
      console.log('✅ Обложка загружена, URL:', coverUrl);
      
      return coverUrl;
      
    } catch (err) {
      console.error('❌ Ошибка загрузки обложки:', err);
      console.error('❌ Stack:', err.stack);
      alert(`Не удалось загрузить обложку: ${err.message}\n\nКнига будет создана без обложки.`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📘 Начинаем создание книги...');
    
    if (!formData.title.trim()) {
      setError('Название книги обязательно');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let cover_url = null;
      
      // 1. Загружаем обложку если есть
      if (coverFile) {
        console.log('🖼️  Начинаем загрузку обложки...');
        const uploadedCover = await handleUploadCover();
        console.log('📥 Результат загрузки обложки:', uploadedCover);
        if (uploadedCover) {
          cover_url = uploadedCover;
        }
      } else {
        console.log('📭 Обложка не выбрана, пропускаем загрузку');
      }
      
      // 2. Подготавливаем данные для сервера
      const bookData = {
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        genre: formData.genre,
        status: formData.status,
        cover_url: cover_url || ''
      };
      
      console.log('📦 Отправляем данные книги:', bookData);
      
      // 3. Отправляем на сервер
      const token = localStorage.getItem('token');
      console.log('🔑 Токен для создания книги:', token ? 'Есть' : 'Нет');
      
      const response = await fetch('http://localhost:3001/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(bookData)
      });
      
      const responseText = await response.text();
      console.log('📨 Ответ сервера на создание книги:');
      console.log('📨 Статус:', response.status);
      console.log('📨 Текст:', responseText);
      
      if (!response.ok) {
        throw new Error(`Ошибка создания книги: ${response.status} - ${responseText}`);
      }
      
      // 4. УСПЕШНОЕ СОЗДАНИЕ - обрабатываем результат
      try {
        const result = JSON.parse(responseText);
        console.log('✅ Книга успешно создана:', result);
        
        // Показываем успех
        setSuccess('Книга успешно создана!');
        
        // Обновляем список книг через 1 секунду
        setTimeout(() => {
          if (onBookCreated) {
            onBookCreated();
          }
          onClose(); // Закрываем модалку
          
          // Очищаем форму
          setFormData({
            title: '',
            description: '',
            genre: 'fantasy',
            status: 'draft'
          });
          setCoverPreview(null);
          setCoverFile(null);
        }, 1000);
        
      } catch (parseError) {
        console.warn('Не удалось распарсить ответ:', parseError);
        setSuccess('Книга успешно создана!');
        
        setTimeout(() => {
          if (onBookCreated) {
            onBookCreated();
          }
          onClose();
          
          // Очищаем форму
          setFormData({
            title: '',
            description: '',
            genre: 'fantasy',
            status: 'draft'
          });
          setCoverPreview(null);
          setCoverFile(null);
        }, 1000);
      }
      
    } catch (err) {
      console.error('❌ Ошибка создания книги:', err);
      setError(err.message || 'Ошибка при создании книги');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Book className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Создать новую книгу</h2>
              <p className="text-gray-600">Заполните информацию и посмотрите, как книга будет выглядеть в ленте</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading || uploading}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Основной контент */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(95vh-5rem)]">
          {/* Левая колонка - форма */}
          <div className="p-8 overflow-y-auto border-r border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Сообщение об успехе */}
              {success && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 text-green-700 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="font-medium">{success}</span>
                  </div>
                </div>
              )}
              
              {/* Название */}
              <div>
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-3">
                  <Type className="h-5 w-5 text-blue-500" />
                  <span>Название книги *</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Введите название вашей книги..."
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-xl font-medium transition-all"
                  disabled={loading || uploading}
                />
                <p className="mt-2 text-sm text-gray-500 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Придумайте запоминающееся название, которое привлечет читателей
                </p>
              </div>

              {/* Жанр */}
              <div>
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-3">
                  <Tag className="h-5 w-5 text-purple-500" />
                  <span>Жанр *</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {genres.map((genre) => (
                    <button
                      key={genre.value}
                      type="button"
                      onClick={() => setFormData({...formData, genre: genre.value})}
                      className={`px-4 py-4 rounded-xl border-2 text-center transition-all duration-300 ${
                        formData.genre === genre.value
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02] border-transparent'
                          : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                      }`}
                      disabled={loading || uploading}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Выберите основной жанр вашей истории
                </p>
              </div>

              {/* Описание */}
              <div>
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-3">
                  <FileText className="h-5 w-5 text-green-500" />
                  <span>Описание книги</span>
                </label>
                <div className="relative">
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Опишите вашу книгу... Что ждет читателей? О чем эта история? Какие эмоции она вызовет?"
                    rows={6}
                    className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-green-500/30 focus:border-green-500 outline-none resize-none transition-all"
                    disabled={loading || uploading}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {formData.description.length}/2000
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Хорошее описание поможет привлечь больше читателей. Расскажите о сюжете, персонажах, атмосфере.
                </p>
              </div>

              {/* Статус */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Статус публикации
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${formData.status === 'draft' 
                      ? 'border-blue-500 bg-blue-50 shadow-inner' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    <input
                      type="radio"
                      checked={formData.status === 'draft'}
                      onChange={() => setFormData({...formData, status: 'draft'})}
                      className="sr-only"
                      disabled={loading || uploading}
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        formData.status === 'draft' 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-400'
                      }`}>
                        {formData.status === 'draft' && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Черновик</div>
                        <div className="text-sm text-gray-500">Виден только вам</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`
                    relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${formData.status === 'published' 
                      ? 'border-green-500 bg-green-50 shadow-inner' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${(loading || uploading) ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    <input
                      type="radio"
                      checked={formData.status === 'published'}
                      onChange={() => setFormData({...formData, status: 'published'})}
                      className="sr-only"
                      disabled={loading || uploading}
                    />
                    <div className="flex items-center space-x-3">
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        formData.status === 'published' 
                          ? 'border-green-500 bg-green-500' 
                          : 'border-gray-400'
                      }`}>
                        {formData.status === 'published' && (
                          <div className="h-2 w-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">Опубликовать</div>
                        <div className="text-sm text-gray-500">Будет видно всем</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Обложка */}
              <div>
                <label className="flex items-center space-x-2 text-lg font-semibold text-gray-800 mb-3">
                  <ImageIcon className="h-5 w-5 text-pink-500" />
                  <span>Обложка книги</span>
                  {uploading && (
                    <span className="text-sm text-blue-500 flex items-center">
                      <Loader className="h-4 w-4 animate-spin mr-1" />
                      Загрузка...
                    </span>
                  )}
                </label>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={loading || uploading}
                />
                
                <div 
                  onClick={() => !uploading && !loading && fileInputRef.current?.click()}
                  className={`
                    border-3 border-dashed rounded-2xl p-8 text-center 
                    transition-all duration-300
                    ${uploading || loading 
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    }
                  `}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600">Загрузка обложки...</p>
                    </div>
                  ) : coverPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="w-40 h-56 mx-auto mb-4 rounded-xl shadow-lg overflow-hidden">
                        <img 
                          src={coverPreview} 
                          alt="Preview обложки" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCoverPreview(null)
                            setCoverFile(null)
                          }}
                          className="px-4 py-2 bg-red-100 text-red-600 font-medium rounded-lg hover:bg-red-200 flex items-center"
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Удалить
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                          className="px-4 py-2 bg-blue-100 text-blue-600 font-medium rounded-lg hover:bg-blue-200 flex items-center"
                          disabled={loading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Изменить
                        </button>
                      </div>
                      <p className="mt-3 text-sm text-gray-500">
                        Нажмите чтобы изменить обложку
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-40 h-56 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl shadow-lg flex flex-col items-center justify-center p-6 mb-4">
                        {formData.title ? (
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-800 line-clamp-4">
                              {formData.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-3">
                              {genres.find(g => g.value === formData.genre)?.label || "Фэнтези"}
                            </div>
                          </div>
                        ) : (
                          <>
                            <ImageIcon className="h-16 w-16 text-gray-400" />
                            <p className="text-gray-500 mt-4">Обложка книги</p>
                          </>
                        )}
                      </div>
                      <button 
                        type="button"
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300 flex items-center mx-auto"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Загрузить обложку
                      </button>
                      <p className="mt-3 text-sm text-gray-500">
                        Рекомендуется: 800×1200px, JPG, PNG или WebP (макс. 5MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Ошибка */}
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center mr-3">
                      !
                    </div>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Кнопки */}
              <div className="flex justify-between space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors flex-1"
                  disabled={loading || uploading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || uploading || !formData.title.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl font-semibold transition-all duration-300 flex-1 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || uploading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Создание...</span>
                    </>
                  ) : (
                    <>
                      <Book className="h-5 w-5" />
                      <span>Создать книгу</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {/* Мобильный Preview (под формой) */}
            <div className="lg:hidden mt-8">
              <BookPreviewMobile 
                formData={formData} 
                genres={genres} 
                coverPreview={coverPreview}
                status={formData.status}
              />
            </div>
          </div>

          {/* Правая колонка - Preview (только на десктопе) */}
          <div className="hidden lg:block p-8 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            <div className="sticky top-0">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-500" />
                  Предпросмотр в ленте
                </h3>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Обновляется в реальном времени
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4 p-4 bg-blue-50 rounded-xl">
                <p className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                  Это как будет выглядеть ваша книга в ленте для читателей
                </p>
              </div>
              
              <BookPreview 
                formData={formData} 
                genres={genres} 
                coverPreview={coverPreview}
                status={formData.status}
              />
              
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  💡 Советы по созданию
                </h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Название должно быть запоминающимся и отражать суть истории</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Описание — это ваша визитная карточка, напишите его интересно</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Выберите правильный жанр, чтобы книга нашла свою аудиторию</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Красивая обложка увеличивает шансы, что книгу заметят</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}