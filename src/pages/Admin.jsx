import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/admin/LoginForm';
import ProductForm from '../components/admin/ProductForm';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import { isAuthenticated, logout } from '../utils/auth';
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    initializeSampleData,
    resetToSampleData
} from '../utils/storage';

const PLACEHOLDER_IMAGE = '/sample-bikini.jpg';

export default function Admin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, product: null });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Check authentication status
        setIsLoggedIn(isAuthenticated());

        if (isAuthenticated()) {
            initializeAndLoad();
        } else {
            setIsLoading(false);
        }
    }, []);

    const initializeAndLoad = async () => {
        setIsLoading(true);
        try {
            await initializeSampleData();
            await loadProducts();
        } catch (error) {
            console.error('Error initializing:', error);
        }
        setIsLoading(false);
    };

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        initializeAndLoad();
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
    };

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.collection && product.collection.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = (product) => {
        setDeleteConfirm({ open: true, product });
    };

    const confirmDelete = async () => {
        if (deleteConfirm.product) {
            setIsSaving(true);
            try {
                await deleteProduct(deleteConfirm.product.id);
                await loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Erro ao deletar produto. Tente novamente.');
            }
            setIsSaving(false);
        }
        setDeleteConfirm({ open: false, product: null });
    };
};

const processImages = async (images) => {
    const processedImages = await Promise.all(images.map(async (image) => {
        if (image instanceof File) {
            // Upload new file to Storage
            return await uploadImage(image);
        }
        // Return existing URL as is
        return image;
    }));
    return processedImages;
};

const handleSave = async (formData) => {
    setIsSaving(true);
    try {
        // Process images before saving (upload new ones)
        const imageUrls = await processImages(formData.images);

        // Create a copy of formData with invalid characters removed from name if needed 
        // but primarily replacing the images array with URLs
        const productData = {
            ...formData,
            images: imageUrls
        };

        if (editingProduct) {
            await updateProduct(editingProduct.id, productData);
        } else {
            await addProduct(productData);
        }
        await loadProducts();
        setIsFormOpen(false);
        setEditingProduct(null);
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Erro ao salvar produto. Tente novamente.');
    }
    setIsSaving(false);
};

const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
};

const handleResetData = async () => {
    if (confirm('Isso vai resetar todos os produtos para os dados de exemplo. Continuar?')) {
        setIsLoading(true);
        try {
            await resetToSampleData();
            await loadProducts();
        } catch (error) {
            console.error('Error resetting data:', error);
            alert('Erro ao resetar dados. Tente novamente.');
        }
        setIsLoading(false);
    }
};

// Show login form if not authenticated
if (!isLoggedIn) {
    return <LoginForm onSuccess={handleLoginSuccess} />;
}

const featuredCount = products.filter(p => p.featured).length;
const newCount = products.filter(p => p.isNew).length;

return (
    <div className="admin-layout">
        <header className="admin-header">
            <div className="admin-header-left">
                <img src="/logo.png" alt="Tary Moda Praia" className="admin-logo" />
                <h1 className="admin-title">Painel Admin</h1>
                <span style={{
                    fontSize: '0.7rem',
                    background: '#10b981',
                    color: 'white',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    marginLeft: '0.5rem'
                }}>🔥 Firebase</span>
            </div>
            <div className="admin-header-right">
                <div className="admin-user">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                    </svg>
                    Administrador
                </div>
                <Link to="/" className="btn btn-ghost btn-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    Ver Site
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sair
                </button>
            </div>
        </header>

        <main className="admin-main">
            <div className="admin-toolbar">
                <div className="admin-search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Buscar por nome, categoria ou coleção..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleResetData} disabled={isLoading}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                        </svg>
                        Resetar Dados
                    </button>
                    <button className="btn btn-primary" onClick={handleAddNew} disabled={isLoading}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Novo Produto
                    </button>
                </div>
            </div>

            <div className="products-table-container">
                {isLoading ? (
                    <div className="empty-state">
                        <div className="empty-state-icon" style={{ animation: 'pulse 1.5s infinite' }}>⏳</div>
                        <h3 className="empty-state-title">Carregando produtos...</h3>
                        <p>Conectando ao Firebase</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th style={{ width: '90px' }}>Foto</th>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Coleção</th>
                                <th>Preço</th>
                                <th style={{ width: '100px' }}>Status</th>
                                <th style={{ width: '120px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img
                                            src={product.images?.[0] || PLACEHOLDER_IMAGE}
                                            alt={product.name}
                                            className="product-table-image"
                                        />
                                    </td>
                                    <td>
                                        <div className="product-table-info">
                                            <span className="product-table-name">{product.name}</span>
                                            {product.collection && (
                                                <span className="product-table-collection">{product.collection}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>{product.collection || '—'}</td>
                                    <td><strong>{product.price}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {product.featured && (
                                                <span className="status-badge featured">⭐ Destaque</span>
                                            )}
                                            {product.isNew && (
                                                <span className="status-badge active">✨ Novo</span>
                                            )}
                                            {!product.featured && !product.isNew && (
                                                <span style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="product-table-actions">
                                            <button
                                                className="action-btn edit"
                                                onClick={() => handleEdit(product)}
                                                title="Editar"
                                                disabled={isSaving}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDelete(product)}
                                                title="Deletar"
                                                disabled={isSaving}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">
                            {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
                        </h3>
                        <p>
                            {searchQuery
                                ? 'Tente buscar por outro termo'
                                : 'Clique em "Novo Produto" para começar'
                            }
                        </p>
                    </div>
                )}
            </div>

            <div className="stats-bar">
                <div className="stat-item">
                    <span className="stat-value">{products.length}</span>
                    <span>produtos</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{featuredCount}</span>
                    <span>em destaque</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{newCount}</span>
                    <span>novidades</span>
                </div>
            </div>
        </main>

        <ProductForm
            isOpen={isFormOpen}
            product={editingProduct}
            onSave={handleSave}
            onClose={handleCloseForm}
        />

        <ConfirmDialog
            isOpen={deleteConfirm.open}
            title="Deletar Produto"
            message={`Tem certeza que deseja deletar "${deleteConfirm.product?.name}"? Esta ação não pode ser desfeita.`}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm({ open: false, product: null })}
        />
    </div>
);
}
