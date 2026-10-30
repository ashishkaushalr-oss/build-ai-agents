"""Build src/w1.html (the live Week 1 module, five day tabs) from src/_w1-flat.html, the single-scroll source.
Edit concepts, exercises, lab, quiz and practice in _w1-flat.html, then run this to regenerate w1.html.
Usage: python -I tools/make_w1_days.py   (from the course folder)
"""
import os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, 'src', '_w1-flat.html')
OUT = os.path.join(HERE, 'src', 'w1.html')
s = open(SRC, encoding='utf-8').read()

def cut(a, b):
    i = s.index(a); j = s.index(b, i)
    return s[i:j]

# ---------- pieces of the single-scroll page ----------
head = s[:s.index('<main class="wrap">') + len('<main class="wrap">\n')]
concepts = re.findall(r'    <!-- \d+\. [^\n]*-->\n    <article class="concept[^"]*"[^>]*>.*?\n    </article>\n', s, re.S)
assert len(concepts) == 11, len(concepts)
try_items = {int(m.group(1)): m.group(0) for m in re.finditer(r'      <li><span class="step__num"></span><input class="check" type="checkbox" id="try-(\d)".*?</li>\n', s, re.S)}
assert sorted(try_items) == [1, 2, 3, 4, 5], sorted(try_items)
email = cut('    <h4 style="margin:22px 0 8px">The customer email for step 1</h4>', '  </section>\n\n  <section class="scene" id="lab">')
email = email.replace('The customer email for step 1', 'The customer email for the reply exercise')
lab = cut('  <section class="scene" id="lab">', '  <section class="scene" id="quiz">')
quiz = cut('  <section class="scene" id="quiz">', '  <section class="scene" id="build">')
build = cut('  <section class="scene" id="build">', '  <section class="scene" id="wrapup">')
wrapup = cut('  <section class="scene" id="wrapup">', '</main>')
script = s[s.index('<!-- @js -->'):]

def as_part(block, pid):
    block = block.replace('  <section class="scene" id="%s">' % pid, '    <div class="part" id="%s">' % pid, 1)
    return block.rstrip('\n').rsplit('  </section>', 1)[0] + '    </div>\n'
lab, quiz, build = as_part(lab, 'lab'), as_part(quiz, 'quiz'), as_part(build, 'build')

# ---------- head: title, rail pills, hero copy, day CSS ----------
pills_old = cut('      <a class="rail__pill" href="#learn">', '    </nav>')
pills_new = ''.join('      <a class="rail__pill" href="#day%d"><i class="rail__dot"></i>Day %d</a>\n' % (i, i) for i in range(1, 6))
head = head.replace(pills_old, pills_new, 1)
head = head.replace('Week 1 · Modules 1 to 3 · about 5 hours · Lab: failure notebook and design log', 'Week 1 · Modules 1 to 3 · five days · about 5 hours in total', 1)
head = head.replace('By the time we build agents from Week 6, none of it should feel like magic.',
                    'I have cut the week into five short days, from 35 minutes to an hour and a half. Take one a day, or several in one sitting. By the time we build agents from Week 6, none of it should feel like magic.', 1)
head = head.replace('<a class="btn btn--primary" href="#learn">Start learning</a>\n        <a class="btn" href="#lab">Jump to the lab</a>',
                    '<a class="btn btn--primary" href="#day1">Start Day 1</a>\n        <a class="btn" href="#day5">Go to Day 5, the lab</a>', 1)
DAY_CSS = ''   # day-tab styles now live in shared/course.css
head = head.replace('</style>', DAY_CSS + '</style>', 1)

# ---------- the five days ----------
DAYS = [
    dict(n=1, tab='What AI is', mins=35, title='What AI is',
         intro='I will go in the order I would use in a room: first what AI is and where it already sits in your week, then how a machine learns, how a language model works, where it goes wrong, which tools exist, and finally the two questions every AI product has to answer. Today, the first two ideas. Every visual is live. Poke it.',
         concepts=[0, 1]),
    dict(n=2, tab='Machines that learn', mins=65, title='How a machine learns, and how a language model guesses',
         intro='Three stops today. First, how a machine learns without being handed rules. Then the one trick a language model knows: guess the next word. Then one animated pass through the transformer that makes the guess. By the end you can explain all three to a colleague in plain words, and you will have drafted your first customer reply with Claude.',
         concepts=[2, 3, 4]),
    dict(n=3, tab='Tokens and the desk', mins=50, title='Tokens, and the desk the model works at',
         intro='Today is about limits. The model reads in chunks, not letters, and it can only see what is on its desk. By the end you can predict when it will miscount, when it will forget, and why.',
         concepts=[5, 6]),
    dict(n=4, tab='Trust, tools, files', mins=60, title='Trust, tools and files',
         intro='Today you learn to tell a grounded answer from an invented one, to pick the right kind of tool for a task, and to hand Claude files, photos and spreadsheets. By the end you will have turned a photo into a table and built your first Artifact.',
         concepts=[7, 8, 9]),
    dict(n=5, tab='Design and the lab', mins=100, title='Design it, then try to break it',
         intro='The longest day. You write your first intelligence target the way the MIT design process asks, spend an hour making Claude fail on purpose and naming the patterns, start your design log, fill your toolkit map, and take the quiz.',
         concepts=[10]),
]

