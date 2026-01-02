## Approach

In this project, I built a scalable solution to display very large datasets smoothly. On the backend, I used Node.js streams to read a large file of usernames line by line, so the entire file is never loaded into memory. The API supports cursor-based pagination, allowing the client to request small chunks of data at a time. On the frontend, I implemented infinite scrolling using the Intersection Observer API, which automatically loads more users as the user scrolls. This setup keeps the application fast and memory-efficient, even when handling hundreds of thousands of records.

## Why I Chose This Approach

I chose this approach to ensure the application remains fast, scalable, and memory-efficient when working with very large datasets, since loading all the data at once does not scale and quickly impacts performance. By combining backend streaming with cursor-based pagination and frontend infinite scrolling, the system processes and displays only the data the user actually needs at any moment. This pattern is widely used by large technology companies such as Facebook, Instagram, Twitter (X), and LinkedIn to power feeds, search results, and user lists, as it reduces server load while delivering a smooth and responsive user experience.

## Worst-Case Memory Study

This is the study i do for the worst-case scenario:

- Each character uses 1 byte (octet).  
- Maximum username length = 20 characters.  
- Total number of users = 10,000,000.  

Memory needed to store all usernames in the frontend state(we imagine that the user scroll untill 10m)
20 bytes * 10,000,000 users % (1024)**2 ≈ 190 MB
This amount of memory is manageable in modern browsers on most computers.  



## Implementation Plan

This is the followed steps in the development of this project:

### Backend Development
- Develop the backend API using Node.js streams to efficiently read large files and expose a cursor-based pagination endpoint.

### Backend Testing
- Implement unit tests.  
- Test the API endpoints using Postman to verify pagination logic, cursor handling, performance, and edge cases before frontend integration.

### Frontend Integration
- Connect the validated backend API to the frontend application to fetch and display paginated data.

### Infinite Scroll Implementation
- Implement infinite scrolling on the frontend using the Intersection Observer API, enabling automatic data loading as the user scrolls.  
- Add the feature of filtering by a menu on the frontend and adjust the backend to support it.

### Add search bar for improved data navigation
- Reuse the existing `userService` service.
- Use a text-based search query to filter users.

### Optimization of the file reading process using indexes

- The approach I implemented makes reading the file more efficient by creating a file usernames.idx.json. In this file, I store the starting point of each letter (a, b, c, …) along with its byte offset, so the program can start reading directly from that point without processing the entire file.

- The file usernames.idx.json is generated automatically if it does not exist; if it exists, the program uses it.