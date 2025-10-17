import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod';

export function useBotActivity(limit = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchActivity() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/bot/activity?limit=${limit}`);
        const result = await response.json();
        
        if (mounted && result.success) {
          setData(result.tasks || []);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          console.error('Failed to fetch bot activity:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchActivity();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { data, loading, error };
}

export function useBotMetrics(hours = 24) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMetrics() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/bot/metrics?hours=${hours}`);
        const result = await response.json();
        
        if (mounted && result.success) {
          setData(result.metrics);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          console.error('Failed to fetch bot metrics:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMetrics();

    return () => {
      mounted = false;
    };
  }, [hours]);

  return { data, loading, error };
}
