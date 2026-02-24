/**
 * Prompt 构造工具
 * 根据用户输入（姿势、配色、搭配、自定义指令）生成用于 Banana API 的 prompt
 */

const POSE_MAP = {
    '站姿': 'standing straight, facing camera, natural pose',
    '走姿': 'walking forward, dynamic stride, natural motion',
    '坐姿': 'sitting elegantly, relaxed pose',
    '侧身': 'side profile, turning slightly, elegant angle',
    '抬手': 'one hand raised, dynamic gesture, expressive pose'
};

const COLOR_MAP = {
    '黑白': 'black and white color scheme, monochrome outfit',
    '米白+深蓝': 'cream white and navy blue color scheme',
    '浅卡其+白': 'light khaki and white color combination',
    '深灰+酒红': 'dark grey and burgundy wine red accent'
};

/**
 * 构造首次生成的 prompt
 */
export function buildInitialPrompt({ pose, colorScheme, customInstructions }) {
    const parts = [
        'Professional fashion model photo, editorial quality',
        'full body shot, studio lighting, clean solid white background',
        'fashion e-commerce product image, high resolution'
    ];

    if (pose && POSE_MAP[pose]) {
        parts.push(POSE_MAP[pose]);
    }

    if (colorScheme && COLOR_MAP[colorScheme]) {
        parts.push(COLOR_MAP[colorScheme]);
    }

    if (customInstructions && customInstructions.trim()) {
        parts.push(customInstructions.trim());
    }

    return parts.join(', ');
}

/**
 * 构造迭代编辑的 prompt
 */
export function buildEditPrompt({ pose, colorScheme, customInstructions, editType }) {
    const parts = [
        'Professional fashion model photo, editorial quality',
        'maintain the same model face and body type',
        'studio lighting, clean solid white background',
        'fashion e-commerce product image'
    ];

    if (pose && POSE_MAP[pose]) {
        parts.push(`pose: ${POSE_MAP[pose]}`);
    }

    if (colorScheme && COLOR_MAP[colorScheme]) {
        parts.push(`color scheme: ${COLOR_MAP[colorScheme]}`);
    }

    if (editType === 'outfit') {
        parts.push('wearing the outfit shown in the reference image');
    }

    if (customInstructions && customInstructions.trim()) {
        parts.push(customInstructions.trim());
    }

    return parts.join(', ');
}

export const POSE_OPTIONS = Object.keys(POSE_MAP);
export const COLOR_OPTIONS = Object.keys(COLOR_MAP);
