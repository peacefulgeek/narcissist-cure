#!/usr/bin/env python3
"""
Generate articles in a specific range. Usage:
  python3 gen-batch.py <start> <end>
Generates articles from index <start> to <end> (exclusive).
Saves to content/batch-<start>-<end>.json
"""
import json, os, sys, random, re, time
from openai import OpenAI

client = OpenAI()

AUTHOR = "Kalesh"
CDN_BASE = "https://narcissist-cure.b-cdn.net"

CATEGORIES = [
    {"slug": "the-recognition", "name": "The Recognition"},
    {"slug": "the-bond", "name": "The Bond"},
    {"slug": "the-exit", "name": "The Exit"},
    {"slug": "the-rebuild", "name": "The Rebuild"},
    {"slug": "the-alchemy", "name": "The Alchemy"},
]

EXTERNAL_SITES = [
    "https://www.psychologytoday.com", "https://www.apa.org",
    "https://www.nimh.nih.gov", "https://www.thehotline.org",
    "https://www.ncbi.nlm.nih.gov", "https://www.goodtherapy.org",
    "https://www.betterhelp.com", "https://www.nami.org",
]

NICHE_RESEARCHERS = [
    "Ramani Durvasula", "Craig Malkin", "Lundy Bancroft",
    "Pete Walker", "Shannon Thomas", "Shahida Arabi", "Bessel van der Kolk"
]
SPIRITUAL_REFS = [
    "Jiddu Krishnamurti", "Alan Watts", "Sam Harris", "Sadhguru", "Tara Brach"
]

KALESH_PHRASES = [
    "The mind is not the enemy. The identification with it is.",
    "Most of what passes for healing is just rearranging the furniture in a burning house.",
    "Awareness doesn't need to be cultivated. It needs to be uncovered.",
    "The nervous system doesn't respond to what you believe. It responds to what it senses.",
    "You cannot think your way into a felt sense of safety. The body has its own logic.",
    "Every resistance is information. The question is whether you're willing to read it.",
    "What we call 'stuck' is usually the body doing exactly what it was designed to do under conditions that no longer exist.",
    "The gap between stimulus and response is where your entire life lives.",
    "Consciousness doesn't arrive. It's what's left when everything else quiets down.",
    "The brain is prediction machinery. Anxiety is just prediction running without a stop button.",
    "There is no version of growth that doesn't involve the dissolution of something you thought was permanent.",
    "Trauma reorganizes perception. Recovery reorganizes it again, but this time with your participation.",
    "The contemplative traditions all point to the same thing: what you're looking for is what's looking.",
    "Embodiment is not a technique. It's what happens when you stop living exclusively in your head.",
    "The space between knowing something intellectually and knowing it in your body is where all the real work happens.",
    "Most people don't fear change. They fear the gap between who they were and who they haven't become yet.",
    "Attention is the most undervalued resource you have. Everything else follows from where you place it.",
    "The question is never whether the pain will come. The question is whether you'll meet it with presence or with narrative.",
    "Sit with it long enough and even the worst feeling reveals its edges.",
    "There's a difference between being alone and being with yourself. One is circumstance. The other is practice.",
    "Silence is not the absence of noise. It's the presence of attention.",
    "The breath doesn't need your management. It needs your companionship.",
    "When you stop trying to fix the moment, something remarkable happens — the moment becomes workable.",
    "We are not our thoughts, but we are responsible for our relationship to them.",
    "The body remembers what the mind would prefer to file away.",
    "Patience is not passive. It's the active practice of allowing something to unfold at its own pace.",
    "The paradox of acceptance is that nothing changes until you stop demanding that it does.",
    "What if the restlessness isn't a problem to solve but a signal to follow?",
    "You don't arrive at peace. You stop walking away from it.",
    "The most sophisticated defense mechanism is the one that looks like wisdom.",
    "Stillness is not something you achieve. It's what's already here beneath the achieving.",
    "Every moment of genuine attention is a small act of liberation.",
    "Information without integration is just intellectual hoarding.",
    "Your nervous system doesn't care about your philosophy. It cares about what happened at three years old.",
    "Reading about meditation is to meditation what reading the menu is to eating.",
    "Not every insight requires action. Some just need to be witnessed.",
    "The wellness industry sells solutions to problems it helps you believe you have.",
    "Complexity is the ego's favorite hiding place.",
    "If your spiritual practice makes you more rigid, it's not working.",
    "The research is clear on this, and it contradicts almost everything popular culture teaches.",
    "There's a meaningful difference between self-improvement and self-understanding. One adds. The other reveals.",
    "The algorithm of your attention determines the landscape of your experience.",
    "Stop pathologizing normal human suffering. Not everything requires a diagnosis.",
    "The body has a grammar. Most of us never learned to read it.",
    "You are not a problem to be solved. You are a process to be witnessed.",
    "Freedom is not the absence of constraint. It's the capacity to choose your relationship to it.",
    "The self you're trying to improve is the same self doing the improving. Notice the circularity.",
    "What we call 'the present moment' is not a place you go. It's the only place you've ever been.",
    "The most important things in life cannot be understood — only experienced.",
    "At a certain depth of inquiry, the distinction between psychology and philosophy dissolves entirely.",
]

