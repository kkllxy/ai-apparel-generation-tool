import { useState, useRef, useCallback } from 'react';

export default function ImageUploader({ image, onSelect, placeholder }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFile = useCallback((file) => {
        if (file && file.type.startsWith('image/')) {
            onSelect(file);
        }
    }, [onSelect]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
        e.target.value = '';
    };

    const hasImage = image?.preview;

    return (
        <>
            <div
                className={`upload-zone ${isDragging ? 'dragging' : ''} ${hasImage ? 'has-image' : ''}`}
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {hasImage ? (
                    <>
                        <img src={image.preview} alt="Preview" className="upload-preview" />
                        <div className="upload-overlay">
                            <span className="upload-overlay-text">点击重新上传</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="upload-icon">📁</div>
                        <div className="upload-text">
                            拖拽图片到此处 或 <span>点击上传</span>
                            <br />
                            {placeholder}
                        </div>
                    </>
                )}
            </div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: 'none' }}
            />
        </>
    );
}
