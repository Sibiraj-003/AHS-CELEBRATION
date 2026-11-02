import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-upload-middleware',
      configureServer(server) {
        server.middlewares.use('/api/upload', async (req, res) => {
          if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.statusCode = 200;
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });

          req.on('end', async () => {
            try {
              const { imageBase64, filename } = JSON.parse(body || '{}');
              if (!imageBase64) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing imageBase64' }));
                return;
              }

              const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
              const buffer = Buffer.from(base64Data, 'base64');
              const formData = new FormData();
              formData.append('reqtype', 'fileupload');
              formData.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), filename || 'attendee.jpg');

              const catboxRes = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: formData,
              });

              const publicUrl = (await catboxRes.text()).trim();
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');

              if (publicUrl.startsWith('http')) {
                res.statusCode = 200;
                res.end(JSON.stringify({ url: publicUrl }));
              } else {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Upload failed', details: publicUrl }));
              }
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Server error' }));
            }
          });
        });
      },
    },
  ],
})
