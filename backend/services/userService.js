import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getUsersFromFile = async (cursor, limit) => {
  const filePath = join(__dirname, '..', 'usernames.txt');
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
  return users;
};

