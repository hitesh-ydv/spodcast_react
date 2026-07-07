import { AnimatePresence, motion } from "framer-motion";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.22 }}
            className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-purple-500/20 bg-[#12121A] p-6 shadow-[0_0_40px_rgba(139,92,246,0.18)]"
          >
            <h2 className="text-xl font-semibold text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {description}
              </p>
            )}

            <div className="mt-8 flex justify-end gap-3">
              {/* Cancel */}
              <button
                onClick={onCancel}
                className="rounded-full cursor-pointer border border-zinc-700 bg-[#12121A] px-5 py-2 text-sm font-medium text-white transition-all hover:border-zinc-500 hover:bg-[#1D1D2F]"
              >
                {cancelText}
              </button>

              {/* Confirm */}
              <button
                onClick={onConfirm}
                className="rounded-full cursor-pointer bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-blue-600 hover:shadow-lg active:scale-95"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}