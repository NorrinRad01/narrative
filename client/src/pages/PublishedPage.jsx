import BookList from '../components/BookList';

export default function PublishedPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Опубликовано</h1>
        <p className="text-gray-600">Книги, доступные другим пользователям</p>
      </div>
      <BookList filter="published" />
    </div>
  );
}