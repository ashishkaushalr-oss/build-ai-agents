"""Inline the shared CSS/JS and the course URLs into every page in src/.

Usage
  python -I build.py [page-name ...]
      -> dist/<name>.html        the artifact bodies published to claude.ai (links point at the Claude artifacts)
      -> dist/preview/<name>.html the same, wrapped in the skeleton the platform adds, for local viewing
  python -I build.py --site [dir] [--doc-url URL] [page-name ...]
      -> a static site with relative links between pages, hub.html written as index.html (default dir: docs/).
         Serve it from GitHub Pages or any web host. --doc-url sets where "Course doc" links go.
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC, DIST, SHARED = os.path.join(HERE, 'src'), os.path.join(HERE, 'dist'), os.path.join(HERE, 'shared')
SKELETON = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
            '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>')


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def write(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)


args = sys.argv[1:]
site_dir, doc_url = None, None
if '--site' in args:
    i = args.index('--site'); args.pop(i)
    site_dir = args.pop(i) if i < len(args) and not args[i].startswith('--') else 'docs'
if '--doc-url' in args:
    i = args.index('--doc-url'); args.pop(i); doc_url = args.pop(i)

css = read(os.path.join(SHARED, 'course.css'))
js = read(os.path.join(SHARED, 'course.js'))
urls_path = os.path.join(HERE, 'urls.json')
urls = json.loads(read(urls_path)) if os.path.exists(urls_path) else {}
urls.setdefault('weeks', ['#'] * 10)
names = args or [n[:-5] for n in sorted(os.listdir(SRC)) if n.endswith('.html') and not n.startswith('_')]
problems = []


def build_page(name, url_map):
    page = read(os.path.join(SRC, name + '.html'))
    tag = '<script>window.COURSE_URLS=' + json.dumps(url_map) + ';</script>'
    out = page.replace('<!-- @css -->', '<style>\n' + css + '\n</style>')
    out = out.replace('<!-- @js -->', tag + '\n<script>\n' + js + '\n</script>')
    out = out.replace('<!-- @urls -->', tag)
    if '<title>' not in out[:8000]: problems.append(name + ': no <title> in first 8KB')
    for bad in ('<!doctype', '<html', '<head', '<body'):
        if bad in out.lower()[:2000]: problems.append(name + ': contains ' + bad)
    if out.count('<script') != out.count('</script>'): problems.append(name + ': unbalanced <script> tags')
    if '{{' in out: problems.append(name + ': leftover {{ placeholder')
    if 'href="course.css"' in out: problems.append(name + ': links course.css instead of inlining')
    return out


if site_dir:
    site = site_dir if os.path.isabs(site_dir) else os.path.join(HERE, site_dir)
    site_urls = {'hub': 'index.html', 'doc': doc_url or urls.get('doc', '#'), 'playground': 'playground.html',
                 'weeks': ['w%d.html' % n for n in range(1, 11)]}
    for name in names:
        out = build_page(name, site_urls)
        fname = 'index.html' if name == 'hub' else name + '.html'
        write(os.path.join(site, fname), SKELETON + out + '</body></html>')
        print('site', fname, len(out), 'bytes')
    write(os.path.join(site, '.nojekyll'), '')
else:
    for name in names:
        out = build_page(name, urls)
        write(os.path.join(DIST, name + '.html'), out)
        write(os.path.join(DIST, 'preview', name + '.html'), SKELETON + out + '</body></html>')
        print('built', name, len(out), 'bytes')
for p in problems:
    print('WARNING', p)
