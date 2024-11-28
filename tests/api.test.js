const request = require('supertest');
const app = require('../index.js');
const books = require('../router/booksdb.js');

expect.extend({
    toBeOneOf(received, array) {
        const pass = array.includes(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be one of ${array}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be one of ${array}`,
                pass: false,
            };
        }
    },
});

describe('Book Shop API', () => {
    // Test for getting all books
    test('GET / should return all books', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body.books).toBeInstanceOf(Array);
        // check the returned books are the same as the books in the database, all sorted
        const books_with_isbn = Object.entries(books).map(([isbn, book]) => ({
            isbn,
            ...book
        }));
        expect(response.body.books.sort()).toEqual(books_with_isbn.sort());
    });

    // Test for getting a book by ISBN
    test('GET /isbn/:isbn should return book details', async () => {
        const isbn = '1'; // Assuming '1' is a valid ISBN in your database
        const response = await request(app).get(`/isbn/${isbn}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('author', 'Chinua Achebe');
    });

    // Test for getting books by author
    test('GET /author/:author should return books by author', async () => {
        const author = 'Chinua Achebe';
        const response = await request(app).get(`/author/${encodeURIComponent(author)}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.books).toBeInstanceOf(Array);
        expect(response.body.books[0].author).toBe(author);
    });

    // Test for getting books by title
    test('GET /title/:title should return books with matching title', async () => {
        const title = 'Things Fall Apart';
        const response = await request(app).get(`/title/${encodeURIComponent(title)}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.books).toBeInstanceOf(Array);
        expect(response.body.books[0].title).toContain(title);
    });

    // Test for getting book reviews
    test('GET /review/:isbn should return book reviews', async () => {
        const isbn = '1'; // Assuming this book has reviews
        const response = await request(app).get(`/review/${isbn}`);
        expect(response.statusCode).toBe(200);
        //expect(response.body.reviews).toBeInstanceOf(Object);
    });

    // Test for user registration
    test('POST /register should register a new user', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser', password: 'password123' });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    // Test for user login
    test('POST /customer/login should authenticate user', async () => {
        const response = await request(app)
            .post('/customer/login')
            .send({ username: 'testuser', password: 'password123' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    // Test for adding/modifying a review (requires authentication)
    test('PUT /customer/auth/review/:isbn should add or modify a review', async () => {
        const agent = request.agent(app);
        const response = await agent
            .post('/customer/login')
            .send({ username: 'testuser', password: 'password123' });
        const token = response.body.token;
        const response1 = await agent
            .put('/customer/auth/review/1')
            .set('Authorization', token)
            .send({ review: 'Great book!' });
        expect(response1.statusCode).toBe(201 || 200);
        expect(response1.body.message).toBe('Review added successfully');
        const response2 = await agent.get('/review/1');
        expect(response2.body.reviews['testuser']).toBe('Great book!');
    });

    // Test for deleting a review (requires authentication)
    test('DELETE /auth/review/:isbn should delete a review', async () => {
        // Assuming the user has already logged in and has a review to delete
        const loginResponse = await request(app)
            .post('/customer/login')
            .send({ username: 'testuser', password: 'password123' });
        const token = loginResponse.body.token;

        const response = await request(app)
            .delete('/customer/auth/review/1')
            .set('Authorization', token);
        expect(response.statusCode).toBe(200);
    });

    // Test for getting a book by ISBN with an invalid ISBN
    test('GET /isbn/:isbn should return 404 for invalid ISBN', async () => {
        const invalidIsbn = 'invalid';
        const response = await request(app).get(`/isbn/${invalidIsbn}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Book not found');
    });

    // Test for getting books by author with no matching books
    test('GET /author/:author should return an empty array when no books match', async () => {
        const author = 'NonExistentAuthor';
        const response = await request(app).get(`/author/${encodeURIComponent(author)}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.books).toEqual([]);
    });

    // Test for getting books by title with partial match
    test('GET /title/:title should return books with partial title match', async () => {
        const title = 'Fall';
        const response = await request(app).get(`/title/${encodeURIComponent(title)}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.books).toBeInstanceOf(Array);
        expect(response.body.books.some(book => book.title.includes(title))).toBe(true);
    });

    // Test for getting book reviews with no reviews
    test('GET /review/:isbn should return an empty object when no reviews exist', async () => {
        const isbn = '10'; // Assuming this book has no reviews
        const response = await request(app).get(`/review/${isbn}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.reviews).toEqual({});
    });

    // Test for user registration with invalid username
    test('POST /register should return error for invalid username', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'invalid@user', password: 'password123' });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid username');
    });

    // Test for user login with incorrect credentials
    test('POST /customer/auth/login should return error for incorrect credentials', async () => {
        const response = await request(app)
            .post('/customer/login')
            .send({ username: 'testuser', password: 'wrongpassword' });
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');
    });

    // Test for adding/modifying a review with invalid token
    test('PUT /auth/review/:isbn should return unauthorized for invalid token', async () => {
        const response = await request(app)
            .put('/customer/auth/review/1')
            .set('Authorization', 'invalidtoken')
            .send({ review: 'Great book!' });
        expect(response.statusCode).toBe(901);
    });

    // Test for deleting a review with invalid token
    test('DELETE /customer/auth/review/:isbn should return unauthorized for invalid token', async () => {
        const response = await request(app)
            .delete('/customer/auth/review/1')
            .set('Authorization', 'invalidtoken');
        expect(response.statusCode).toBe(901);
    });

    // Test for concurrency - multiple users adding reviews simultaneously
    test('Concurrency test: Multiple users adding reviews', async () => {
        const users = [
            { username: 'user1', password: 'password1' },
            { username: 'user2', password: 'password2' }
        ];

        const promises = users.map(async user => {
            const loginResponse = await request(app)
                .post('/customer/login')
                .send(user);
            const token = loginResponse.body.token;
            return request(app)
                .put('/customer/auth/review/1')
                .set('Authorization', token)
                .send({ review: `Review by ${user.username}` });
        });

        const results = await Promise.all(promises);
        results.forEach(result => {
            expect(result.statusCode).toBe(201 || 200);
        });
    });

    test('GET /author/:author should be case insensitive', async () => {
        const author = 'chinua achebe';
        const response = await request(app).get(`/author/${encodeURIComponent(author)}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.books[0].author).toBe('Chinua Achebe');
    });

    test('GET /title/:title should be case insensitive', async () => {
        const title = 'things fall apart';
        const response = await request(app).get(`/title/${encodeURIComponent(title)}`);
        expect(response.statusCode).toBe(200);
        expect(response.body.books[0].title).toContain('Things Fall Apart');
    });

    test('GET /isbn/:isbn should return 400 for invalid ISBN format', async () => {
        const invalidIsbn = 'notanumber';
        const response = await request(app).get(`/isbn/${invalidIsbn}`);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Invalid ISBN format');
    });

    test('PUT /customer/auth/review/:isbn should return 401 for unauthorized access', async () => {
        const response = await request(app)
            .put('/customer/auth/review/1')
            .send({ review: 'Unauthorized review' });
        expect(response.statusCode).toBe(401);
    });

    test('PUT /customer/auth/review/:isbn should update review correctly', async () => {
        const agent = request.agent(app);
        const response = await agent
            .post('/customer/login')
            .send({ username: 'testuser', password: 'password123' });
        const token = response.body.token;
        const newReview = 'Updated review';
        const response1 = await agent
            .put('/customer/auth/review/1')
            .set('Authorization', token)
            .send({ review: newReview });
        expect(response1.statusCode).toBeOneOf([201, 200]);
        const getResponse = await agent.get('/review/1');
        expect(getResponse.body.reviews['testuser']).toBe(newReview);
    });

    test('POST /register should sanitize input', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: '<script>alert("XSS")</script>', password: 'password123' });
        expect(response.statusCode).toEqual(400);
        expect(response.body.message).toBe('Invalid username');
    });

    // Test for authentication middleware
    test('GET /customer/auth/review/:isbn should require authentication', async () => {
        const response = await request(app).get('/customer/auth/review/1');
        expect(response.statusCode).toBe(703); // No token provided
        expect(response.body.message).toBe('No token provided.');
    });

    test('GET /customer/auth/review/:isbn should fail with invalid token', async () => {
        const response = await request(app)
            .get('/customer/auth/review/1')
            .set('Authorization', 'invalidtoken');
        expect(response.statusCode).toBe(901); // Invalid token
    });

    // Test for user registration with existing username
    test('POST /register should return error for existing username', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser', password: 'password123' });
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Username already exists');
    });

    // Test for adding review to non-existent book
    test('PUT /customer/auth/review/:isbn should return 404 for non-existent book', async () => {
        const agent = request.agent(app);
        const loginResponse = await agent
            .post('/customer/login')
            .send({ username: 'testuser', password: 'password123' });
        const token = loginResponse.body.token;
        const response = await agent
            .put('/customer/auth/review/99999')
            .set('Authorization', token)
            .send({ review: 'Great book!' });
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Book not found');
    });

    // Test for deleting a review that doesn't exist
    test('DELETE /customer/auth/review/:isbn should return 404 for non-existent review', async () => {
        const agent = request.agent(app);
        const loginResponse = await agent
            .post('/customer/login')
            .send({ username: 'testuser', password: 'password123' });
        const token = loginResponse.body.token;
        const response = await agent
            .delete('/customer/auth/review/1')
            .set('Authorization', token);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Review not found');
    });

});