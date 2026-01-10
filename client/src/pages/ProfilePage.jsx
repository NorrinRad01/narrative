export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">👤 Мой профиль</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          <div>
            <h2 className="text-xl font-bold">Тестовый Автор</h2>
            <p className="text-gray-600">Автор · 12 книг</p>
            <p className="text-sm text-gray-500">⭐ 4.8 · 👥 1.2k подписчиков</p>
          </div>
        </div>
        <p className="text-gray-600">
          Информация о профиле будет здесь.
        </p>
      </div>
    </div>
  )
}