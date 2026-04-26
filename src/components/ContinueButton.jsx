import React from 'react';
import './ContinueButton.css';

const ContinueButton = ({ onClick, disabled, type = 'button', children }) => {
    return (
        <div className="w-full pb-4"> {/* Added padding bottom to account for the 3D shadow/displacement */}
            <button
                className="continue-btn"
                onClick={onClick}
                disabled={disabled}
                type={type}
            >
                {children}
            </button>
        </div>
    );
}

export default ContinueButton;
