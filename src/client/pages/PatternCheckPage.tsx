import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import NewsletterForm from '../components/NewsletterForm';

interface PatternResult {
  name: string;
  score: number;
  description: string;
  articles: string[];
}

const QUESTIONS = [
  { id: 1, text: 'Did your partner make grand promises about the future very early in the relationship?', pattern: 'future-faking' },
  { id: 2, text: 'Did you often feel confused about what actually happened during disagreements?', pattern: 'gaslighting' },
  { id: 3, text: 'Did your partner frequently bring up other people to make you feel jealous or insecure?', pattern: 'triangulation' },
  { id: 4, text: 'Did your partner alternate between intense affection and cold withdrawal?', pattern: 'intermittent-reinforcement' },
  { id: 5, text: 'Did your partner tell you that your friends or family were bad influences?', pattern: 'isolation' },
  { id: 6, text: 'Did you feel like you were walking on eggshells to avoid triggering their anger?', pattern: 'gaslighting' },
  { id: 7, text: 'Did your partner paint a picture of a perfect future together that never materialized?', pattern: 'future-faking' },
  { id: 8, text: 'Did your partner compare you unfavorably to exes, friends, or colleagues?', pattern: 'triangulation' },
  { id: 9, text: 'Did the relationship feel addictive — impossible to leave despite knowing it was harmful?', pattern: 'intermittent-reinforcement' },
  { id: 10, text: 'Did your social circle shrink significantly during the relationship?', pattern: 'isolation' },
  { id: 11, text: 'Did your partner deny saying things you clearly remember them saying?', pattern: 'gaslighting' },
  { id: 12, text: 'Did your partner use the silent treatment as punishment?', pattern: 'intermittent-reinforcement' },
  { id: 13, text: 'Did your partner seem to have a different personality in public versus private?', pattern: 'triangulation' },
  { id: 14, text: 'Did your partner promise to change after every major conflict?', pattern: 'future-faking' },
  { id: 15, text: 'Did you lose contact with people who cared about you during the relationship?', pattern: 'isolation' },
];

const PATTERN_INFO: Record<string, { name: string; description: string }> = {
  'gaslighting': {
    name: 'Gaslighting',
    description: 'A systematic pattern of making you doubt your own perception, memory, and sanity. Gaslighting rewires your relationship with reality itself. Bessel van der Kolk\'s research demonstrates that this kind of sustained perceptual manipulation literally changes how the brain processes information.',
  },
  'future-faking': {
    name: 'Future Faking',
    description: 'The narcissist creates an elaborate vision of a shared future that they have no intention of building. This is not optimism or poor planning — it is a deliberate manipulation tool designed to keep you invested in a relationship that serves only them.',
  },
  'triangulation': {
    name: 'Triangulation',
    description: 'Bringing third parties into the dynamic to destabilize your sense of security. This can involve exes, friends, family members, or even strangers. The goal is to keep you in a constant state of comparison and competition.',
  },
  'intermittent-reinforcement': {
    name: 'Intermittent Reinforcement',
    description: 'The unpredictable alternation between reward and punishment that creates the strongest form of psychological attachment. This is the same mechanism that makes gambling addictive — and it is why trauma bonds feel impossible to break.',
  },
  'isolation': {
    name: 'Isolation',
    description: 'The systematic removal of your support network. This rarely happens through direct prohibition — instead, the narcissist creates conditions where maintaining outside relationships becomes too exhausting, too conflictual, or too dangerous.',
  },
};

