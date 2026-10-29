# Build Your Own AI Agents

Repository: https://github.com/ashishkaushalr-oss/build-ai-agents

A ten-week, no-code course on building AI agents with Claude and n8n, written for new professionals and product managers. Each week is an interactive module split into five day tabs: four days of concepts with live visuals and short exercises, then a lab day with a quiz, a practice round and an entry in the learner's design log. Fifty days in all, about 57 hours.

| Week | Title | What you make |
|---|---|---|
| 1 | Meet Modern AI | A workplace AI failure notebook, design-log entry 1 and a toolkit map |
| 2 | Prompt Craft | A guardrail system prompt that holds 9 of 10 attacks |
| 3 | Claude Projects | A company policy helper Project with a scored test sheet |
| 4 | Context Engineering | A caching cost table and a question-order accuracy comparison |
| 5 | Embeddings and RAG | A retrieval scorecard at three chunk sizes and cited answers |
| 6 | n8n Workflows | A webhook-triggered support-ticket intake |
| 7 | Your First Agent | A Claude agent in n8n that reads a mock CRM and sends alerts |
| 8 | Tool Calling | Tool schemas and a spreadsheet analytics agent |
| 9 | Chat Channels | A session-aware chat front end on a live web page |
| 10 | Capstone | A production-style assistant on two channels, with a demo and a write-up |

## Read or run the course

- **Static site.** The `docs/` folder is a complete copy of the course that runs from any web host. GitHub Pages serves it from `/docs` on `main`: the hub is at https://ashishkaushalr-oss.github.io/build-ai-agents/ and each week at `w1.html` to `w10.html`.
- **Phone app.** The site is also a progressive web app: open it on a phone and add it to the home screen (Safari: Share, then Add to Home Screen; Chrome: Install). It opens full screen with its own icon, and every week works offline.
- **Course doc.** `COURSE.md` is the written course: welcome, setup, every week's learn, try-it, lab and check-yourself sections, a glossary and a progress checklist.
- **Inside Claude.** The course owner also publishes each page as a Claude artifact (`urls.json`). Two things only work there: the hub's progress sync to a Claude account (elsewhere progress stays in the browser), and the live Claude workbench in Week 2 and the Agent Playground (elsewhere the page says so and keeps the rest working).

## Sign in and progress sync

On the web the course remembers progress in the visitor's browser, and every page also offers **Sign in with Google**: a signed-in learner's progress (hub ticks, concepts, notes, module checklists, quiz scores) follows them across devices. The site is connected to the Firebase project `build-ai-agents-1ffed`; `firebase/SETUP.md` explains the ten-minute setup for a fork, the config lives in `shared/firebase-config.js` and the access rule is `firebase/firestore.rules` (each person can read and write only their own record). Inside Claude the hub keeps using Claude's own account sync and the Firebase code stays idle.

## How the repository is laid out

| Folder or file | What it holds |
|---|---|
| `src/` | One HTML file per page: `hub.html`, `w1.html` to `w10.html`, `playground.html`. `_template.html` is the five-day skeleton; `_w1-flat.html` is Week 1's single-scroll source. |
| `shared/` | `course.css` and `course.js`, the design tokens and the runtime every page shares (day tabs, checklists, quizzes, canvases, link resolution); `sync.js` and `firebase-config.js`, the optional account sync; `install.js`, the web-app install hint and offline registration (site build only). |
| `assets/` | The app icon, the "A Mark": `icon.svg` plus every size the web app needs, `icon-src/` with the iOS appearance variants and the design spec, `concepts/` with earlier explorations. `tools/make_icons.py` regenerates the sizes. |
| `content/` | The course text in Markdown, one file per week plus the syllabus, glossary and setup notes. `syllabus.md` is the fifteen-module programme the course follows. |
| `dist/` | Built pages: `dist/<name>.html` are the artifact bodies published to Claude; `dist/preview/` wraps them for local viewing. |
| `docs/` | The static site build with relative links, ready for GitHub Pages. |
| `tools/` | Helpers: `check_pages.py` (static checks), `update_hub.py` + `hub_entries.json` (hub cards and totals), `doc_ops.py` + `doc_blocks.json` (pushing a week's text into the Claude doc), `make_w1_days.py` (regenerates Week 1 from its flat source). |
| `BRIEF.md` | The builder brief: voice rules, the five-day structure, the page contract and lessons learned. Start here before changing a page. |
| `urls.json` | Where each page is published on claude.ai. |
| `firebase/` | Setup guide and the Firestore security rule for account sync. |

## Build and check

```bash
python -I build.py            # dist/ and dist/preview/
python -I build.py --site     # docs/ with relative links; add --doc-url to point the doc link elsewhere
python -I tools/check_pages.py
```

To look at a page locally, serve `dist/preview/` or `docs/` with any static server, for example `python -m http.server 8000`.

Week 1 is generated: edit `src/_w1-flat.html` and run `python -I tools/make_w1_days.py`. Every other week is edited directly in `src/`.

## Sources and credit

The course follows a five-day, fifteen-module professional syllabus (summarised in `content/syllabus.md`) and borrows framing from MIT xPRO's *Designing and Building AI Products and Services*: the four-stage design process, the taxonomy of machine learning, the "AI cancers", Superminds, and the practices of explanation. The MIT material itself is not part of this repository; the text names the module wherever it draws on one. Model names are current as of late 2026 (`claude-sonnet-5-5` and relatives) and the pages say so where it matters.

Every lab uses made-up companies and data. Never put a real API key, customer record or colleague's details into any exercise.
