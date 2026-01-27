import { useState, useRef } from 'react';
import { filesToBase64 } from '../../utils/storage';

export default function ImageUploader({ images, onChange }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await processFiles(files);
        }
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            await processFiles(files);
        }
    };

    const processFiles = async (files) => {
        try {
            const base64Images = await filesToBase64(files);
            onChange([...images, ...base64Images]);
        } catch (error) {
            console.error('Error processing files:', error);
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div className="form-group">
            <label className="form-label">Fotos do Produto</label>

            <div
                className={`image-uploader ${isDragOver ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="image-uploader-icon">📷</div>
                <p className="image-uploader-text">
                    Arraste as fotos aqui ou clique para selecionar
                </p>
                <p className="image-uploader-hint">
                    Formatos aceitos: JPG, PNG, WebP
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {images.length > 0 && (
                <div className="image-previews">
                    {images.map((img, index) => (
                        <div key={index} className="image-preview">
                            <img src={img} alt={`Preview ${index + 1}`} />
                            <button
                                type="button"
                                className="image-preview-remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
