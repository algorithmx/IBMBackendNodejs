const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { addBookReview, deleteBookReview } = require("./booksdb.js");
const regd_users = express.Router()
const { JWT_SECRET } = require('./secret.js');

let users = {};

const isUserExists = (username) => {
  return (username in users);
}

const addUser = (username, password) => {
  users[username] = password;
}

const fetchAllUsers = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(users);
    }, Math.random() * 1000);
  });
}

const isValid = (username) => {
  return /^[a-zA-Z0-9]+$/.test(username);
}

const authenticatedUser = (username, password) => {
  return (username in users) && (users[username] === password);
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ userId: username }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token: token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const userId = req.session.userId;
  const { review } = req.body;
  addBookReview(isbn, userId, review)
    .then((msg) => res.status(200).json({ message: msg }))
    .catch((err) => res.status(404).json({ message: err.message }));
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const userId = req.session.userId;
  deleteBookReview(isbn, userId)
    .then((msg) => res.status(200).json({ message: msg }))
    .catch((err) => res.status(404).json({ message: err.message }));
});


module.exports = {
  isValid,
  addUser,
  isUserExists,
  fetchAllUsers,
  authenticated : regd_users,
};
