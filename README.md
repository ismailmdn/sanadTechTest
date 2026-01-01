# sanadTechTest

## Approach

In this project, I built a scalable solution to display very large datasets smoothly. On the backend, I used Node.js streams to read a large file of usernames line by line, so the entire file is never loaded into memory. The API supports cursor-based pagination, allowing the client to request small chunks of data at a time. On the frontend, I implemented infinite scrolling using the Intersection Observer API, which automatically loads more users as the user scrolls. This setup keeps the application fast and memory-efficient, even when handling hundreds of thousands of records.

## Why I Chose This Approach

I chose this approach to ensure the application remains fast, scalable, and memory-efficient when working with very large datasets, since loading all the data at once does not scale and quickly impacts performance. By combining backend streaming with cursor-based pagination and frontend infinite scrolling, the system processes and displays only the data the user actually needs at any moment. This pattern is widely used by large technology companies such as Facebook, Instagram, Twitter (X), and LinkedIn to power feeds, search results, and user lists, as it reduces server load while delivering a smooth and responsive user experience.

## Implementation Plan

The development of this project follows a clear and structured set of steps:

### Backend Development
- Develop the backend API using Node.js streams to efficiently read large files and expose a cursor-based pagination endpoint.

### Backend Testing
- Implement unit tests.  
- Test the API endpoints using Postman to verify pagination logic, cursor handling, performance, and edge cases before frontend integration.

### Frontend Integration
- Connect the validated backend API to the frontend application to fetch and display paginated data.

### Infinite Scroll Implementation
- Implement infinite scrolling on the frontend using the Intersection Observer API, enabling automatic data loading as the user scrolls.  
- Add the feature of filtering on the frontend and adjust the backend to support it.
