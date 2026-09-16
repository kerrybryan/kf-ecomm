'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ImageStudioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/content-studio');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs font-bold text-[#6B6459]">
      Redirecting to Content Studio...
    </div>
  );
}
