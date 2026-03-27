#!/usr/bin/env python3
"""Clean forbidden phrases from all articles."""
import json, re

articles = json.load(open('/home/ubuntu/narcissist-cure/content/articles-index.json'))

# Forbidden phrase replacements
REPLACEMENTS = {
    'lean into': 'move toward',
    'leaning into': 'moving toward',
    'leaned into': 'moved toward',
    'showing up for': 'being present with',
    'show up for': 'be present with',
    'shows up for': 'is present with',
    'authentic self': 'true nature',
    'your authentic': 'your genuine',
    'safe space': 'place of refuge',
    'a safe space': 'a place of refuge',
    'hold space': 'remain present',
    'holding space': 'remaining present',
    'held space': 'remained present',
    'sacred container': 'contemplative framework',
    'raise your vibration': 'deepen your awareness',
    'raising your vibration': 'deepening your awareness',
    'raise vibration': 'deepen awareness',
    'manifestation': 'emergence',
    'manifest ': 'emerge ',
    'manifesting': 'cultivating',
    'manifested': 'emerged',
    'to manifest': 'to cultivate',
    'can manifest': 'can emerge',
    'will manifest': 'will emerge',
    'may manifest': 'may emerge',
    'might manifest': 'might emerge',
    'often manifest': 'often emerge',
    'that manifest': 'that emerge',
    'which manifest': 'which emerge',
    'symptoms manifest': 'symptoms emerge',
    'patterns manifest': 'patterns emerge',
    'behaviors manifest': 'behaviors emerge',
    'traits manifest': 'traits emerge',
    'tendencies manifest': 'tendencies emerge',
    'manifest as': 'appear as',
    'manifest in': 'appear in',
    'manifest through': 'appear through',
    'manifest themselves': 'express themselves',
}

total_fixes = 0
for a in articles:
    body = a['bodyHtml']
    fixes = 0
    for old, new in REPLACEMENTS.items():
        # Case-insensitive replacement
        pattern = re.compile(re.escape(old), re.IGNORECASE)
        matches = len(pattern.findall(body))
        if matches > 0:
            def replace_match(m):
                original = m.group()
                if original[0].isupper():
                    return new[0].upper() + new[1:]
                return new
            body = pattern.sub(replace_match, body)
            fixes += matches
    
    if fixes > 0:
        a['bodyHtml'] = body
        total_fixes += fixes

# Save cleaned version
with open('/home/ubuntu/narcissist-cure/content/articles-index.json', 'w') as f:
    json.dump(articles, f, indent=2)

print(f'Total fixes applied: {total_fixes}')

# Verify
violations = {}
forbidden = ['lean into', 'showing up for', 'authentic self', 'safe space', 'hold space', 'sacred container', 'raise your vibration']
for phrase in forbidden:
    count = sum(1 for a in articles if phrase.lower() in a['bodyHtml'].lower())
    if count > 0:
        violations[phrase] = count

# Check manifest more carefully - only flag if not part of a legitimate word
manifest_count = 0
for a in articles:
    # Find standalone "manifest" not part of "manifestation" etc
    matches = re.findall(r'\bmanifest(?:s|ed|ing|ation)?\b', a['bodyHtml'].lower())
    manifest_count += len(matches)

print(f'Remaining forbidden phrases: {violations}')
print(f'Remaining manifest variants: {manifest_count}')
