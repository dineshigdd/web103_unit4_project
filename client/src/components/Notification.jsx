const Notification = ({ isOpen, onClose, onConfirm, title, message, type = "info" }) => {
  if (!isOpen) return null;

  // Use onConfirm if provided, otherwise default to onClose
  const handleAction = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <dialog open>
      <article>
        <header>
          <a href="#close" aria-label="Close" className="close" onClick={(e) => { e.preventDefault(); onClose(); }}></a>
          <strong style={{ color: type === 'error' ? 'var(--pico-del-color)' : 'inherit' }}>
            {title || "Notification"}
          </strong>
        </header>
        <p>{message}</p>
        <footer>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
            {/* 1. Cancel Button (Only shows if onConfirm exists) */}
            {onConfirm && (
              <button 
                className="secondary outline" 
                onClick={onClose}
                style={{ marginBottom: 0 }} // Prevents Pico's bottom margin
              >
                Cancel
              </button>
            )}
            
            {/* 2. Action Button */}
            <button 
              className={onConfirm && type === 'error' ? 'delete-btn' : ''} 
              style={{ 
                backgroundColor: (onConfirm && type === 'error') ? 'var(--pico-del-color)' : '',
                borderColor: (onConfirm && type === 'error') ? 'var(--pico-del-color)' : '',
                marginBottom: 0, // Keeps buttons aligned
                width: 'auto'    /* Prevents button from stretching to full width */
              }}
              onClick={handleAction}
            >
              {onConfirm && type === 'error' ? "Delete Forever" : "Confirm"}
            </button>
          </div>
        </footer>
      </article>
    </dialog>
  );
};

export default Notification;