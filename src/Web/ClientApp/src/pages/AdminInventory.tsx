import React, { useState } from 'react';
import { useMenuStore, MenuItem } from '../store/useMenuStore';
import { getImageUrl } from '../lib/api';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Plus, Edit2, Trash2, Search, X, FolderKanban, Layers, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Dropdown from '../components/Admin/Dropdown';
import CategoryManagementModal from '../components/Admin/CategoryManagementModal';
import ExtraManagementModal from '../components/Admin/ExtraManagementModal';

interface FormVariantItem {
  id?: string;
  name: string;
  price: string;
  isAvailable: boolean;
  displayOrder: number;
}

export default function AdminInventory() {
  const { items, categories, fetchMenu, addItem, updateItem, deleteItem, toggleItemAvailability, isSubmitting, isLoading } = useMenuStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    imagePreview: '',
    imageFile: null as File | null,
    description: '',
    isAvailable: true,
  });

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<FormVariantItem[]>([]);

  React.useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  if (isLoading && items.length === 0) {
    return (
      <div className="flex-grow flex items-center justify-center bg-gray-50 h-full min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-[#0f3229] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-500 font-bold text-sm">در حال دریافت منو...</span>
        </div>
      </div>
    );
  }

  // Handle open modal for create
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: '',
      category: categories[0]?.id || '',
      imagePreview: '',
      imageFile: null,
      description: '',
      isAvailable: true
    });
    setHasVariants(false);
    setVariants([]);
    setIsFormModalOpen(true);
  };

  // Handle open modal for edit
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      imagePreview: item.image || '',
      imageFile: null,
      description: item.description || '',
      isAvailable: item.isAvailable,
    });
    if (item.variants && item.variants.length > 0) {
      setHasVariants(true);
      setVariants(
        item.variants.map((v, idx) => ({
          id: v.id,
          name: v.name,
          price: v.price.toString(),
          isAvailable: v.isAvailable,
          displayOrder: v.displayOrder ?? idx
        }))
      );
    } else {
      setHasVariants(false);
      setVariants([]);
    }
    setIsFormModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setTimeout(() => {
      setEditingItem(null);
      setHasVariants(false);
      setVariants([]);
    }, 200);
  };

  const handleAddVariant = () => {
    setVariants(prev => [
      ...prev,
      {
        name: '',
        price: '',
        isAvailable: true,
        displayOrder: prev.length
      }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index: number, field: keyof FormVariantItem, value: any) => {
    setVariants(prev => prev.map((v, idx) => {
      if (idx === index) {
        return { ...v, [field]: value };
      }
      return v;
    }));
  };

  const validVariantPrices = variants
    .map(v => Number(v.price))
    .filter(p => !isNaN(p) && p > 0);
  const minVariantPrice = validVariantPrices.length > 0 ? Math.min(...validVariantPrices) : null;

  const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  // Handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) {
      toast.error('لطفا تمام فیلدهای اجباری را پر کنید');
      return;
    }

    if (!hasVariants && (!formData.price || Number(formData.price) <= 0)) {
      toast.error('لطفا قیمت معتبر برای محصول وارد کنید');
      return;
    }

    // Client-side validation for variants
    if (hasVariants) {
      if (variants.length === 0) {
        toast.error('لطفاً حداقل یک تنوع برای محصول اضافه کنید یا حالت تنوع را غیرفعال کنید');
        return;
      }

      const trimmedNames = new Set<string>();
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const trimmedName = v.name.trim();
        if (!trimmedName) {
          toast.error(`نام تنوع در ردیف ${i + 1} الزامی است`);
          return;
        }

        const priceNum = Number(v.price);
        if (isNaN(priceNum) || priceNum <= 0) {
          toast.error(`قیمت تنوع «${trimmedName}» باید بزرگتر از صفر باشد`);
          return;
        }

        const lowerName = trimmedName.toLowerCase();
        if (trimmedNames.has(lowerName)) {
          toast.error(`نام تنوع «${trimmedName}» تکراری است. نام هر تنوع باید یکتا باشد`);
          return;
        }
        trimmedNames.add(lowerName);
      }
    }

    let base64Image = '';
    if (formData.imageFile) {
      try {
        base64Image = await toBase64(formData.imageFile);
      } catch (err) {
        toast.error('خطا در پردازش تصویر');
        return;
      }
    }

    if (!editingItem && !base64Image) {
      toast.error('لطفا یک تصویر انتخاب کنید');
      return;
    }

    const finalPrice = hasVariants && minVariantPrice !== null && minVariantPrice > 0
      ? minVariantPrice
      : Number(formData.price);

    const payload = {
      name: formData.name.trim(),
      price: finalPrice,
      category: formData.category,
      image: '',
      base64Image: base64Image !== '' ? base64Image : undefined,
      description: formData.description.trim(),
      isAvailable: formData.isAvailable,
      variants: hasVariants ? variants.map((v, idx) => ({
        id: v.id,
        name: v.name.trim(),
        price: Number(v.price),
        isAvailable: v.isAvailable,
        displayOrder: idx
      })) : (editingItem && editingItem.variants && editingItem.variants.length > 0 ? [] : undefined)
    };

    try {
      if (editingItem) {
        await updateItem(editingItem.id, payload);
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

  const confirmDelete = async () => {
    if (deleteItemId) {
      try {
        await deleteItem(deleteItemId);
        toast.success('محصول با موفقیت حذف شد');
        setDeleteItemId(null);
      } catch {
        // Error toast is already shown by the store
      }
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
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-white text-[#0f3229] border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors whitespace-nowrap text-sm cursor-pointer shadow-xs"
          >
            <FolderKanban className="w-4 h-4 text-[#0f3229]" />
            مدیریت دسته‌بندی‌ها
          </button>
          <button
            type="button"
            onClick={() => setIsExtraModalOpen(true)}
            className="flex items-center gap-2 bg-white text-[#0f3229] border border-gray-200 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors whitespace-nowrap text-sm cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            مدیریت افزودنی‌ها
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#0f3229] text-[#d4af37] px-4 py-2.5 rounded-xl font-bold hover:bg-[#164237] transition-colors whitespace-nowrap text-sm cursor-pointer"
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
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    </td>
                    <td className="p-4 font-bold text-right">
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.variants && item.variants.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Layers size={11} className="text-emerald-700" />
                            {item.variants.length} نوع
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 text-right">{category?.name}</td>
                    <td className="p-4 text-right">
                      {item.variants && item.variants.length > 0 ? (
                        <div className="flex items-baseline gap-1 font-bold text-[#0f3229]">
                          <span className="text-[11px] font-normal text-gray-500">از</span>
                          <span>{(item.startingPrice || item.price).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span>{item.price.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={async () => {
                          try {
                            await toggleItemAvailability(item.id);
                            toast.success('وضعیت موجودی محصول بروزرسانی شد');
                          } catch {
                            // Error toast is already handled by the store
                          }
                        }}
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
          <Dialog.Content className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-xl z-[101] dialog-content p-6 rtl border border-[#8fa8a4] max-h-[90vh] flex flex-col">
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229]"
                  placeholder="مثال: لاته"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی *</label>
                <Dropdown
                  value={formData.category}
                  onChange={(val) => setFormData({ ...formData, category: val })}
                  options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                  triggerClassName="w-full py-2.5 text-right font-medium bg-white text-gray-900 border border-gray-200"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {hasVariants ? 'قیمت پایه (حداقل قیمت) *' : 'قیمت (تومان) *'}
                  </label>
                  {hasVariants && minVariantPrice !== null && (
                    <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                      محاسبه خودکار از کمترین تنوع
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  required={!hasVariants}
                  min="0"
                  value={hasVariants && minVariantPrice !== null ? minVariantPrice : formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  disabled={hasVariants && minVariantPrice !== null}
                  className={`w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] ${
                    hasVariants && minVariantPrice !== null ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : ''
                  }`}
                  placeholder="مثال: 85000"
                />
                {hasVariants && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    این قیمت به عنوان شروع قیمت در کارت‌های منو و صندوق نمایش داده می‌شود.
                  </p>
                )}
              </div>

              {/* Product Variants Section */}
              <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0f3229]" />
                      <span className="text-sm font-bold text-gray-900">محصول دارای تنوع / واریانت</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-0.5">
                      برای تعریف گزینه‌ها و قیمت‌های مختلف (سایز، نوع دانه، ...)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setHasVariants(checked);
                        if (checked && variants.length === 0) {
                          setVariants([
                            {
                              name: '',
                              price: formData.price || '',
                              isAvailable: true,
                              displayOrder: 0
                            }
                          ]);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f3229]"></div>
                  </label>
                </div>

                {hasVariants && (
                  <div className="pt-2 border-t border-gray-200/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700">
                        لیست انواع {variants.length > 0 && `(${variants.length})`}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f3229] hover:text-[#164237] bg-white hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        افزودن نوع جدید
                      </button>
                    </div>

                    {variants.length === 0 ? (
                      /* Empty State */
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 text-center bg-white/70">
                        <Layers className="w-7 h-7 mx-auto text-gray-400 mb-1.5" />
                        <p className="text-xs font-bold text-gray-700 mb-0.5">هنوز تنوعی برای این محصول ثبت نشده است</p>
                        <p className="text-[11px] text-gray-400 mb-3">اندازه‌ها یا گزینه‌های مختلف را با قیمت جداگانه تعریف کنید</p>
                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f3229] text-[#d4af37] text-xs font-bold hover:bg-[#164237] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          افزودن اولین نوع
                        </button>
                      </div>
                    ) : (
                      /* Variants Repeater List */
                      <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-0.5">
                        {/* Desktop Header */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-3 py-1 text-[11px] font-bold text-gray-500">
                          <div className="col-span-5">نام تنوع / سایز *</div>
                          <div className="col-span-4">قیمت (تومان) *</div>
                          <div className="col-span-2 text-center">موجودی</div>
                          <div className="col-span-1 text-center">حذف</div>
                        </div>

                        {variants.map((variant, index) => (
                          <div
                            key={variant.id || index}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-2xs hover:border-gray-300 transition-colors"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                              {/* Title */}
                              <div className="sm:col-span-5">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1 sm:hidden">نام تنوع *</label>
                                <input
                                  type="text"
                                  placeholder="مثال: تک شات / دانه تجاری"
                                  value={variant.name}
                                  onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3229]"
                                />
                              </div>

                              {/* Price */}
                              <div className="sm:col-span-4">
                                <label className="block text-[11px] font-medium text-gray-500 mb-1 sm:hidden">قیمت (تومان) *</label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="قیمت"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                    className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f3229]"
                                  />
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 select-none">تومان</span>
                                </div>
                              </div>

                              {/* Availability Toggle */}
                              <div className="sm:col-span-2 flex items-center justify-between sm:justify-center">
                                <span className="text-[11px] text-gray-500 sm:hidden">وضعیت:</span>
                                <button
                                  type="button"
                                  onClick={() => handleVariantChange(index, 'isAvailable', !variant.isAvailable)}
                                  className={`min-w-[40px] min-h-[40px] px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${
                                    variant.isAvailable
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                  title={variant.isAvailable ? 'موجود است (برای تغییر کلیک کنید)' : 'ناموجود است (برای تغییر کلیک کنید)'}
                                >
                                  {variant.isAvailable ? 'موجود' : 'ناموجود'}
                                </button>
                              </div>

                              {/* Remove Button */}
                              <div className="sm:col-span-1 flex items-center justify-end sm:justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(index)}
                                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="حذف این ردیف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تصویر محصول *</label>
                <div className="flex flex-col gap-3">
                  {formData.imagePreview && (
                    <img src={getImageUrl(formData.imagePreview)} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-gray-200" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({
                          ...formData,
                          imageFile: file,
                          imagePreview: URL.createObjectURL(file)
                        });
                      }
                    }}
                    className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-[#0f3229] file:text-[#d4af37] hover:file:bg-[#164237]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] resize-none h-24"
                  placeholder="ترکیبات یا توضیحات بیشتر..."
                />
              </div>

              <div className="flex items-center pt-2 pb-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
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

      {/* Category Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Extra Management Modal */}
      <ExtraManagementModal
        isOpen={isExtraModalOpen}
        onClose={() => setIsExtraModalOpen(false)}
      />
    </div>
  );
}

