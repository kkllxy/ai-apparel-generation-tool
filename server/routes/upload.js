import { Router } from 'express';
import { randomUUID } from 'crypto';

export function uploadRoute(supabase, upload) {
    const router = Router();

    router.post('/', upload.single('image'), async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: '请上传图片文件' });
            }

            const ext = req.file.originalname.split('.').pop() || 'png';
            const fileName = `${Date.now()}-${randomUUID()}.${ext}`;
            const filePath = `uploads/${fileName}`;

            const { data, error } = await supabase.storage
                .from('images')
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (error) {
                console.error('Supabase upload error:', error);
                return res.status(500).json({ error: `上传失败: ${error.message}` });
            }

            // 获取公开 URL
            const { data: urlData } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            res.json({
                url: urlData.publicUrl,
                path: filePath,
                fileName
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: error.message || '上传失败' });
        }
    });

    return router;
}
