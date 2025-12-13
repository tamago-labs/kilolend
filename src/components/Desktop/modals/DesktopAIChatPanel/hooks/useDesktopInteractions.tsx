import { useEffect, useCallback, useState } from 'react';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

export const useDesktopInteractions = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Add notification
  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    duration = 5000
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration,
      timestamp: Date.now()
    };

    setNotifications(prev => [...prev, notification]);

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Setup keyboard shortcuts
  const setupKeyboardShortcuts = useCallback((shortcuts: KeyboardShortcuts) => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if modifier keys are pressed
      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const isAlt = event.altKey;

      // Build key combination string
      let keyCombo = '';
      if (isCtrl) keyCombo += 'ctrl+';
      if (isShift) keyCombo += 'shift+';
      if (isAlt) keyCombo += 'alt+';
      keyCombo += event.key.toLowerCase();

      // Execute matching shortcut
      if (shortcuts[keyCombo]) {
        event.preventDefault();
        shortcuts[keyCombo]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Copy to clipboard with notification
  const copyToClipboard = useCallback(async (text: string, successMessage = 'Copied to clipboard') => {
    try {
      await navigator.clipboard.writeText(text);
      addNotification('success', 'Success', successMessage);
      return true;
    } catch (error) {
      addNotification('error', 'Error', 'Failed to copy to clipboard');
      return false;
    }
  }, [addNotification]);

  // Toggle minimize/maximize
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);

  const toggleMaximize = useCallback(() => {
    setIsMaximized(prev => !prev);
  }, []);

  // Play sound notification (if supported)
  const playNotificationSound = useCallback((type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    try {
      const audio = new Audio();
      
      // You could have different sounds for different notification types
      switch (type) {
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        case 'error':
          audio.src = '/sounds/error.mp3';
          break;
        case 'warning':
          audio.src = '/sounds/warning.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }
      
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if sound files don't exist or autoplay is blocked
      });
    } catch (error) {
      // Ignore sound errors
    }
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((
    title: string,
    options: NotificationOptions = {}
  ) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/images/kilolend-logo.png',
        badge: '/images/kilo-icon.png',
        ...options
      });
    }
    return null;
  }, []);

  // Auto-focus management
  const requestFocus = useCallback(() => {
    if (document.hidden) {
      window.focus();
    }
  }, []);

  // Setup default keyboard shortcuts for the AI chat panel
  const setupDefaultShortcuts = useCallback((actions: {
    sendMessage?: () => void;
    clearChat?: () => void;
    toggleMinimize?: () => void;
    toggleMaximize?: () => void;
    copyAddress?: () => void;
  }) => {
    const shortcuts: KeyboardShortcuts = {
      'ctrl+enter': actions.sendMessage || (() => {}),
      'ctrl+k': actions.clearChat || (() => {}),
      'ctrl+m': actions.toggleMinimize || toggleMinimize,
      'ctrl+shift+m': actions.toggleMaximize || toggleMaximize,
      'ctrl+c': actions.copyAddress || (() => {}),
      'escape': () => setIsMinimized(false), // Restore from minimize
    };

    return setupKeyboardShortcuts(shortcuts);
  }, [setupKeyboardShortcuts, toggleMinimize, toggleMaximize]);

  // Monitor visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && notifications.length > 0) {
        // User returned to tab, maybe clear old notifications
        const now = Date.now();
        setNotifications(prev => 
          prev.filter(n => now - n.timestamp < 30000) // Keep notifications from last 30 seconds
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [notifications.length]);

  return {
    // State
    notifications,
    isMinimized,
    isMaximized,
    
    // Notification methods
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Window controls
    toggleMinimize,
    toggleMaximize,
    setIsMinimized,
    setIsMaximized,
    
    // Utility methods
    copyToClipboard,
    playNotificationSound,
    requestNotificationPermission,
    showBrowserNotification,
    requestFocus,
    
    // Keyboard shortcuts
    setupKeyboardShortcuts,
    setupDefaultShortcuts,
  };
};
