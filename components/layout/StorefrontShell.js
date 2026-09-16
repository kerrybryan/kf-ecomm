'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import AnnouncementBar from './AnnouncementBar';
import ExitIntentPopup from '@/components/home/ExitIntentPopup';

export default function StorefrontShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <AnnouncementBar />
      <Header />
      <CartDrawer />
      <ExitIntentPopup />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
