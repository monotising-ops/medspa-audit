import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — Med Spa Growth Audit',
  robots: 'noindex,nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
