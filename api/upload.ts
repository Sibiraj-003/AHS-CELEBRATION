import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageBase64, filename } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    // Extract raw base64 data
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Forward to Catbox for permanent public image hosting
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    const blob = new Blob([buffer], { type: 'image/jpeg' });
    formData.append('fileToUpload', blob, filename || 'attendee.jpg');

    const catboxRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    const publicUrl = await catboxRes.text();
    const cleanUrl = publicUrl ? publicUrl.trim() : '';

    if (cleanUrl.startsWith('http')) {
      return res.status(200).json({ url: cleanUrl });
    } else {
      return res.status(500).json({ error: 'Upload failed', details: cleanUrl });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
