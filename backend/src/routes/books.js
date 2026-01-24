const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// GET /api/books - Public endpoint to list all books (for library browsing)
// Anyone can see the book catalog, but limited info for non-authenticated users
router.get('/', optionalAuth, async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 }).lean();
    
    // For non-authenticated users, only return basic info (no file URLs)
    const booksToReturn = books.map(book => {
      const baseBook = {
        _id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverUrl: book.coverUrl,
        category: book.category,
        subject: book.subject,
        level: book.level,
        pageCount: book.pageCount,
        createdAt: book.createdAt,
        resourceType: book.resourceType,
        customResourceType: book.customResourceType,
        downloadCount: book.downloadCount || 0,
      };
      
      // Only include file URL for authenticated users
      if (req.user) {
        baseBook.fileUrl = book.fileUrl;
      }
      
      return baseBook;
    });
    
    return res.json({ count: booksToReturn.length, books: booksToReturn });
  } catch (err) {
    console.error('Failed to list books', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/books/:id - Get a single book by ID
// Requires authentication to access the full book details including file URL
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).lean();
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Return full book details for authenticated users
    return res.json({ book });
  } catch (err) {
    console.error('Failed to get book', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/books/:id/preview - Get book preview info (public)
// Returns basic info without the file URL for previewing
router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).lean();
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Return preview info (no file URL)
    return res.json({
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        coverUrl: book.coverUrl,
        category: book.category,
        subject: book.subject,
        level: book.level,
        pageCount: book.pageCount,
        createdAt: book.createdAt,
      }
    });
  } catch (err) {
    console.error('Failed to get book preview', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
