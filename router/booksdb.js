let books = {
  1: { "author": "Chinua Achebe", "title": "Things Fall Apart", "reviews": {} },
  2: { "author": "Hans Christian Andersen", "title": "Fairy tales", "reviews": {} },
  3: { "author": "Dante Alighieri", "title": "The Divine Comedy", "reviews": {} },
  4: { "author": "Unknown", "title": "The Epic Of Gilgamesh", "reviews": {} },
  5: { "author": "Unknown", "title": "The Book Of Job", "reviews": {} },
  6: { "author": "Unknown", "title": "One Thousand and One Nights", "reviews": {} },
  7: { "author": "Unknown", "title": "Nj\u00e1l's Saga", "reviews": {} },
  8: { "author": "Jane Austen", "title": "Pride and Prejudice", "reviews": {} },
  9: { "author": "Honor\u00e9 de Balzac", "title": "Le P\u00e8re Goriot", "reviews": {} },
  10: { "author": "Samuel Beckett", "title": "Molloy, Malone Dies, The Unnamable, the trilogy", "reviews": {} }
}

// convert the books object to an array of books with ISBN
const convertToBooksWithISBN = () => {
  return Object.entries(books).map(([isbn, book]) => ({
    isbn,
    ...book
  }));
}

const fetchAllISBNs = () => {
  return Object.keys(books);
}

// mock function to get all books using axios and promises
// simulate a random delay less than 1 second
function fetchAllBooks() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const books_with_isbn = convertToBooksWithISBN();
      resolve(books_with_isbn);
    }, Math.random() * 1000);
  });
}

const isValidISBN = (isbn) => {
  return /^\d{1,9}$$/.test(isbn);
};

const fetchBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!isValidISBN(isbn)) {
        reject(new Error("Invalid ISBN format"));
      } else if (isbn in books) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    }, Math.random() * 1000);
  });
};



const isValidAuthor = (author) => {
  return /^(\w{1,30}\.?\s+){0,2}\w{1,30}\.?$/.test(author);
};

// Get book details based on author
const fetchBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!isValidAuthor(author)) {
        reject(new Error("Invalid author format"));
      } else {
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
      }
    }, Math.random() * 1000);
  });
};



// Get all books based on title
const fetchBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
      if (booksByTitle.length > 0) {
        resolve(booksByTitle);
      } else {
        reject(new Error("No books found with this title"));
      }
    }, Math.random() * 1000);
  });
};


//  Get book review
const fetchBookReviews = (isbn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (isbn in books) {
        resolve(books[isbn].reviews);
      } else {
        reject(new Error("Book not found"));
      }
    }, Math.random() * 1000); 
  });
};

const addBookReview = (isbn, userId, review) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) {
        reject(new Error("User ID is required"));
      } else if (!isValidISBN(isbn)) {
        reject(new Error("Invalid ISBN format"));
      } else if (!(isbn in books)) {
        reject(new Error("Book not found"));
      } else if (userId in books[isbn].reviews) {
        books[isbn].reviews[userId] = review;
        resolve({ message: "Review updated successfully" });
      } else {
        books[isbn].reviews[userId] = review;
        resolve({ message: "Review added successfully" });
      }
    }, Math.random() * 1000);
  });
}


// Delete a book review
const deleteBookReview = (isbn, userId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) {
        reject(new Error("User ID is required"));
      } else if (!isValidISBN(isbn)) {
        reject(new Error("Invalid ISBN format"));
      } else if (!(isbn in books)) {
        reject(new Error("Book not found"));
      } else if (userId in books[isbn].reviews) {
        delete books[isbn].reviews[userId];
        resolve(true);
      } else {
        reject(new Error("Review not found"));
      }
    }, Math.random() * 1000);
  });
};


module.exports = { 
  books, 
  convertToBooksWithISBN, 
  fetchAllBooks, 
  fetchAllISBNs, 
  fetchBookByISBN, 
  fetchBooksByAuthor, 
  fetchBooksByTitle, 
  fetchBookReviews, 
  isValidISBN,
  addBookReview,
  deleteBookReview
};
