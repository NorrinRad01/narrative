import BookList from '../components/BookList';

export default function DraftsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Черновики</h1>
        <p className="text-gray-600">Книги, которые еще не опубликованы</p>
      </div>
      <BookList filter="draft" />
    </div>
  );
}