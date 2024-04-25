const express = require("express");
const mongoose = require("mongoose");
const Book = require("./model.book");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3007;

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/Library")
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((err) => {
    console.log("Failed to connect!");
  });

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// Endpoint to add a new book
app.post("/add-book", (req, res) => {
  const { title, author } = req.body; // Extract title and author from request body

  // Create a new book instance
  const newBook = new Book({
    title,
    author,
  });

  // Save the new book to the database
  newBook
    .save()
    .then(() => {
      console.log("New book added successfully!");
      res.redirect("/"); // Redirect to home page or any other page
    })
    .catch((err) => {
      console.error("Error adding book:", err);
      res.status(500).send("Error adding book");
    });
});

// Endpoint to search for books by title
// Endpoint to search for books by title or author
app.get("/search", async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required" });
  }

  try {
    const books = await Book.find(
      {
        $or: [
          { title: { $regex: new RegExp(searchTerm, "i") } },
          { author: { $regex: new RegExp(searchTerm, "i") } },
        ],
      },
      "title author"
    );

    if (books.length > 0) {
      res.json(books);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error searching for book: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch all books
app.get("/get-all-books", async (req, res) => {
  try {
    const books = await Book.find({}, "title author");
    res.json(books);
  } catch (error) {
    console.error("Error fetching books: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to update a book
app.put("/update-book/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;

  try {
    const updatedBook = await Book.findByIdAndUpdate(
      id,
      { title, author },
      { new: true }
    );
    if (!updatedBook) {
      return res.status(404).send("Book not found");
    }
    res.json(updatedBook);
  } catch (error) {
    console.error("Error updating book: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to delete a book
app.delete("/delete-book/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).send("Book not found");
    }
    res.send("Book deleted successfully");
  } catch (error) {
    console.error("Error deleting book: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
