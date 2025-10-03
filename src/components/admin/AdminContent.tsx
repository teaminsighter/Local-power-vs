'use client';

import { adminCategories, AdminCategory } from './AdminDashboard';

interface AdminContentProps {
  activeCategory: string;
  activeTab: string;
  categories?: AdminCategory[];
}

const AdminContent = ({ activeCategory, activeTab, categories = adminCategories }: AdminContentProps) => {
  const currentCategory = categories.find(cat => cat.id === activeCategory);
  const currentTab = currentCategory?.tabs.find(tab => tab.id === activeTab);

  if (!currentTab) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">Content not found</div>
      </div>
    );
  }

  const TabComponent = currentTab.component;

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <TabComponent />
    </div>
  );
};

export default AdminContent;