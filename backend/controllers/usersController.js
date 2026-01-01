import { getUsersFromFile } from '../services/userService.js';

export const getUsers = async (req, res) => {
  try {
    const cursor = req.validatedCursor;
    const limit = req.validatedLimit;

    const users = await getUsersFromFile(cursor, limit);

    const nextCursor =
      users.length < limit ? null : cursor + users.length;

    res.json({
      users,
      nextCursor,
      hasMore: nextCursor !== null
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

