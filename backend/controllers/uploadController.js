import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { buildIndex } from '../services/userService.js';
import formidable from 'formidable';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const uploadFile = async (req, res) => {
  try {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024,
      keepExtensions: true
    });

    const [fields, files] = await form.parse(req);

    if (!files.file || !Array.isArray(files.file) || files.file.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = files.file[0];
    
    if (!uploadedFile.originalFilename || !uploadedFile.originalFilename.endsWith('.txt')) {
      if (fs.existsSync(uploadedFile.filepath)) {
        fs.unlinkSync(uploadedFile.filepath);
      }
      return res.status(400).json({ error: 'Only .txt files are allowed' });
    }

    const filePath = join(__dirname, '..', 'usernames.txt');
    const indexPath = join(__dirname, '..', 'usernames.idx.json');

    if (fs.existsSync(indexPath)) {
      fs.unlinkSync(indexPath);
      console.log('Deleted old index file');
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    fs.renameSync(uploadedFile.filepath, filePath);

    await buildIndex(filePath);
    console.log('New index built successfully');

    res.json({ 
      message: 'File uploaded and replaced successfully',
      filename: uploadedFile.originalFilename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

