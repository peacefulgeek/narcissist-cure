import React from 'react';
import SEOHead from '../components/SEOHead';

export default function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy"
        description="Privacy policy for The Narcissist Antidote. Learn how we handle your data."
        canonical="https://narcissistcure.com/privacy"
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1>Privacy Policy</h1>
        <p><em>Last updated: March 27, 2026</em></p>

        <h2>Information We Collect</h2>
        <p>
          The Narcissist Antidote collects only the information you voluntarily provide. If you subscribe to our newsletter, we collect your email address and the date and page from which you subscribed. We do not collect names, addresses, payment information, or any other personal data.
        </p>

        <h2>How We Store Your Information</h2>
        <p>
          Email addresses submitted through our newsletter forms are stored securely on Bunny CDN, a content delivery network with servers in multiple locations. We do not use databases, third-party email marketing platforms, or customer relationship management tools to store your information.
        </p>

        <h2>How We Use Your Information</h2>
        <p>
          Currently, we do not send marketing emails or newsletters. Your email address is stored for potential future communications. If we begin sending emails, we will update this policy and provide an opt-out mechanism in every communication.
        </p>

        <h2>Third-Party Services</h2>
        <p>
          We use Bunny CDN to deliver images and store subscriber data. We do not use Google Analytics, Facebook Pixel, or any other third-party tracking or advertising services. We do not sell, trade, or otherwise transfer your personal information to outside parties.
        </p>

        <h2>Cookies</h2>
        <p>
          We use essential cookies to remember your cookie consent preference. We do not use tracking cookies, advertising cookies, or third-party cookies of any kind.
        </p>

        <h2>Your Rights</h2>
        <p>
          You have the right to request access to, correction of, or deletion of your personal data. Under GDPR, CCPA, and similar regulations, you may also object to processing or request data portability. To exercise any of these rights, you may contact us through the site.
        </p>

        <h2>Opt-Out</h2>
        <p>
          If you wish to have your email address removed from our subscriber list, you may request removal at any time. Since we do not currently send emails, there is no unsubscribe link, but we honor all removal requests.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date.
        </p>
      </div>
    </>
  );
}
