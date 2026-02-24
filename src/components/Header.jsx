export default function Header({ isGenerating, onOpenSettings }) {
    return (
        <header className="header">
            <div className="header-left">
                <div className="header-logo">✨</div>
                <h1 className="header-title">AI 模特成片生成器</h1>
            </div>
            <div className="header-right">
                <div className="status-indicator">
                    <div className={`status-dot ${isGenerating ? 'generating' : ''}`} />
                    <span>{isGenerating ? '生成中...' : '就绪'}</span>
                </div>
                <button
                    className="settings-btn"
                    onClick={onOpenSettings}
                    title="设置"
                >
                    ⚙
                </button>
            </div>
        </header>
    );
}
