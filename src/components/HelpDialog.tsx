import { useHelp } from "@/store/states";

export default function HelpDialog() {
  const showHelp = useHelp((state) => state.showHelp)
  const setShowHelp = useHelp((state) => state.setShowHelp)

  return (
    <div>
      {showHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                onKeyDown={(e) => e.key === "Enter" && setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close help dialog"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span>Focus search</span>
                <div className="flex gap-1">
                  <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
                ⌘K
              </kbd>
              <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
                /
              </kbd>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Clear search</span>
            <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
              Esc
            </kbd>
          </div>
          <div className="flex justify-between items-center">
            <span>Add new word</span>
            <div className="flex gap-1">
              <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
                +
              </kbd>
              <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
                A
              </kbd>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Scroll through words</span>
            <div className="flex gap-1">
              <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
                J
              </kbd>
              <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
                K
              </kbd>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span>Show this help</span>
            <kbd className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border">
              Shift + ?
            </kbd>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
          Press{" "}
          <kbd className="bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded border">
            Esc
          </kbd>{" "}
          or click outside to close
        </div>
      </div>
    </div>
  )}
  </div>
  )
}
