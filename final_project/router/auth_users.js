const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];  // Shared users array

// Check if username exists
const isValid = (username) => users.some(u => u.username === username);

// Check if credentials match
const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "Username does not exist." });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Incorrect password." });
  }
  const token = jwt.sign({ username }, 'fingerprint_customer', { expiresIn: '1h' });
  req.session.authorization = { token, username };
  return res.status(200).json({ message: "User logged in successfully.", token });
});

// Add/update a review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params, { review } = req.body;
  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }
  books[isbn].reviews = books[isbn].reviews || {};
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: "Review added/updated successfully.",
    reviews: books[isbn].reviews
  });
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user on the given book." });
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
