import { useState, useEffect } from 'react';

export default function SettingsModal({ onClose, onSave }) {
    const [apiKey, setApiKey] = useState('');
    const [status, setStatus] = useState('unsaved');

    useEffect(() => {
        const saved = localStorage.getItem('banana_api_key');
        if (saved) {
            setApiKey(saved);
            setStatus('saved');
        }
    }, []);

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('banana_api_key', apiKey.trim());
            setStatus('saved');
            onSave();
        }
    };

    const handleClear = () => {
        localStorage.removeItem('banana_api_key');
        setApiKey('');
        setStatus('unsaved');
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">⚙ 设置</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className={`modal-status ${status}`}>
                    {status === 'saved' ? '● 已保存' : '○ 未设置'}
                </div>

                <div className="modal-field">
                    <label className="modal-label">API Key</label>
                    <input
                        className="modal-input"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="输入您的 API Key"
                    />
                    <p className="modal-hint">
                        用于 jiekou.ai Banana Light API 的鉴权密钥。
                        密钥将存储在浏览器本地，不会上传到任何服务器。
                    </p>
                </div>

                <button className="modal-save-btn" onClick={handleSave}>
                    保存 Key
                </button>

                {status === 'saved' && (
                    <button
                        className="modal-save-btn"
                        style={{ marginTop: 8, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                        onClick={handleClear}
                    >
                        清除 Key
                    </button>
                )}
            </div>
        </div>
    );
}
