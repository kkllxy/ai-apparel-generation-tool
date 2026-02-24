import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件'));
    }
  }
});

// === Health check ===
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// === Upload route ===
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const ext = req.file.originalname.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `uploads/${fileName}`;

    console.log(`📤 Uploading ${req.file.originalname} (${req.file.size} bytes) → ${filePath}`);

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

    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    console.log(`✅ Upload success: ${urlData.publicUrl}`);
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

// === Generate route ===
app.post('/api/generate', async (req, res) => {
  try {
    const {
      prompt,
      modelRefUrl,
      outfitRefUrl,
      previousImageUrl,
      pose,
      colorScheme,
      customInstructions,
      apiKey
    } = req.body;

    const bananaKey = apiKey || process.env.BANANA_API_KEY;
    if (!bananaKey) {
      return res.status(400).json({ error: '未配置 API Key，请在设置中填入您的 API Key' });
    }

    // 决定使用 t2i 还是 i2i
    const hasReferenceImage = previousImageUrl || modelRefUrl;
    const endpoint = hasReferenceImage
      ? 'https://api.jiekou.ai/v3/nano-banana-light-i2i'
      : 'https://api.jiekou.ai/v3/nano-banana-light-t2i';

    const requestBody = {
      prompt: prompt,
      size: '3x4',
      quality: '2k',
      response_format: 'url'
    };

    // 如果是 i2i，添加 images（API 要求 string 数组）
    if (hasReferenceImage) {
      const images = [];
      if (previousImageUrl) {
        images.push(previousImageUrl);
      } else if (modelRefUrl) {
        images.push(modelRefUrl);
      }
      if (outfitRefUrl && !previousImageUrl) {
        images.push(outfitRefUrl);
      }
      requestBody.images = images;
    }

    console.log(`📡 Calling Banana API: ${endpoint}`);
    console.log('📝 Prompt:', prompt.substring(0, 100) + '...');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bananaKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Banana API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `AI 生成失败 (${response.status}): ${errorText}`
      });
    }

    const result = await response.json();
    const imageUrl = result.data?.[0]?.url || result.data?.[0]?.b64_json;
    const revisedPrompt = result.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      return res.status(500).json({ error: '生成结果为空，请重试' });
    }

    // 保存到 Supabase
    try {
      await supabase.from('generations').insert({
        model_ref_url: modelRefUrl || null,
        outfit_ref_url: outfitRefUrl || null,
        prompt,
        result_url: imageUrl,
        pose: pose || null,
        color_scheme: colorScheme || null,
        custom_instructions: customInstructions || null
      });
    } catch (dbErr) {
      console.warn('Supabase save error:', dbErr.message);
    }

    res.json({ imageUrl, revisedPrompt, created: result.created });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ error: error.message || '生成失败，请重试' });
  }
});

// === History route ===
app.get('/api/generate/history', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
