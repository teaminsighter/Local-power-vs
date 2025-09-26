import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insighter.Digital - Admin Panel',
  description: 'Advanced analytics and lead management dashboard',
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