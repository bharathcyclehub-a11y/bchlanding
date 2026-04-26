const CTAButton = ({ onClick, children = "Test ride", className }) => {
    return (
        <div className={`inline-block ${className || ''}`}>
            <button className="cta-btn" onClick={onClick}>
                {children}
            </button>
        </div>
    );
}

export default CTAButton;
