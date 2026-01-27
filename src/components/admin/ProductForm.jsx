import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { CATEGORIES, COLLECTIONS } from '../../utils/storage';

const initialFormState = {
    name: '',
    category: 'Biquínis',
    collection: 'Verão 2024',
    price: '',
    description: '',
    images: [],
    featured: false,
    isNew: false,
    plusSize: false
};

// Format price as Brazilian currency (R$ 100,00)
// Input treated as centavos: 18990 -> R$ 189,90
const formatPrice = (value) => {
    // Remove everything except numbers
    let numbers = value.replace(/\D/g, '');

    // If empty, return empty
    if (numbers === '') return '';

    // Remove leading zeros
    numbers = numbers.replace(/^0+/, '') || '0';

    // Pad with zeros if less than 3 digits (need at least 3 for centavos)
    while (numbers.length < 3) {
        numbers = '0' + numbers;
    }

    // Split into reais and centavos
    const centavos = numbers.slice(-2);
    const reais = numbers.slice(0, -2) || '0';

    // Format reais with thousand separator
    const reaisFormatted = parseInt(reais, 10).toLocaleString('pt-BR');

    return `R$ ${reaisFormatted},${centavos}`;
};

// Parse price string to centavos (for editing)
const parsePrice = (priceString) => {
    if (!priceString) return '';
    // Remove "R$ ", dots, and commas to get raw centavos
    return priceString.replace(/[R$\s.]/g, '').replace(',', '');
};

export default function ProductForm({ isOpen, product, onSave, onClose }) {
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                category: product.category || 'Biquínis',
                collection: product.collection || 'Verão 2024',
                price: product.price || '',
                description: product.description || '',
                images: product.images || [],
                featured: product.featured || false,
                isNew: product.isNew || false,
                plusSize: product.plusSize || false
            });
        } else {
            setFormData(initialFormState);
        }
    }, [product, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Special handler for price formatting
    const handlePriceChange = (e) => {
        const rawValue = e.target.value;
        const formatted = formatPrice(rawValue);
        setFormData(prev => ({
            ...prev,
            price: formatted
        }));
    };

    const handleImagesChange = (newImages) => {
        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.price.trim()) {
            alert('Por favor, preencha o nome e o preço do produto.');
            return;
        }

        onSave(formData);
        setFormData(initialFormState);
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
                        {product ? 'Editar Produto' : 'Novo Produto'}
                    </h2>
                    <button className="modal-close" onClick={onClose} style={{ position: 'static' }}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="admin-modal-body">
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Nome do Produto *</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Biquíni Tropical"
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="category">Categoria</label>
                                <select
                                    id="category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="collection">Coleção</label>
                                <select
                                    id="collection"
                                    name="collection"
                                    className="form-select"
                                    value={formData.collection}
                                    onChange={handleChange}
                                >
                                    {COLLECTIONS.map(col => (
                                        <option key={col} value={col}>{col}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="price">Preço *</label>
                            <input
                                id="price"
                                name="price"
                                type="text"
                                className="form-input"
                                value={formData.price}
                                onChange={handlePriceChange}
                                placeholder="Digite apenas números (ex: 18990)"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="description">Descrição</label>
                            <textarea
                                id="description"
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Descreva os detalhes do produto..."
                            />
                        </div>

                        <ImageUploader
                            images={formData.images}
                            onChange={handleImagesChange}
                        />

                        <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px', accentColor: 'var(--gold)' }}
                                    />
                                    <span>⭐ Produto em Destaque</span>
                                </label>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="isNew"
                                        checked={formData.isNew}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px', accentColor: 'var(--accent-blue)' }}
                                    />
                                    <span>✨ Novidade</span>
                                </label>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="plusSize"
                                        checked={formData.plusSize}
                                        onChange={handleChange}
                                        style={{ width: '20px', height: '20px', accentColor: '#ec4899' }}
                                    />
                                    <span>👗 Plus Size</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="admin-modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-success">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {product ? 'Salvar Alterações' : 'Adicionar Produto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
