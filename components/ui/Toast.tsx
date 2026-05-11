'use client';

export { toast } from 'sonner';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#111111',
          border: '1px solid #1e1e1e',
          color: '#f5f5f5',
        },
      }}
    />
  );
}
