import ImageUploader from './ImageUploader';

export default function UploadPanel({
    modelImage,
    outfitImage,
    onModelImageSelect,
    onOutfitImageSelect,
    onGenerate,
    isGenerating,
    canGenerate
}) {
    return (
        <div className="panel">
            <div className="panel-title">输入素材</div>

            <div className="upload-section">
                <label className="upload-label">📷 模特参考图</label>
                <ImageUploader
                    image={modelImage}
                    onSelect={onModelImageSelect}
                    placeholder="上传模特照片作为外观参考"
                />
            </div>

            <div className="upload-section">
                <label className="upload-label">👗 搭配参考图</label>
                <ImageUploader
                    image={outfitImage}
                    onSelect={onOutfitImageSelect}
                    placeholder="上传服装搭配参考图"
                />
            </div>

            <div className="generate-params">
                <span>输出尺寸</span>
                <span>300 × 400</span>
            </div>

            <button
                className={`generate-btn ${isGenerating ? 'generating' : ''}`}
                onClick={onGenerate}
                disabled={!canGenerate || isGenerating}
            >
                {isGenerating ? '⏳ 生成中...' : '✨ 生成成片'}
            </button>
        </div>
    );
}
