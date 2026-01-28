import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/admin/LoginForm';
import ProductForm from '../components/admin/ProductForm';
import BannerForm from '../components/admin/BannerForm';
import StoryForm from '../components/admin/StoryForm';
import CategoryForm from '../components/admin/CategoryForm';
import ConfirmDialog from '../components/admin/ConfirmDialog';
import { isAuthenticated, logout } from '../utils/auth';
import {
    getProducts, addProduct, updateProduct, deleteProduct,
    getBanners, addBanner, updateBanner, deleteBanner,
    getStories, addStory, updateStory, deleteStory,
    getCategoriesDB, addCategoryDB, updateCategoryDB, deleteCategoryDB,
    getCollectionsDB, addCollectionDB, updateCollectionDB, deleteCollectionDB,
    uploadImage, initializeSampleData, resetToSampleData
} from '../utils/storage';
import CollectionForm from '../components/admin/CollectionForm';

const PLACEHOLDER_IMAGE = '/sample-bikini.jpg';

export default function Admin() {
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [firebaseStatus, setFirebaseStatus] = useState('checking'); // 'connected', 'disconnected'

    // UI State
    const [activeTab, setActiveTab] = useState('products');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Data State
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [stories, setStories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [collections, setCollections] = useState([]);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, item: null, type: null });

    useEffect(() => {
        setIsLoggedIn(isAuthenticated());

        // Check Firebase Connection
        import('../utils/firebase').then(({ default: app }) => {
            import('firebase/auth').then(({ getAuth }) => {
                const auth = getAuth(app);
                setFirebaseStatus(auth.currentUser ? 'connected' : 'disconnected');
                auth.onAuthStateChanged(user => {
                    setFirebaseStatus(user ? 'connected' : 'disconnected');
                });
            });
        });

        if (isAuthenticated()) {
            loadAllData();
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                loadProducts(),
                loadBanners(),
                loadStories(),
                loadCategories(),
                loadCollections()
            ]);
        } catch (error) {
            console.error('Error initializing:', error);
        }
        setIsLoading(false);
    };

    const loadProducts = async () => {
        const data = await getProducts();
        setProducts(data);
    };

    const loadBanners = async () => {
        const data = await getBanners();
        setBanners(data);
    };

    const loadStories = async () => {
        const data = await getStories();
        setStories(data);
    };

    const loadCategories = async () => {
        const data = await getCategoriesDB();
        setCategories(data);
    };

    const loadCollections = async () => {
        const data = await getCollectionsDB();
        setCollections(data);
    };

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        loadAllData();
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
    };

    // Generic Handlers
    const handleAddNew = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    };

    const handleDelete = (item, type) => {
        setDeleteConfirm({ open: true, item, type });
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingItem(null);
    };

    // CRUD Operations
    const confirmDelete = async () => {
        if (!deleteConfirm.item) return;

        setIsSaving(true);
        try {
            const { item, type } = deleteConfirm;
            switch (type) {
                case 'product':
                    await deleteProduct(item.id);
                    await loadProducts();
                    break;
                case 'banner':
                    await deleteBanner(item.id);
                    await loadBanners();
                    break;
                case 'story':
                    await deleteStory(item.id);
                    await loadStories();
                    break;
                case 'category':
                    await deleteCategoryDB(item.id);
                    await loadCategories();
                    break;
                case 'collection':
                    await deleteCollectionDB(item.id);
                    await loadCollections();
                    break;
            }
            setDeleteConfirm({ open: false, item: null, type: null });

        } catch (error) {
            console.error('Error deleting:', error);
            alert('Erro ao deletar item. Tente novamente.');
        }
        setIsSaving(false);
        setDeleteConfirm({ open: false, item: null, type: null });
    };

    const processImage = async (image, folder) => {
        if (image instanceof File) {
            return await uploadImage(image, folder);
        }
        return image;
    };

    const processImages = async (images, folder) => {
        return await Promise.all(images.map(async (image) => {
            if (image instanceof File) {
                return await uploadImage(image, folder);
            }
            return image;
        }));
    };

    const handleSave = async (formData) => {
        setIsSaving(true);
        try {
            if (activeTab === 'products') {
                const imageUrls = await processImages(formData.images, 'products');
                const productData = { ...formData, images: imageUrls };
                if (editingItem) await updateProduct(editingItem.id, productData);
                else await addProduct(productData);
                await loadProducts();
            } else if (activeTab === 'banners') {
                const imageUrl = await processImage(formData.imageUrl, 'banners');
                const bannerData = { ...formData, imageUrl };
                if (editingItem) await updateBanner(editingItem.id, bannerData);
                else await addBanner(bannerData);
                await loadBanners();
            } else if (activeTab === 'stories') {
                // Handle multiple images for stories
                // formData.images might contain mix of Files and URL strings
                const imageUrls = await processImages(formData.images, 'stories');

                // Use the first image as the 'cover' or 'imageUrl' for backward compatibility/listings
                // But mainly store the array in 'images'
                const storyData = {
                    ...formData,
                    images: imageUrls,
                    imageUrl: imageUrls[0] // Set cover image for easy access
                };

                if (editingItem) await updateStory(editingItem.id, storyData);
                else await addStory(storyData);
                await loadStories();
            } else if (activeTab === 'categories') {
                const imageUrl = await processImage(formData.imageUrl, 'categories');
                const categoryData = { ...formData, imageUrl };
                if (editingItem) await updateCategoryDB(editingItem.id, categoryData);
                else await addCategoryDB(categoryData);
                await loadCategories();
            } else if (activeTab === 'collections') {
                const imageUrl = await processImage(formData.imageUrl, 'collections');
                const collectionData = { ...formData, imageUrl };
                if (editingItem) await updateCollectionDB(editingItem.id, collectionData);
                else await addCollectionDB(collectionData);
                await loadCollections();
            }
            handleCloseForm();
        } catch (error) {
            console.error('Error saving:', error);
            if (error.code === 'storage/unauthorized') {
                alert('PERMISSÃO NEGADA: Você precisa configurar as regras do Firebase Storage para permitir escrita nas pastas "banners", "stories" e "categories".');
            } else {
                alert('Erro ao salvar. Tente novamente: ' + error.message);
            }
        }
        setIsSaving(false);
    };

    const handleResetData = async () => {
        if (confirm('Isso vai resetar todos os PRODUTOS para os dados de exemplo. Continuar?')) {
            setIsLoading(true);
            try {
                await resetToSampleData();
                await loadProducts();
            } catch (error) {
                alert('Erro ao resetar dados.');
            }
            setIsLoading(false);
        }
    };

    if (!isLoggedIn) return <LoginForm onSuccess={handleLoginSuccess} />;

    // Filtering
    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Tab Content Component
    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th style={{ width: '90px' }}>Foto</th>
                                <th>Produto</th>
                                <th>Preço</th>
                                <th style={{ width: '100px' }}>Status</th>
                                <th style={{ width: '120px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <img src={product.images?.[0] || PLACEHOLDER_IMAGE} alt={product.name} className="product-table-image" />
                                    </td>
                                    <td>
                                        <div className="product-table-info">
                                            <span className="product-table-name">{product.name}</span>
                                            <span className="product-table-collection">{product.category} • {product.collection}</span>
                                        </div>
                                    </td>
                                    <td><strong>{product.price}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            {product.featured && <span>⭐</span>}
                                            {product.isNew && <span>✨</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="product-table-actions">
                                            <button className="action-btn edit" onClick={() => handleEdit(product)} title="Editar">✏️</button>
                                            <button className="action-btn delete" onClick={() => handleDelete(product, 'product')} title="Deletar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'banners':
                return (
                    <div className="admin-grid">
                        {banners.map(banner => (
                            <div key={banner.id} className="admin-card">
                                <img src={banner.imageUrl} alt={banner.title} className="admin-card-image" style={{ height: '100px', objectFit: 'cover' }} />
                                <div className="admin-card-content">
                                    <h3>{banner.title}</h3>
                                    <p>{banner.link || 'Sem link'}</p>
                                    <div className="admin-card-footer">
                                        <span className={`status-badge ${banner.active ? 'active' : ''}`}>
                                            {banner.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                        <div className="admin-card-actions">
                                            <button onClick={() => handleEdit(banner)}>✏️</button>
                                            <button onClick={() => handleDelete(banner, 'banner')} className="delete">🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'stories':
                return (
                    <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                        {stories.map(story => (
                            <div key={story.id} className="admin-card">
                                {/* Use imageUrl (backward compat) or first image of array */}
                                <img
                                    src={story.images?.[0] || story.imageUrl}
                                    alt={story.title}
                                    className="admin-card-image"
                                    style={{ aspectRatio: '9/16', objectFit: 'cover' }}
                                />
                                <div className="admin-card-content">
                                    <h3>{story.title}</h3>
                                    <div className="admin-card-footer">
                                        <span className={`status-badge ${story.active ? 'active' : ''}`}>
                                            {story.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                        <div className="admin-card-actions">
                                            <button onClick={() => handleEdit(story)}>✏️</button>
                                            <button onClick={() => handleDelete(story, 'story')} className="delete">🗑️</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'categories':
                return (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th style={{ width: '90px' }}>Imagem</th>
                                <th>Nome</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th style={{ width: '120px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id}>
                                    <td>
                                        <img src={cat.imageUrl || PLACEHOLDER_IMAGE} alt={cat.name} className="product-table-image" />
                                    </td>
                                    <td><strong>{cat.name}</strong></td>
                                    <td>{cat.slug}</td>
                                    <td>
                                        <span className={`status-badge ${cat.active ? 'active' : ''}`}>
                                            {cat.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="product-table-actions">
                                            <button className="action-btn edit" onClick={() => handleEdit(cat)} title="Editar">✏️</button>
                                            <button className="action-btn delete" onClick={() => handleDelete(cat, 'category')} title="Deletar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'collections':
                return (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th style={{ width: '90px' }}>Imagem</th>
                                <th>Nome</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th style={{ width: '120px' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {collections.map(col => (
                                <tr key={col.id}>
                                    <td>
                                        <img src={col.imageUrl || PLACEHOLDER_IMAGE} alt={col.name} className="product-table-image" />
                                    </td>
                                    <td><strong>{col.name}</strong></td>
                                    <td>{col.slug}</td>
                                    <td>
                                        <span className={`status-badge ${col.active ? 'active' : ''}`}>
                                            {col.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="product-table-actions">
                                            <button className="action-btn edit" onClick={() => handleEdit(col)} title="Editar">✏️</button>
                                            <button className="action-btn delete" onClick={() => handleDelete(col, 'collection')} title="Deletar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
        }
    };

    return (
        <div className="admin-layout">
            <header className="admin-header">
                <div className="admin-header-left">
                    <img src="/logo.png" alt="Tary" className="admin-logo" />
                    <h1 className="admin-title">Painel Admin</h1>
                </div>
                <div className="admin-header-right">
                    <div className="admin-user" style={{ borderRight: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0' }}>
                        <span style={{ fontSize: '0.8rem', color: firebaseStatus === 'connected' ? 'var(--success)' : 'var(--danger)' }}>
                            {firebaseStatus === 'connected' ? '● Firebase Conectado' : '○ Firebase Desconectado'}
                        </span>
                    </div>
                    <Link to="/" className="btn btn-ghost btn-sm">Ver Site</Link>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Sair</button>
                </div>
            </header>

            <main className="admin-main">
                <div className="admin-tabs">
                    <button
                        className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Produtos
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'banners' ? 'active' : ''}`}
                        onClick={() => setActiveTab('banners')}
                    >
                        Banners
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'stories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stories')}
                    >
                        Stories
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveTab('categories')}
                    >
                        Categorias
                    </button>
                    <button
                        className={`admin-tab ${activeTab === 'collections' ? 'active' : ''}`}
                        onClick={() => setActiveTab('collections')}
                    >
                        Coleções
                    </button>
                </div>

                <div className="admin-toolbar">
                    <div className="admin-search">
                        {activeTab === 'products' && (
                            <input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {activeTab === 'products' && (
                            <button className="btn btn-secondary btn-sm" onClick={handleResetData}>
                                Resetar Produtos
                            </button>
                        )}
                        <button className="btn btn-primary" onClick={handleAddNew}>
                            + Novo {activeTab.slice(0, -1)}
                        </button>
                    </div>
                </div>

                <div className="products-table-container">
                    {renderTabContent()}
                </div>
            </main>

            {/* Forms */}
            <ProductForm
                isOpen={isFormOpen && activeTab === 'products'}
                product={editingItem}
                onSave={handleSave}
                onClose={handleCloseForm}
            />
            <BannerForm
                isOpen={isFormOpen && activeTab === 'banners'}
                banner={editingItem}
                onSave={handleSave}
                onClose={handleCloseForm}
            />
            <StoryForm
                isOpen={isFormOpen && activeTab === 'stories'}
                story={editingItem}
                onSave={handleSave}
                onClose={handleCloseForm}
            />
            <CategoryForm
                isOpen={isFormOpen && activeTab === 'categories'}
                category={editingItem}
                onSave={handleSave}
                onClose={handleCloseForm}
            />
            <CollectionForm
                isOpen={isFormOpen && activeTab === 'collections'}
                collection={editingItem}
                onSave={handleSave}
                onClose={handleCloseForm}
            />

            <ConfirmDialog
                isOpen={deleteConfirm.open}
                title={`Deletar ${deleteConfirm.type}`}
                message="Tem certeza? Esta ação não pode ser desfeita."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ open: false, item: null, type: null })}
            />
        </div>
    );
}
