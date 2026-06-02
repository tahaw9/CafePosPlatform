import React, { useState } from 'react';
import { useMenuStore, MenuItem } from '../store/useMenuStore';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Dropdown from '../components/Admin/Dropdown';

export default function AdminInventory() {
  const { items, categories, fetchMenu, addItem, updateItem, deleteItem, toggleItemAvailability, isSubmitting } = useMenuStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: '',
    isAvailable: true,
  });

  const isStoreInitialized = React.useRef(false);

  React.useEffect(() => {
    if (!isStoreInitialized.current && items.length === 0) {
      fetchMenu();
      isStoreInitialized.current = true;
    }
  }, [items.length, fetchMenu]);

  // Handle open modal for create
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({ 
      name: '', 
      price: '', 
      category: categories[0]?.id || '', 
      image: '', 
      description: '', 
      isAvailable: true 
    });
    setIsFormModalOpen(true);
  };

  // Handle open modal for edit
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      image: item.image,
      description: item.description || '',
      isAvailable: item.isAvailable,
    });
    setIsFormModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setTimeout(() => {
      setEditingItem(null);
    }, 200);
  };

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category || !formData.image) {
      toast.error('لطفا تمام فیلدهای اجباری را پر کنید');
      return;
    }

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      image: formData.image,
      description: formData.description,
      isAvailable: formData.isAvailable,
    };

    try {
      if (editingItem) {
        updateItem(editingItem.id, payload);
        toast.success('محصول با موفقیت ویرایش شد');
      } else {
        await addItem(payload);
        toast.success('محصول جدید با موفقیت اضافه شد');
      }
      handleCloseModal();
    } catch {
      // Error toast is already shown by the store
    }
  };

  const confirmDelete = () => {
    if (deleteItemId) {
      deleteItem(deleteItemId);
      toast.success('محصول با موفقیت حذف شد');
      setDeleteItemId(null);
    }
  };

  const filteredItems = items.filter(item => {
    const term = searchQuery.toLowerCase();
    const categoryName = categories.find(c => c.id === item.category)?.name.toLowerCase() || '';
    return item.name.toLowerCase().includes(term) || categoryName.includes(term);
  });

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-black text-[#0f3229]">انبار و منو</h1>
        
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="جستجوی محصول یا دسته..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0f3229] transition-all text-sm"
              dir="rtl"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#0f3229] text-[#d4af37] px-4 py-2.5 rounded-xl font-bold hover:bg-[#164237] transition-colors whitespace-nowrap text-sm"
          >
            <Plus className="w-5 h-5" />
            افزودن محصول
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-right" dir="rtl">
            <thead className="bg-[#0f3229] sticky top-0 z-10 text-[#d4af37]">
              <tr>
                <th className="p-4 font-medium text-right text-sm rounded-tr-2xl">تصویر</th>
                <th className="p-4 font-medium text-right text-sm">نام محصول</th>
                <th className="p-4 font-medium text-right text-sm">دسته‌بندی</th>
                <th className="p-4 font-medium text-right text-sm">قیمت (تومان)</th>
                <th className="p-4 font-medium text-right text-sm">موجودی</th>
                <th className="p-4 font-medium text-right text-sm rounded-tl-2xl">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const category = categories.find(c => c.id === item.category);
                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-right">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    </td>
                    <td className="p-4 font-bold text-right">{item.name}</td>
                    <td className="p-4 text-gray-500 text-right">{category?.name}</td>
                    <td className="p-4 text-right">{item.price.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => toggleItemAvailability(item.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors w-24 text-center ${item.isAvailable ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      >
                        {item.isAvailable ? 'موجود' : 'ناموجود'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-2 text-gray-400 hover:bg-gray-100 hover:text-[#0f3229] rounded-lg transition-colors"
                          title="ویرایش"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteItemId(item.id)}
                          className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 font-medium">محصولی یافت نشد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog.Root open={isFormModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
          <Dialog.Content className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-md z-[101] dialog-content p-6 rtl border border-[#8fa8a4] max-h-[90vh] flex flex-col">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-6 shrink-0">
              {editingItem ? 'ویرایش محصول' : 'افزودن محصول جدید'}
            </Dialog.Title>
            
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نام محصول *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229]"
                  placeholder="مثال: لاته"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229]"
                  placeholder="مثال: 85000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی *</label>
                <Dropdown
                  value={formData.category}
                  onChange={(val) => setFormData({...formData, category: val})}
                  options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  triggerClassName="w-full py-2.5 text-right font-medium bg-white text-gray-900 border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">آدرس تصویر (URL) *</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] text-left font-mono placeholder:font-sans placeholder:text-right"
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] resize-none h-24"
                  placeholder="ترکیبات یا توضیحات بیشتر..."
                />
              </div>

              <div className="flex items-center pt-2 pb-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  className="w-4 h-4 text-[#0f3229] border-gray-300 rounded focus:ring-[#0f3229]"
                />
                <label htmlFor="isAvailable" className="mr-2 text-sm font-medium text-gray-700">
                  موجود است
                </label>
              </div>

              <div className="pt-4 flex gap-3 shrink-0 border-t border-gray-100 mt-2">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-colors ${isSubmitting ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-[#0f3229] hover:bg-[#0b261f] text-white'}`}
                >
                  {isSubmitting ? 'در حال ارسال...' : editingItem ? 'ذخیره تغییرات' : 'افزودن محصول'}
                </button>
                <Dialog.Close asChild>
                  <button 
                    type="button" 
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    انصراف
                  </button>
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Modal */}
      <AlertDialog.Root open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
          <AlertDialog.Content className="fixed bg-white rounded-xl shadow-xl p-6 w-[90vw] max-w-sm z-[101] dialog-content rtl">
            <AlertDialog.Title className="text-xl font-bold text-gray-900 mb-2">حذف محصول</AlertDialog.Title>
            <AlertDialog.Description className="text-gray-500 mb-6 font-medium">
              آیا از حذف این محصول اطمینان دارید؟ این عملیات قابل بازگشت نیست.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <button className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  انصراف
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  حذف محصول
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
