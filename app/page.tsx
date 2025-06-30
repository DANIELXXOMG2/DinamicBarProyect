'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function POSPage() {
  const router = useRouter();

  // Redirect to products page by default
  useEffect(() => {
    router.push('/products');
  }, [router]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Content will be rendered in the layout */}
    </div>
  );
}