export default function PatternCheckPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (qId: number, value: number) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const calculateResults = (): PatternResult[] => {
    const patternScores: Record<string, number> = {};
    QUESTIONS.forEach(q => {
      const answer = answers[q.id] || 0;
      patternScores[q.pattern] = (patternScores[q.pattern] || 0) + answer;
    });

    return Object.entries(patternScores)
      .map(([key, score]) => ({
        name: PATTERN_INFO[key].name,
        score,
        description: PATTERN_INFO[key].description,
        articles: [],
      }))
      .sort((a, b) => b.score - a.score);
  };

  const allAnswered = Object.keys(answers).length === QUESTIONS.length;
  const results = showResults ? calculateResults() : [];
  const topPattern = results[0];

  return (
    <>
      <SEOHead
        title="The Relationship Pattern Illuminator"
        description="Identify narcissistic dynamics in your relationship — gaslighting, future-faking, triangulation, and more. Not a diagnosis. A mirror."
        canonical="https://narcissistcure.com/pattern-check"
        ogImage="https://narcissist-cure.b-cdn.net/og/pattern-check.png"
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1>The Relationship Pattern Illuminator</h1>
        <p style={{ color: '#555', marginBottom: '0.5rem' }}>
          This is not a diagnosis. It is a mirror. Answer these 15 questions about your last significant relationship, and we will identify which narcissistic dynamics may have been present.
        </p>
        <p style={{ color: '#999', fontSize: '0.85rem', marginBottom: '2rem' }}>
          Rate each statement from 0 (never) to 4 (constantly).
        </p>

        {!showResults ? (
          <>
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} style={{
                padding: '1.5rem 0',
                borderBottom: '1px solid #f0f0f0',
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem' }}>
                  {idx + 1}. {q.text}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[0, 1, 2, 3, 4].map(val => (
                    <button
                      key={val}
                      onClick={() => handleAnswer(q.id, val)}
                      style={{
                        padding: '0.5em 1em',
                        border: `2px solid ${answers[q.id] === val ? '#4682B4' : '#e0e0e0'}`,
                        borderRadius: '4px',
                        background: answers[q.id] === val ? '#4682B4' : 'transparent',
                        color: answers[q.id] === val ? '#FFFFF0' : '#555',
                        cursor: 'pointer',
                        minWidth: '44px',
                        minHeight: '44px',
                        fontSize: '0.9rem',
                      }}
                      aria-label={`Rate ${val} - ${['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'][val]}`}
                    >
                      {val} — {['Never', 'Rarely', 'Sometimes', 'Often', 'Constantly'][val]}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              className="btn btn-primary"
              onClick={() => setShowResults(true)}
              disabled={!allAnswered}
              style={{ marginTop: '2rem', opacity: allAnswered ? 1 : 0.5 }}
            >
              {allAnswered ? 'See My Patterns' : `Answer all 15 questions (${Object.keys(answers).length}/15)`}
            </button>
          </>
        ) : (
          <>
            <div style={{
              padding: '2rem',
              background: 'rgba(184,115,51,0.05)',
              borderRadius: '8px',
              borderLeft: '4px solid #B87333',
              marginBottom: '2rem',
            }}>
              <h2 style={{ marginTop: 0, color: '#B87333' }}>Your Primary Pattern: {topPattern?.name}</h2>
              <p>{topPattern?.description}</p>
            </div>

            <h2>All Patterns Identified</h2>
            {results.map((r, i) => {
              const maxPossible = QUESTIONS.filter(q => q.pattern === Object.keys(PATTERN_INFO).find(k => PATTERN_INFO[k].name === r.name)).length * 4;
              const pct = maxPossible > 0 ? Math.round((r.score / maxPossible) * 100) : 0;
              return (
                <div key={i} style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>{r.name}</strong>
                    <span style={{ color: '#999' }}>{pct}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: pct > 60 ? '#B87333' : '#4682B4',
                      borderRadius: '4px',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>{r.description}</p>
                </div>
              );
            })}

            <div style={{ padding: '1.5rem', background: 'rgba(70,130,180,0.05)', borderRadius: '8px', margin: '2rem 0' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Get personalized recovery insights</p>
              <NewsletterForm source="pattern-check" />
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/articles" className="btn btn-primary">Read Recovery Articles</Link>
              <button
                className="btn btn-accent"
                onClick={() => { setAnswers({}); setShowResults(false); }}
              >
                Retake Assessment
              </button>
            </div>

            <div className="disclaimer">
              <strong>Important:</strong> This assessment is for educational purposes only. It is not a clinical diagnosis. If you are in an abusive relationship, please contact the National Domestic Violence Hotline at 1-800-799-7233.
            </div>
          </>
        )}
      </div>
    </>
  );
}
