// Firebase Firestore storage utilities for product management
import { db, storage } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Collection reference
const PRODUCTS_COLLECTION = 'products';

// Generate unique ID (Firebase creates its own, but keeping for compatibility)
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all products
export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

// Get single product by ID
export const getProduct = async (id) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

// Add new product
export const addProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...productData };
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id, productData) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: serverTimestamp()
    });
    return { id, ...productData };
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id) => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Search products (client-side filtering since Firestore has limitations)
export const searchProducts = async (queryText) => {
  const products = await getProducts();
  const lowerQuery = queryText.toLowerCase();

  return products.filter(p =>
    p.name?.toLowerCase().includes(lowerQuery) ||
    p.category?.toLowerCase().includes(lowerQuery) ||
    p.collection?.toLowerCase().includes(lowerQuery) ||
    p.description?.toLowerCase().includes(lowerQuery)
  );
};

// Get products by category
export const getProductsByCategory = async (category) => {
  const products = await getProducts();
  return products.filter(p => p.category === category);
};

// Get products by collection
export const getProductsByCollection = async (collectionName) => {
  const products = await getProducts();
  return products.filter(p => p.collection === collectionName);
};

// Get featured products
export const getFeaturedProducts = async () => {
  const products = await getProducts();
  return products.filter(p => p.featured);
};

