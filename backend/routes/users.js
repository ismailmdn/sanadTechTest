import express from 'express';
import { getUsers } from '../controllers/usersController.js';
import { validatePagination } from '../middleware/validation.js';

const router = express.Router();

router.get('/', validatePagination, getUsers);

export default router;