def li(cid, text, notice=None, extra=''):
    n = '' if not notice else '<p class="step__notice"><strong>Notice:</strong> %s</p>' % notice
    return '        <li><span class="step__num"></span><input class="check" type="checkbox" id="%s" aria-label="Done"><div class="step__body"><p>%s</p>%s%s</div></li>\n' % (cid, text, n, extra)

def today(n, intro, items, after=''):
    return ('    <div class="today">\n'
            '      <div class="today__head"><span class="scene__kicker scene__kicker--try">Do today</span>'
            '<div class="meter" data-meter-for="d%d"><div class="meter__row"><span>Progress</span><b data-meter-label>0 / %d</b></div><div class="progress"><i></i></div></div></div>\n'
            '      <p class="muted" style="font-size:.95rem">%s</p>\n'
            '      <ol class="steps steps--numbered" data-persist="d%d">\n%s      </ol>\n%s    </div>\n') % (n, len(items), intro, n, ''.join(items), after)

TODAY = {
    1: today(1, 'Nothing to open yet. Today is about noticing.', [
        li('d1-1', 'Click through all seven moments of the Tuesday, and all four rings of the family tree. Both chips turn green once you have seen everything.'),
        li('d1-2', 'In the note below, write three AI moments from your own working day. For each one, name the task and how well it has to be done.', None,
           '<textarea data-note="d1-moments" id="d1Moments" placeholder="07:45 · the expense tool read my taxi receipt · task: find the amount, date and vendor · how well: right on the amount every time"></textarea>'),
    ]),
    2: today(2, 'One experiment on this page, one in Claude. Use made-up data.', [
        li('d2-1', 'Press Train on the ticket sorter and let it run to 60 rounds at 1× speed. Watch where the curve flattens. Then press Start over and run it again at 8×.',
           'the model never saw a rule. It saw labelled examples, and a lot of them. The flattening curve is the moment more examples stop helping much.'),
        li('d2-2', 'In the transformer card, press Generate and watch the flow run left to right. Then drag Temperature to 0.3 and generate five words; pick the example again, drag it to 1.8 and generate five more. Decide which setting you would want for a refund email.',
           'low temperature makes the same safe choice every time; high temperature wanders. Claude\'s default sits near 1, and you will set this knob yourself in the Console in Week 8.'),
        try_items[1],
    ], email),
    3: today(3, 'Two experiments in Claude, about 20 minutes.', [try_items[5], try_items[2]]),
    4: today(4, 'Two experiments in Claude, about 20 minutes.', [try_items[3], try_items[4]]),
}

def nav(n):
    parts = []
    if n > 1: parts.append('<button class="btn" type="button" data-go="%d" id="goPrev%d">← Day %d · %s</button>' % (n - 1, n, n - 1, DAYS[n - 2]['tab']))
    else: parts.append('<span></span>')
    if n < 5: parts.append('<button class="btn btn--primary" type="button" data-go="%d" id="goNext%d">Day %d · %s →</button>' % (n + 1, n, n + 1, DAYS[n]['tab']))
    else: parts.append('<a class="btn btn--primary" href="#wrapup">Record the week in the tracker ↓</a>')
    return '    <div class="daynav">%s</div>\n' % ''.join(parts)

tabs = '  <nav class="days" id="dayTabs" aria-label="The five days of Week 1" role="tablist">\n' + ''.join(
    '    <button class="dayt" type="button" role="tab" id="dayt%d" aria-controls="day%d" aria-selected="false"><span class="dayt__n">Day %d</span><b>%s</b><span class="dayt__t">about %d min</span><i class="dayt__dot"></i></button>\n' % (d['n'], d['n'], d['n'], d['tab'], d['mins']) for d in DAYS) + '  </nav>\n\n'

panels = ''
for d in DAYS:
    n = d['n']
    body = ''.join(concepts[i] for i in d['concepts'])
    extra = TODAY.get(n, '')
    if n == 5:
        extra = lab + quiz + build
    panels += ('  <section class="scene daypanel" id="day%d" role="tabpanel" aria-labelledby="dayt%d" hidden>\n'
               '    <div class="scene__head">\n'
               '      <span class="scene__kicker scene__kicker--learn">Day %d · about %d minutes</span>\n'
               '      <h2>%s</h2>\n'
               '      <p>%s</p>\n'
               '    </div>\n' % (n, n, n, d['mins'], d['title'], d['intro'])) + body + extra + nav(n) + '  </section>\n\n'

DAY_JS = '''
Course.days();
</script>'''
script = script.replace('Course.init({week: 1, title: \'Meet Modern AI\'});', 'Course.init({week: 1, title: \'Meet Modern AI\'});', 1)
assert script.rstrip().endswith('</script>')
script = script.rstrip()[:-len('</script>')] + DAY_JS + '\n'

out = head + '\n' + tabs + panels + wrapup + '</main>\n\n' + script
open(OUT, 'w', encoding='utf-8').write(out)
print('wrote', OUT, len(out.splitlines()), 'lines')
