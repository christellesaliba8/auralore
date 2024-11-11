import { ReactNode } from "react";

const Modal = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black-1 bg-opacity-90 backdrop-blur-lg z-50 flex justify-center items-center">
      <div className="max-w-7xl w-[90%] max-h-[90vh] bg-black-1 rounded-lg p-6 relative overflow-y-auto">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-purple-1 text-2xl">
          &#x2715;
        </button>
        {/* Scrollable Modal content */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
