const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

/**
 * 上传图片到服务端 (→ Supabase Storage)
 */
export async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '上传失败');
    }
    return res.json();
}

/**
 * 调用 AI 生成成片
 */
export async function generateImage({
    prompt,
    modelRefUrl,
    outfitRefUrl,
    previousImageUrl,
    pose,
    colorScheme,
    customInstructions,
    apiKey
}) {
    const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt,
            modelRefUrl,
            outfitRefUrl,
            previousImageUrl,
            pose,
            colorScheme,
            customInstructions,
            apiKey
        })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '生成失败');
    }
    return res.json();
}

/**
 * 获取生成历史
 */
export async function fetchHistory() {
    const res = await fetch(`${API_BASE}/generate/history`);
    if (!res.ok) {
        return [];
    }
    return res.json();
}
