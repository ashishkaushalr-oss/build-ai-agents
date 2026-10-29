"""Build the Claude Docs ops that replace one week's section with content/wN.md.
Usage: python -I tools/doc_ops.py N out.json   (from the course folder)
Ops: replace heading (as text), replace the Interactive-module paragraph (as markdown),
insert the body after it (markdown), delete the old body blocks; W10 also moves the kept embed + caption
to sit right after the module paragraph. Guards: ifHash from tools/doc_blocks.json, ifRev = the read that showed them.
"""
import json, re, sys, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
n, out = sys.argv[1], sys.argv[2]
blocks = json.load(open(os.path.join(HERE, 'tools', 'doc_blocks.json'), encoding='utf-8'))
w = blocks['weeks'][n]
PFX = 'mnxj5acqhga'
REV = blocks.get('rev', 30)
full = lambda i: PFX + i if i.startswith('.') else i
lines = open(os.path.join(HERE, 'content', f'w{n}.md'), encoding='utf-8').read().strip('\n').split('\n')
assert lines[0].startswith('## '), 'first line must be the ## heading'
heading = lines[0][3:].strip()
i = 1
while not lines[i].strip(): i += 1
assert lines[i].startswith('**Interactive module:**'), 'second block must be the Interactive module paragraph'
mod = []
while i < len(lines) and lines[i].strip():
    mod.append(lines[i]); i += 1
module_md = '\n'.join(mod)
body_md = '\n'.join(lines[i:]).strip('\n')
if '{{' in body_md: print('note: body contains {{ (n8n expressions); fine for the doc')
ops = [
    {"op": "replace", "target": {"kind": "blocks", "ids": [full(w['heading'])]}, "ifHash": w['heading_h'], "ifRev": REV,
     "with": {"as": "text", "from": {"kind": "inline", "content": heading}}},
    {"op": "replace", "target": {"kind": "blocks", "ids": [full(w['module'])]}, "ifHash": w['module_h'], "ifRev": REV,
     "with": {"as": "markdown", "from": {"kind": "inline", "content": module_md}}},
    {"op": "insert", "target": {"kind": "blocks", "ids": [full(w['module'])]}, "side": "after",
     "source": {"as": "markdown", "from": {"kind": "inline", "content": body_md}}},
    {"op": "delete", "target": {"kind": "blocks", "ids": [full(b) for b in w['body']]}, "ifRev": REV},
]
if w.get('keep'):
    ops.append({"op": "move", "target": {"kind": "blocks", "ids": [full(b) for b in w['keep']]},
                "to": {"target": {"kind": "blocks", "ids": [full(w['module'])]}, "side": "after"}})
json.dump({"ops": ops}, open(out, 'w', encoding='utf-8'), ensure_ascii=False)
print(f'week {n}: heading {heading!r}; module {len(module_md)} chars; body {len(body_md)} chars, {body_md.count(chr(10))+1} lines; delete {len(w["body"])} blocks; ops {len(ops)} -> {out}')
