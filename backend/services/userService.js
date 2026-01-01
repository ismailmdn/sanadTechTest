import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getUsersFromFile = async (cursor, limit, searchQuery = '') => {
  const filePath = join(__dirname, '..', 'usernames.txt');
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let index = 0;
  let matchedCount = 0;
  const users = [];
  const searchLower = searchQuery.toLowerCase().trim();

  for await (const line of rl) {
    const username = line.trim();
    
    if (username) {
      const matchesSearch = !searchLower || username.toLowerCase().startsWith(searchLower);
      
      if (matchesSearch) {
        if (matchedCount >= cursor && users.length < limit) {
          users.push({
            id: index,
            username
          });
        }
        matchedCount++;
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

