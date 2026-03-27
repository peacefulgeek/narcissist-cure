#!/usr/bin/env python3
"""Prepare image task files for parallel generation."""
import json, os

prompts = json.load(open('/home/ubuntu/narcissist-cure/content/image-prompts.json'))

os.makedirs('/home/ubuntu/narcissist-cure/content/img-tasks', exist_ok=True)

for p in prompts:
    slug = p['slug']
    title = p['title']
    hero_prompt = p.get('heroPrompt', '')
    og_prompt = p.get('ogPrompt', '')
    
    # Create detailed hero prompt
    hero_full = f"""Create a luminous, warm, healing-themed illustration that directly represents the concept of "{title}". {hero_prompt} Style: Soft watercolor-like digital art with warm golden and copper tones. Ethereal, peaceful atmosphere. Abstract but evocative. No text, no words, no letters on the image. No dark or distressing imagery. The image must clearly relate to the specific topic of {title}. No generic scenery or landscapes."""
    
    # Create detailed OG prompt  
    og_full = f"""Create a clean, professional social media card illustration for an article titled "{title}". {og_prompt} Style: Modern, clean design with warm copper and steel blue accent colors on a cream/ivory background. Abstract symbolic representation of the topic. No text, no words, no letters. Luminous and inviting. The image must clearly relate to the specific topic of {title}."""
    
    task = {
        'idx': p['idx'],
        'slug': slug,
        'title': title,
        'heroPrompt': hero_full,
        'ogPrompt': og_full,
    }
    
    with open(f'/home/ubuntu/narcissist-cure/content/img-tasks/{p["idx"]:03d}-{slug[:40]}.json', 'w') as f:
        json.dump(task, f)

print(f"Prepared {len(prompts)} image task files")
