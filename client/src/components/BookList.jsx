import { useState, useEffect } from 'react';
import { Calendar, BookOpen, Loader, Edit, Trash2, Eye, EyeOff, RefreshCw, AlertCircle } from 'lucide-react';

export default function BookList({ filter = 'all', onBookUpdate }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deletedBookIds, setDeletedBookIds] = useState(
    JSON.parse(localStorage.getItem('deletedBookIds') || '[]')
  );

  // Функция для преобразования данных сервера
  const transformServerData = (book) => {
    if (!book) return null;
    
    return {
      id: book.id,
      title: book.title || 'Без названия',
      description: book.description || '',
      genre: book.genre || '',
      status: book.status || 'draft',
      coverUrl: book.cover_url || '',
      createdAt: book.created_at || new Date().toISOString(),
      updatedAt: book.updated_at || new Date().toISOString(),
      chapterCount: book.chapter_count || 0,
      likes: book.likes_count || 0,
      authorId: book.author_id || 1,
      author_name: book.author_name || 'Автор'
    };
  };

  // Полное удаление книги из всех мест
  const completelyDeleteBook = async (bookId, bookTitle) => {
    console.log('🔴 Начинаем полное удаление книги:', bookId, bookTitle);
    
    try {
      // 1. Добавляем в список удаленных
      const newDeletedIds = [...deletedBookIds, bookId];
      setDeletedBookIds(newDeletedIds);
      localStorage.setItem('deletedBookIds', JSON.stringify(newDeletedIds));
      
      // 2. Удаляем из локального состояния React
      setBooks(prev => prev.filter(book => book.id !== bookId));
      
      // 3. Удаляем из localStorage myBooks
      const localBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
      const updatedLocalBooks = localBooks.filter(book => book.id !== bookId);
      localStorage.setItem('myBooks', JSON.stringify(updatedLocalBooks));
      
      // 4. Удаляем из ленты
      const feedData = JSON.parse(localStorage.getItem('bookFeed') || '[]');
      const updatedFeed = feedData.filter(item => 
        item.type !== 'book' || item.bookId !== bookId
      );
      localStorage.setItem('bookFeed', JSON.stringify(updatedFeed));
      
      // 5. Пробуем удалить на сервере
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const deleteResponse = await fetch(`http://localhost:3001/api/books/${bookId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (deleteResponse.ok) {
            console.log('✅ Книга удалена на сервере через DELETE');
          } else {
            console.log('DELETE не сработал, пробуем изменить статус');
            
            const updateResponse = await fetch(`http://localhost:3001/api/books/${bookId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                status: 'deleted',
                is_deleted: true 
              })
            });
            
            if (updateResponse.ok) {
              console.log('✅ Статус книги изменен на deleted');
            }
          }
        } catch (serverError) {
          console.warn('⚠️ Не удалось удалить на сервере:', serverError);
          const pendingDeletes = JSON.parse(localStorage.getItem('pendingDeletes') || '[]');
          localStorage.setItem('pendingDeletes', JSON.stringify([...pendingDeletes, bookId]));
        }
      }
      
      // 6. Отправляем событие для обновления ленты
      window.dispatchEvent(new CustomEvent('bookDeleted', { 
        detail: { bookId, bookTitle } 
      }));
      
      console.log('✅ Удаление завершено для книги:', bookTitle);
      return true;
      
    } catch (error) {
      console.error('❌ Ошибка при удалении книги:', error);
      return false;
    }
  };

  // Проверяем, не удалена ли книга
  const isBookDeleted = (bookId) => {
    return deletedBookIds.includes(bookId);
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📚 Начинаем загрузку книг...');
      
      const token = localStorage.getItem('token');
      console.log('🔑 Токен в localStorage:', token ? `Есть (${token.length} символов)` : 'Нет');
      
      let url = 'http://localhost:3001/api/books';
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // ВСЕГДА используем /api/my-books если есть токен (чтобы видеть черновики)
      if (token) {
        console.log('👤 Загружаем книги пользователя через /api/my-books');
        url = 'http://localhost:3001/api/my-books';
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('🌐 Запрос к:', url);
      console.log('📋 Заголовки:', JSON.stringify(headers, null, 2));
      
      const response = await fetch(url, { headers });
      
      console.log('📥 Ответ сервера:', response.status, response.statusText);
      
      // Подробная отладка при ошибке 401
      if (response.status === 401) {
        console.error('❌ ОШИБКА 401 - Проблемы с авторизацией');
        console.error('❌ Токен, который отправили:', token);
        
        // Пробуем получить текст ошибки
        const errorText = await response.text();
        console.error('❌ Текст ошибки от сервера:', errorText);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка HTTP:', errorText);
        
        // Если 401, пробуем публичный endpoint
        if (response.status === 401) {
          console.log('⚠️ 401, пробуем публичные книги');
          const publicResponse = await fetch('http://localhost:3001/api/books');
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            processBooksData(publicData);
            return;
          }
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
      
      const data = await response.json();
      console.log('📦 Получены данные:', data);
      
      processBooksData(data);
      
    } catch (err) {
      console.error('❌ Ошибка загрузки книг:', err);
      setError(`Не удалось загрузить книги: ${err.message}`);
      
      // Fallback данные
      const fallbackBooks = [
        {
          id: 1,
          title: 'Пример книги',
          description: 'Тестовая книга для демонстрации',
          genre: 'Фэнтези',
          status: 'draft',
          cover_url: '',
          created_at: new Date().toISOString(),
          chapter_count: 0,
          likes_count: 0,
          author_id: 1
        }
      ];
      
      const transformed = fallbackBooks
        .map(transformServerData)
        .filter(book => book !== null && !isBookDeleted(book.id));
      
      const filtered = filter === 'all' ? transformed : transformed.filter(b => b.status === filter);
      setBooks(filtered);
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Вспомогательная функция для обработки данных
  const processBooksData = (data) => {
    let booksArray = [];
    
    console.log('📊 Обрабатываем данные сервера:', data);
    
    // Обрабатываем разные форматы ответа
    if (Array.isArray(data)) {
      booksArray = data;
    } else if (data && Array.isArray(data.books)) {
      booksArray = data.books;
    } else if (data && data.success && Array.isArray(data.data)) {
      booksArray = data.data;
    } else if (data && data.books) {
      booksArray = data.books;
    }
    
    console.log('📊 Книг для обработки:', booksArray.length);
    console.log('📖 Первая книга из массива:', booksArray[0]);
    
    const transformedBooks = booksArray
      .map(transformServerData)
      .filter(book => book !== null && !isBookDeleted(book.id));
    
    console.log('✅ Преобразовано книг:', transformedBooks.length);
    console.log('📚 Все преобразованные книги:', transformedBooks);
    
    let filteredBooks = transformedBooks;
    if (filter !== 'all') {
      filteredBooks = transformedBooks.filter(book => book.status === filter);
      console.log(`🎯 После фильтра "${filter}":`, filteredBooks.length);
    }
    
    setBooks(filteredBooks);
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('❌ Требуется авторизация');
        return;
      }
      
      console.log(`🔄 Изменение статуса книги ${bookId} на ${newStatus}`);
      
      const response = await fetch(`http://localhost:3001/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          title: books.find(b => b.id === bookId)?.title || '',
          genre: books.find(b => b.id === bookId)?.genre || '',
          description: books.find(b => b.id === bookId)?.description || ''
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setBooks(prev => prev.map(book => 
          book.id === bookId ? { ...book, status: newStatus } : book
        ));
        
        alert(`✅ Статус изменен на: ${
          newStatus === 'draft' ? 'Черновик' : 
          newStatus === 'published' ? 'Опубликовано' : 
          'Архив'
        }`);
        
        if (onBookUpdate) {
          onBookUpdate();
        }
      } else {
        throw new Error(result.error || 'Ошибка обновления статуса');
      }
    } catch (err) {
      console.error('Error updating book status:', err);
      alert(`❌ Ошибка при изменении статуса: ${err.message}`);
    }
  };

  useEffect(() => {
    console.log('🔐 Проверка при монтировании BookList:');
    console.log('🔐 Токен:', localStorage.getItem('token'));
    console.log('🔐 Фильтр:', filter);
    console.log('🔐 Pathname:', window.location.pathname);
    
    loadBooks();
    
    // Слушаем события удаления книг
    const handleBookDeleted = (event) => {
      loadBooks();
    };
    
    window.addEventListener('bookDeleted', handleBookDeleted);
    
    return () => {
      window.removeEventListener('bookDeleted', handleBookDeleted);
    };
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBooks();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Дата не указана';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Неверная дата';
      
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Ошибка даты';
    }
  };

  if (loading && !refreshing) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Загружаем книги с сервера...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-600 mr-3" />
          <h3 className="text-lg font-semibold text-yellow-800">Внимание</h3>
        </div>
        
        <p className="text-yellow-700 mb-4">{error}</p>
        
        <div className="space-y-3">
          <button 
            onClick={handleRefresh}
            className="px-6 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Обновление...' : 'Попробовать снова'}
          </button>
        </div>
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="text-5xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {filter === 'draft' ? 'Нет черновиков' : 
           filter === 'published' ? 'Нет опубликованных книг' : 
           filter === 'archived' ? 'Архив пуст' : 
           'У вас пока нет книг'}
        </h3>
        <p className="text-gray-600">
          {filter === 'draft' ? 'Создайте свой первый черновик!' : 
           filter === 'published' ? 'Опубликуйте свою первую книгу!' : 
           'Начните с создания новой книги!'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Панель управления */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {filter === 'draft' ? 'Черновики' : 
             filter === 'published' ? 'Опубликованные книги' : 
             filter === 'archived' ? 'Архив' : 
             'Все книги'} ({books.length})
          </h2>
          <p className="text-gray-600 text-sm">
            {filter === 'draft' ? 'Книги в разработке' : 
             filter === 'published' ? 'Доступны для чтения' : 
             filter === 'archived' ? 'Скрытые книги' : 
             'Все ваши созданные книги'}
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          title="Обновить список"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {/* Список книг */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* ОБЛОЖКА - ВАЖНАЯ ЧАСТЬ! */}
            <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 relative">
              {book.coverUrl ? (
                <img 
                  src={book.coverUrl.startsWith('http') ? book.coverUrl : `http://localhost:3001${book.coverUrl}`} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <BookOpen class="h-12 w-12 text-gray-400" />
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  book.status === 'published' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {book.status === 'draft' ? 'Черновик' : 
                   book.status === 'published' ? 'Опубликовано' : 
                   'Архив'}
                </span>
              </div>
            </div>
            
            {/* Контент */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-3">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1 mb-1">
                    {book.title || 'Без названия'}
                  </h3>
                  {book.genre && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {book.genre}
                    </span>
                  )}
                </div>
                
                {/* Действия */}
                <div className="flex space-x-1 flex-shrink-0">
                  <button
                    onClick={() => window.location.href = `/books/edit/${book.id}`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      const newStatus = book.status === 'draft' ? 'published' : 
                                      book.status === 'published' ? 'archived' : 'draft';
                      const statusText = book.status === 'draft' ? 'опубликовать' : 
                                       book.status === 'published' ? 'архивировать' : 'вернуть из архива';
                      
                      if (window.confirm(`Вы уверены, что хотите ${statusText} книгу "${book.title}"?`)) {
                        handleStatusChange(book.id, newStatus);
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title={book.status === 'draft' ? 'Опубликовать' : 
                           book.status === 'published' ? 'В архив' : 
                           'Вернуть из архива'}
                  >
                    {book.status === 'draft' ? <Eye className="h-4 w-4" /> : 
                     book.status === 'published' ? <EyeOff className="h-4 w-4" /> : 
                     <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={async () => {
                      const confirmed = window.confirm(
                        `🗑️ Вы уверены, что хотите удалить книгу "${book.title}"?\n\n` +
                        `Это действие:\n` +
                        `• Удалит книгу из раздела "Мои книги"\n` +
                        `• Удалит книгу из ленты\n` +
                        `• Нельзя будет отменить`
                      );
                      
                      if (confirmed) {
                        const success = await completelyDeleteBook(book.id, book.title);
                        if (success && onBookUpdate) {
                          onBookUpdate();
                        }
                      }
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Удалить книгу"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-2 mb-4 min-h-[40px]">
                {book.description || 'Нет описания'}
              </p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {formatDate(book.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span>📖 {book.chapterCount || 0} глав</span>
                  <span>❤️ {book.likes || 0}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => window.location.href = `/books/${book.id}/chapters`}
                  className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Управление главами
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}