from PIL import Image
from collections import Counter
import os

logo_path = 'public/logo.png'
if not os.path.exists(logo_path):
    print(f"{logo_path} does not exist!")
    exit(1)

img = Image.open(logo_path).convert("RGBA")
pixels = img.getdata()

# Filter out transparent pixels (alpha < 100)
colors = [p[:3] for p in pixels if p[3] > 100]

counter = Counter(colors)
# Get top 20 dominant colors
common_colors = counter.most_common(20)

print("Most common non-transparent RGB colors in public/logo.png:")
for rgb, count in common_colors:
    hex_color = '#{:02x}{:02x}{:02x}'.format(*rgb).upper()
    print(f"RGB: {rgb} | HEX: {hex_color} | Count: {count}")
