const express = require('express');
const crypto = require('crypto');
// database never exposes data directly, it only exposes functions to access data
const { fetchAllBooks, fetchBookByISBN, fetchBooksByAuthor, fetchBooksByTitle, fetchBookReviews } = require("./booksdb.js");
const { isValid, addUser, isUserExists, fetchAllUsers } = require("./auth_users.js");
const public_users = express.Router();

// Get the book list available in the shop
// assuming the id (key) is the book's ISBN
public_users.get('/',function (req, res) {
  fetchAllBooks()
    .then(books_with_isbn => res.status(200).json({ books: books_with_isbn }))
    .catch(err => res.status(500).json({ message: err.message }));  
});


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (isValid(username)) {
    if (isUserExists(username)) {
      return res.status(400).json({message: "Username already exists"});
    }
    try {
      addUser(username, password);
      return res.status(201).json({message: "User registered successfully"});
    } catch (err) {
      return res.status(500).json({message: `Error registering user: ${err.message}`});
    }
  } else {
    return res.status(400).json({message: "Invalid username"});
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  fetchBookByISBN(isbn)
    .then(book => res.status(200).json(book))
    .catch(err => res.status(400).json({ message: err.message }));
});

public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  fetchBooksByAuthor(author)
    .then(books => res.status(200).json({books: books}))
    .catch(err => res.status(404).json({message: err.message}));
});

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  fetchBooksByTitle(title)
    .then(books => res.status(200).json({books: books}))
    .catch(err => res.status(404).json({message: err.message}));
});

public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  fetchBookReviews(isbn)
    .then(reviews => res.status(200).json({reviews: reviews}))
    .catch(err => res.status(404).json({message: err.message}));
});

public_users.get('/test/users', (req, res) => {
  fetchAllUsers()
    .then(users => res.status(200).json({users: users}))
    .catch(err => res.status(500).json({message: err.message}));
});

module.exports.general = public_users;
