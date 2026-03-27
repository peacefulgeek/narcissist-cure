#!/usr/bin/env python3
"""
Download hero images from URLs and upload to Bunny CDN as WebP.
Also handles OG images.
Usage: python3 download-and-upload.py <mapping_file> <bunny_prefix> <format>
  mapping_file: JSON with slug -> URL mapping
  bunny_prefix: e.g. 'images/heroes' or 'images/og'
  format: 'webp' or 'png'
"""
import json, os, sys, io, time, requests
from PIL import Image
from concurrent.futures import ThreadPoolExecutor, as_completed

BUNNY_STORAGE_ZONE = 'narcissist-cure'
BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com'
BUNNY_STORAGE_PASSWORD = '4e5b4df1-0478-41bd-875da770a1e7-2d36-4c4b'

def upload_to_bunny(path, data, content_type='application/octet-stream'):
    url = f'https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{path}'
    for attempt in range(3):
        try:
            resp = requests.put(url, data=data, headers={
                'AccessKey': BUNNY_STORAGE_PASSWORD,
                'Content-Type': content_type,
            }, timeout=30)
            if resp.status_code in (200, 201):
                return True
            print(f"  Upload failed ({resp.status_code}): {resp.text[:100]}", flush=True)
        except Exception as e:
            print(f"  Upload error: {e}", flush=True)
        time.sleep(1)
    return False

def process_image(slug, url, bunny_prefix, fmt):
    try:
        # Download
        resp = requests.get(url, timeout=60)
        if resp.status_code != 200:
            return slug, False, f"Download failed: {resp.status_code}"
        
        # Convert
        img = Image.open(io.BytesIO(resp.content))
        buf = io.BytesIO()
        
        if fmt == 'webp':
            img.save(buf, format='WEBP', quality=82)
            ext = 'webp'
            ct = 'image/webp'
        else:
            img.save(buf, format='PNG', optimize=True)
            ext = 'png'
            ct = 'image/png'
        
        bunny_path = f'{bunny_prefix}/{slug}.{ext}'
        data = buf.getvalue()
        
        if upload_to_bunny(bunny_path, data, ct):
            return slug, True, bunny_path
        return slug, False, "Upload failed"
        
    except Exception as e:
        return slug, False, str(e)

def main():
    mapping_file = sys.argv[1]
    bunny_prefix = sys.argv[2]
    fmt = sys.argv[3] if len(sys.argv) > 3 else 'webp'
    
    mapping = json.load(open(mapping_file))
    total = len(mapping)
    
    success = 0
    failed = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {}
        for slug, url in mapping.items():
            f = executor.submit(process_image, slug, url, bunny_prefix, fmt)
            futures[f] = slug
        
        for i, f in enumerate(as_completed(futures)):
            slug, ok, msg = f.result()
            if ok:
                success += 1
            else:
                failed.append(slug)
            
            if (i + 1) % 20 == 0:
                print(f'[{i+1}/{total}] {success} uploaded, {len(failed)} failed', flush=True)
    
    print(f'\nDone: {success}/{total} uploaded, {len(failed)} failed', flush=True)
    if failed:
        print(f'Failed slugs: {json.dumps(failed[:30])}', flush=True)
    
    # Save results
    with open(f'{mapping_file}.results.json', 'w') as f:
        json.dump({'success': success, 'failed': failed, 'total': total}, f)

if __name__ == '__main__':
    main()
