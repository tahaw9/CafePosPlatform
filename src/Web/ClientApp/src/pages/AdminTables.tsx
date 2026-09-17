import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useOrderStore, TableStatus, Table } from '../store/useOrderStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Loader2, 
  CheckCircle2, 
  Coffee, 
  Bell, 
  Info,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<TableStatus, {
  bg: string;
  badge: string;
  text: string;
  icon: typeof Coffee;
}> = {
  empty: {
    bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    text: 'خالی',
    icon: CheckCircle2,
  },
  occupied: {
    bg: 'bg-rose-50/70 border-rose-200 text-rose-900 hover:border-rose-300',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    text: 'پر',
    icon: Coffee,
  },
  waiter_called: {
    bg: 'bg-amber-50/90 border-amber-300 text-amber-900 animate-pulse hover:border-amber-400',
    badge: 'bg-amber-200 text-amber-900 border-amber-400',
    text: 'درخواست گارسون',
    icon: Bell,
  },
};

export default function AdminTables() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const { 
    tables, 
    orders, 
    fetchInitialData, 
    createTable, 
    updateTable, 
    deleteTable, 
    updateTableStatus,
    isLoading,
    isSubmitting 
  } = useOrderStore();

  // Modal States
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableNumberInput, setTableNumberInput] = useState<string>('');
  const [tableNameInput, setTableNameInput] = useState<string>('');
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTable, setDeletingTable] = useState<Table | null>(null);

  const [statusModalTable, setStatusModalTable] = useState<Table | null>(null);

  useEffect(() => {
    if (tables.length === 0) {
      fetchInitialData();
    }
  }, [fetchInitialData, tables.length]);

  // Handle opening the Add Table modal
  const handleOpenAdd = () => {
    // Propose next available table number
    const maxNum = tables.reduce((max, t) => Math.max(max, t.tableNumber || 0), 0);
    const nextNum = maxNum + 1;

    setEditingTable(null);
    setTableNumberInput(nextNum.toString());
    setTableNameInput(`میز ${nextNum}`);
    setIsNameManuallyEdited(false);
    setIsAddEditOpen(true);
  };

  // Handle opening the Edit Table modal
  const handleOpenEdit = (table: Table) => {
    setEditingTable(table);
    setTableNumberInput(table.tableNumber.toString());
    setTableNameInput(table.name);
    setIsNameManuallyEdited(table.name !== `میز ${table.tableNumber}`);
    setIsAddEditOpen(true);
  };

  // Handle Table Number input change with smart auto-naming
  const handleTableNumberChange = (val: string) => {
    setTableNumberInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      if (!isNameManuallyEdited || tableNameInput.trim() === '' || tableNameInput.startsWith('میز ')) {
        setTableNameInput(`میز ${num}`);
      }
    } else if (val === '') {
      if (!isNameManuallyEdited) {
        setTableNameInput('');
      }
    }
  };

  // Submit Add or Edit
  const handleSubmitAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(tableNumberInput, 10);
    if (isNaN(num) || num <= 0) {
      toast.error('شماره میز باید عددی بزرگتر از صفر باشد');
      return;
    }

    try {
      if (editingTable) {
        await updateTable(editingTable.id, {
          tableNumber: num,
          name: tableNameInput.trim() || `میز ${num}`
        });
      } else {
        await createTable({
          tableNumber: num,
          name: tableNameInput.trim() || `میز ${num}`
        });
      }
      setIsAddEditOpen(false);
    } catch {
      // Errors handled in useOrderStore via toast
    }
  };

  // Open Delete Confirmation
  const handleOpenDelete = (table: Table) => {
    setDeletingTable(table);
    setIsDeleteOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingTable) return;
    try {
      await deleteTable(deletingTable.id);
      setIsDeleteOpen(false);
      setDeletingTable(null);
    } catch {
      // Error handled in store
    }
  };

  // Status counters
  const emptyCount = tables.filter(t => t.status === 'empty').length;
  const occupiedCount = tables.filter(t => t.status === 'occupied').length;
  const waiterCount = tables.filter(t => t.status === 'waiter_called').length;

  return (
    <div className="p-6 h-full flex flex-col rtl font-sans" dir="rtl">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-[#0f3229] mb-1">مدیریت و وضعیت میزها</h1>
          <p className="text-sm text-gray-500 font-medium">
            نظارت زنده بر وضعیت میزهای سالن و مدیریت چیدمان
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Live Summary Chips */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {emptyCount} خالی
            </span>
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              {occupiedCount} پر
            </span>
            {waiterCount > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-amber-200 text-amber-900 border border-amber-300 animate-pulse">
                {waiterCount} گارسون
              </span>
            )}
          </div>

          {/* Admin Add Table Button */}
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-[#0f3229] hover:bg-[#0b261f] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <Plus size={18} />
              <span>افزودن میز</span>
            </button>
          )}
        </div>
      </div>

      {/* Tables Grid */}
      {isLoading && tables.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0f3229]" size={36} />
        </div>
      ) : tables.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Info size={48} className="text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800 mb-1">هیچ میزی ثبت نشده است</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            برای شروع، اولین میز سالن را با زدن دکمه زیر ایجاد کنید.
          </p>
          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="bg-[#0f3229] hover:bg-[#0b261f] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer"
            >
              افزودن میز اول
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto pb-10">
          {tables.map(table => {
            const activeOrder = orders.find(
              o => o.tableId === table.id && o.status !== 'cancelled' && o.status !== 'completed'
            );
            const isDeletable = table.status === 'empty' && !activeOrder;
            const config = STATUS_CONFIG[table.status];
            const StatusIcon = config.icon;

            return (
              <div 
                key={table.id}
                className={`relative border-2 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${config.bg}`}
              >
                {/* Card Top: Number badge and Admin Actions */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-mono font-bold bg-white/80 border border-black/10 px-2 py-0.5 rounded-md text-gray-700">
                    #{table.tableNumber}
                  </span>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(table);
                        }}
                        title="ویرایش میز"
                        className="p-1 rounded-md text-gray-500 hover:text-[#0f3229] hover:bg-white/80 transition-colors cursor-pointer"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isDeletable) handleOpenDelete(table);
                        }}
                        disabled={!isDeletable}
                        title={
                          !isDeletable 
                            ? (table.status !== 'empty' 
                                ? 'میز خالی نیست و قابل حذف نمی‌باشد' 
                                : 'میز دارای سفارش فعال است و قابل حذف نمی‌باشد')
                            : 'حذف میز'
                        }
                        className={`p-1 rounded-md transition-colors ${
                          isDeletable 
                            ? 'text-gray-400 hover:text-red-600 hover:bg-white/80 cursor-pointer' 
                            : 'text-gray-300 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Middle: Table Name */}
                <div className="text-center my-3">
                  <div className="font-black text-xl text-gray-900 tracking-tight">{table.name}</div>
                  {activeOrder && (
                    <div className="inline-block mt-1 text-xs font-bold bg-black/10 text-gray-800 rounded px-2 py-0.5">
                      سفارش #{activeOrder.orderCode}
                    </div>
                  )}
                </div>

                {/* Card Bottom: Interactive Status Switcher */}
                <button
                  onClick={() => setStatusModalTable(table)}
                  title="تغییر وضعیت میز"
                  className={`mt-2 py-1.5 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-transform active:scale-95 cursor-pointer bg-white/90 shadow-2xs hover:bg-white ${config.badge}`}
                >
                  <StatusIcon size={14} />
                  <span>{config.text}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT TABLE MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      <Dialog.Root open={isAddEditOpen} onOpenChange={setIsAddEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
          <Dialog.Content 
            className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-md z-[101] dialog-content p-6 rtl border border-[#8fa8a4]"
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
              <Dialog.Title className="text-xl font-bold text-gray-900">
                {editingTable ? `ویرایش ${editingTable.name}` : 'افزودن میز جدید'}
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer">
                <X size={20} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmitAddEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  شماره میز <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={tableNumberInput}
                  onChange={(e) => handleTableNumberChange(e.target.value)}
                  placeholder="مثال: 1"
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] placeholder:text-gray-400 text-left font-mono text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  شماره میز باید منحصر‌به‌فرد و بزرگتر از صفر باشد.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نام نمایشی میز <span className="text-gray-400 font-normal text-xs mr-1">(اختیاری)</span>
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={tableNameInput}
                  onChange={(e) => {
                    setTableNameInput(e.target.value);
                    setIsNameManuallyEdited(true);
                  }}
                  placeholder="مثال: میز 1 یا میز VIP سالن"
                  className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0f3229] placeholder:text-gray-400 text-sm font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  در صورت خالی گذاشتن، به‌صورت خودکار <span className="font-semibold text-gray-700">«میز {tableNumberInput || 'X'}»</span> نام‌گذاری می‌شود.
                </p>
              </div>

              <div className="pt-4 flex gap-3 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0f3229] hover:bg-[#0b261f] text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : null}
                  <span>{editingTable ? 'ذخیره تغییرات' : 'ثبت میز'}</span>
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
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
          <Dialog.Content 
            className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-sm p-6 z-[101] dialog-content rtl text-center border border-gray-200"
            dir="rtl"
          >
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} />
            </div>

            <Dialog.Title className="text-lg font-bold text-gray-900 mb-2">
              حذف {deletingTable?.name}
            </Dialog.Title>

            <Dialog.Description className="text-sm text-gray-600 leading-relaxed mb-6">
              آیا از حذف این میز اطمینان دارید؟ سوابق سفارش‌های قبلی این میز در گزارش‌های مالی محفوظ خواهد ماند.
            </Dialog.Description>

            <div className="flex gap-3">
              <button
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

      {/* ------------------------------------------------------------- */}
      {/* QUICK STATUS SWITCHER MODAL                                   */}
      {/* ------------------------------------------------------------- */}
      <Dialog.Root open={!!statusModalTable} onOpenChange={(open) => !open && setStatusModalTable(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100] dialog-overlay" />
          <Dialog.Content 
            className="fixed bg-white rounded-xl shadow-xl w-[90vw] max-w-xs p-5 z-[101] dialog-content rtl border border-gray-200"
            dir="rtl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <Dialog.Title className="text-base font-black text-gray-900">
                تغییر وضعیت {statusModalTable?.name}
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </Dialog.Close>
            </div>

            <div className="space-y-2">
              {(['empty', 'occupied', 'waiter_called'] as TableStatus[]).map((st) => {
                const conf = STATUS_CONFIG[st];
                const Icon = conf.icon;
                const isSelected = statusModalTable?.status === st;

                return (
                  <button
                    key={st}
                    onClick={async () => {
                      if (!statusModalTable || isSelected) return;
                      try {
                        await updateTableStatus(statusModalTable.id, st);
                        setStatusModalTable(null);
                      } catch {
                        // Handled in store
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#0f3229] text-white border-[#0f3229] shadow-sm' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} />
                      <span>{conf.text}</span>
                    </div>
                    {isSelected && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">فعلی</span>}
                  </button>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
