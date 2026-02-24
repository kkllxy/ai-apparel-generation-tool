import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { default: multer } = await import('multer');
        const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

        await new Promise((resolve, reject) => {
            upload.single('image')(req, res, (err) => (err ? reject(err) : resolve()));
        });

        if (!req.file) return res.status(400).json({ error: '请上传图片文件' });

        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
        const ext = req.file.originalname.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabase.storage.from('images').upload(filePath, req.file.buffer, {
            contentType: req.file.mimetype, upsert: false
        });
        if (error) return res.status(500).json({ error: `上传失败: ${error.message}` });

        const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
        res.json({ url: urlData.publicUrl, path: filePath, fileName });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || '上传失败' });
    }
}