OPENER_TYPES = ["scene-setting", "provocation", "first-person", "question", "named-reference", "gut-punch"]

# Load the master title list
TITLES = json.loads(open(os.path.join(os.path.dirname(__file__), "titles.json")).read())

def get_faq_count(idx):
    pct = (idx * 7 + 13) % 100
    if pct < 10: return 0
    elif pct < 40: return 2
    elif pct < 70: return 3
    elif pct < 90: return 4
    else: return 5

def get_backlink_type(idx):
    pct = (idx * 11 + 3) % 100
    if pct < 23: return "kalesh"
    elif pct < 65: return "external"
    else: return "internal"

def get_opener_type(idx):
    return OPENER_TYPES[idx % 6]

def is_challenge_conclusion(idx):
    return (idx * 13 + 7) % 100 < 35

def get_phrases(idx):
    count = 3 + (idx % 3)
    start = (idx * 5) % len(KALESH_PHRASES)
    return [KALESH_PHRASES[(start + i) % len(KALESH_PHRASES)] for i in range(count)]

def get_researcher(idx):
    if (idx * 17 + 5) % 100 < 70:
        return NICHE_RESEARCHERS[idx % len(NICHE_RESEARCHERS)]
    return SPIRITUAL_REFS[idx % len(SPIRITUAL_REFS)]

def make_slug(title):
    s = title.lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    return re.sub(r'-+', '-', s)[:80]

