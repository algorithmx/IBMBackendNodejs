const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const { JWT_SECRET } = require('./secret.js');

let users = [];

const isValid = (username) => {
  return /^[a-zA-Z0-9]+$/.test(username);
}

const authenticatedUser = (username, password) => {
  const user = users.find(u => u.username === username);
  return user && user.password === password;
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
  if (!(isbn in books)) {
    return res.status(404).json({ message: "Book not found" });
  }

  const userId = req.session.userId;
  const username = req.headers.username;
  if (!username) {
    return res.status(601).json({ message: "User not authenticated" });
  }
  if (userId !== username) {
    return res.status(602).json({ message: "User ID does not match username" });
  }
  const { review } = req.body;
  if (!books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    return res.status(201).json({ message: "Review added successfully" });
  } else {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  if (!(isbn in books)) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.session.userId;
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (isValid(username)) {
    if (users.find(user => user.username === username)) {
      return res.status(400).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
  } else {
    return res.status(400).json({ message: "Invalid username" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
