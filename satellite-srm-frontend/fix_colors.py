import os
import glob
import re

def fix_text_colors():
    files = glob.glob('src/**/*.tsx', recursive=True)
    replacements = [
        # Primary
        (r'text-slate-900\s+dark:text-white', 'text-primary'),
        (r'text-slate-800\s+dark:text-white', 'text-primary'),
        (r'text-slate-900\s+dark:text-slate-100', 'text-primary'),
        (r'text-slate-900\s+dark:text-slate-200', 'text-primary'),
        (r'text-slate-800\s+dark:text-slate-200', 'text-primary'),
        (r'text-slate-900\s+dark:text-slate-300', 'text-primary'),
        (r'dark:text-white\s+text-slate-900', 'text-primary'),
        
        # Secondary
        (r'text-slate-700\s+dark:text-slate-300', 'text-secondary'),
        (r'text-slate-700\s+dark:text-slate-200', 'text-secondary'),
        (r'text-slate-600\s+dark:text-slate-300', 'text-secondary'),
        
        # Muted
        (r'text-slate-500\s+dark:text-slate-400', 'text-muted-foreground'),
        (r'text-slate-600\s+dark:text-slate-400', 'text-muted-foreground'),
        (r'text-slate-400\s+dark:text-slate-500', 'text-muted-foreground'),
        
        # Hover states
        (r'hover:text-slate-900\s+dark:hover:text-white', 'hover:text-primary'),
        (r'hover:text-slate-800\s+dark:hover:text-white', 'hover:text-primary'),
        (r'hover:text-slate-700\s+dark:hover:text-slate-200', 'hover:text-secondary'),
        (r'hover:text-slate-700\s+dark:hover:text-slate-300', 'hover:text-secondary'),
    ]

    for f in files:
        try:
            with open(f, 'r', encoding='utf-8') as file:
                content = file.read()
            
            original_content = content
            for pattern, replacement in replacements:
                content = re.sub(pattern, replacement, content)
                
            if content != original_content:
                with open(f, 'w', encoding='utf-8') as file:
                    file.write(content)
                print(f"Updated: {f}")
        except Exception as e:
            print(f"Error reading {f}: {e}")

if __name__ == '__main__':
    fix_text_colors()
