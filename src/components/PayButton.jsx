export default function PayButton({ onClick, loading, disabled }) {
  const isDisabled = loading || disabled;

  return (
    <div
      onClick={isDisabled ? undefined : onClick}
      className={`pay-btn-container ${isDisabled ? 'disabled' : ''}`}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!isDisabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="pay-btn-left-side">
        {loading ? (
          <div className="pay-btn-loading">
            <div className="pay-btn-spinner" />
          </div>
        ) : (
          <>
            <div className="pay-btn-card">
              <div className="pay-btn-card-line" />
              <div className="pay-btn-buttons" />
            </div>
            <div className="pay-btn-post">
              <div className="pay-btn-post-line" />
              <div className="pay-btn-screen">
                <div className="pay-btn-dollar">₹</div>
              </div>
              <div className="pay-btn-numbers" />
              <div className="pay-btn-numbers-line2" />
            </div>
          </>
        )}
      </div>
      <div className="pay-btn-right-side">
        <div className="pay-btn-text">
          {loading ? 'Processing...' : 'Pay ₹99'}
        </div>
        <svg
          viewBox="0 0 451.846 451.847"
          height={512}
          width={512}
          xmlns="http://www.w3.org/2000/svg"
          className="pay-btn-arrow"
        >
          <path
            fill="#cfcfcf"
            d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
          />
        </svg>
      </div>
    </div>
  );
}