// Upload image to Firebase Storage
export const uploadImage = async (file, folder = 'products') => {
  try {
    const fileName = `${folder}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Delete image from Firebase Storage
export const deleteImage = async (imageUrl) => {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image might not exist
    return false;
  }
};

// Initialize with sample data if empty
export const initializeSampleData = async () => {
  const products = await getProducts();
  if (products.length === 0) {
    const sampleProducts = [
      {
        name: 'Biquíni Azul Royal',
        category: 'Biquínis',
        collection: 'Verão 2024',
        price: 'R$ 189,00',
        description: 'Biquíni em tom azul royal vibrante com detalhes dourados. Tecido premium com toque acetinado e proteção UV.',
        images: [
          '/sample-bikini.jpg',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&h=600&fit=crop'
        ],
        featured: true,
        isNew: true
      },
      {
        name: 'Biquíni Tropical Sunset',
        category: 'Biquínis',
        collection: 'Tropical',
        price: 'R$ 169,00',
        description: 'Biquíni estampado com cores vibrantes inspiradas no pôr do sol tropical.',
        images: [
          '/sample-bikini.jpg',
          'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&h=600&fit=crop'
        ],
        featured: true,
        isNew: false
      },
      {
        name: 'Maiô Elegance',
        category: 'Maiôs',
        collection: 'Elegance',
        price: 'R$ 249,00',
        description: 'Maiô sofisticado em tom azul marinho com detalhes em dourado.',
        images: [
          '/sample-bikini.jpg',
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=600&fit=crop'
        ],
        featured: true,
        isNew: false
      },
      {
        name: 'Saída de Praia Rendada',
        category: 'Saídas de Praia',
        collection: 'Verão 2024',
        price: 'R$ 159,00',
        description: 'Saída de praia em renda delicada branca.',
        images: [
          '/sample-bikini.jpg',
          'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=600&h=600&fit=crop'
        ],
        featured: false,
        isNew: true
      }
    ];

    // Add sample products to Firestore
    for (const product of sampleProducts) {
      await addProduct(product);
    }

    return await getProducts();
  }
  return products;
};

// Reset to sample data (clears all and re-adds samples)
export const resetToSampleData = async () => {
  const products = await getProducts();
  // Delete all existing products
  for (const product of products) {
    await deleteProduct(product.id);
  }
  // Re-initialize with sample data
  return initializeSampleData();
};

// Convert file to base64 (keeping for backwards compatibility)
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Convert multiple files to base64
export const filesToBase64 = async (files) => {
  const promises = Array.from(files).map(file => fileToBase64(file));
  return Promise.all(promises);
};

// Collections list (DEPRECATED: Use getCollectionsDB instead)
/* export const COLLECTIONS = [
  'Verão 2024',
  'Tropical',
  'Elegance',
  'Essential',
  'Festas'
]; */
export const COLLECTIONS = []; // Keep empty array until removed completely loops

// Categories list (DEPRECATED: Use getCategoriesDB instead)
/* export const CATEGORIES = [
  'Biquínis',
  'Maiôs',
  'Saídas de Praia',
  'Moda Masculina',
  'Acessórios'
]; */
export const CATEGORIES = []; // Keep empty array for now

// Get all unique collections from products
export const getCollectionsFromProducts = async () => {
  const products = await getProducts();
  const collections = [...new Set(products.map(p => p.collection).filter(Boolean))];
  return collections;
};

// --- BANNERS CRUD ---
const BANNERS_COLLECTION = 'banners';

export const getBanners = async () => {
  try {
    const q = query(collection(db, BANNERS_COLLECTION), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const banners = [];
    querySnapshot.forEach((doc) => {
      banners.push({ id: doc.id, ...doc.data() });
    });
    return banners;
  } catch (error) {
    console.error('Error getting banners:', error);
    return [];
  }
};

export const addBanner = async (bannerData) => {
  try {
    const docRef = await addDoc(collection(db, BANNERS_COLLECTION), {
      ...bannerData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...bannerData };
  } catch (error) {
    console.error('Error adding banner:', error);
    throw error;
  }
};

export const updateBanner = async (id, bannerData) => {
  try {
    const docRef = doc(db, BANNERS_COLLECTION, id);
    await updateDoc(docRef, {
      ...bannerData,
      updatedAt: serverTimestamp()
    });
    return { id, ...bannerData };
  } catch (error) {
    console.error('Error updating banner:', error);
    throw error;
  }
};

export const deleteBanner = async (id) => {
  try {
    const docRef = doc(db, BANNERS_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw error;
  }
};

// --- STORIES CRUD ---
const STORIES_COLLECTION = 'stories';

export const getStories = async () => {
  try {
    const q = query(collection(db, STORIES_COLLECTION), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const stories = [];
    querySnapshot.forEach((doc) => {
      stories.push({ id: doc.id, ...doc.data() });
    });
    return stories;
  } catch (error) {
    console.error('Error getting stories:', error);
    return [];
  }
};

export const addStory = async (storyData) => {
  try {
    const docRef = await addDoc(collection(db, STORIES_COLLECTION), {
      ...storyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...storyData };
  } catch (error) {
    console.error('Error adding story:', error);
    throw error;
  }
};

export const updateStory = async (id, storyData) => {
  try {
    const docRef = doc(db, STORIES_COLLECTION, id);
    await updateDoc(docRef, {
      ...storyData,
      updatedAt: serverTimestamp()
    });
    return { id, ...storyData };
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};

export const deleteStory = async (id) => {
  try {
    const docRef = doc(db, STORIES_COLLECTION, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

// --- CATEGORIES CRUD ---
const CATEGORIES_COLLECTION_DB = 'categories'; // Renamed to avoid conflict with CATEGORIES constant

export const getCategoriesDB = async () => {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION_DB), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() });
    });
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const addCategoryDB = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION_DB), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...categoryData };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategoryDB = async (id, categoryData) => {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION_DB, id);
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: serverTimestamp()
    });
    return { id, ...categoryData };
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategoryDB = async (id) => {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION_DB, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// --- COLLECTIONS CRUD ---
const COLLECTIONS_COLLECTION_DB = 'collections';

export const getCollectionsDB = async () => {
  try {
    const q = query(collection(db, COLLECTIONS_COLLECTION_DB), orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    const collections = [];
    querySnapshot.forEach((doc) => {
      collections.push({ id: doc.id, ...doc.data() });
    });
    return collections;
  } catch (error) {
    console.error('Error getting collections:', error);
    return [];
  }
};

export const addCollectionDB = async (collectionData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS_COLLECTION_DB), {
      ...collectionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...collectionData };
  } catch (error) {
    console.error('Error adding collection:', error);
    throw error;
  }
};

export const updateCollectionDB = async (id, collectionData) => {
  try {
    const docRef = doc(db, COLLECTIONS_COLLECTION_DB, id);
    await updateDoc(docRef, {
      ...collectionData,
      updatedAt: serverTimestamp()
    });
    return { id, ...collectionData };
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

export const deleteCollectionDB = async (id) => {
  try {
    const docRef = doc(db, COLLECTIONS_COLLECTION_DB, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

// --- HELPERS ---
export const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Split accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};