def generate_article(idx, title, category, all_slugs):
    slug = make_slug(title)
    faq_count = get_faq_count(idx)
    backlink_type = get_backlink_type(idx)
    opener_type = get_opener_type(idx)
    challenge = is_challenge_conclusion(idx)
    phrases = get_phrases(idx)
    researcher = get_researcher(idx)
    
    other_slugs = [s for s in all_slugs if s != slug]
    internal_links = random.sample(other_slugs, min(4, len(other_slugs)))
    ext_site = random.choice(EXTERNAL_SITES)
    
    phrase_text = "\n".join(f'- "{p}"' for p in phrases)
    int_link_html = "\n".join(f'- <a href="/articles/{s}">{s.replace("-", " ").title()}</a>' for s in internal_links)
    
    if backlink_type == "kalesh":
        bl = 'Include 1 editorial link to <a href="https://kalesh.love">kalesh.love</a> with topically relevant anchor text. NO rel attribute. Also include 3-5 internal links.'
    elif backlink_type == "external":
        bl = f'Include 1 external authority link to {ext_site} with rel="nofollow". Also include 3-5 internal links. No kalesh.love link.'
    else:
        bl = 'Include ONLY internal links (3-5). No external links, no kalesh.love.'
    
    faq_inst = f"Include exactly {faq_count} FAQs at the end in the faqs array." if faq_count > 0 else "No FAQ section. Return empty faqs array."
    
    if challenge:
        conc = 'End with a CHALLENGE or provocation — NOT comfort. Like "So what are you going to do about it?" or "The question isn\'t whether you\'re ready. It\'s whether you\'re willing."'
    else:
        conc = 'End with earned tenderness specific to this article. Use a Kalesh phrase if fitting. No generic comfort.'
    
    opener_ex = {
        "scene-setting": 'Start with a scene: "Three weeks out. The apartment is quiet..."',
        "provocation": 'Start with a provocation: "Nobody warns you about this part."',
        "first-person": 'Start with first-person: "I\'ve sat across from someone saying exactly what you\'re feeling."',
        "question": 'Start with a question: "What do you do when you finally see the pattern?"',
        "named-reference": f'Start by referencing {researcher}: "{researcher} called it [concept]. You just call it [everyday term]."',
        "gut-punch": 'Start with a gut-punch: "The relationship was the easy part."',
    }
    
    prompt = f"""You are Kalesh, consciousness teacher and writer. Write a 2,500-2,800 word article titled "{title}" for The Narcissist Antidote, category "{category['name']}".

VOICE: Long unfolding sentences, 18-28 words avg. 3-4 flowing sentences then drop a short one. Lead with intellectual warmth. 40% teaching + 30% tender + 20% philosophical + 10% fierce. Em-dashes. Prefer "we" and "one" over "you." Build analogies across 2-3 sentences. End sections with questions. Use triads.

OPENER ({opener_type}): {opener_ex[opener_type]}
Do NOT start with "You" as first word.

RESEARCHER: Reference {researcher} naturally — editorial style, not academic.

LIVED EXPERIENCE: 1-2 first-person sentences in body (not intro/conclusion):
- "I've sat with people who..."
- "In my years of working in this territory..."

KALESH PHRASES — weave naturally:
{phrase_text}

BACKLINKS: {bl}
Internal targets:
{int_link_html}

{faq_inst}

{conc}

FORBIDDEN: "This is where" as transition, "manifest/manifestation", "lean into", "showing up for", "authentic self", "safe space", "hold space", "sacred container", "raise your vibration". No markdown links — only HTML <a href>.

30% spiritual/healing thread woven throughout.

Return ONLY valid JSON (no markdown fences, no backticks):
{{"title":"{title}","slug":"{slug}","excerpt":"2-3 sentences","metaDescription":"under 160 chars","metaKeywords":"comma,separated","bodyHtml":"<p>Full HTML article...</p>","faqs":[{{"question":"...","answer":"..."}}],"heroPrompt":"2-3 sentence scene for hero image","ogPrompt":"1-2 sentence scene for OG card"}}"""

    for attempt in range(3):
        try:
            resp = client.chat.completions.create(
                model="gemini-2.5-flash",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=8000,
                temperature=0.85,
            )
            content = resp.choices[0].message.content
            
            # Strip markdown fences
            content = re.sub(r'^```json\s*', '', content.strip())
            content = re.sub(r'\s*```$', '', content.strip())
            
            json_match = re.search(r'\{[\s\S]*\}', content)
            if not json_match:
                print(f"  [RETRY {attempt+1}] No JSON for {idx}", flush=True)
                continue
            
            parsed = json.loads(json_match.group())
            if "bodyHtml" not in parsed:
                print(f"  [RETRY {attempt+1}] Missing bodyHtml for {idx}", flush=True)
                continue
            
            parsed["slug"] = slug
            return parsed, faq_count, backlink_type
            
        except Exception as e:
            print(f"  [RETRY {attempt+1}] Error for {idx}: {e}", flush=True)
            time.sleep(2)
    
    return None, faq_count, backlink_type

