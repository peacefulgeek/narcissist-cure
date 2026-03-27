import React from 'react';
import SEOHead from '../components/SEOHead';

export default function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Terms of service for The Narcissist Antidote."
        canonical="https://narcissistcure.com/terms"
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1>Terms of Service</h1>
        <p><em>Last updated: March 27, 2026</em></p>

        <h2>Educational Purpose</h2>
        <p>
          All content on The Narcissist Antidote is provided for educational and informational purposes only. Nothing on this site constitutes professional medical advice, psychological counseling, legal advice, or any form of professional consultation. Always seek the advice of a qualified professional for any questions regarding your health, mental health, or legal situation.
        </p>

        <h2>No Professional Relationship</h2>
        <p>
          Reading articles, taking quizzes, or subscribing to our newsletter does not create a therapist-client, doctor-patient, or any other professional relationship. If you are in crisis, please contact the National Domestic Violence Hotline at 1-800-799-7233 or text START to 88788.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          All content, including articles, images, quizzes, and design elements, is the intellectual property of The Narcissist Antidote and is protected by copyright law. You may share links to our content but may not reproduce, distribute, or create derivative works without written permission.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          The Narcissist Antidote and its contributors shall not be held liable for any damages arising from the use of this site or its content. This includes but is not limited to direct, indirect, incidental, consequential, or punitive damages. You use this site at your own risk.
        </p>

        <h2>External Links</h2>
        <p>
          This site contains links to external websites. We are not responsible for the content, privacy practices, or availability of these external sites. Inclusion of a link does not imply endorsement.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.
        </p>
      </div>
    </>
  );
}
