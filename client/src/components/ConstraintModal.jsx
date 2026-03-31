import React from 'react';

const ConstraintModal = ({ error, setError }) => {
   if (!error || error.trim() === "") return null;

    const handleClose = (e) => {
        if (e) e.preventDefault();
        setError("");
    };

    return (
        <dialog open>
            <article>
                <header>
                    <button 
                        aria-label="Close" 
                        rel="prev" 
                        onClick={handleClose}
                    ></button>
                    <p>
                        <strong>Configuration Alert</strong>
                    </p>
                </header>
                
                <p>{error}</p> 
                
                <footer style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        className="contrast" 
                        style={{ width: 'auto', marginBottom: 0 }} 
                        onClick={handleClose}
                    >
                        OK
                    </button>
                </footer>
            </article>
        </dialog>
    );
};

export default ConstraintModal;