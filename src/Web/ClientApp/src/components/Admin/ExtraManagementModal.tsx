import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  Sparkles
} from 'lucide-react';
import { useExtraStore } from '../../store/useExtraStore';
import { ExtraDto } from '../../lib/extraService';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

interface ExtraManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtraManagementModal({ isOpen, onClose }: ExtraManagementModalProps) {
  const { 
    allExtras, 
    fetchAllExtras, 
    createExtra, 
    updateExtra, 
    toggleAvailability, 
    deleteExtra, 
    isLoading, 
    isSubmitting 
  } = useExtraStore();

  const { user } = useAuthStore();
  const isAdmin = !user || user.role === 'admin';

  // Add/Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<ExtraDto | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [displayOrderInput, setDisplayOrderInput] = useState('');
  const [isAvailableInput, setIsAvailableInput] = useState(true);

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingExtra, setDeletingExtra] = useState<ExtraDto | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllExtras();
    }
  }, [isOpen, fetchAllExtras]);

  const openAddExtra = () => {
    setEditingExtra(null);
    setNameInput('');
    setPriceInput('');
    const maxOrder = allExtras.reduce((max, e) => Math.max(max, e.displayOrder || 0), 0);
    setDisplayOrderInput(String(maxOrder + 1));
    setIsAvailableInput(true);
    setIsFormOpen(true);
  };

  const openEditExtra = (extra: ExtraDto) => {
    setEditingExtra(extra);
    setNameInput(extra.name);
    setPriceInput(String(extra.price));
    setDisplayOrderInput(String(extra.displayOrder ?? 0));
    setIsAvailableInput(extra.isAvailable);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (extra: ExtraDto) => {
    setDeletingExtra(extra);
    setIsDeleteOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      toast.error('لطفاً عنوان افزودنی را وارد کنید');
      return;
    }

    const price = Number(priceInput.replace(/,/g, ''));
    if (isNaN(price) || price < 0) {
      toast.error('قیمت افزودنی باید عددی معتبر و بزرگتر یا مساوی صفر باشد');
      return;
    }

    const displayOrder = parseInt(displayOrderInput, 10);
    if (isNaN(displayOrder) || displayOrder < 0) {
      toast.error('ترتیب نمایش باید عددی بزرگتر یا مساوی صفر باشد');
      return;
    }

    try {
      if (editingExtra) {
        await updateExtra(editingExtra.id, {
          name: trimmedName,
          price,
          isAvailable: isAvailableInput,
          displayOrder
        });
        toast.success('افزودنی با موفقیت ویرایش شد');
      } else {
        await createExtra({
          name: trimmedName,
          price,
          isAvailable: isAvailableInput,
          displayOrder
        });
        toast.success('افزودنی جدید با موفقیت ایجاد شد');
      }
      setIsFormOpen(false);
    } catch {
      // Toast already shown in store
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingExtra) return;
    try {
      await deleteExtra(deletingExtra.id);
      toast.success('افزودنی با موفقیت حذف شد');
      setIsDeleteOpen(false);
      setDeletingExtra(null);
    } catch {
      // Handled in store
    }
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
          <Dialog.Content 
            className="fixed bg-white rounded-xl shadow-xl w-[92vw] max-w-2xl z-[101] dialog-content p-6 rtl border border-[#8fa8a4] max-h-[85vh] flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0f3229]/10 flex items-center justify-center text-[#0f3229]">
                  <Sparkles size={22} />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    مدیریت افزودنی‌ها
                  </Dialog.Title>
                  <p className="text-xs text-gray-500 mt-0.5">
                    تعریف و مدیریت اقلام انتخابی قابل افزودن به سفارش‌ها (سیروپ، شات، شیر و ...)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={openAddExtra}
                    className="flex items-center gap-1.5 bg-[#0f3229] hover:bg-[#0b261f] text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>افزودن افزودنی</span>
                  </button>
                )}
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            {/* Content List */}
            <div className="overflow-y-auto flex-1 custom-scrollbar pr-1">
              {isLoading && allExtras.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0f3229]" />
                  <p className="text-xs text-gray-500">در حال دریافت افزودنی‌ها...</p>
                </div>
              ) : allExtras.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="text-sm">هیچ افزودنی فعالی یافت نشد.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {allExtras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs text-[#0f3229]">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">{extra.name}</h4>
                            <span className="text-[11px] font-mono font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                              ترتیب: {extra.displayOrder}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0f3229]">
                              {extra.price > 0 ? `${extra.price.toLocaleString('fa-IR')} تومان` : 'رایگان'}
                            </span>
                            <button
                              type="button"
                              onClick={() => isAdmin && toggleAvailability(extra.id)}
                              disabled={!isAdmin}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                                isAdmin ? 'cursor-pointer' : 'cursor-default'
                              } ${
                                extra.isAvailable 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              }`}
                              title={isAdmin ? 'کلیک برای تغییر وضعیت موجودی' : undefined}
                            >
                              {extra.isAvailable ? 'موجود' : 'ناموجود'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditExtra(extra)}
                            className="p-2 text-gray-500 hover:text-[#0f3229] hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                            title="ویرایش افزودنی"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => openDeleteDialog(extra)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer"
                            title="حذف افزودنی"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-3 border-t border-gray-100 flex justify-end shrink-0">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                >
                  بستن
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT EXTRA MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[102] dialog-overlay" />
          <Dialog.Content 
            className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-md z-[103] dialog-content p-6 rtl border border-[#8fa8a4]"
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                {editingExtra ? `ویرایش ${editingExtra.name}` : 'افزودن افزودنی جدید'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  عنوان افزودنی <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="مثال: شات اضافه اسپرسو، سیروپ کارامل، شیر بادام"
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] placeholder:text-gray-400 text-sm font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  قیمت (تومان) <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="مثال: 25000"
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] placeholder:text-gray-400 font-mono text-left text-sm font-medium transition-colors"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ترتیب نمایش (اولویت مرتب‌سازی) <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={displayOrderInput}
                  onChange={(e) => setDisplayOrderInput(e.target.value)}
                  placeholder="مثال: 1"
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] placeholder:text-gray-400 font-mono text-left text-sm font-medium transition-colors"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  افزودنی‌ها در صندوق به ترتیب این عدد (از کوچک به بزرگ) نمایش داده می‌شوند.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-gray-50 border border-gray-200 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-900 block">وضعیت موجودی</span>
                  <span className="text-xs text-gray-500">آیا این افزودنی در صندوق قابل انتخاب است؟</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailableInput}
                    onChange={(e) => setIsAvailableInput(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f3229]"></div>
                </label>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0f3229] hover:bg-[#0b261f] text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  <span>{editingExtra ? 'ذخیره تغییرات' : 'ثبت افزودنی'}</span>
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                </Dialog.Close>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[104] dialog-overlay" />
          <Dialog.Content 
            className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-sm p-6 z-[105] dialog-content rtl text-center border border-gray-200"
            dir="rtl"
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>

            <Dialog.Title className="text-lg font-bold text-gray-900 mb-2">
              حذف افزودنی «{deletingExtra?.name}»
            </Dialog.Title>

            <Dialog.Description className="text-sm text-gray-600 leading-relaxed mb-6">
              آیا از حذف این افزودنی اطمینان دارید؟ این عملیات قابل بازگشت نخواهد بود.
            </Dialog.Description>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                <span>تایید و حذف</span>
              </button>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  انصراف
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
