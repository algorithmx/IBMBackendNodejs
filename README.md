Book Review Application API
===

## Introduction

In this project, I followed the instructions in the course to build a server-side online book review application and integrate it with a secure REST API server which uses authentication at session level using JWT. 

## Code review

The file `router/booksdb.js` mocks the database backend of the library. The utility functions are:
convertToBooksWithISBN, 
  - `fetchAllBooks`, 
  - `fetchAllISBNs`, 
  - `fetchBookByISBN`, 
  - `fetchBooksByAuthor`, 
  - `fetchBooksByTitle`, 
  - `fetchBookReviews`, 
  - `isValidISBN`,
  - `addBookReview`,
  - `deleteBookReview`. 
They help to retrieve or modify the database `books`. Note that I have assumed that the keys in the books object are ISBNs.

The file `router/general.js` handles general requests which do not require authentication. The API endpoints includes:
  - `/`: list all books in the database
  - `/register`: handles user registration
  - `/isbn/:isbn`: find book by ISBN
  - `/author/:author`: find book by author
  - `/title/:title`: find book by title
  - `/review/:isbn`: get review by ISBN

The file `router/auth_users.js` handles requests with a token obtained after authentication. The API endpoints are: 
  - `/customer/login`
  - `/customer/auth/review/:isbn`
All the endpoints have prefix `/customer` because the routing design in `index.js`. The authentication middleware is defined in `index.js` such that all endpoints with prefix `/customer/auth` need to go through the middleware to verify the token. The middleware is implemented as session-based authentication.


I have written comprehensive tests `tests/api.test.js` using Jest to test my application API. All tests are passed and the test coverage is acceptable.

