import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { prompt, modelRefUrl, outfitRefUrl, previousImageUrl, pose, colorScheme, customInstructions, apiKey } = req.body;

        const bananaKey = apiKey || process.env.BANANA_API_KEY;
        if (!bananaKey) return res.status(400).json({ error: '未配置 API Key，请在设置中填入您的 API Key' });

        const hasReferenceImage = previousImageUrl || modelRefUrl;
        const endpoint = hasReferenceImage
            ? 'https://api.jiekou.ai/v3/nano-banana-light-i2i'
            : 'https://api.jiekou.ai/v3/nano-banana-light-t2i';

        const requestBody = { prompt, size: '3x4', quality: '2k', response_format: 'url' };

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

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bananaKey}` },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `AI 生成失败 (${response.status}): ${errorText}` });
        }

        const result = await response.json();
        const imageUrl = result.data?.[0]?.url || result.data?.[0]?.b64_json;
        if (!imageUrl) return res.status(500).json({ error: '生成结果为空，请重试' });

        // 保存到 Supabase
        try {
            const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY);
            await supabase.from('generations').insert({
                model_ref_url: modelRefUrl || null, outfit_ref_url: outfitRefUrl || null,
                prompt, result_url: imageUrl, pose: pose || null,
                color_scheme: colorScheme || null, custom_instructions: customInstructions || null
            });
        } catch (e) { console.warn('DB save error:', e.message); }

        res.json({ imageUrl, revisedPrompt: result.data?.[0]?.revised_prompt, created: result.created });
    } catch (error) {
        console.error('Generate error:', error);
        res.status(500).json({ error: error.message || '生成失败，请重试' });
    }
}
