import dotenv from 'dotenv';

dotenv.config();

const MAX_LIMIT = parseInt(process.env.MAX_LIMIT) || 1000;
const DEFAULT_LIMIT = parseInt(process.env.DEFAULT_LIMIT) || 50;

export const validateCursor = (cursorParam) => {
  let cursor = 0;
  
  if (cursorParam !== undefined && cursorParam !== null && cursorParam !== '') {
    const parsedCursor = parseInt(cursorParam);
    if (isNaN(parsedCursor)) {
      cursor = 0;
    } else if (parsedCursor < 0) {
      return {
        isValid: false,
        cursor: 0,
        error: 'Invalid cursor or limit'
      };
    } else {
      cursor = parsedCursor;
    }
  }
  
  return {
    isValid: true,
    cursor
  };
};

export const validateLimit = (limitParam) => {
  let limit = DEFAULT_LIMIT;
  
  if (limitParam !== undefined && limitParam !== null && limitParam !== '') {
    const parsedLimit = parseInt(limitParam);
    if (isNaN(parsedLimit)) {
      limit = DEFAULT_LIMIT;
    } else if (parsedLimit < 1) {
      return {
        isValid: false,
        limit: DEFAULT_LIMIT,
        error: 'Invalid cursor or limit'
      };
    } else {
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }
  }
  
  return {
    isValid: true,
    limit
  };
};

export const validatePagination = (req, res, next) => {
  const cursorValidation = validateCursor(req.query.cursor);
  const limitValidation = validateLimit(req.query.limit);
  
  if (!cursorValidation.isValid) {
    return res.status(400).json({ error: cursorValidation.error });
  }
  
  if (!limitValidation.isValid) {
    return res.status(400).json({ error: limitValidation.error });
  }
  
  req.validatedCursor = cursorValidation.cursor;
  req.validatedLimit = limitValidation.limit;
  req.searchQuery = req.query.searchquery || '';
  
  next();
};

