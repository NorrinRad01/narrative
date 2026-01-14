// Создайте файл `client/src/utils/bookDeleter.js`:
export const bookDeleter = {
  // Массив ID удаленных книг
  deletedIds: JSON.parse(localStorage.getItem('deletedBookIds') || '[]'),
  
  // Удалить книгу
  deleteBook(bookId) {
    if (!this.deletedIds.includes(bookId)) {
      this.deletedIds.push(bookId);
      localStorage.setItem('deletedBookIds', JSON.stringify(this.deletedIds));
    }
    
    // Также удаляем из всех localStorage коллекций
    this.cleanupFromStorage(bookId);
    
    return true;
  },
  
  // Очистка из всех хранилищ
  cleanupFromStorage(bookId) {
    // Из myBooks
    const myBooks = JSON.parse(localStorage.getItem('myBooks') || '[]');
    localStorage.setItem('myBooks', 
      JSON.stringify(myBooks.filter(book => book.id !== bookId))
    );
    
    // Из feed
    const feed = JSON.parse(localStorage.getItem('bookFeed') || '[]');
    localStorage.setItem('bookFeed',
      JSON.stringify(feed.filter(item => 
        !item.bookId || item.bookId !== bookId
      ))
    );
    
    // Из trending
    const trending = JSON.parse(localStorage.getItem('trendingBooks') || '[]');
    localStorage.setItem('trendingBooks',
      JSON.stringify(trending.filter(id => id !== bookId))
    );
  },
  
  // Проверить, удалена ли книга
  isDeleted(bookId) {
    return this.deletedIds.includes(bookId);
  },
  
  // Получить отфильтрованный список книг
  filterDeleted(books) {
    return books.filter(book => !this.isDeleted(book.id));
  }
};

// Затем в BookList.jsx используйте:
import { bookDeleter } from '../utils/bookDeleter';

// В loadBooks после получения книг:
const filteredBooks = bookDeleter.filterDeleted(transformedBooks);

// В handleDeleteBook:
bookDeleter.deleteBook(bookId);