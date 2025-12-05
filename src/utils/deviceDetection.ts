/**
 * Device detection utilities for distinguishing between mobile and desktop
 */

export interface DeviceInfo {
  isMobile: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'desktop';
}

/**
 * Detects if the current device is mobile or desktop
 * Uses multiple methods for reliable detection
 */
export const detectDevice = (): DeviceInfo => {
  // Method 1: User agent detection (most reliable)
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
  
  const isMobileByUA = mobileRegex.test(userAgent);
  
  // Method 2: Screen width detection (fallback)
  const isMobileByWidth = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  // Method 3: Touch capability detection (secondary confirmation)
  const hasTouch = typeof window !== 'undefined' && (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
  
  // Combine methods for best accuracy
  // If user agent says mobile, trust it
  // Otherwise, use screen width and touch capability as fallback
  const isMobile = isMobileByUA || (isMobileByWidth && hasTouch);
  const isDesktop = !isMobile;
  
  return {
    isMobile,
    isDesktop,
    deviceType: isMobile ? 'mobile' : 'desktop'
  };
};

/**
 * Simple boolean check for mobile detection
 */
export const isMobileDevice = (): boolean => {
  return detectDevice().isMobile;
};

/**
 * Simple boolean check for desktop detection
 */
export const isDesktopDevice = (): boolean => {
  return detectDevice().isDesktop;
};
