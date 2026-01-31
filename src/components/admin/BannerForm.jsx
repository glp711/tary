import { useState, useEffect, useRef } from 'react';

const initialFormState = {
    subtitle: '',
    title: '',
    description: '',
    imageUrl: '',
    buttonText: '',
    link: '',
    order: 0,
    active: true
};

export default function BannerForm({ isOpen, banner, onSave, onClose }) {
    const [formData, setFormData] = useState(initialFormState);
    const [previewUrl, setPreviewUrl] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (banner) {
            setFormData({
                subtitle: banner.subtitle || '',
                title: banner.title || '',
                description: banner.description || '',
                imageUrl: banner.imageUrl || '',
                buttonText: banner.buttonText || '',
                link: banner.link || '',
                order: banner.order || 0,
                active: banner.active ?? true
            });
            setPreviewUrl(banner.imageUrl || '');
        } else {
            setFormData(initialFormState);
            setPreviewUrl('');
        }
    }, [banner, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                imageUrl: file
            }));
            setPreviewUrl(URL.createObjectURL(file));
        }
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
                        {banner ? 'Editar Banner' : 'Novo Banner'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="form-group">
                            <label className="form-label">Subtítulo (Pequeno acima do título)</label>
                            <input
                                name="subtitle"
                                type="text"
                                className="form-input"
                                value={formData.subtitle}
                                onChange={handleChange}
                                placeholder="Ex: ESTILO PARA ELE"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Título Principal</label>
                            <input
                                name="title"
                                type="text"
                                className="form-input"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Moda Masculina"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descrição (Texto abaixo do título)</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Ex: Sungas e bermudas com design moderno e confortável"
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Texto do Botão</label>
                                <input
                                    name="buttonText"
                                    type="text"
                                    className="form-input"
                                    value={formData.buttonText}
                                    onChange={handleChange}
                                    placeholder="Ex: VER COLEÇÃO"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Link do Botão (Destino)</label>
                                <input
                                    name="link"
                                    type="text"
                                    className="form-input"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="Ex: /categoria/biquinis"
                                />
                                <div className="form-help-text" style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginTop: '0.5rem', background: 'var(--gray-50)', padding: '0.75rem', borderRadius: '4px' }}>
                                    <strong style={{ display: 'block', marginBottom: '0.25rem' }}>💡 Como usar o Link:</strong>
                                    <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                        <li><strong>Filtrar por categoria:</strong> Digite o nome da categoria (ex: <code>Maiôs</code>, <code>Biquínis</code>, <code>Plus Size</code>)</li>
                                        <li><strong>Rolar para seção:</strong> <code>#produtos</code>, <code>#novidades</code></li>
                                        <li><strong>Link externo:</strong> <code>https://instagram.com/...</code></li>
                                    </ul>
                                    <p style={{ margin: '0.5rem 0 0', fontStyle: 'italic' }}>✨ Ao usar o nome da categoria, o botão filtra e rola automaticamente!</p>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Imagem do Banner (1200x400px)</label>
                            <div
                                className="image-uploader"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: '2px dashed var(--gray-300)', borderRadius: '8px' }}
                            >
                                {previewUrl ? (
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Clique para trocar</div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                                        <p>Clique para selecionar uma imagem</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                />
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
                        <button type="submit" className="btn btn-success">Salvar Banner</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
