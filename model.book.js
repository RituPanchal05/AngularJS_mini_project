const mongoose = require("mongoose");

// Define the book schema
const bookSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
});

// Create a model from the schema
const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
