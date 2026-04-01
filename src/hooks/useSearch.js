import { useState, useEffect, useCallback } from 'react';

// Debounce hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Search hook with debouncing
export const useSearch = (initialFilters = {}, fetchFunction, delay = 500) => {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const debouncedSearch = useDebounce(filters.search || '', delay);

  // Handle filter changes
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to first page unless changing page
    }));
  }, []);

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      setIsSearching(true);
      setError(null);
      
      const queryParams = {
        ...filters,
        search: debouncedSearch
      };
      
      const response = await fetchFunction(queryParams);
      
      if (response.data) {
        setData(response.data.data || response.data.employees || response.data.departments || response.data.designations || []);
        setPagination(response.data.pagination || {});
      }

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error fetching data");
      console.error("Fetch error:", err);
    } finally {
      setIsSearching(false);
    }
  }, [debouncedSearch, filters, fetchFunction]);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      try {
        setLoading(true);
        const response = await fetchFunction(initialFilters);
        
        if (response.data) {
          setData(response.data.data || response.data.employees || response.data.departments || response.data.designations || []);
          setPagination(response.data.pagination || {});
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, []);

  // Filter changes (excluding initial load)
  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [fetchData, loading]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    filters,
    data,
    loading,
    isSearching,
    error,
    pagination,
    handleFilterChange,
    clearFilters,
    refreshData,
    setError,
    setData
  };
};