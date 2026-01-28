import { useState, useEffect, useRef } from 'react';
import { createSlug } from '../../utils/storage';

const initialFormState = {
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    order: 0,
    active: true
};

export default function CollectionForm({ isOpen, collection, onSave, onClose }) {
    const [formData, setFormData] = useState(initialFormState);
    const [previewUrl, setPreviewUrl] = useState('');
    const [touchedSlug, setTouchedSlug] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (collection) {
            setFormData({
                name: collection.name || '',
                slug: collection.slug || '',
                description: collection.description || '',
                imageUrl: collection.imageUrl || '',
                order: collection.order || 0,
                active: collection.active ?? true
            });
            setPreviewUrl(collection.imageUrl || '');
            setTouchedSlug(true);
        } else {
            setFormData(initialFormState);
            setPreviewUrl('');
            setTouchedSlug(false);
        }
    }, [collection, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => {
            const newData = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            if (name === 'name' && !touchedSlug) {
                newData.slug = createSlug(value);
            }

            return newData;
        });

        if (name === 'slug') {
            setTouchedSlug(true);
        }
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
                        {collection ? 'Editar Coleção' : 'Nova Coleção'}
                    </h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="form-group">
                            <label className="form-label">Nome da Coleção</label>
                            <input
                                name="name"
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Verão 2024"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Slug (URL)</label>
                            <input
                                name="slug"
                                type="text"
                                className="form-input"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="ex: verao-2024"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Descrição</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Breve descrição da coleção..."
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Imagem da Coleção (400x400px)</label>
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
                                            style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-500)' }}>Clique para trocar</div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
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
                                    <span>Ativa</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-success">Salvar Coleção</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
