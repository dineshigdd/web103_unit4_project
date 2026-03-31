import React from 'react';

const Notification = ({ isOpen, onClose, title, message, type = "info" }) => {
  if (!isOpen) return null;

  return (
    <dialog open>
      <article>
        <header>
          <a
            href="#close"
            aria-label="Close"
            className="close"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          ></a>
          <strong style={{ color: type === 'error' ? 'var(--pico-del-color)' : 'inherit' }}>
            {title || "Notification"}
          </strong>
        </header>
        <p>{message}</p>
        <footer>
          <button 
            className={type === 'error' ? 'secondary' : ''} 
            onClick={onClose}
          >
            Confirm
          </button>
        </footer>
      </article>
    </dialog>
  );
};

export default Notification;