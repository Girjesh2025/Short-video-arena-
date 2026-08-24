import re

css_path = "/root/MoneyPrinterTurbo2026/webui-next/src/app/globals.css"
with open(css_path, "r") as f:
    content = f.read()

# Remove all existing @import lines at the top
lines = content.split('\n')
new_lines = []
for line in lines:
    if line.strip().startswith('@import'):
        continue
    new_lines.append(line)

final_content = """@import "tailwindcss/theme";
@import "tailwindcss/utilities";
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

""" + '\n'.join(new_lines).lstrip()

with open(css_path, "w") as f:
    f.write(final_content)

print("CSS fixed")
