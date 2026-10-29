"""Patch the hub's WEEKS entries and totals. Usage: python -I tools/update_hub.py entries.json  (from the course folder)
entries.json: a list of objects {n, title, hours, lab, make, viz, concepts:[...]} (any subset of weeks).
Each matching `{n: N, ...}` line in src/hub.html is replaced (the last entry has no trailing comma); then the eyebrow
and summary totals are recomputed.
"""
import json, re, sys, os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hub_p = os.path.join(HERE, 'src', 'hub.html')
entries = json.load(open(sys.argv[1], encoding='utf-8'))
s = open(hub_p, encoding='utf-8').read()
BS = chr(92)


def js_str(v):
    return "'" + str(v).replace(BS, BS + BS).replace("'", BS + "'") + "'"


for e in entries:
    n = int(e['n'])
    pat = re.compile(r"^    \{n: %d, title: .*?\}(,?)\n" % n, re.M)
    m = pat.search(s)
    assert m, 'no WEEKS entry for week %d' % n
    line = ("    {n: %d, title: %s, hours: %d, lab: %s, make: %s, viz: %s, concepts: [%s]}%s\n" %
            (n, js_str(e['title']), int(e['hours']), js_str(e['lab']), js_str(e['make']), js_str(e['viz']),
             ', '.join(js_str(c) for c in e['concepts']), m.group(1)))
    s = s[:m.start()] + line + s[m.end():]
    print('week %d updated: %s, %d concepts' % (n, e['title'], len(e['concepts'])))

# totals
weeks = re.findall(r"^    \{n: (\d+), title: '(?:[^'\\]|\\.)*', hours: (\d+), .*?concepts: \[(.*?)\]\},?\n", s, re.M)
hours = sum(int(h) for _, h, _ in weeks)
concepts = sum(len(re.findall(r"'(?:[^'\\]|\\.)*'", c)) for _, _, c in weeks)
labs = len(re.findall(r"lab: '", s))
s, n1 = re.subn(r"10 weeks · \d+ hours · \d+ concepts · \d+ labs", "10 weeks · %d hours · %d concepts · %d labs" % (hours, concepts, labs), s)
s, n2 = re.subn(r"of \d+ concepts</span>", "of %d concepts</span>" % concepts, s)
s, n3 = re.subn(r"of \d+ hours</span>", "of %d hours</span>" % hours, s)
open(hub_p, 'w', encoding='utf-8').write(s)
print('totals: %d weeks, %d hours, %d concepts, %d labs (eyebrow %d, cards %d/%d)' % (len(weeks), hours, concepts, labs, n1, n2, n3))
