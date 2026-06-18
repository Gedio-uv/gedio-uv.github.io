import re
import os

files = ['incode.html', 'speaker.html', 'ytem.html', 'about.html', 'other.html', 'motion.html']

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Replace the entire <style>...</style> block with the link tag
    new_content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="styles.css">', content, flags=re.DOTALL)
    
    with open(file, 'w') as f:
        f.write(new_content)

print("Done replacing styles!")