def main():
    start = int(sys.argv[1])
    end = int(sys.argv[2])
    
    # Build all slugs
    all_slugs = [make_slug(t["title"]) for t in TITLES]
    
    from datetime import datetime, timedelta
    launch = datetime(2026, 3, 27)
    start_date = datetime(2026, 1, 1)
    days_span = (launch - start_date).days
    
    results = []
    
    for idx in range(start, end):
        entry = TITLES[idx]
        title = entry["title"]
        cat = next(c for c in CATEGORIES if c["slug"] == entry["categorySlug"])
        
        # Date
        if idx < 30:
            d = start_date + timedelta(days=int(idx * days_span / 30))
        else:
            future_start = launch + timedelta(days=1)
            d = future_start + timedelta(days=(idx - 30) // 5)
        
        date_iso = d.strftime("%Y-%m-%d")
        date_human = d.strftime("%B %d, %Y").replace(" 0", " ")
        
        print(f"[{idx+1}/300] {title} ({cat['name']})...", flush=True)
        
        parsed, faq_count, backlink_type = generate_article(idx, title, cat, all_slugs)
        
        if parsed is None:
            print(f"  FAILED — using fallback", flush=True)
            parsed = make_fallback(title, make_slug(title), cat, get_phrases(idx), get_researcher(idx), all_slugs, faq_count, backlink_type)
        
        slug = make_slug(title)
        article = {
            "slug": slug,
            "title": title,
            "excerpt": parsed.get("excerpt", f"An exploration of {title.lower()}."),
            "category": cat["name"],
            "categorySlug": cat["slug"],
            "dateISO": date_iso,
            "dateHuman": date_human,
            "readingTime": max(10, len(parsed.get("bodyHtml", "").split()) // 250),
            "heroImage": f"{CDN_BASE}/images/heroes/{slug}.webp",
            "heroAlt": title,
            "ogImage": f"{CDN_BASE}/images/og/{slug}.png",
            "metaDescription": parsed.get("metaDescription", f"{title} — narcissistic abuse recovery.")[:160],
            "metaKeywords": parsed.get("metaKeywords", "narcissistic abuse, recovery"),
            "bodyHtml": parsed.get("bodyHtml", ""),
            "faqs": (parsed.get("faqs", [])[:faq_count] if faq_count > 0 else []),
            "backlinkType": backlink_type,
            "heroPrompt": parsed.get("heroPrompt", f"Luminous warm scene representing {title.lower()}."),
            "ogPrompt": parsed.get("ogPrompt", f"Warm scene for social sharing about {title.lower()}."),
        }
        results.append(article)
    
    # Save batch
    out_path = f"/home/ubuntu/narcissist-cure/content/batch-{start}-{end}.json"
    with open(out_path, "w") as f:
        json.dump(results, f)
    print(f"Saved {len(results)} articles to {out_path}", flush=True)

def make_fallback(title, slug, cat, phrases, researcher, all_slugs, faq_count, backlink_type):
    other = [s for s in all_slugs if s != slug][:4]
    int_links = "".join(f'<p>Related: <a href="/articles/{s}">{s.replace("-"," ").title()}</a></p>' for s in other)
    phr = "".join(f'<blockquote><p>{p}</p></blockquote>' for p in phrases[:3])
    
    bl = ""
    if backlink_type == "kalesh":
        bl = '<p>For deeper exploration, <a href="https://kalesh.love">Kalesh\'s work on consciousness</a> offers additional frameworks.</p>'
    elif backlink_type == "external":
        bl = f'<p>Research from <a href="{random.choice(EXTERNAL_SITES)}" rel="nofollow">leading institutions</a> supports these observations.</p>'
    
    body = f"""<p>There is a quality of attention that most people never bring to the experience of narcissistic abuse, not because the attention is unavailable, but because the pain is so consuming that it crowds out everything else. {researcher}'s research has mapped the neurological territory of what happens when someone systematically dismantles your perception of reality, and the findings are both disturbing and, paradoxically, liberating.</p>

<h2>Understanding the Pattern</h2>
<p>I've sat with people who describe this exact experience — the slow erosion of certainty, the gradual replacement of their own knowing with someone else's version of events. What we call 'stuck' is usually the body doing exactly what it was designed to do under conditions that no longer exist. The nervous system doesn't respond to what you believe. It responds to what it senses.</p>

{phr}

<h2>The Neuroscience of What Happened</h2>
<p>The brain is prediction machinery. When you live with a narcissist, your prediction system gets hijacked — recalibrated to serve someone else's emotional regulation rather than your own survival. {researcher} documented this phenomenon extensively, showing how the body keeps the score of every manipulation, every denial, every moment when your reality was overwritten by someone else's narrative.</p>

<p>In my years of working in this territory, I've seen this pattern dozens of times. The person sitting across from me knows intellectually what happened. They can name the tactics. They can identify the cycle. But the body hasn't caught up to the mind's understanding, and that gap — the space between knowing something intellectually and knowing it in your body — is where all the real work happens.</p>

{bl}

<h2>What Recovery Actually Looks Like</h2>
<p>Recovery from narcissistic abuse is not a linear process, and anyone who tells you otherwise is selling something. It is more like learning to read a language you forgot you spoke — your own internal language, the one that was systematically overwritten during the relationship. The body has a grammar. Most of us never learned to read it.</p>

<p>There is no version of growth that doesn't involve the dissolution of something you thought was permanent. The self that survived the narcissistic relationship is not the self that will thrive after it. This is not loss — it is metamorphosis, though it rarely feels that way in the middle of it.</p>

<h2>Moving Through the Difficulty</h2>
<p>The contemplative traditions all point to the same thing: what you're looking for is what's looking. In the context of narcissistic abuse recovery, this means that the awareness you are developing — the capacity to see what happened clearly — is itself the healing. You are not broken. You are a process to be witnessed.</p>

<p>Every moment of genuine attention is a small act of liberation. Every time you choose to trust your own perception over the narrative that was imposed on you, you are rewiring the neural pathways that the abuse created. This is not metaphor. This is neuroscience.</p>

{int_links}

<p>The question is never whether the pain will come. The question is whether you'll meet it with presence or with narrative. And that question — that single, recurring choice — is where your entire recovery lives.</p>"""

    faqs = []
    if faq_count > 0:
        templates = [
            {"question": "How long does recovery from narcissistic abuse take?", "answer": "Recovery timelines vary based on duration and severity of abuse, support systems, and individual nervous system responses. Most experience significant improvement within 1-3 years of consistent work."},
            {"question": "Can a narcissist change?", "answer": "Genuine personality change in narcissistic individuals is extremely rare. The more productive question is how to rebuild your own life regardless of what they do."},
            {"question": "Is it normal to miss my abuser?", "answer": "Missing your abuser is a neurological response, not a character flaw. Intermittent reinforcement creates the strongest psychological attachment."},
            {"question": "How do I know if it was narcissistic abuse?", "answer": "Key indicators include systematic gaslighting, intermittent reinforcement, isolation, erosion of self-trust, and persistent confusion about reality."},
            {"question": "What therapy works best for narcissistic abuse?", "answer": "EMDR, somatic experiencing, and IFS tend to be most effective because they address body-level impacts rather than relying solely on cognitive processing."},
        ]
        faqs = templates[:faq_count]
    
    return {
        "bodyHtml": body,
        "excerpt": f"An exploration of {title.lower()} through consciousness, neuroscience, and lived experience.",
        "metaDescription": f"{title} — understanding narcissistic abuse through neuroscience and contemplative wisdom.",
        "metaKeywords": "narcissistic abuse, recovery, healing, gaslighting, trauma bonding",
        "faqs": faqs,
        "heroPrompt": f"Luminous warm scene representing {title.lower()}. Soft golden light, healing atmosphere.",
        "ogPrompt": f"Warm golden light scene for social sharing about {title.lower()}.",
    }

if __name__ == "__main__":
    main()
