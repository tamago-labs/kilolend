"use client";

import { useAppStore } from '@/stores/appStore';
import { Bootstrap } from '@/components/Bootstrap/Bootstrap';
import { DesktopBootstrap } from '@/components/Desktop/shared/DesktopBootstrap';


interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const { isMobile, deviceDetected } = useAppStore();

  // if (!deviceDetected) {
  //   return <div>{children}</div>
  // }

  // Mobile: Use mobile Bootstrap with width constraints
  if (isMobile && deviceDetected) {
    return <Bootstrap>{children}</Bootstrap>;
  }

  // Desktop: Use desktop Bootstrap without width constraints
  return <DesktopBootstrap>{children}</DesktopBootstrap>;
};
