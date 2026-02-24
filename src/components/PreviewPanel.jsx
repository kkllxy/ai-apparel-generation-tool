export default function PreviewPanel({
    currentResult,
    history,
    isGenerating,
    onDownload,
    onHistorySelect
}) {
    return (
        <div className="panel preview-panel">
            <div className="preview-main">
                {isGenerating ? (
                    <div className="generating-overlay">
                        <div className="spinner" />
                        <span>AI 正在生成成片...</span>
                        <span style={{ fontSize: 12, opacity: 0.6 }}>预计 30-60 秒</span>
                    </div>
                ) : currentResult?.imageUrl ? (
                    <div className="preview-image-container">
                        <img
                            src={currentResult.imageUrl}
                            alt="AI 生成成片"
                            className="preview-image"
                        />
                        <div className="preview-actions">
                            <button className="preview-action-btn" onClick={onDownload}>
                                ⬇ 下载成片
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="preview-empty">
                        <div className="preview-empty-icon">🖼️</div>
                        <div className="preview-empty-text">暂无生成结果</div>
                        <div className="preview-empty-sub">
                            上传参考图后点击「生成成片」
                        </div>
                    </div>
                )}
            </div>

            <div className="history-section">
                <div className="history-title">历史记录</div>
                <div className="history-grid">
                    {history.length > 0 ? (
                        history.slice(0, 6).map((item, index) => (
                            <div
                                key={item.id || index}
                                className={`history-item ${currentResult?.imageUrl === item.imageUrl ? 'active' : ''}`}
                                onClick={() => onHistorySelect(item)}
                            >
                                <img src={item.imageUrl} alt={`历史 ${index + 1}`} />
                            </div>
                        ))
                    ) : (
                        <div className="history-empty">
                            生成后的成片将显示在这里
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
