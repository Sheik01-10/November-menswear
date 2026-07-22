import os
from PIL import Image

def generate_favicons():
    logo_path = 'public/logo.png'
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found.")
        return

    # Load logo
    img = Image.open(logo_path)
    print(f"Loaded logo.png: size={img.size}, format={img.format}, mode={img.mode}")

    # Ensure it is in RGBA mode to preserve transparency
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Center crop to a perfect square
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    right = left + min_dim
    bottom = top + min_dim
    
    square_img = img.crop((left, top, right, bottom))
    print(f"Cropped to perfect square: size={square_img.size}")

    # Required output files & dimensions
    sizes = {
        'public/favicon-16x16.png': (16, 16),
        'public/favicon-32x32.png': (32, 32),
        'public/favicon-48x48.png': (48, 48),
        'public/apple-touch-icon.png': (180, 180),
        'public/android-chrome-192x192.png': (192, 192),
        'public/android-chrome-512x512.png': (512, 512)
    }

    # Generate individual PNG files
    for path, size in sizes.items():
        resized = square_img.resize(size, Image.Resampling.LANCZOS)
        resized.save(path, 'PNG')
        print(f"Saved {path} with size {size}")

    # Generate multi-resolution favicon.ico (16x16, 32x32, 48x48)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [square_img.resize(size, Image.Resampling.LANCZOS) for size in ico_sizes]
    
    ico_path = 'public/favicon.ico'
    ico_images[0].save(
        ico_path,
        format='ICO',
        sizes=ico_sizes,
        append_images=ico_images[1:]
    )
    print(f"Saved multi-resolution ICO to {ico_path}")

if __name__ == '__main__':
    generate_favicons()
