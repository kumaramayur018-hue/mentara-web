import { useState, useEffect, useCallback } from 'react';
import { counselorAPI, resourcesAPI, productsAPI, defaultCounselors, defaultResources, defaultProducts } from '../../utils/api';

// Hook for managing counselors data
export function useCounselors() {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounselors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[FRONTEND] Fetching counselors...');
      const data = await counselorAPI.getAll();
      console.log('[FRONTEND] Received counselors data:', data?.length || 0, 'counselors');
      setCounselors(data || defaultCounselors);
    } catch (err) {
      console.error('[FRONTEND] Failed to fetch counselors:', err);
      setError('Failed to load counselors');
      setCounselors(defaultCounselors);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounselors();
  }, [fetchCounselors]);

  return {
    counselors,
    loading,
    error,
    refresh: fetchCounselors
  };
}

// Hook for managing resources data
export function useResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[FRONTEND] Fetching resources...');
      const data = await resourcesAPI.getAll();
      console.log('[FRONTEND] Received resources data:', data?.length || 0, 'resources');
      setResources(data || defaultResources);
    } catch (err) {
      console.error('[FRONTEND] Failed to fetch resources:', err);
      setError('Failed to load resources');
      setResources(defaultResources);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return {
    resources,
    loading,
    error,
    refresh: fetchResources
  };
}

// Hook for admin counselor management
export function useAdminCounselors() {
  const [counselors, setCounselors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounselors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await counselorAPI.getAllAdmin();
      setCounselors(data || []);
    } catch (err) {
      console.error('Failed to fetch admin counselors:', err);
      setError('Failed to load counselors');
      setCounselors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addCounselor = useCallback(async (counselor: any) => {
    try {
      const result = await counselorAPI.create(counselor);
      setCounselors(prev => [...prev, result.counselor]);
      return result;
    } catch (err) {
      console.error('Failed to add counselor:', err);
      throw err;
    }
  }, []);

  const updateCounselor = useCallback(async (id: string, counselor: any) => {
    try {
      await counselorAPI.update(id, counselor);
      setCounselors(prev => prev.map(c => c.id === id ? { ...c, ...counselor } : c));
    } catch (err) {
      console.error('Failed to update counselor:', err);
      throw err;
    }
  }, []);

  const deleteCounselor = useCallback(async (id: string) => {
    try {
      await counselorAPI.delete(id);
      setCounselors(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete counselor:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchCounselors();
  }, [fetchCounselors]);

  return {
    counselors,
    loading,
    error,
    refresh: fetchCounselors,
    addCounselor,
    updateCounselor,
    deleteCounselor
  };
}

// Hook for admin resources management
export function useAdminResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resourcesAPI.getAllAdmin();
      setResources(data || []);
    } catch (err) {
      console.error('Failed to fetch admin resources:', err);
      setError('Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addResource = useCallback(async (resource: any) => {
    try {
      const result = await resourcesAPI.create(resource);
      setResources(prev => [...prev, result.resource]);
      return result;
    } catch (err) {
      console.error('Failed to add resource:', err);
      throw err;
    }
  }, []);

  const updateResource = useCallback(async (id: string, resource: any) => {
    try {
      await resourcesAPI.update(id, resource);
      setResources(prev => prev.map(r => r.id === id ? { ...r, ...resource } : r));
    } catch (err) {
      console.error('Failed to update resource:', err);
      throw err;
    }
  }, []);

  const deleteResource = useCallback(async (id: string) => {
    try {
      await resourcesAPI.delete(id);
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete resource:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return {
    resources,
    loading,
    error,
    refresh: fetchResources,
    addResource,
    updateResource,
    deleteResource
  };
}

// Hook for managing products data
export function useProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll();
      setProducts(data || defaultProducts);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
      setProducts(defaultProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts
  };
}

// Hook for admin products management
export function useAdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAllAdmin();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to fetch admin products:', err);
      setError('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (product: any) => {
    try {
      const result = await productsAPI.create(product);
      setProducts(prev => [...prev, result.product]);
      return result;
    } catch (err) {
      console.error('Failed to add product:', err);
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, product: any) => {
    try {
      await productsAPI.update(id, product);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...product } : p));
    } catch (err) {
      console.error('Failed to update product:', err);
      throw err;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct
  };
}