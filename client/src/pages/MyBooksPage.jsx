import { useState } from 'react';
import BookList from '../components/BookList';
import CreateBookModal from '../components/CreateBookModal';

export default function MyBooksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📚 Мои книги</h1>
          <p className="text-gray-600 mt-2">Все ваши созданные книги в одном месте</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all duration-200"
        >
          + Создать книгу
        </button>
      </div>

      <BookList 
        key={refreshKey} 
        filter="all" 
        onBookUpdate={() => setRefreshKey(prev => prev + 1)}
      />

      <CreateBookModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBookCreated={handleBookCreated}
      />
    </div>
  );
}