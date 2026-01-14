import BookList from '../components/BookList';

export default function ArchivePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🗄️ Архив</h1>
        <p className="text-gray-600">Скрытые и архивные книги</p>
      </div>
      <BookList filter="archived" />
    </div>
  );
}