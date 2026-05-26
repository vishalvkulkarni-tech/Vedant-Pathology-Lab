'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'test' | 'package';
  is_available: boolean;
}

export default function CatalogManager() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchCatalog();
  }, []);

  async function fetchCatalog() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('catalog')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching catalog:', error);
    } else {
      setItems(data || []);
    }
    setIsLoading(false);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as 'test' | 'package',
      is_available: formData.get('is_available') === 'on',
    };

    if (editingItem) {
      const { error } = await supabase
        .from('catalog')
        .update(itemData)
        .eq('id', editingItem.id);
      if (error) alert(error.message);
    } else {
      const { error } = await supabase
        .from('catalog')
        .insert([itemData]);
      if (error) alert(error.message);
    }

    setIsModalOpen(false);
    setEditingItem(null);
    fetchCatalog();
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      const { error } = await supabase
        .from('catalog')
        .delete()
        .eq('id', id);
      if (error) alert(error.message);
      else fetchCatalog();
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Test & Package Catalog</h2>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests or packages..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-sm font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center">No items found.</td></tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs ${item.category === 'package' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">₹{item.price}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center text-sm ${item.is_available ? 'text-green-600' : 'text-red-600'}`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${item.is_available ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full mr-2"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
            <form onSubmit={handleSave}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input name="name" defaultValue={editingItem?.name} required className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" defaultValue={editingItem?.description} className="w-full p-2 border rounded-lg h-20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingItem?.price} required className="w-full p-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select name="category" defaultValue={editingItem?.category || 'test'} className="w-full p-2 border rounded-lg">
                      <option value="test">Test</option>
                      <option value="package">Package</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" name="is_available" id="is_available" defaultChecked={editingItem?.is_available ?? true} className="mr-2" />
                  <label htmlFor="is_available" className="text-sm text-gray-700">Available for booking</label>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
