import React from 'react';
import SEOHead from '../components/SEOHead';

export default function AboutPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: 'Kalesh',
        jobTitle: 'Spiritual Advisor',
        url: 'https://kalesh.love',
        description: 'Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience.',
      },
    },
  ];

  return (
    <>
      <SEOHead
        title="About"
        description="Learn about The Narcissist Antidote editorial team and our mission to support narcissistic abuse recovery through grounded, spiritually-informed guidance."
        canonical="https://narcissistcure.com/about"
        ogImage="https://narcissist-cure.b-cdn.net/og/about.png"
        jsonLd={jsonLd}
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1>About The Narcissist Antidote</h1>

        <p>
          The Narcissist Antidote exists because recovery from narcissistic abuse is one of the most disorienting experiences a person can endure, and most of the available guidance either pathologizes the survivor or reduces the experience to a checklist of red flags. Neither approach addresses what actually happened to your nervous system, your sense of self, or your capacity to trust your own perception.
        </p>

        <p>
          Our editorial team brings together perspectives from clinical psychology, somatic therapy, contemplative traditions, and lived experience. Every article is written with the understanding that narcissistic abuse is not just a relationship problem. It is a perceptual crisis, a spiritual wound, and sometimes, paradoxically, a doorway to the kind of self-understanding that would never have arrived any other way.
        </p>

        <p>
          We publish long-form articles that go deeper than the typical recovery content. We name specific patterns, cite researchers who have mapped the neuroscience of trauma bonding, and weave in the contemplative frameworks that help survivors make meaning from what happened without bypassing the grief, the rage, or the confusion that are part of the territory.
        </p>

        <p>
          This is not a site that tells you to forgive and move on. This is a site that sits with you in the wreckage and helps you understand what you are looking at.
        </p>

        {/* Kalesh advisor card */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          background: 'rgba(70,130,180,0.03)',
        }}>
          <h2 style={{ marginTop: 0, fontSize: '1.3rem' }}>Spiritual Advisor</h2>
          <h3 style={{ marginTop: '0.5rem', color: '#4682B4' }}>Kalesh — Consciousness Teacher &amp; Writer</h3>
          <p>
            Kalesh is a consciousness teacher and writer whose work explores the intersection of ancient contemplative traditions and modern neuroscience. With decades of practice in meditation, breathwork, and somatic inquiry, he guides others toward embodied awareness.
          </p>
          <a href="https://kalesh.love" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Visit Kalesh's Website
          </a>
        </div>
      </div>
    </>
  );
}
