#!/usr/bin/env python3
"""
Generate hero images and OG images for all 300 articles.
Uses OpenAI-compatible API for image generation.
Uploads to Bunny CDN as WebP (heroes) and PNG (OG).
Usage: python3 gen-images.py <start> <end> <type>
  type: hero or og
"""
import json, os, sys, time, re, io
from openai import OpenAI
import requests

client = OpenAI()

BUNNY_STORAGE_ZONE = 'narcissist-cure'
BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com'
BUNNY_STORAGE_PASSWORD = '4e5b4df1-0478-41bd-875da770a1e7-2d36-4c4b'
BUNNY_CDN_BASE = 'https://narcissist-cure.b-cdn.net'

def upload_to_bunny(path, data, content_type='application/octet-stream'):
    """Upload file to Bunny CDN storage."""
    url = f'https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{path}'
    resp = requests.put(url, data=data, headers={
        'AccessKey': BUNNY_STORAGE_PASSWORD,
        'Content-Type': content_type,
    })
    if resp.status_code in (200, 201):
        return True
    print(f"  Upload failed ({resp.status_code}): {resp.text[:200]}", flush=True)
    return False

def generate_image(prompt, size="1792x1024"):
    """Generate image using OpenAI API."""
    try:
        response = client.images.generate(
            model="gpt-4.1-mini",
            prompt=prompt,
            n=1,
            size=size,
        )
        image_url = response.data[0].url
        # Download the image
        img_resp = requests.get(image_url, timeout=30)
        if img_resp.status_code == 200:
            return img_resp.content
        return None
    except Exception as e:
        print(f"  Image gen error: {e}", flush=True)
        return None

def create_hero_image_prompt(article):
    """Create a specific hero image prompt from article data."""
    title = article['title']
    hero_prompt = article.get('heroPrompt', '')
    
    # Build a specific, article-related prompt
    prompt = f"""Create a luminous, warm, healing-themed illustration that directly represents the concept of "{title}". 

{hero_prompt}

Style: Soft watercolor-like digital art with warm golden and copper tones. Ethereal, peaceful atmosphere. Abstract but evocative. No text, no words, no letters on the image. No dark or distressing imagery. No generic landscapes — the image must clearly relate to the specific topic of {title}."""
    
    return prompt

def create_og_image_prompt(article):
    """Create OG image prompt."""
    title = article['title']
    og_prompt = article.get('ogPrompt', '')
    
    prompt = f"""Create a clean, professional social media card illustration for an article titled "{title}". 

{og_prompt}

Style: Modern, clean design with warm copper (#B87333) and steel blue (#4682B4) accent colors on a cream/ivory background. Abstract symbolic representation of the topic. No text, no words, no letters. Composed for 1200x630 social sharing format. Luminous and inviting."""
    
    return prompt

def main():
    start = int(sys.argv[1])
    end = int(sys.argv[2])
    img_type = sys.argv[3]  # 'hero' or 'og'
    
    # Load articles with prompts
    articles = json.load(open('/home/ubuntu/narcissist-cure/content/articles-full.json'))
    
    for idx in range(start, min(end, len(articles))):
        article = articles[idx]
        slug = article['slug']
        
        if img_type == 'hero':
            prompt = create_hero_image_prompt(article)
            bunny_path = f'images/heroes/{slug}.webp'
            size = "1792x1024"
        else:
            prompt = create_og_image_prompt(article)
            bunny_path = f'images/og/{slug}.png'
            size = "1792x1024"
        
        print(f"[{idx+1}/300] {img_type}: {slug}...", flush=True)
        
        for attempt in range(2):
            img_data = generate_image(prompt, size)
            if img_data:
                # Convert to WebP for heroes using PIL
                if img_type == 'hero':
                    try:
                        from PIL import Image
                        img = Image.open(io.BytesIO(img_data))
                        webp_buffer = io.BytesIO()
                        img.save(webp_buffer, format='WEBP', quality=82)
                        img_data = webp_buffer.getvalue()
                    except Exception as e:
                        print(f"  WebP conversion error: {e}", flush=True)
                
                if upload_to_bunny(bunny_path, img_data):
                    print(f"  Uploaded: {bunny_path}", flush=True)
                    break
                else:
                    print(f"  Upload failed, retry {attempt+1}", flush=True)
            else:
                print(f"  Generation failed, retry {attempt+1}", flush=True)
                time.sleep(2)
        else:
            print(f"  FAILED: {slug}", flush=True)
    
    print(f"Batch {start}-{end} {img_type} complete.", flush=True)

if __name__ == "__main__":
    main()
