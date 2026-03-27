import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import NewsletterForm from '../components/NewsletterForm';

interface QuizQuestion {
  text: string;
  options: { text: string; scores: Record<string, number> }[];
}

interface QuizResult {
  id: string;
  title: string;
  description: string;
}

interface QuizData {
  title: string;
  description: string;
  ogImage: string;
  questions: QuizQuestion[];
  results: QuizResult[];
}

const QUIZZES: Record<string, QuizData> = {
  'gaslighting-awareness': {
    title: 'How Well Do You Recognize Gaslighting?',
    description: 'Test your ability to identify gaslighting tactics in everyday situations.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-gaslighting.png',
    questions: [
      { text: 'When you express a concern, your partner says "That never happened." How do you respond?', options: [
        { text: 'I start doubting my own memory', scores: { vulnerable: 2 } },
        { text: 'I feel confused but hold my ground', scores: { aware: 1, vulnerable: 1 } },
        { text: 'I recognize this as a gaslighting tactic', scores: { aware: 2 } },
        { text: 'I check with others to verify my experience', scores: { aware: 1 } },
      ]},
      { text: 'You notice your partner tells different versions of the same story to different people. What do you think?', options: [
        { text: 'Maybe I misunderstood what they said', scores: { vulnerable: 2 } },
        { text: 'This is concerning but I give them the benefit of the doubt', scores: { vulnerable: 1 } },
        { text: 'This is a pattern of manipulation', scores: { aware: 2 } },
        { text: 'I document what I observe', scores: { aware: 2 } },
      ]},
      { text: 'After an argument, you feel like you were wrong even though you started with a valid point. How often does this happen?', options: [
        { text: 'Almost every time we disagree', scores: { vulnerable: 2 } },
        { text: 'Frequently, and it leaves me confused', scores: { vulnerable: 1, aware: 1 } },
        { text: 'I have started noticing this pattern', scores: { aware: 2 } },
        { text: 'Rarely — I can usually hold onto my perspective', scores: { aware: 1 } },
      ]},
      { text: 'Your partner says "You are too sensitive" when you bring up something that hurt you. What is your reaction?', options: [
        { text: 'They are probably right — I am too sensitive', scores: { vulnerable: 2 } },
        { text: 'I feel ashamed and drop the subject', scores: { vulnerable: 2 } },
        { text: 'I recognize this as dismissal of my feelings', scores: { aware: 2 } },
        { text: 'I restate my boundary calmly', scores: { aware: 2 } },
      ]},
      { text: 'You catch your partner in a lie, and they respond with anger and blame. What happens next?', options: [
        { text: 'I end up apologizing for bringing it up', scores: { vulnerable: 2 } },
        { text: 'I feel guilty even though I know I am right', scores: { vulnerable: 1, aware: 1 } },
        { text: 'I name the deflection and stay with the original issue', scores: { aware: 2 } },
        { text: 'I disengage and process what just happened', scores: { aware: 1 } },
      ]},
    ],
    results: [
      { id: 'vulnerable', title: 'Gaslighting May Be Affecting Your Perception', description: 'Your responses suggest that gaslighting tactics may be significantly impacting your ability to trust your own experience. This is not a weakness — it is the predictable result of sustained psychological manipulation. The first step is recognizing the pattern.' },
      { id: 'aware', title: 'You Have Strong Gaslighting Awareness', description: 'Your responses indicate a solid ability to recognize gaslighting tactics when they occur. This awareness is your most powerful tool. Continue trusting your perception and documenting what you observe.' },
    ],
  },
  'trauma-bond-assessment': {
    title: 'Are You in a Trauma Bond?',
    description: 'Understand the patterns that keep you connected to someone who hurts you.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-trauma-bond.png',
    questions: [
      { text: 'When your partner is kind after a period of cruelty, how do you feel?', options: [
        { text: 'Overwhelming relief and love', scores: { bonded: 2 } },
        { text: 'Grateful but wary', scores: { bonded: 1, breaking: 1 } },
        { text: 'I recognize this as the cycle repeating', scores: { breaking: 2 } },
        { text: 'I feel nothing — I have become numb to the cycle', scores: { bonded: 1 } },
      ]},
      { text: 'How do you feel when you imagine leaving the relationship permanently?', options: [
        { text: 'Terrified — I cannot imagine life without them', scores: { bonded: 2 } },
        { text: 'Sad but I know it might be necessary', scores: { bonded: 1, breaking: 1 } },
        { text: 'Relieved at the thought', scores: { breaking: 2 } },
        { text: 'I have tried to leave multiple times but keep going back', scores: { bonded: 2 } },
      ]},
      { text: 'Do you find yourself defending your partner to friends and family who express concern?', options: [
        { text: 'Yes — they do not understand the good parts', scores: { bonded: 2 } },
        { text: 'Sometimes, but I am starting to see their point', scores: { bonded: 1, breaking: 1 } },
        { text: 'No — I have stopped defending the behavior', scores: { breaking: 2 } },
        { text: 'I have stopped talking to people about the relationship', scores: { bonded: 2 } },
      ]},
      { text: 'After a fight, who usually initiates reconciliation?', options: [
        { text: 'I do — I cannot stand the silent treatment', scores: { bonded: 2 } },
        { text: 'They do — with grand gestures or promises', scores: { bonded: 1 } },
        { text: 'It varies, but the pattern always repeats', scores: { bonded: 1, breaking: 1 } },
        { text: 'I have started letting the silence sit', scores: { breaking: 2 } },
      ]},
      { text: 'Do you spend significant time trying to figure out what you did wrong?', options: [
        { text: 'Constantly — I replay every conversation', scores: { bonded: 2 } },
        { text: 'Yes, but I am beginning to question whether I am actually the problem', scores: { bonded: 1, breaking: 1 } },
        { text: 'I have realized the problem is not mine to solve', scores: { breaking: 2 } },
        { text: 'I journal about it to track patterns', scores: { breaking: 1 } },
      ]},
    ],
    results: [
      { id: 'bonded', title: 'Signs of an Active Trauma Bond', description: 'Your responses suggest you may be experiencing an active trauma bond. This is a neurochemical attachment created by intermittent reinforcement — cycles of cruelty and kindness that hijack your brain\'s reward system. Understanding this mechanism is the first step toward freedom.' },
      { id: 'breaking', title: 'You Are Beginning to Break Free', description: 'Your responses suggest you are in the process of recognizing and disrupting a trauma bond. This is one of the hardest things a person can do. The awareness you are developing is not just intellectual — it is rewiring your nervous system\'s response patterns.' },
    ],
  },
  'narcissist-type-identifier': {
    title: 'What Type of Narcissist Are You Dealing With?',
    description: 'Identify whether you are dealing with a grandiose, covert, or malignant narcissist.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-narc-type.png',
    questions: [
      { text: 'How does this person typically respond to criticism?', options: [
        { text: 'Explosive rage and counterattack', scores: { grandiose: 2 } },
        { text: 'Quiet withdrawal and passive-aggressive punishment', scores: { covert: 2 } },
        { text: 'Calculated retaliation days or weeks later', scores: { malignant: 2 } },
        { text: 'Playing the victim to gain sympathy from others', scores: { covert: 1, malignant: 1 } },
      ]},
      { text: 'How does this person present themselves publicly?', options: [
        { text: 'Charming, confident, the center of attention', scores: { grandiose: 2 } },
        { text: 'Humble, self-deprecating, always the helper', scores: { covert: 2 } },
        { text: 'Respected and feared — people walk on eggshells', scores: { malignant: 2 } },
        { text: 'Different person in public versus private', scores: { grandiose: 1, covert: 1 } },
      ]},
      { text: 'When you achieve something, how does this person respond?', options: [
        { text: 'Takes credit or one-ups your achievement', scores: { grandiose: 2 } },
        { text: 'Subtly undermines it while appearing supportive', scores: { covert: 2 } },
        { text: 'Punishes you for outshining them', scores: { malignant: 2 } },
        { text: 'Ignores it completely', scores: { covert: 1 } },
      ]},
      { text: 'How does this person handle being caught in a lie?', options: [
        { text: 'Denies it loudly and turns it around on you', scores: { grandiose: 2 } },
        { text: 'Cries and makes you feel guilty for questioning them', scores: { covert: 2 } },
        { text: 'Threatens consequences if you tell anyone', scores: { malignant: 2 } },
        { text: 'Creates an elaborate alternative story', scores: { grandiose: 1, malignant: 1 } },
      ]},
      { text: 'What happens when you try to set a boundary?', options: [
        { text: 'They bulldoze through it as if it does not exist', scores: { grandiose: 2 } },
        { text: 'They guilt-trip you until you abandon it', scores: { covert: 2 } },
        { text: 'They escalate to threats or intimidation', scores: { malignant: 2 } },
        { text: 'They agree verbally but violate it immediately', scores: { covert: 1, grandiose: 1 } },
      ]},
    ],
    results: [
      { id: 'grandiose', title: 'Grandiose Narcissist Pattern', description: 'The pattern you describe is consistent with grandiose narcissism — characterized by overt entitlement, need for admiration, and inability to tolerate any challenge to their self-image. These individuals are often easier to identify but no less damaging.' },
      { id: 'covert', title: 'Covert Narcissist Pattern', description: 'The pattern you describe is consistent with covert narcissism — the most difficult type to identify because it hides behind a mask of humility, victimhood, and apparent sensitivity. The manipulation is subtle, which makes it more disorienting for the target.' },
      { id: 'malignant', title: 'Malignant Narcissist Pattern', description: 'The pattern you describe is consistent with malignant narcissism — a combination of narcissistic traits with antisocial behavior, sadism, and a willingness to cause deliberate harm. If you are in this situation, your safety is the priority.' },
    ],
  },
  'recovery-stage': {
    title: 'What Stage of Recovery Are You In?',
    description: 'Understand where you are in the narcissistic abuse recovery process.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-recovery.png',
    questions: [
      { text: 'How do you currently feel about what happened to you?', options: [
        { text: 'Confused — I am still not sure if it was abuse', scores: { early: 2 } },
        { text: 'Angry — I know what happened and I am furious', scores: { middle: 2 } },
        { text: 'Grieving — I am mourning who I thought they were', scores: { middle: 1, late: 1 } },
        { text: 'Accepting — I understand it and I am building something new', scores: { late: 2 } },
      ]},
      { text: 'How often do you think about the narcissist?', options: [
        { text: 'Constantly — they dominate my thoughts', scores: { early: 2 } },
        { text: 'Daily, but I am starting to have moments of freedom', scores: { middle: 2 } },
        { text: 'Less and less — whole days pass without thinking of them', scores: { late: 2 } },
        { text: 'Only when something triggers a memory', scores: { late: 1 } },
      ]},
      { text: 'How do you feel about yourself right now?', options: [
        { text: 'Broken — I do not recognize who I have become', scores: { early: 2 } },
        { text: 'Rebuilding — I am rediscovering who I am', scores: { middle: 2 } },
        { text: 'Stronger — I understand myself better than before', scores: { late: 2 } },
        { text: 'Numb — I cannot access my feelings', scores: { early: 1 } },
      ]},
      { text: 'What is your relationship with boundaries like?', options: [
        { text: 'I do not know what healthy boundaries look like', scores: { early: 2 } },
        { text: 'I am learning to set them but it feels terrifying', scores: { middle: 2 } },
        { text: 'I set them consistently and can tolerate the discomfort', scores: { late: 2 } },
        { text: 'I over-correct and push everyone away', scores: { middle: 1 } },
      ]},
      { text: 'How do you view the experience now?', options: [
        { text: 'As the worst thing that ever happened to me', scores: { early: 2 } },
        { text: 'As something I survived but am still processing', scores: { middle: 2 } },
        { text: 'As something that broke me open in ways I needed', scores: { late: 2 } },
        { text: 'I swing between all of these depending on the day', scores: { middle: 1, early: 1 } },
      ]},
    ],
    results: [
      { id: 'early', title: 'Early Recovery — The Awakening', description: 'You are in the earliest and often most disorienting stage of recovery. The fog is just beginning to lift, and what you are seeing is painful. This is not weakness — this is the beginning of clarity. Your primary task right now is safety and validation.' },
      { id: 'middle', title: 'Middle Recovery — The Reckoning', description: 'You are in the active processing stage — the anger, the grief, the boundary-building. This is where the real work happens. It is messy and nonlinear, and that is exactly how it is supposed to be.' },
      { id: 'late', title: 'Late Recovery — The Integration', description: 'You have moved through the worst of it and are now integrating the experience into a larger understanding of yourself. This does not mean the pain is gone — it means you have developed a different relationship with it.' },
    ],
  },
  'boundary-strength': {
    title: 'How Strong Are Your Boundaries?',
    description: 'Assess your ability to set and maintain healthy boundaries after narcissistic abuse.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-boundaries.png',
    questions: [
      { text: 'Someone asks you to do something you do not want to do. What happens?', options: [
        { text: 'I say yes automatically and resent it later', scores: { weak: 2 } },
        { text: 'I hesitate but usually give in', scores: { weak: 1, growing: 1 } },
        { text: 'I say no but feel guilty about it', scores: { growing: 2 } },
        { text: 'I decline clearly and without excessive explanation', scores: { strong: 2 } },
      ]},
      { text: 'How do you handle someone who repeatedly crosses a stated boundary?', options: [
        { text: 'I repeat the boundary and hope they listen this time', scores: { weak: 1 } },
        { text: 'I get angry but do not follow through on consequences', scores: { growing: 1 } },
        { text: 'I enforce the consequence I stated', scores: { strong: 2 } },
        { text: 'I distance myself without explanation', scores: { growing: 1, strong: 1 } },
      ]},
      { text: 'When someone expresses disappointment in your boundary, how do you feel?', options: [
        { text: 'Terrible — I immediately want to take it back', scores: { weak: 2 } },
        { text: 'Uncomfortable but I hold firm', scores: { growing: 2 } },
        { text: 'I understand their disappointment is not my responsibility', scores: { strong: 2 } },
        { text: 'I over-explain to make them feel better', scores: { weak: 1, growing: 1 } },
      ]},
      { text: 'Do you know the difference between a boundary and a wall?', options: [
        { text: 'I am not sure — I tend to either let everyone in or shut everyone out', scores: { weak: 2 } },
        { text: 'I am learning the difference', scores: { growing: 2 } },
        { text: 'Yes — boundaries are flexible and walls are rigid', scores: { strong: 2 } },
        { text: 'I think walls are sometimes necessary', scores: { growing: 1 } },
      ]},
      { text: 'How do you feel after setting a boundary with someone important to you?', options: [
        { text: 'Anxious and afraid they will leave', scores: { weak: 2 } },
        { text: 'Proud but shaky', scores: { growing: 2 } },
        { text: 'Calm — it is just part of healthy relating', scores: { strong: 2 } },
        { text: 'I avoid setting boundaries with people I care about', scores: { weak: 2 } },
      ]},
    ],
    results: [
      { id: 'weak', title: 'Boundaries Need Significant Work', description: 'Your boundary system has likely been eroded by narcissistic abuse. This is not a character flaw — it is a predictable consequence of being in a relationship where your limits were systematically violated. Rebuilding starts with small, low-stakes boundaries.' },
      { id: 'growing', title: 'Boundaries Are Developing', description: 'You are in the active process of building a boundary system. The discomfort you feel when setting limits is not a sign that you are doing it wrong — it is a sign that you are doing something your nervous system has not practiced enough yet.' },
      { id: 'strong', title: 'Strong Boundary Foundation', description: 'You have developed a solid boundary system. You understand that boundaries are not about controlling others — they are about defining what you will and will not participate in. This is one of the most important skills in post-abuse recovery.' },
    ],
  },
  'codependency-check': {
    title: 'Is It Love or Codependency?',
    description: 'Explore whether your relationship patterns reflect love or codependent attachment.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-codependency.png',
    questions: [
      { text: 'Do you feel responsible for your partner\'s emotional state?', options: [
        { text: 'Yes — if they are unhappy, I feel like I failed', scores: { codependent: 2 } },
        { text: 'Sometimes — I want to help but I know I cannot fix it', scores: { codependent: 1, healthy: 1 } },
        { text: 'No — I care about their feelings but they are responsible for them', scores: { healthy: 2 } },
        { text: 'I do not know where their emotions end and mine begin', scores: { codependent: 2 } },
      ]},
      { text: 'How much of your identity is tied to your relationship?', options: [
        { text: 'Most of it — I do not know who I am outside the relationship', scores: { codependent: 2 } },
        { text: 'A significant part, but I have other things', scores: { codependent: 1 } },
        { text: 'My relationship is important but not my whole identity', scores: { healthy: 2 } },
        { text: 'I have lost touch with my own interests and friends', scores: { codependent: 2 } },
      ]},
      { text: 'When your partner is upset with you, what do you do?', options: [
        { text: 'Everything possible to fix it immediately', scores: { codependent: 2 } },
        { text: 'Feel anxious but try to give them space', scores: { codependent: 1, healthy: 1 } },
        { text: 'Reflect on whether their upset is reasonable', scores: { healthy: 2 } },
        { text: 'Panic and abandon my own needs to appease them', scores: { codependent: 2 } },
      ]},
      { text: 'Do you sacrifice your own needs to keep the peace?', options: [
        { text: 'Regularly — their needs always come first', scores: { codependent: 2 } },
        { text: 'Sometimes, when the issue seems small', scores: { codependent: 1 } },
        { text: 'Rarely — I have learned that my needs matter equally', scores: { healthy: 2 } },
        { text: 'I do not even know what my needs are anymore', scores: { codependent: 2 } },
      ]},
      { text: 'How do you feel when you are alone?', options: [
        { text: 'Anxious and incomplete', scores: { codependent: 2 } },
        { text: 'Uncomfortable but working on it', scores: { codependent: 1, healthy: 1 } },
        { text: 'Peaceful — I enjoy my own company', scores: { healthy: 2 } },
        { text: 'I avoid being alone at all costs', scores: { codependent: 2 } },
      ]},
    ],
    results: [
      { id: 'codependent', title: 'Codependent Patterns Present', description: 'Your responses suggest significant codependent patterns in your relating style. Codependency is not love — it is a survival strategy developed in response to unpredictable or emotionally unavailable caregiving. Recognizing it is the first step toward developing secure attachment.' },
      { id: 'healthy', title: 'Healthy Attachment Patterns', description: 'Your responses suggest a relatively healthy attachment style with good self-differentiation. You can love deeply without losing yourself in the process. This is the foundation of genuine intimacy.' },
    ],
  },
  'flying-monkey-detector': {
    title: 'Are There Flying Monkeys in Your Life?',
    description: 'Identify people who may be unknowingly serving the narcissist\'s agenda.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-flying-monkeys.png',
    questions: [
      { text: 'After going no-contact, do certain friends or family members suddenly reach out with "concern"?', options: [
        { text: 'Yes — and they always bring up the narcissist', scores: { present: 2 } },
        { text: 'Occasionally, but it seems genuine', scores: { present: 1, minimal: 1 } },
        { text: 'No — my support system respects my boundaries', scores: { minimal: 2 } },
        { text: 'Yes — and they pressure me to reconcile', scores: { present: 2 } },
      ]},
      { text: 'Do people in your life report back to the narcissist about your activities?', options: [
        { text: 'Yes — the narcissist seems to know things I only told certain people', scores: { present: 2 } },
        { text: 'I suspect it but cannot prove it', scores: { present: 1 } },
        { text: 'No — I have been careful about who I trust', scores: { minimal: 2 } },
        { text: 'I have had to cut off mutual friends because of this', scores: { present: 1, minimal: 1 } },
      ]},
      { text: 'Has anyone told you that you are being unfair to the narcissist?', options: [
        { text: 'Multiple people — using the narcissist\'s exact language', scores: { present: 2 } },
        { text: 'One or two people who do not know the full story', scores: { present: 1 } },
        { text: 'No — the people around me understand', scores: { minimal: 2 } },
        { text: 'Yes — and it made me question my decision to leave', scores: { present: 2 } },
      ]},
      { text: 'Do certain people in your life seem to have a suspiciously one-sided view of the situation?', options: [
        { text: 'Yes — they only see the narcissist\'s version', scores: { present: 2 } },
        { text: 'Some do, but I understand they have been manipulated', scores: { present: 1, minimal: 1 } },
        { text: 'No — the people I trust have seen both sides', scores: { minimal: 2 } },
        { text: 'I have stopped trying to explain my side', scores: { present: 1 } },
      ]},
      { text: 'How do you handle people who seem to be acting on the narcissist\'s behalf?', options: [
        { text: 'I engage and try to explain my perspective', scores: { present: 1 } },
        { text: 'I feel hurt and confused by their betrayal', scores: { present: 2 } },
        { text: 'I set clear boundaries about what I will discuss', scores: { minimal: 2 } },
        { text: 'I have removed them from my life', scores: { minimal: 1 } },
      ]},
    ],
    results: [
      { id: 'present', title: 'Flying Monkeys Are Active', description: 'Your responses suggest that people in your life are actively functioning as extensions of the narcissist\'s control system. This is one of the most painful aspects of narcissistic abuse — the weaponization of your own support network. Identifying them is essential to protecting your recovery.' },
      { id: 'minimal', title: 'Minimal Flying Monkey Activity', description: 'Your responses suggest you have either identified and addressed flying monkey dynamics or have a support system that is not compromised. This is a significant protective factor in your recovery.' },
    ],
  },
  'healing-readiness': {
    title: 'Are You Ready to Heal?',
    description: 'Assess your readiness for deep healing work after narcissistic abuse.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-healing.png',
    questions: [
      { text: 'Are you currently in a safe environment, away from the narcissist?', options: [
        { text: 'Yes — I have established physical and emotional distance', scores: { ready: 2 } },
        { text: 'Mostly — I still have some contact due to circumstances', scores: { ready: 1, notyet: 1 } },
        { text: 'No — I am still in the relationship or living situation', scores: { notyet: 2 } },
        { text: 'I go back and forth', scores: { notyet: 2 } },
      ]},
      { text: 'Do you have at least one person who believes your experience?', options: [
        { text: 'Yes — I have support', scores: { ready: 2 } },
        { text: 'I have online support but no one in person', scores: { ready: 1 } },
        { text: 'No — I feel completely alone in this', scores: { notyet: 2 } },
        { text: 'I have a therapist who understands', scores: { ready: 2 } },
      ]},
      { text: 'Can you tolerate uncomfortable emotions without immediately numbing or dissociating?', options: [
        { text: 'Sometimes — I am building this capacity', scores: { ready: 1, notyet: 1 } },
        { text: 'Yes — I can sit with difficult feelings', scores: { ready: 2 } },
        { text: 'No — I shut down or escape when things get intense', scores: { notyet: 2 } },
        { text: 'I am not sure — I have been numb for so long', scores: { notyet: 1 } },
      ]},
      { text: 'Are you willing to look at your own patterns, not just the narcissist\'s behavior?', options: [
        { text: 'Yes — I want to understand why I was vulnerable', scores: { ready: 2 } },
        { text: 'I am open to it but it feels scary', scores: { ready: 1, notyet: 1 } },
        { text: 'Not yet — I need to focus on what they did first', scores: { notyet: 2 } },
        { text: 'I already know my patterns and I am working on them', scores: { ready: 2 } },
      ]},
      { text: 'What is your primary motivation for healing?', options: [
        { text: 'I want to make sure this never happens again', scores: { ready: 2 } },
        { text: 'I want to feel like myself again', scores: { ready: 2 } },
        { text: 'I want the pain to stop', scores: { notyet: 1, ready: 1 } },
        { text: 'I want to prove them wrong', scores: { notyet: 2 } },
      ]},
    ],
    results: [
      { id: 'ready', title: 'You Are Ready for Deep Healing Work', description: 'Your responses suggest you have the safety, support, and willingness needed to engage in deeper healing work. This does not mean it will be easy — it means you have the foundation to do it without retraumatizing yourself.' },
      { id: 'notyet', title: 'Foundation Building Comes First', description: 'Your responses suggest that some foundational elements — safety, support, or emotional regulation capacity — may need strengthening before deep healing work begins. This is not a failure. It is wisdom. Build the container first, then do the work.' },
    ],
  },
  'narcissistic-parent': {
    title: 'Did You Grow Up with a Narcissistic Parent?',
    description: 'Explore whether childhood patterns point to narcissistic parenting.',
    ogImage: 'https://narcissist-cure.b-cdn.net/og/quiz-parent.png',
    questions: [
      { text: 'As a child, did you feel responsible for your parent\'s emotional state?', options: [
        { text: 'Yes — I was their emotional caretaker', scores: { yes: 2 } },
        { text: 'Sometimes — when they were upset, it felt like my fault', scores: { yes: 1, maybe: 1 } },
        { text: 'No — my parents managed their own emotions', scores: { no: 2 } },
        { text: 'I learned to read their moods to stay safe', scores: { yes: 2 } },
      ]},
      { text: 'Were your achievements celebrated or co-opted?', options: [
        { text: 'My parent took credit or made it about them', scores: { yes: 2 } },
        { text: 'They were celebrated but with conditions', scores: { yes: 1, maybe: 1 } },
        { text: 'They were genuinely celebrated', scores: { no: 2 } },
        { text: 'My achievements were ignored or minimized', scores: { yes: 2 } },
      ]},
      { text: 'Did you have a clearly defined role in the family (golden child, scapegoat, invisible child)?', options: [
        { text: 'Yes — and the role shifted depending on my parent\'s needs', scores: { yes: 2 } },
        { text: 'I think so, but I am only now recognizing it', scores: { yes: 1, maybe: 1 } },
        { text: 'No — I was treated as an individual', scores: { no: 2 } },
        { text: 'I was compared constantly to a sibling', scores: { yes: 2 } },
      ]},
      { text: 'How did your parent respond when you expressed needs or emotions?', options: [
        { text: 'Dismissed, mocked, or punished', scores: { yes: 2 } },
        { text: 'Inconsistently — sometimes supportive, sometimes hostile', scores: { yes: 1, maybe: 1 } },
        { text: 'With empathy and appropriate response', scores: { no: 2 } },
        { text: 'By making it about their own feelings', scores: { yes: 2 } },
      ]},
      { text: 'Do you struggle with people-pleasing, perfectionism, or difficulty knowing what you want?', options: [
        { text: 'Yes — all of these', scores: { yes: 2 } },
        { text: 'Some of these — I am working on it', scores: { yes: 1, maybe: 1 } },
        { text: 'Not particularly', scores: { no: 2 } },
        { text: 'I did not realize these were connected to my childhood until recently', scores: { yes: 2 } },
      ]},
    ],
    results: [
      { id: 'yes', title: 'Narcissistic Parenting Patterns Present', description: 'Your responses strongly suggest you grew up with a narcissistic parent. This is not a diagnosis of your parent — it is a recognition of the environment you adapted to. The survival strategies you developed as a child are the same patterns that may be causing problems in your adult relationships.' },
      { id: 'maybe', title: 'Some Narcissistic Parenting Indicators', description: 'Your responses suggest some narcissistic parenting dynamics may have been present in your childhood. Not every difficult parent is narcissistic, but the patterns you describe are worth exploring with a qualified therapist.' },
      { id: 'no', title: 'Minimal Narcissistic Parenting Indicators', description: 'Your responses do not strongly suggest narcissistic parenting patterns. If you are dealing with narcissistic abuse in adult relationships, the roots may lie elsewhere — and that is equally valid territory to explore.' },
    ],
  },
};

