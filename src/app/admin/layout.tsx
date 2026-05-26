import Link from 'next/link';
import { LayoutDashboard, Beaker, Settings, ClipboardList } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">Lab Admin</h1>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link
            href="/admin/catalog"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Beaker className="w-5 h-5 mr-3" />
            Manage Catalog
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <ClipboardList className="w-5 h-5 mr-3" />
            Orders
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
