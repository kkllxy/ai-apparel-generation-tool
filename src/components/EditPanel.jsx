import ImageUploader from './ImageUploader';
import { POSE_OPTIONS, COLOR_OPTIONS } from '../lib/prompts';

export default function EditPanel({
    pose,
    setPose,
    colorScheme,
    setColorScheme,
    customInstructions,
    setCustomInstructions,
    newOutfitImage,
    onNewOutfitSelect,
    onApply,
    isGenerating,
    hasResult
}) {
    return (
        <div className="panel">
            <div className="panel-title">编辑面板</div>

            {/* 姿势调整 */}
            <div className="edit-section">
                <div className="edit-section-title">🧍 姿势调整</div>
                <select
                    className="edit-select"
                    value={pose}
                    onChange={(e) => setPose(e.target.value)}
                >
                    <option value="">选择姿势预设...</option>
                    {POSE_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                <textarea
                    className="edit-textarea"
                    value={pose === '' ? customInstructions : ''}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder='可选：细化动作描述，如「左手叉腰，右手自然下垂」'
                    rows={2}
                />
            </div>

            {/* 配色调整 */}
            <div className="edit-section">
                <div className="edit-section-title">🎨 配色方案</div>
                <div className="color-presets">
                    {COLOR_OPTIONS.map(c => (
                        <button
                            key={c}
                            className={`color-preset ${colorScheme === c ? 'active' : ''}`}
                            onClick={() => setColorScheme(colorScheme === c ? '' : c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <textarea
                    className="edit-textarea"
                    placeholder='可选：细化色调描述，如「整体偏暖色调」'
                    rows={2}
                />
            </div>

            {/* 换搭方案 */}
            <div className="edit-section">
                <div className="edit-section-title">👗 换搭方案</div>
                <ImageUploader
                    image={newOutfitImage}
                    onSelect={onNewOutfitSelect}
                    placeholder="上传新的搭配参考图"
                />
            </div>

            {/* 应用修改按钮 */}
            <button
                className="apply-btn"
                onClick={onApply}
                disabled={isGenerating || !hasResult}
            >
                {isGenerating ? '⏳ 生成中...' : '🔄 应用修改'}
            </button>

            {/* 一致性提示 */}
            <div className="consistency-hint">
                💡 修改会尽量保持模特的人脸和体型一致性。选择姿势或配色后点击「应用修改」即可生成新的成片。
            </div>
        </div>
    );
}
