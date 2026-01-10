export default function MyBooksPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📚 Мои книги</h1>
        <button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700">
          + Создать книгу
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-600 text-center py-8">
          Ваши книги появятся здесь. Начните с создания первой книги!
        </p>
      </div>
    </div>
  )
}