## What is this?

This is a web application that lets you browse through a large list of usernames (hundreds of thousands or millions) efficiently. Instead of loading everything at once (which would be slow), it loads users in small chunks as you scroll, making it fast and smooth even with huge datasets.

**Key Features:**
- **Infinite Scroll**: Automatically loads more users as you scroll down
- **Search & Filter**: Search by name or filter by first letter (A-Z)
- **File Upload**: Upload your own list of usernames to replace the existing data
- **Fast Performance**: Uses smart indexing to quickly find what you're looking for

---

## Approach

In this project, I built a scalable solution to display very large datasets efficiently. On the backend, I used Node.js streams combined with cursor-based pagination to read a large file of usernames line by line, ensuring that the entire file is never loaded into memory. To further optimize file access, I implemented file indexing, which allows the system to start reading from specific byte offsets instead of scanning the file from the beginning on each request.

On the frontend, I implemented infinite scrolling using the Intersection Observer API, which automatically loads paginated data as the user scrolls. This architecture keeps the application fast and memory-efficient, even when handling hundreds of thousands or millions of records.

---

## Why I Chose This Approach

I chose this approach to ensure that the application remains fast, scalable, and memory-efficient when working with very large datasets. Loading all data at once does not scale and quickly degrades performance.

By combining backend streaming, cursor-based pagination, and frontend infinite scrolling, the system processes and displays only the data the user actually needs at any given moment. This pattern is widely used by large technology companies such as Facebook, Instagram, Twitter (X), and LinkedIn to power feeds, search results, and large user lists. It reduces server load while delivering a smooth and responsive user experience.

---

## Worst-Case Memory Study

The following analysis represents a worst-case scenario where the user scrolls through the entire dataset.

- Each character uses 1 byte (1 octet)
- Maximum username length: 20 characters
- Total number of users: 10,000,000

**Memory required to store all usernames in the frontend state:**

20 bytes × 10,000,000 users ÷ (1024²) ≈ 190 MB


This amount of memory is generally manageable in modern browsers on most computers. However, in real-world usage, users rarely scroll through the entire dataset, which makes the actual memory consumption significantly lower.

---

## Implementation Plan

The following steps were followed during the development of this project:

### Backend Development
- Develop a backend API using Node.js streams to efficiently read large files.
- Expose a cursor-based pagination endpoint to fetch users incrementally.

### Backend Testing
- Implement unit tests for core services and pagination logic.
- Test API endpoints using Postman to validate cursor handling, performance, and edge cases before frontend integration.

### Frontend Integration
- Connect the validated backend API to the frontend application.
- Fetch and display paginated user data.

### Infinite Scroll Implementation
- Implement infinite scrolling using the Intersection Observer API.
- Automatically load more data as the user scrolls.
- Add filtering functionality via a frontend menu and update the backend to support filters.

### Search Bar for Improved Data Navigation
- Reuse the existing `userService`.
- Implement a text-based search query to filter users efficiently.

### Optimization Using File Indexing
- Optimize file reading by generating an index file named `usernames.idx.json`.
- This file stores the byte offset for the starting position of each letter (`a`, `b`, `c`, etc.).
- The backend can jump directly to the relevant section of the file without scanning it from the beginning.
- The index file is generated automatically if it does not exist.
- If the index file already exists, it is reused.

### File Upload Feature
- Add the ability to upload a new file to replace the sample dataset.
- Automatically regenerate the index file whenever a new file is uploaded.


