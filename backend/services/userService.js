import fs from 'fs';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getIndexPath = () => join(__dirname, '..', 'usernames.idx.json');
const getFilePath = () => join(__dirname, '..', 'usernames.txt');

let indexBuildPromise = null;

const loadIndex = async () => {
  const indexPath = getIndexPath();
  if (fs.existsSync(indexPath)) {
    try {
      const indexData = fs.readFileSync(indexPath, 'utf-8');
      return JSON.parse(indexData);
    } catch (error) {
      console.error('Error loading index:', error);
      return null;
    }
  }
  return null;
};

const ensureIndexExists = async () => {
  const indexPath = getIndexPath();
  const filePath = getFilePath();
  
  if (!fs.existsSync(indexPath)) {
    if (!indexBuildPromise) {
      console.log('Index file not found. Building index...');
      indexBuildPromise = buildIndex(filePath);
      await indexBuildPromise;
      indexBuildPromise = null;
      console.log('Index built successfully');
    } else {
      await indexBuildPromise;
    }
  }
};

export const buildIndex = async (filePath) => {
  const index = {};
  let offset = 0;
  let lineNumber = 0;

  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({ 
    input: stream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    const firstChar = line[0]?.toLowerCase();

    if (firstChar && !(firstChar in index)) {
      index[firstChar] = {
        offset: offset,
        lineNumber: lineNumber
      };
    }

    offset += Buffer.byteLength(line + '\n', 'utf-8');
    lineNumber++;
  }

  rl.close();
  
  const indexPath = getIndexPath();
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log('Index built successfully');
  return index;
};

export const getUsersFromFile = async (cursor, limit, searchQuery = '') => {
  await ensureIndexExists();
  
  const filePath = getFilePath();
  const searchLower = searchQuery.toLowerCase().trim();
  
  let startOffset = 0;
  let startLineIndex = 0;
  
  if (searchLower && searchLower.length > 0) {
    const firstChar = searchLower[0];
    const index = await loadIndex();
    if (index && index[firstChar]) {
      const indexEntry = index[firstChar];
      if (typeof indexEntry === 'object' && indexEntry.offset !== undefined) {
        startOffset = indexEntry.offset;
        startLineIndex = indexEntry.lineNumber;
      } else if (typeof indexEntry === 'number') {
        startOffset = indexEntry;
      }
    }
  }

  const stream = fs.createReadStream(filePath, { start: startOffset });
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  let globalIndex = startLineIndex;
  let matchedCount = 0;
  const users = [];

  for await (const line of rl) {
    const username = line.trim();
    
    if (username) {
      const matchesSearch = !searchLower || username.toLowerCase().startsWith(searchLower);
      
      if (matchesSearch) {
        if (matchedCount >= cursor && users.length < limit) {
          users.push({
            id: globalIndex,
            username
          });
        }
        matchedCount++;
      }
    }

    globalIndex++;

    if (users.length === limit) {
      break;
    }
  }

  rl.close();
  return users;
};

