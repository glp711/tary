import { useState, useEffect, useRef } from 'react';

const initialFormState = {
    title: '',
    images: [], // Changed from imageUrl to images array
    link: '',
    order: 0,
    active: true
};

export default function StoryForm({ isOpen, story, onSave, onClose }) {
    const [formData, setFormData] = useState(initialFormState);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (story) {
            setFormData({
                title: story.title || '',
                images: story.images || (story.imageUrl ? [story.imageUrl] : []), // Handle legacy or new array
                link: story.link || '',
                order: story.order || 0,
                active: story.active ?? true
            });
            // Initial previews are the existing URLs
            setPreviews(story.images || (story.imageUrl ? [story.imageUrl] : []));
        } else {
            setFormData(initialFormState);
            setPreviews([]);
        }
    }, [story, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Append new files to existing images array
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...files]
            }));

            // Create previews for new files and append to existing previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'open' : ''}`} onClick={handleOverlayClick}>
            <div className="modal admin-modal">
                <div className="admin-modal-header">
                    <h2 className="admin-modal-title">
                        {story ? 'Editar Story' : 'Novo Story'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="form-group">
                            <label className="form-label">Título</label>
                            <input
                                name="title"
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Bastidores"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Imagens do Story (Vertical 400x600px)</label>
                            <div
                                className="image-uploader"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="image-uploader-content">
                                    <div className="image-uploader-icon">📷</div>
                                    <p className="image-uploader-text">Adicionar Fotos</p>
                                    <p className="image-uploader-hint">Clique para selecionar múltiplas</p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple // Allow multiple files
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    key={previews.length} // Reset input to allow adding same file if deleted
                                />
                            </div>

                            {/* Image Previews */}
                            {previews.length > 0 && (
                                <div className="image-previews">
                                    {previews.map((preview, index) => (
                                        <div key={index} className="image-preview">
                                            <img src={preview} alt={`Preview ${index + 1}`} />
                                            <button
                                                type="button"
                                                className="image-preview-remove"
                                                onClick={() => removeImage(index)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {previews.length > 0 && (
                                <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: '0.5rem' }}>
                                    A primeira imagem será a capa do Story.
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Link (Opcional)</label>
                            <input
                                name="link"
                                type="text"
                                className="form-input"
                                value={formData.link}
                                onChange={handleChange}
                                placeholder="Ex: Maiôs ou Biquínis"
                            />
                            <div style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.5rem', background: 'var(--gray-50)', padding: '0.75rem', borderRadius: '4px' }}>
                                <strong style={{ display: 'block', marginBottom: '0.25rem' }}>💡 Como usar o Link:</strong>
                                <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                    <li><strong>Filtrar por categoria:</strong> Digite o nome (ex: <code>Maiôs</code>, <code>Biquínis</code>, <code>Plus Size</code>)</li>
                                    <li><strong>Rolar para seção:</strong> <code>#produtos</code></li>
                                    <li><strong>Link externo:</strong> <code>https://...</code></li>
                                </ul>
                                <p style={{ margin: '0.5rem 0 0', fontStyle: 'italic' }}>✨ Ao clicar em "Ver Mais", filtra e rola automaticamente!</p>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Ordem</label>
                                <input
                                    name="order"
                                    type="number"
                                    className="form-input"
                                    value={formData.order}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="active"
                                        checked={formData.active}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <span>Ativo</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-success">Salvar Story</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
