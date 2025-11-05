import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kilolend_news_modal_last_shown';

export const useNewsModal = () => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkShouldShowNews = () => {
      try {
        // Get the last shown date from localStorage
        const lastShown = localStorage.getItem(STORAGE_KEY); 
        if (!lastShown) {  
          setShouldShow(true);
          return;
        }

        const lastShownDate = new Date(lastShown);
        const today = new Date();
        
        // Reset time to compare dates only (not times)
        lastShownDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        console.log('Date comparison:', {
          lastShown: lastShownDate.toDateString(),
          today: today.toDateString(),
          shouldShow: lastShownDate.getTime() < today.getTime()
        });

        // If last shown date is before today, show the modal
        if (lastShownDate.getTime() < today.getTime()) {
          console.log('Showing news modal - new day');
          setShouldShow(true);
        } else {
          console.log('Not showing news modal - already shown today');
          setShouldShow(false);
        }
      } catch (error) {
        console.error('Error checking news modal status:', error);
        // On error, show the modal to be safe
        setShouldShow(true);
      }
    };

    checkShouldShowNews();
  }, []);

  const markAsShown = () => {
    try {
      // Store current date when modal is closed
      const today = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, today);
      setShouldShow(false);
    } catch (error) {
      console.error('Error saving news modal status:', error);
      setShouldShow(false);
    }
  };

  const resetNewsModal = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setShouldShow(true);
    } catch (error) {
      console.error('Error resetting news modal status:', error);
    }
  };

  return {
    shouldShow,
    markAsShown,
    resetNewsModal
  };
};
