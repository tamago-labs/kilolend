"use client";

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

export interface LeaderboardData {
  address: string;
  rank: number;
  kiloReward: number;
  basePoints: number;
  baseTVL: number;
  multiplier: number;
  netContribution: number;
  share: number;
}

export interface LeaderboardResponse {
  success: boolean;
  data?: {
    date: string;
    leaderboard: LeaderboardData[];
    totalUsers: number;
  };
  message?: string;
}

export interface UserPointsData {
  totalPoints: number;
  dailyBreakdown: Record<string, number>;
  lastUpdated?: string;
  status?: string;
  isNewUser: boolean;
}

export interface UserPointsResponse {
  success: boolean;
  dailyPoints?: Array<{ date: string; [key: string]: string | number }>;
  totalPoints?: number;
  lastUpdated?: string;
}

const LEADERBOARD_API_BASE = 'https://kvxdikvk5b.execute-api.ap-southeast-1.amazonaws.com/prod';
const TRIGGER_ENDPOINT = 'https://7pdgsmb6ay.ap-southeast-1.awsapprunner.com/trigger-daily-update';

// Trigger daily update endpoint
const triggerDailyUpdate = async () => {
  try {
    await fetch(TRIGGER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Daily update trigger sent successfully');
  } catch (error) {
    console.error('Failed to trigger daily update:', error);
    // Don't throw error - this is fire-and-forget
  }
};

export const useLeaderboardData = (selectedDate: string) => {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${LEADERBOARD_API_BASE}/leaderboard/${selectedDate}`);
      
      // Handle 404 specifically as no data scenario
      if (response.status === 404) {
        // Trigger daily update endpoint
        triggerDailyUpdate();
        
        // Set specific message for no data scenario
        setData({
          success: false,
          message: '⏳ Today\'s leaderboard is being updated... Please check back shortly.'
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: LeaderboardResponse = await response.json();
      
      // Check if no data is available
      if (!result.success || !result.data?.leaderboard?.length) {
        // Trigger daily update endpoint
        triggerDailyUpdate();
        
        // Set specific message for no data scenario
        setData({
          success: false,
          message: 'Leaderboard is being updated, come back in a few minutes'
        });
      } else {
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard data');
      setData({
        success: false,
        message: 'Failed to load leaderboard data'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      fetchLeaderboard();
    }
  }, [selectedDate]);

  return {
    data,
    loading,
    error,
    refetch: fetchLeaderboard
  };
};

export const useUserPoints = (address?: string) => {
  const [data, setData] = useState<UserPointsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPoints = useCallback(async (userAddress: string) => {
    setLoading(true);
    setError(null);

    try {
      // Parse and validate address
      const parsedAddress = ethers.getAddress(userAddress);
      
      const response = await fetch(`${LEADERBOARD_API_BASE}/users/${parsedAddress}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: UserPointsResponse = await response.json();
      
      if (!result.success || !result.dailyPoints) {
        // New user or no data
        setData({
          totalPoints: 0,
          dailyBreakdown: {},
          isNewUser: true
        });
      } else {
        // Convert dailyPoints array into an object keyed by date
        let totalPoints = 0;
        const dailyBreakdown: Record<string, number> = {};
        
        result.dailyPoints.forEach((entry) => {
          const date = entry.date;
          const points = Number(entry[date]) || 0;
          dailyBreakdown[date] = points;
          totalPoints += points;
        });

        setData({
          totalPoints,
          dailyBreakdown,
          lastUpdated: result.lastUpdated,
          isNewUser: false
        });
      }
    } catch (err) {
      console.error('Error fetching user points:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user points');
      
      // Set empty state on error
      setData({
        totalPoints: 0,
        dailyBreakdown: {},
        isNewUser: true
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      fetchUserPoints(address);
    }
  }, [address, fetchUserPoints]);

  return {
    data,
    loading,
    error,
    refetch: address ? () => fetchUserPoints(address) : undefined
  };
};

// Utility functions
export const getDateString = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const getTabLabel = (daysAgo: number): string => {
  switch (daysAgo) {
    case 0: return 'Today';
    case 1: return 'Yesterday';
    case 2: return '2 Days Ago';
    case 7: return '7 Days Ago';
    default: return `${daysAgo} Days Ago`;
  }
};

export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatKilo = (kilo: number): string => {
  return kilo.toLocaleString();
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
