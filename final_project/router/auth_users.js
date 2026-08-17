const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username exists
const isValid = (username) => {
    return users[username] !== undefined;
};

// Check if username and password match
const authenticatedUser = (username, password) => {
    return users[username] === password;
};


// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: "1h" }
    );

    req.session.authorization = accessToken;

    return res.status(200).json({
        message: "Login successful",
        token: accessToken
    });
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    const username = req.user.username;

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: books[isbn].reviews
    });
});


// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const username = req.user.username;

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review not found"
        });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;