export default function QuizPage() {
  const { slug } = useParams<{ slug: string }>();
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const quiz = slug ? QUIZZES[slug] : null;

  if (!quiz) {
    return (
      <div className="container" style={{ padding: '4rem 0' }}>
        <h1>Quiz not found</h1>
        <p>Available quizzes:</p>
        {Object.entries(QUIZZES).map(([key, q]) => (
          <div key={key} style={{ marginBottom: '0.5rem' }}>
            <Link to={`/quiz/${key}`}>{q.title}</Link>
          </div>
        ))}
      </div>
    );
  }

  const handleAnswer = (option: { scores: Record<string, number> }) => {
    const newScores = { ...scores };
    Object.entries(option.scores).forEach(([key, val]) => {
      newScores[key] = (newScores[key] || 0) + val;
    });
    setScores(newScores);

    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setFinished(true);
    }
  };

  const getResult = (): QuizResult | null => {
    if (!finished) return null;
    let maxScore = 0;
    let resultId = '';
    Object.entries(scores).forEach(([key, val]) => {
      if (val > maxScore) {
        maxScore = val;
        resultId = key;
      }
    });
    return quiz.results.find(r => r.id === resultId) || quiz.results[0];
  };

  const result = getResult();
  const progress = finished ? 100 : ((currentQ) / quiz.questions.length) * 100;

  return (
    <>
      <SEOHead
        title={finished && result ? result.title : quiz.title}
        description={finished && result ? result.description.slice(0, 155) : quiz.description}
        canonical={`https://narcissistcure.com/quiz/${slug}`}
        ogImage={quiz.ogImage}
      />
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div className="quiz-container">
          {/* Progress */}
          <div className="quiz-progress">
            <div className="quiz-progress-bar" style={{ width: `${progress}%` }} />
          </div>

          {!finished ? (
            <>
              <h1 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{quiz.title}</h1>
              <p style={{ color: '#999', marginBottom: '2rem', fontSize: '0.85rem' }}>
                Question {currentQ + 1} of {quiz.questions.length}
              </p>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', marginTop: 0 }}>
                {quiz.questions[currentQ].text}
              </h2>
              {quiz.questions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  className="quiz-option"
                  onClick={() => handleAnswer(opt)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleAnswer(opt); }}
                  tabIndex={0}
                >
                  {opt.text}
                </button>
              ))}
            </>
          ) : result ? (
            <>
              <h1 style={{ color: '#4682B4' }}>{result.title}</h1>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                {result.description}
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <h3>Share your result</h3>
                <div className="share-buttons" style={{ borderTop: 'none', paddingTop: 0 }}>
                  <a
                    className="share-btn"
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://narcissistcure.com/quiz/${slug}`)}&text=${encodeURIComponent(`I got "${result.title}" on The Narcissist Antidote quiz`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share result on X"
                  >
                    Share on X
                  </a>
                  <a
                    className="share-btn"
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://narcissistcure.com/quiz/${slug}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share result on Facebook"
                  >
                    Share on Facebook
                  </a>
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'rgba(70,130,180,0.05)', borderRadius: '8px', marginBottom: '2rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Get more insights delivered to you</p>
                <NewsletterForm source={`quiz-${slug}`} />
              </div>

              <div>
                <Link to="/articles" className="btn btn-primary">Explore Articles</Link>
                {' '}
                <button
                  className="btn btn-accent"
                  onClick={() => { setCurrentQ(0); setScores({}); setFinished(false); }}
                >
                  Retake Quiz
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
