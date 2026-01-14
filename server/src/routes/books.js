// GET /api/books - получение всех книг
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const books = await db.all('SELECT * FROM books WHERE authorId = ?', [userId]);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/books - создание книги
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, genre, status, coverUrl } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await db.run(
      `INSERT INTO books (title, description, genre, status, coverUrl, authorId) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || '', genre || '', status || 'draft', coverUrl || '', userId]
    );

    const newBook = {
      id: result.lastID,
      title,
      description: description || '',
      genre: genre || '',
      status: status || 'draft',
      coverUrl: coverUrl || '',
      authorId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});