const express = require('express');
let books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

// User registration
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }
  if (users.some(u => u.username === username)) {
    return res.status(409).json({ message: "Username already exists." });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully." });
});

// Get all books
const axios = require('axios');

// Async-Await version using Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching books:', error.message);
    return res.status(500).json({ message: "Unable to fetch books." });
  }
});


// Get book details by ISBN


// Async-Await version using Axios
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/internal/books/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  }
});

// Get books by author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();

  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    const books = response.data;
    const bookList = Object.values(books);

    const matchingBooks = bookList.filter(book => 
      book.author.toLowerCase() === author
    );

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found for the given author." });
    }

  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book data." });
  }
});


// Get books by title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.trim().toLowerCase(); // 👈 Fix is here

  const bookList = Object.values(books);

  const matches = bookList.filter(book =>
    book.title.toLowerCase().includes(title)
  );

  if (matches.length > 0) {
    return res.status(200).json(matches);
  } else {
    return res.status(404).json({ message: "No books found with the given title." });
  }
});


// Get book reviews by ISBN
// public_users.get('/review/:isbn', (req, res) => {
//   const book = books[req.params.isbn];
//   if (book) return res.status(200).json(book.reviews || {});
//   return res.status(404).json({ message: "Book not found for the given ISBN." });
// });
public_users.get('/review/:isbn', (req, res) => {
  const isbn = Number(req.params.isbn); // ✅ convert to number
  console.log("Review request for ISBN:", isbn);
  console.log("Available ISBNs:", Object.keys(books));

  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews || {});
  } else {
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  }
});


public_users.get('/internal/books', (req, res) => {
  return res.status(200).json(books);
});

// Internal route for Axios to access book by ISBN
public_users.get('/internal/books/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found for the given ISBN." });
  }
});
// Internal route used by Axios to fetch all books
// public_users.get('/internal/books', (req, res) => {
//   return res.status(200).json(books);
// });


module.exports.general = public_users;
