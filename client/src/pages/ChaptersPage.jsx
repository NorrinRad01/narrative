import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export default function ChaptersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Временные данные для глав
  const [chapters, setChapters] = useState([
    { id: 1, title: 'Глава 1: Начало', content: 'Содержание первой главы...', order: 1 },
    { id: 2, title: 'Глава 2: Развитие', content: 'Содержание второй главы...', order: 2 },
    { id: 3, title: 'Глава 3: Кульминация', content: 'Содержание третьей главы...', order: 3 },
  ]);
  
  const [newChapterTitle, setNewChapterTitle] = useState('');
  
  const addChapter = () => {
    if (!newChapterTitle.trim()) return;
    
    const newChapter = {
      id: chapters.length + 1,
      title: newChapterTitle,
      content: 'Новое содержание главы...',
      order: chapters.length + 1
    };
    
    setChapters([...chapters, newChapter]);
    setNewChapterTitle('');
  };
  
  const deleteChapter = (chapterId) => {
    if (window.confirm('Удалить главу?')) {
      setChapters(chapters.filter(ch => ch.id !== chapterId));
    }
  };
  
  const moveChapter = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newChapters = [...chapters];
      [newChapters[index], newChapters[index - 1]] = [newChapters[index - 1], newChapters[index]];
      setChapters(newChapters);
    } else if (direction === 'down' && index < chapters.length - 1) {
      const newChapters = [...chapters];
      [newChapters[index], newChapters[index + 1]] = [newChapters[index + 1], newChapters[index]];
      setChapters(newChapters);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Хедер */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/my-books')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Управление главами</h1>
            <p className="text-gray-600">Книга #{id} - редактирование глав</p>
          </div>
        </div>
      </div>
      
      {/* Добавление новой главы */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Добавить новую главу</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="Название главы"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={addChapter}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Добавить
          </button>
        </div>
      </div>
      
      {/* Список глав */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Список глав ({chapters.length})</h2>
        </div>
        
        {chapters.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Глав пока нет. Добавьте первую!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {chapters.map((chapter, index) => (
              <div key={chapter.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500 font-mono">#{chapter.order}</span>
                      <h3 className="font-bold text-lg text-gray-900">{chapter.title}</h3>
                    </div>
                    <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                      {chapter.content}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => moveChapter(index, 'up')}
                      disabled={index === 0}
                      className={`p-2 rounded-lg ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                      title="Поднять выше"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveChapter(index, 'down')}
                      disabled={index === chapters.length - 1}
                      className={`p-2 rounded-lg ${index === chapters.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'}`}
                      title="Опустить ниже"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => alert('Редактирование главы в разработке!')}
                      className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                      title="Редактировать"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteChapter(chapter.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Информация */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 text-sm">
          ⚠️ Это временная страница управления главами. Полная функциональность будет добавлена позже.
        </p>
      </div>
    </div>
  );
}