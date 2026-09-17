import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { 
  X, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  FolderKanban, 
  Coffee, 
  GlassWater, 
  Sandwich, 
  Pizza, 
  Croissant, 
  Utensils,
  EggFried,
  Dessert,
  CakeSlice,
  Cookie,
  Beer
} from 'lucide-react';
import { useMenuStore, MenuCategory } from '../../store/useMenuStore';
import { useAuthStore } from '../../store/useAuthStore';
import toast from 'react-hot-toast';

function Blender({ size = 20, className = '', strokeWidth = 2, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M7 3h10l-1.5 12H8.5L7 3z" />
      <path d="M5 21h14" />
      <path d="M8.5 15v6" />
      <path d="M15.5 15v6" />
      <path d="M16 6h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2.5" />
      <path d="M10.5 3v-1" />
    </svg>
  );
}

const AVAILABLE_ICONS = [
  { value: 'Coffee', label: 'قهوه و گرم', icon: Coffee },
  { value: 'GlassWater', label: 'نوشیدنی سرد', icon: GlassWater },
  { value: 'Blender', label: 'اسموتی و شیک', icon: Blender },
  { value: 'Beer', label: 'ماءالشعیر', icon: Beer },
  { value: 'Sandwich', label: 'ساندویچ', icon: Sandwich },
  { value: 'Pizza', label: 'پیتزا', icon: Pizza },
  { value: 'EggFried', label: 'صبحانه و نیمرو', icon: EggFried },
  { value: 'Utensils', label: 'غذا و متفرقه', icon: Utensils },
  { value: 'CakeSlice', label: 'کیک و اسلایس', icon: CakeSlice },
  { value: 'Dessert', label: 'دسر', icon: Dessert },
  { value: 'Cookie', label: 'کوکی', icon: Cookie },
  { value: 'Croissant', label: 'کروسان و نان', icon: Croissant },
];

function getCategoryIcon(iconName: string) {
  const item = AVAILABLE_ICONS.find(i => i.value === iconName);
  const IconComponent = item ? item.icon : Coffee;
  return <IconComponent size={20} className="text-[#0f3229]" />;
}

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryManagementModal({ isOpen, onClose }: CategoryManagementModalProps) {
  const { categories, createCategory, updateCategory, deleteCategory, isSubmitting } = useMenuStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  // Add/Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [displayOrderInput, setDisplayOrderInput] = useState('');
  const [iconInput, setIconInput] = useState('Coffee');

  // Delete Confirmation State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<MenuCategory | null>(null);

  const openAddCategory = () => {
    setEditingCategory(null);
    setNameInput('');
    // Suggest next display order
    const maxOrder = categories.reduce((max, c) => Math.max(max, c.displayOrder || 0), 0);
    setDisplayOrderInput(String(maxOrder + 1));
    setIconInput('Coffee');
    setIsFormOpen(true);
  };

  const openEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setNameInput(cat.name);
    setDisplayOrderInput(String(cat.displayOrder ?? 0));
    setIconInput(cat.icon || 'Coffee');
    setIsFormOpen(true);
  };

  const openDeleteDialog = (cat: MenuCategory) => {
    if (cat.itemCount > 0) {
      toast.error(`امکان حذف وجود ندارد: دسته‌بندی «${cat.name}» دارای ${cat.itemCount} محصول فعال است.`);
      return;
    }
    setDeletingCategory(cat);
    setIsDeleteOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) {
      toast.error('لطفاً نام دسته‌بندی را وارد کنید');
      return;
    }

    const displayOrder = parseInt(displayOrderInput, 10);
    if (isNaN(displayOrder) || displayOrder < 0) {
      toast.error('ترتیب نمایش باید عددی بزرگتر یا مساوی صفر باشد');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name: trimmedName,
          icon: iconInput,
          displayOrder
        });
        toast.success('دسته‌بندی با موفقیت ویرایش شد');
      } else {
        await createCategory({
          name: trimmedName,
          icon: iconInput,
          displayOrder
        });
        toast.success('دسته‌بندی جدید با موفقیت ایجاد شد');
      }
      setIsFormOpen(false);
    } catch {
      // Toast already shown in store
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      toast.success('دسته‌بندی با موفقیت حذف شد');
      setIsDeleteOpen(false);
      setDeletingCategory(null);
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
                  <FolderKanban size={22} />
                </div>
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    مدیریت دسته‌بندی‌ها
                  </Dialog.Title>
                  <p className="text-xs text-gray-500 mt-0.5">
                    سازمان‌دهی دسته‌های محصولات منو و ترتیب نمایش آن‌ها در صندوق و منوی مشتری
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={openAddCategory}
                    className="flex items-center gap-1.5 bg-[#0f3229] hover:bg-[#0b261f] text-white px-3.5 py-2 rounded-lg font-medium text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>افزودن دسته‌بندی</span>
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
              {categories.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="text-sm">هیچ دسته‌بندی فعالی یافت نشد.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {categories.map((cat) => {
                    const hasItems = cat.itemCount > 0;

                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-200 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
                            {getCategoryIcon(cat.icon)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-gray-900">{cat.name}</h4>
                              <span className="text-[11px] font-mono font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                                ترتیب: {cat.displayOrder}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                                hasItems 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {hasItems ? `${cat.itemCount} محصول اختصاص‌یافته` : 'بدون محصول (قابل حذف)'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditCategory(cat)}
                              className="p-2 text-gray-500 hover:text-[#0f3229] hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                              title="ویرایش دسته‌بندی"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteDialog(cat)}
                              disabled={hasItems}
                              className={`p-2 rounded-lg transition-colors border ${
                                hasItems
                                  ? 'text-gray-300 border-transparent cursor-not-allowed opacity-40'
                                  : 'text-gray-400 hover:text-red-600 hover:bg-white border-transparent hover:border-gray-200 cursor-pointer'
                              }`}
                              title={
                                hasItems
                                  ? 'به دلیل وجود محصولات فعال، حذف این دسته‌بندی امکان‌پذیر نیست'
                                  : 'حذف دسته‌بندی'
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
      {/* ADD / EDIT CATEGORY MODAL                                     */}
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
                {editingCategory ? `ویرایش ${editingCategory.name}` : 'افزودن دسته‌بندی جدید'}
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
                  نام دسته‌بندی <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="مثال: نوشیدنی گرم"
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] placeholder:text-gray-400 text-sm font-medium transition-colors"
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
                  دسته‌بندی‌ها در منو و صندوق به ترتیب این عدد (از کوچک به بزرگ) نمایش داده می‌شوند.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  آیکون دسته‌بندی
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 max-h-52 overflow-y-auto custom-scrollbar p-1">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = iconInput === item.value;

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setIconInput(item.value)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#0f3229]/10 border-[#0f3229] text-[#0f3229] font-bold shadow-xs'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <IconComp size={20} />
                        <span className="truncate w-full text-center">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0f3229] hover:bg-[#0b261f] text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  <span>{editingCategory ? 'ذخیره تغییرات' : 'ثبت دسته‌بندی'}</span>
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
              حذف دسته‌بندی {deletingCategory?.name}
            </Dialog.Title>

            <Dialog.Description className="text-sm text-gray-600 leading-relaxed mb-6">
              آیا از حذف این دسته‌بندی اطمینان دارید؟ این عملیات قابل بازگشت نخواهد بود.
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
