const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();


// Internal API endpoints for Axios
public_users.get('/api/books', (req, res) => {
    res.status(200).json(books);
});

public_users.get('/api/books/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

public_users.get('/api/books/author/:author', (req, res) => {
    const author = req.params.author;
    const result = {};

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author === author) {
            result[isbn] = books[isbn];
        }
    });

    if (Object.keys(result).length > 0) {
        return res.status(200).json(result);
    }

    return res.status(404).json({
        message: "No books found for this author"
    });
});

public_users.get('/api/books/title/:title', (req, res) => {
    const title = req.params.title;
    const result = {};

    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title === title) {
            result[isbn] = books[isbn];
        }
    });

    if (Object.keys(result).length > 0) {
        return res.status(200).json(result);
    }

    return res.status(404).json({
        message: "No books found with this title"
    });
});


// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (users[username]) {
        return res.status(400).json({
            message: "User already exists"
        });
    }

    users[username] = password;

    return res.status(200).json({
        message: "User successfully registered. Now you can login"
    });
});


// Task 10 - Get all books using Async/Await with Axios
public_users.get('/', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/api/books');
        return res.status(200).json(response.data);
    } catch (error) {
        return res.status(500).json({
            message: "Error fetching books"
        });
    }
});


// Task 11 - Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    axios.get(`http://localhost:5000/api/books/isbn/${isbn}`)
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            return res.status(404).json({
                message: "Book not found"
            });
        });
});


// Task 12 - Get book details based on author using Promise
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    axios.get(`http://localhost:5000/api/books/author/${encodeURIComponent(author)}`)
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            return res.status(404).json({
                message: "No books found for this author"
            });
        });
});


// Task 13 - Get book details based on title using Promise
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    axios.get(`http://localhost:5000/api/books/title/${encodeURIComponent(title)}`)
        .then(response => {
            return res.status(200).json(response.data);
        })
        .catch(error => {
            return res.status(404).json({
                message: "No books found for this title"
            });
        });
});


// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        if (books[isbn].reviews) {
            return res.status(200).json(books[isbn].reviews);
        }

        return res.status(404).json({
            message: "No reviews found for this book."
        });
    }

    return res.status(404).json({
        message: "Book not found"
    });
});


module.exports.general = public_users;
