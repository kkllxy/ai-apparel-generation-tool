import { Router } from 'express';

export function generateRoute(supabase) {
    const router = Router();

    router.post('/', async (req, res) => {
        try {
            const {
                prompt,
                modelRefUrl,
                outfitRefUrl,
                previousImageUrl,
                pose,
                colorScheme,
                customInstructions,
                apiKey // 用户前端传入的 API Key（可选）
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

            // 构造请求体
            const requestBody = {
                prompt: prompt,
                size: '3x4',       // 接近 300x400 的比例
                quality: '2k',
                response_format: 'url'
            };

            // 如果是 i2i，添加 images 参数
            if (hasReferenceImage) {
                const images = [];
                if (previousImageUrl) {
                    images.push({ url: previousImageUrl });
                } else if (modelRefUrl) {
                    images.push({ url: modelRefUrl });
                }
                if (outfitRefUrl && !previousImageUrl) {
                    images.push({ url: outfitRefUrl });
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

            // 保存生成记录到 Supabase
            try {
                const { error: dbError } = await supabase.from('generations').insert({
                    model_ref_url: modelRefUrl || null,
                    outfit_ref_url: outfitRefUrl || null,
                    prompt: prompt,
                    result_url: imageUrl,
                    pose: pose || null,
                    color_scheme: colorScheme || null,
                    custom_instructions: customInstructions || null
                });
                if (dbError) {
                    console.warn('Failed to save to Supabase:', dbError.message);
                }
            } catch (dbErr) {
                console.warn('Supabase save error:', dbErr.message);
            }

            res.json({
                imageUrl,
                revisedPrompt,
                created: result.created
            });
        } catch (error) {
            console.error('Generate error:', error);
            res.status(500).json({ error: error.message || '生成失败，请重试' });
        }
    });

    // 获取历史记录
    router.get('/history', async (req, res) => {
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

    return router;
}
