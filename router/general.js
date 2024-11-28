const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get the book list available in the shop
// assuming the id (key) is the book's ISBN
public_users.get('/',function (req, res) {
  const books_with_isbn = Object.entries(books).map(([isbn, book]) => ({
    isbn,
    ...book
  }));
  return res.status(200).json({ books: books_with_isbn });
});


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (isValid(username)) {
    if (users.find(user => user.username === username)) {
      return res.status(400).json({message: "Username already exists"});
    }
    users.push({ username, password });
    return res.status(201).json({message: "User registered successfully"});
  } else {
    return res.status(400).json({message: "Invalid username"});
  }
});


// Get book details based on ISBN
const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (isbn in books) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  });
};

public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  fetchBookByISBN(isbn)
    .then(book => res.status(200).json(book))
    .catch(err => res.status(404).json({ message: err.message }));
});

// Get book details based on author
const fetchBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    // Convert books object to array of [isbn, book] pairs
    const booksArray = Object.entries(books);
    const booksByAuthor = booksArray.filter(
      ([isbn, book]) => book.author.toLowerCase().includes(author.toLowerCase())
    );
    if (booksByAuthor.length > 0) {
      const books_with_isbn = booksByAuthor.map(([isbn, book]) => ({
        isbn,
        ...book
      }));
      resolve(books_with_isbn);
    } else {
      resolve([]);
    }
  });
};

public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  fetchBooksByAuthor(author)
    .then(books => res.status(200).json({books: books}))
    .catch(err => res.status(404).json({message: err.message}));
});

// Get all books based on title
const fetchBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject(new Error("No books found with this title"));
    }
  });
};

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  fetchBooksByTitle(title)
    .then(books => res.status(200).json({books: books}))
    .catch(err => res.status(404).json({message: err.message}));
});

//  Get book review
const fetchBookReviews = (isbn) => {
  return new Promise((resolve, reject) => {
    if (isbn in books && books[isbn].reviews) {
      resolve(books[isbn].reviews);
    } else {
      reject(new Error("No reviews found for this book"));
    }
  });
};
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  fetchBookReviews(isbn)
    .then(reviews => res.status(200).json({reviews: reviews}))
    .catch(err => res.status(404).json({message: err.message}));
});

module.exports.general = public_users;
