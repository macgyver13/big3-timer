import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    const filePath = join(process.cwd(), 'frontend', 'public', 'exercises.json');
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load exercise configuration' });
  }
}
