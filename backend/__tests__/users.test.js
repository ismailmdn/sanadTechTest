import { jest } from '@jest/globals';
import request from 'supertest';

const generateMockUsers = (cursor, limit, totalUsers = 10000000) => {
  const users = [];
  const endIndex = Math.min(cursor + limit, totalUsers);
  
  for (let i = cursor; i < endIndex; i++) {
    users.push({
      id: i,
      username: `User ${i}`
    });
  }
  
  return users;
};

const mockGetUsersFromFile = jest.fn();

await jest.unstable_mockModule('../services/userService.js', () => ({
  getUsersFromFile: mockGetUsersFromFile
}));

const { app } = await import('../server.js');

describe('GET /users', () => {
  const MOCK_TOTAL_USERS = 10000000;

  beforeEach(() => {
    mockGetUsersFromFile.mockClear();
    mockGetUsersFromFile.mockImplementation(async (cursor, limit, searchQuery = '') => {
      if (searchQuery && searchQuery.trim()) {
        const allUsers = [];
        for (let i = 0; i < MOCK_TOTAL_USERS; i++) {
          allUsers.push({ id: i, username: `User ${i}` });
        }
        const filteredUsers = allUsers.filter(user => 
          user.username.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
        const startIndex = cursor;
        const endIndex = Math.min(startIndex + limit, filteredUsers.length);
        return filteredUsers.slice(startIndex, endIndex);
      }
      return generateMockUsers(cursor, limit, MOCK_TOTAL_USERS);
    });
  });

  describe('Basic functionality', () => {
    test('should return users with default limit and cursor', async () => {
      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('nextCursor');
      expect(response.body).toHaveProperty('hasMore');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(response.body.users.length).toBeGreaterThan(0);
      expect(mockGetUsersFromFile).toHaveBeenCalledWith(0, 50, '');
    });

    test('should return users with custom limit and cursor', async () => {
      const cursor = 10;
      const limit = 25;
      const response = await request(app)
        .get(`/users?limit=${limit}&cursor=${cursor}`)
        .expect(200);

      expect(response.body.users.length).toBeLessThanOrEqual(limit);
      expect(response.body.users[0].id).toBe(cursor);
      expect(mockGetUsersFromFile).toHaveBeenCalledWith(cursor, limit, '');
    });
  });

  describe('Pagination', () => {
    test('should return nextCursor when more data is available', async () => {
      const response = await request(app)
        .get('/users?limit=50')
        .expect(200);

      expect(response.body.hasMore).toBe(true);
      expect(response.body.nextCursor).toBe(50);
    });

    test('should return null nextCursor when no more data', async () => {
      mockGetUsersFromFile.mockResolvedValueOnce(generateMockUsers(9999995, 3, 9999998));
      
      const response = await request(app)
        .get('/users?limit=10&cursor=9999995')
        .expect(200);

      expect(response.body.hasMore).toBe(false);
      expect(response.body.nextCursor).toBeNull();
    });
  });

  describe('Edge cases', () => {
    test('should return 400 for negative cursor', async () => {
      const response = await request(app)
        .get('/users?cursor=-1')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(mockGetUsersFromFile).not.toHaveBeenCalled();
    });

    test('should return 400 for limit less than 1', async () => {
      const response = await request(app)
        .get('/users?limit=0')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(mockGetUsersFromFile).not.toHaveBeenCalled();
    });

    test('should handle non-numeric parameters gracefully', async () => {
      const response = await request(app)
        .get('/users?limit=abc&cursor=xyz')
        .expect(200);

      expect(response.body.users.length).toBeGreaterThan(0);
      expect(mockGetUsersFromFile).toHaveBeenCalledWith(0, 50, '');
    });

    test('should cap limit at maximum value', async () => {
      const response = await request(app)
        .get('/users?limit=5000')
        .expect(200);

      expect(response.body.users.length).toBeLessThanOrEqual(1000);
      expect(mockGetUsersFromFile).toHaveBeenCalledWith(0, 1000, '');
    });
  });

  describe('Data structure', () => {
    test('should return users with correct structure', async () => {
      const response = await request(app)
        .get('/users?limit=5')
        .expect(200);

      response.body.users.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('username');
        expect(typeof user.id).toBe('number');
        expect(typeof user.username).toBe('string');
      });
    });
  });
});
