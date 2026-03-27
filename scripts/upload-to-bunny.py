#!/usr/bin/env python3
"""
Upload generated images to Bunny CDN.
Usage: python3 upload-to-bunny.py <local_dir> <bunny_prefix> [format]
  local_dir: directory with images
  bunny_prefix: e.g. 'images/heroes' or 'images/og'
  format: 'webp' (default) or 'png'
"""
import os, sys, io, requests
from PIL import Image

BUNNY_STORAGE_ZONE = 'narcissist-cure'
BUNNY_STORAGE_HOST = 'ny.storage.bunnycdn.com'
BUNNY_STORAGE_PASSWORD = '4e5b4df1-0478-41bd-875da770a1e7-2d36-4c4b'

def upload_to_bunny(path, data, content_type='application/octet-stream'):
    url = f'https://{BUNNY_STORAGE_HOST}/{BUNNY_STORAGE_ZONE}/{path}'
    resp = requests.put(url, data=data, headers={
        'AccessKey': BUNNY_STORAGE_PASSWORD,
        'Content-Type': content_type,
    })
    return resp.status_code in (200, 201)

def main():
    local_dir = sys.argv[1]
    bunny_prefix = sys.argv[2]
    fmt = sys.argv[3] if len(sys.argv) > 3 else 'webp'
    
    files = sorted(os.listdir(local_dir))
    total = len(files)
    success = 0
    failed = []
    
    for i, f in enumerate(files):
        filepath = os.path.join(local_dir, f)
        if not os.path.isfile(filepath):
            continue
        
        slug = os.path.splitext(f)[0]
        
        try:
            img = Image.open(filepath)
            buf = io.BytesIO()
            
            if fmt == 'webp':
                img.save(buf, format='WEBP', quality=82)
                ext = 'webp'
                ct = 'image/webp'
            else:
                img.save(buf, format='PNG')
                ext = 'png'
                ct = 'image/png'
            
            bunny_path = f'{bunny_prefix}/{slug}.{ext}'
            data = buf.getvalue()
            
            if upload_to_bunny(bunny_path, data, ct):
                success += 1
                if (i+1) % 10 == 0:
                    print(f'[{i+1}/{total}] Uploaded {success} so far', flush=True)
            else:
                failed.append(slug)
                print(f'  FAILED upload: {slug}', flush=True)
        except Exception as e:
            failed.append(slug)
            print(f'  ERROR {slug}: {e}', flush=True)
    
    print(f'\nDone: {success}/{total} uploaded, {len(failed)} failed', flush=True)
    if failed:
        print(f'Failed: {", ".join(failed[:20])}', flush=True)

if __name__ == '__main__':
    main()
