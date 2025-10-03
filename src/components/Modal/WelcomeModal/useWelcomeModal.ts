import { useState, useEffect } from 'react';

const STORAGE_KEY = 'kilolend_welcome_modal_last_shown';

export const useWelcomeModal = () => {

  const [shouldShow, setShouldShow] = useState(false);

  // useEffect(() => {
  //   const checkShouldShowWelcome = () => {
  //     try {
  //       // Get the last shown date from localStorage
  //       const lastShown = localStorage.getItem(STORAGE_KEY);
        
  //       if (!lastShown) {
  //         // First time user - show welcome modal
  //         setShouldShow(true);
  //         return;
  //       }

  //       const lastShownDate = new Date(lastShown);
  //       const today = new Date();
        
  //       // Reset time to compare dates only (not times)
  //       lastShownDate.setHours(0, 0, 0, 0);
  //       today.setHours(0, 0, 0, 0);

  //       // If last shown date is before today, show the modal
  //       if (lastShownDate.getTime() < today.getTime()) {
  //         setShouldShow(true);
  //       } else {
  //         setShouldShow(false);
  //       }
  //     } catch (error) {
  //       console.error('Error checking welcome modal status:', error);
  //       // On error, show the modal to be safe
  //       setShouldShow(true);
  //     }
  //   };

  //   checkShouldShowWelcome();
  // }, []);

  const markAsShown = () => {
    try {
      // Store current date when modal is closed
      const today = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, today);
      setShouldShow(false);
    } catch (error) {
      console.error('Error saving welcome modal status:', error);
      setShouldShow(false);
    }
  };

  const resetWelcomeModal = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setShouldShow(true);
    } catch (error) {
      console.error('Error resetting welcome modal status:', error);
    }
  };

  return {
    shouldShow,
    markAsShown,
    resetWelcomeModal
  };
};
