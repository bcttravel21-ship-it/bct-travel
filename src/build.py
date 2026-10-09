"""Ndërton faqen nga kodi burimor: src/ -> site/index.html dhe site/admin.html.
Përdorimi:  python3 src/build.py"""
import base64, pathlib

SRC = pathlib.Path(__file__).resolve().parent
OUT = SRC.parent / 'site'
OUT.mkdir(exist_ok=True)
read = lambda p: (SRC / p).read_text(encoding='utf-8')

photos = 'BCT.photoSrc = {\n' + ',\n'.join(
    f"  {p.stem}: 'data:image/webp;base64,{base64.b64encode(p.read_bytes()).decode()}'"
    for p in sorted((SRC / 'assets/photos').glob('*.webp'))) + '\n};'
common = {
    '{{DATA}}': read('data.js'),
    '{{PHOTOS}}': photos,
    '{{LOGO}}': read('assets/logo.b64').strip(),
    '{{LOGO_WHITE}}': read('assets/logo-white.b64').strip(),
    '{{FAVICON}}': read('assets/wing.b64').strip(),
}

def build(template, parts, name):
    t = read(template)
    for k, v in {**common, **parts}.items():
        t = t.replace(k, v)
    assert '{{' not in t, f'{name}: mbeti një vend bosh në shabllon'
    (OUT / name).write_text(t, encoding='utf-8')
    print(f'{name}: {len(t) // 1024} KB')

build('template.html', {
    '{{CSS}}': read('styles.css'), '{{WORLD}}': read('world.js'), '{{GLOBE}}': read('globe.js'),
    '{{SCENES}}': read('scenes.js'), '{{APP}}': read('app.js'), '{{CONTENT}}': read('content.js'),
}, 'index.html')
build('admin/admin-template.html', {'{{CSS}}': read('admin/admin.css'), '{{ADMIN}}': read('admin/admin.js')}, 'admin.html')
