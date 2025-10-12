import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Local Power - Admin Panel',
  description: 'Solar energy analytics and lead management dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}