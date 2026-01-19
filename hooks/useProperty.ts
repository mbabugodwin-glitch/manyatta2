import { useState, useEffect } from 'react';
import { getProperties, getPropertiesByType, getPropertyById, Property } from '../services/propertyService';

/**
 * Hook to fetch properties by type
 */
export const usePropertiesByType = (type?: 'mountain' | 'safari' | 'urban') => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProperties(type);
        setProperties(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch properties';
        setError(message);
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [type]);

  return { properties, loading, error };
};

/**
 * Hook to fetch a single property
 */
export const useProperty = (propertyId: string | null) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(!!propertyId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      setProperty(null);
      setLoading(false);
      return;
    }

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPropertyById(propertyId);
        setProperty(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch property';
        setError(message);
        console.error('Error fetching property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return { property, loading, error };
};

/**
 * Hook to fetch paginated properties
 */
export const usePaginatedProperties = (
  type: 'mountain' | 'safari' | 'urban',
  limit: number = 10
) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = currentPage * limit;
        const { properties: data, total: count } = await getPropertiesByType(
          type,
          limit,
          offset
        );
        setProperties(data);
        setTotal(count);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch properties';
        setError(message);
        console.error('Error fetching properties:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [type, currentPage, limit]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(0, page));
  };

  const nextPage = () => {
    if ((currentPage + 1) * limit < total) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };

  return {
    properties,
    total,
    currentPage,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    totalPages: Math.ceil(total / limit),
  };
};
