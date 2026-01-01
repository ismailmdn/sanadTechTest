import express from 'express';
import cors from 'cors';
import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Users API' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
app.get('/users', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 1000);
    const cursor = parseInt(req.query.cursor) || 0;

    if (cursor < 0 || limit < 1) {
      return res.status(400).json({ error: 'Invalid cursor or limit' });
    }

    const filePath = join(__dirname, 'usernames.txt');

    const stream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    let index = 0;
    const users = [];

    for await (const line of rl) {
      if (index >= cursor && users.length < limit) {
        const username = line.trim();
        if (username) {
          users.push({
            id: index,
            username
          });
        }
      }

      index++;

      if (users.length === limit) {
        break;
      }
    }

    rl.close();

    const nextCursor =
      users.length < limit ? null : cursor + users.length;

    res.json({
      users,
      nextCursor,
      hasMore: nextCursor !== null
    });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
