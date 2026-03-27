import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="alert">
      <p>
        We use essential cookies to improve your experience. By continuing to browse, you agree to our{' '}
        <a href="/privacy" style={{ color: '#B87333' }}>Privacy Policy</a>.
      </p>
      <button onClick={accept}>Accept</button>
    </div>
  );
}
