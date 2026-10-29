# Builder brief: one week of "Build Your Own AI Agents", rebuilt as five day tabs

You are rebuilding ONE week of a 10-week interactive course (no-code AI agents with Claude and n8n). Every week is a single HTML page that shares a design system and a runtime. Your job: produce `course/src/<name>.html` for your week and rewrite `course/content/<name>.md` (the course doc's text for your week) in the same voice. Do NOT publish anything. Do NOT edit `shared/`, `build.py`, `hub.html` or other weeks.

Week 1 is finished and approved. It is the reference for everything below: structure, voice, depth, exercises. Read it before you write a line.

## Read these first, in this order
1. `course/BRIEF.md` (this file).
2. `course/src/w1.html`: the reference page. Match its structure exactly and its voice closely.
3. `course/content/w1.md`: the reference doc text. Your `content/<name>.md` follows the same shape.
4. `course/content/syllabus.md`: the professional syllabus this course teaches. Your week's modules and labs are listed there. Every bullet for your week must be taught.
5. `course/content/<name>.md` (the OLD text for your week): the facts and lab steps to keep. Its voice is wrong (clipped, slogan headlines); rewrite everything.
6. `course/src/<name>.html` (the OLD page for your week): working visuals you may keep and improve. Its structure and prose are wrong; the visuals' code is often good.
7. `course/shared/course.css` and `course/shared/course.js`: the design system and the runtime API (summarised below).
8. `course/source/mit/`: the MIT xPRO texts. The syllabus file says which MIT module feeds your week; read that transcript's relevant parts and use its ideas, naming the MIT course when you do.
9. `course/urls.json`: the published links (your week's link is `weeks[N-1]`; the hub, the doc and the Agent Playground).

## Who reads this page
New professionals and product managers with basic tech skills, learning alone, one day at a time. Both the author of the course and its learners are working adults. Write the way a good instructor talks in a room, not the way a slide deck reads.

## Voice (match Week 1)
- First person singular for the instructor ("I'll show you", "here is the definition I use"), second person for the learner. Admit uncertainty where it is real.
- Open every concept with something the learner already does at work, then name the term. Never open on the term or on a slogan.
- Vary sentence length. Short sentences for emphasis, longer ones with commas to explain. A page of clipped declaratives reads as machine-written. Headings are plain questions or statements ("How does a webhook know a form was submitted?", "It reads in chunks, not letters").
- Explain the why, give one worked example, and say where an analogy breaks. Three to five paragraphs per concept, not two sentences. An `.aside` box for an honest caveat where one exists.
- Examples come from the workplace only: emails, invoices, policies, support tickets, a CRM, spreadsheets, contracts, meetings, hiring, procurement. No homework, no recipes, no teenagers, no cats.
- Name the MIT course when a concept comes from it. Name the syllabus's lab numbers (Lab 1.1, 2.2, ...).
- Banned: "Let's dive in", "powerful", "seamless", "unlock", "leverage", "delve", "robust", "journey", "game-changer", "supercharge", "landscape" (say toolkit), em-dashes, emoji, wry one-line closers on every paragraph, "In this section we will", "Key takeaways".
- Use current model names (`claude-sonnet-5-5`, `claude-haiku-5-5`, `claude-opus-5-5`) and say that names change; the syllabus's "Claude 3.5 Sonnet" is out of date.

## The five-day structure
A week is five day tabs; one day is visible at a time (`Course.days()` in the runtime does the switching, the rail pills, the dots and `#dayN` links). Copy the skeleton in `src/_template.html` exactly. Each day:
- `section.scene.daypanel#dayN` with a `.scene__head`: kicker "Day N · about M minutes", a plain title, one or two sentences on what the learner can do by the end and what they will have made.
- Two or three concepts (`article.concept`), each with a working visual and 3 to 5 paragraphs. Three days of two concepts and one of three is typical; eight to ten concepts a week.
- A `.today` card ("Do today"): a persisted checklist `data-persist="dN"` with meter `data-meter-for="dN"`, two to four concrete exercises with the exact words to type and where (Claude, n8n, the Console, this page), each with a "Notice:" line. Give every step a stable id (`dN-1`, `dN-2` ...). Note fields use `data-note`.
- A `.daynav` row: previous and next day buttons with `data-go`.
- Days run roughly 40, 45, 50, 60 and 100 minutes and sum to the week's hours (hub: W2 5h, W3 5h, W4 5h, W5 6h, W6 5h, W7 6h, W8 6h, W9 6h, W10 8h).
- Day 5 is the long day: one concept at most, then three `.part` blocks with ids `lab`, `quiz`, `build`:
  - `#lab`: the syllabus's lab for the week (its number in the kicker), as a persisted checklist `data-persist="lab"` with hints on the hard steps, copyable prompts and snippets in `pre.code`, any table from the old content as an editable `table.tbl` with `data-note` fields, a `.card.dlog` "Design-log entry N" with three `data-note` textareas that connect the week to the product the learner chose in Week 1, and a `.deliverable` block.
  - `#quiz`: `Course.quiz('#quizBox', ...)` with eight questions (four options, one correct, a `why` that teaches), then the content's "Check yourself" questions as `.reflect` details with model answers (three or four sentences each).
  - `#build`: one practice activity that trains the week's skill, scored, with a reset.
- The wrap-up section (stats, tracker button, pager with the real previous and next week titles, footer) sits under the panels, always visible. Week titles: W1 Meet Modern AI · W2 Prompt Craft · W3 Claude Projects · W4 Context Engineering · W5 Embeddings and RAG · W6 n8n Workflows · W7 Your First Agent · W8 Tool Calling · W9 Chat Channels · W10 Capstone. (Keep your own week's rail title short; the hero headline is a human sentence.)
- Cross-links use `data-href="hub|doc|playground|prev|next|track|w1..w10"`; never hard-code artifact URLs in the page.

## What "high end" means here
- Every concept gets its own working visual that shows the mechanism: a canvas animation, a simulation or an interactive widget with at least one control. Reuse the old page's visuals where they work; re-theme their copy to the workplace. Real content in visuals (real node names, real token counts, real field names), never lorem ipsum.
- The hero stage is the week's signature animation and loops on load. `t = 0` must be a meaningful frame (reduced motion shows that frame).
- Motion with purpose, 60 fps on a laptop, modest particle counts, no layout reads inside draw loops. Canvas text in the page fonts (`'600 13px Figtree, sans-serif'`, mono `'12px "JetBrains Mono", monospace'`), colours via `Course.cssVar('--think')` read on each draw so both themes work.
- Layout rules learned the hard way: widgets live inside a half-width `.concept__viz` column, so size their grids by container (`grid-template-columns:repeat(auto-fit,minmax(<min>px,1fr))`), never by a viewport media query alone. Prefix every page-specific class with the week (`.w4-...`) and check it does not exist in `shared/course.css`. Start every canvas draw with `if (w < 60 || h < 60) return;`.

## Page contract (platform rules; breaking these breaks the page)
- The file starts with `<title>` (a short name, two to four words, no colon or dash explainer), the meta line, the fonts link, `<!-- @css -->`, your `<style>`. No `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` anywhere. The build step inlines the shared CSS and JS at the `<!-- @css -->` and `<!-- @js -->` markers.
- External scripts only from `https://cdnjs.cloudflare.com/ajax/libs/<lib>/<exact version>/<file>` (UMD builds) placed before the inline script that uses them. Three.js, if truly needed: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`. No other hosts, no external images, no iframes, no fetch to the internet.
- No `alert`, `confirm`, `prompt`, `window.print`, download links, `mailto:`.
- Every form control has a stable id. Toggle visibility with the `hidden` attribute, not `style.display`.
- Works at 400 px wide: no horizontal page scroll; grids stack; `min-width:0` on grid and flex children that hold text; wide tables inside `.table-wrap`.
- Complete at rest: nothing hidden behind scroll-triggered reveals.
- Respect `prefers-reduced-motion` (`Course.motionOK` is false then: static or stepped visuals, never spinning).
- Live Claude: ONLY Week 2 declares the `sample` capability. Week 2 keeps `Course.init({week: 2, title: 'Prompt Craft', live: 'sample'})` and its `.live` blocks (`Course.runLive`, `[data-live-btn]`, `[data-live-missing]`); reuse the old `src/w2.html` live code. Every other week must not call `Course.ask`, `Course.askJSON` or `Course.runLive`; for a live exercise, link to the Agent Playground with `data-href="playground"`.

## Runtime API (course.js, already on the page)
- `Course.init({week: N, title: '...'})` first, then `Course.days()`.
- Checklists: any `[data-persist="key"]` container with `input.check[id]` is saved automatically; a `.meter[data-meter-for="key"]` with `.progress>i` and `[data-meter-label]` updates itself. Use distinct keys (`d1`..`d4`, `lab`); never two containers with the same key.
- Notes: `textarea[data-note="key"]` and `input[data-note="key"]` save automatically (build any dynamic note fields before `Course.init` runs, or they are not wired).
- `Course.quiz(sel, {questions: [{q, options: [4], answer: i, why}], passPct: 80})`.
- `Course.canvas(canvasEl, draw(ctx, w, h, t, dt), {auto: true})` returns `{start, stop, once, resetTime, resize, w, h}`; it pauses offscreen and re-measures when a hidden day opens.
- Helpers: `Course.el(tag, attrs, children)`, `Course.$`, `Course.$$`, `Course.esc`, `Course.clamp`, `Course.lerp`, `Course.ease`, `Course.fmt`, `Course.cssVar('--think')`, `Course.roundRect(ctx, x, y, w, h, r)`, `Course.typewrite(el, text, cps)`, `Course.toast(msg)`, `Course.confetti()`, `Course.tabs()` for small `[data-tabs]` groups inside a widget.
- Design tokens: violet `--think` = model thinking, orange `--act` = actions and tools, teal `--observe` = results and observations.

## The doc text: `course/content/<name>.md`
Rewrite it in the new voice with the shape of `content/w1.md`: `## Week N: <plain title>`, the `**Interactive module:**` line with the week's link from `urls.json` and one sentence on the day split, two intro paragraphs (what the week gives you; which syllabus modules it covers and which MIT module it borrows from), `**Learn**` with one italic-led paragraph per concept, `**Try it**` as a numbered list of the week's exercises, `**Lab X.Y: ...**` with steps and any table, the design-log entry, `**Deliverables**`, `**Check yourself**`. Prose only, no HTML. About 1,200 to 1,800 words.

## Output and self-checks
- Write the page in parts of at most 250 lines each into `course/src/<name>parts/p1.html`, `p2.html`, ... (head and hero; one part per day; wrap-up; two or three script parts), then concatenate in order with `cat` into `course/src/<name>.html`. One huge write stalls; parts do not.
- Then run, from the `course` folder: `python -I build.py <name>` and fix every WARNING it prints; extract and syntax-check the script: `python -I -c "import re;s=open('dist/<name>.html',encoding='utf-8').read();open('dist/_<name>.js','w',encoding='utf-8').write('\n'.join(re.findall(r'<script>(.*?)</script>',s,re.S)[-1:]))"` then `node --check dist/_<name>.js`; check for duplicate ids with a short Python script; check that no `{{` is left over.
- Then open `course/dist/preview/<name>.html` with Python's http.server on a free port and the browser tools if you have them, or at least load it with a headless check; confirm no console errors, that every `#dayN` panel exists, every `data-persist` key is unique, and the quiz renders eight questions.
- Delete the parts folder when the page is assembled.
- Report back, in this exact shape:
  - file: path and line count
  - days: the five day titles with minutes
  - concepts: the concept titles in order (these become the hub's concept chips)
  - visuals: one line each
  - lab: lab number and title; deliverable in one sentence
  - quiz: question count; practice: one line
  - hub entry: `{n, title, hours, lab, make, viz, concepts}` as a JavaScript object literal matching the shape in `src/hub.html`
  - anything you could not do

## Lessons from the Weeks 2 to 10 rollout (29 Oct 2026)

- Nine builders ran in parallel from this brief and all nine pages passed `tools/check_pages.py` and the browser smoke test first time. Keep the brief's report shape: the hub entry object pastes straight into `tools/hub_entries.json`, which `tools/update_hub.py` applies.
- Doc sections are replaced with `tools/doc_ops.py N out.json` (reads `content/wN.md`, uses `tools/doc_blocks.json`). The Claude Docs connector caps one update call at 32 KB of inline content, so send one week per call. A comment thread anchored on old text blocks the delete; look it up with `query` first and pass `allowDetach: true` on that op only when the user asked for the rewrite.
- n8n `{{ }}` expressions are fine inside the doc text; the `{{` check applies to the built HTML pages only.
- The Browser pane is shared by every agent in the session. A builder must open its own tab and never navigate the active one, or it will break a sibling's check mid-run.
- The Bash tool collapses a doubled backslash to a single one inside heredocs. Write files that need doubled backslashes with the Write tool.
- Doc texts landed at 1,800 to 2,600 words against the brief's 1,200 to 1,800; the approved Week 1 doc is 2,700. Treat the ceiling as "about the length of Week 1".

## Account sync outside Claude (added 29 Oct 2026)

`shared/sync.js` is inlined into every page after `course.js`. With `window.FIREBASE_CONFIG` set (in `shared/firebase-config.js`) and no `window.claude` present, it adds a Google sign-in control to `.rail__links`, timestamps every `Course.store.set`, and mirrors all `aiagents:*` keys into Firestore `users/<uid>` with newest-wins merging. It emits `syncstatus` and `sync` events; a page that sets `Course.syncHandled = true` and redraws on `sync` avoids the default reload (the hub does). Inside Claude it exits at once. Builders never need to touch it; keep using `Course.store`, `[data-persist]` and `[data-note]` and sync comes free.
