# The source syllabus: a 5-day professional course in 15 modules

This is the programme the 10-week course is built from. Each week of ours covers the modules listed; every bullet below must be taught somewhere in that week, in the instructor's voice, with workplace examples.

## Day 1: Modern AI Tools, Claude Mechanics & Projects (Modules 1 to 4)
- Landscape of modern AI tooling: chat assistants, research copilots, documentation and presentation builders.
- Advanced multimodal chat: file handling, image parsing, and Claude Artifacts.
- LLM internal mechanics: tokens, probability generation, context boundaries, and task failure patterns.
- Prompt engineering frameworks: Role, Task, XML tag structure (`<instructions>`, `<context>`, `<rules>`).
- Introduction to Claude Projects: custom knowledge bases, persistent system instructions, and team sharing.
- Lab 1.1: Crafting XML-structured system prompts for enterprise guardrails.
- Lab 1.2: Building a Claude Project assistant pre-loaded with departmental policy documents.
- Our weeks: Week 1 = Modules 1 to 3 (done). Week 2 = Module 4 prompt engineering + Lab 1.1. Week 3 = Module 4 Projects + Lab 1.2.

## Day 2: Advanced Context Engineering & Vector Retrieval (Modules 5 to 6)
- Claude native tools: web search, document parsing, and analysis sandboxes.
- Context engineering principles: prompt engineering versus context engineering (dynamic state, tools, and long-horizon assembly).
- Managing Claude's 200K+ token context window: needle-in-a-haystack dynamics, attention degradation, context packing, and document pruning.
- Prompt caching fundamentals: caching static system instructions and vector reference sheets to reduce latency and cost.
- Vector stores, embeddings, dynamic document chunking strategies, and semantic retrieval.
- Lab 2.1: Stress-testing prompt caching and multi-document analysis in the Claude Console.
- Lab 2.2: Designing a contextual enterprise retrieval assistant using semantic document ingestion and citation tracking.
- Our weeks: Week 4 = Module 5 + Lab 2.1. Week 5 = Module 6 + Lab 2.2.

## Day 3: Visual Workflow Automation & AI Agents in n8n (Modules 7 to 8)
- Introduction to n8n: nodes, visual execution loops, data pinning, and error handling.
- Webhook architecture: instant triggers, test versus production webhooks, and header security.
- Data literacy for non-programmers: JSON objects, arrays, expression mapping, and schema transformation.
- The n8n AI Agent node: linking Anthropic Claude chat model sub-nodes, conversational memory buffers, and output parsers.
- Exposing n8n workflows as callable tools and integrating external REST APIs (auto-sending emails, CRM updates).
- Lab 3.1: Building an automated workflow in n8n triggered by incoming webhooks.
- Lab 3.2: Configuring an n8n AI Agent powered by Claude that dynamically triggers external tools (Gmail alerts, querying mock CRM records).
- Our weeks: Week 6 = Module 7 + Lab 3.1. Week 7 = Module 8 + Lab 3.2.

## Day 4: Anthropic Workbench & Advanced n8n Analytics Agents (Modules 9 to 11)
- Anthropic Console: Workspaces, Projects, API key provisioning, rate limits, and Workbench prototyping.
- Structured tool calling / function calling with Claude in n8n: defining tool schemas in plain English.
- Vector store nodes in n8n (Qdrant, Pinecone, In-Memory Vector Store) linked to Claude reasoning nodes.
- Building an advanced "Math & Analytics Agent" in n8n: ingesting messy multi-sheet Excel/CSV files, running formulas, validating calculations, and executing Python/JS code nodes without manual programming.
- Execution monitoring: tracing execution steps, inspecting context payloads, and auditing run logs.
- Lab 4.1: Prototyping tool-calling schemas inside the Anthropic Workbench.
- Lab 4.2: Building an n8n Analytics Agent that parses financial spreadsheets, computes KPIs, and generates executive summaries.
- Our weeks: Week 8 = Modules 9 to 11 + Labs 4.1 and 4.2.

## Day 5: Visual Interfaces, Omnichannel Deployment & Capstone (Modules 12 to 15)
- Visual conversational interfaces: block-based dialogue, state management, loops, and variable handling (n8n Chat Trigger, Voiceflow, Typebot).
- Connecting frontends to n8n AI agents: streaming Claude responses, handling conversational memory across sessions.
- Multi-channel deployment: embedding via iframe, floating chat-bubble widgets on corporate web pages, and WhatsApp integration via Wati or the Meta Cloud API.
- Capstone enterprise assistant architecture: orchestrating an end-to-end autonomous assistant combining a branded UI, n8n webhook routing, Claude reasoning, Qdrant or in-memory RAG, and live notification tools.
- Lab 5.1: Connecting a conversational chat trigger to an n8n Claude agent with session-aware memory.
- Lab 5.2: Embedding the assistant widget into a live website and routing inbound queries from WhatsApp.
- Capstone: Deploying a production-style enterprise assistant linking multi-source retrieval, dynamic calculations, and automated ticket and email dispatching.
- Our weeks: Week 9 = Modules 12 to 14 + Labs 5.1 and 5.2. Week 10 = Module 15 + the capstone.

## Lab setup: accounts and environment
- Claude Pro or Claude for Work: one subscription per participant, for Projects, Artifacts and prompt evaluation.
- Anthropic Console (console.anthropic.com): shared team workspace.
- n8n: n8n Cloud Pro workspace, or a self-hosted instance with the community LangChain AI Agent nodes enabled.
- Vector database: a free-tier Qdrant Cloud cluster, a Pinecone index, or the n8n In-Memory Vector Store.
- WhatsApp sandbox (optional): a Wati account or sandbox, or the Meta WhatsApp Cloud API sandbox.
- A modern laptop running Windows, macOS or ChromeOS with Chrome, Edge or Brave; unrestricted HTTPS access to api.anthropic.com, claude.ai, *.n8n.cloud and the WhatsApp endpoints.
- Model names: the syllabus was written for Claude 3.5 Sonnet. Use current names (the Claude 5 family: `claude-sonnet-5-5` for everyday agents, `claude-haiku-5-5` for cheap high-volume steps, `claude-opus-5-5` where quality matters most) and say that model names change.

## The MIT xPRO material (Designing and Building AI Products and Services) and where it belongs
Extracted texts are in `course/source/mit/` (one `.txt` per PDF or Word file; `Week_N__M<N>_Transcript.txt` are the lecture transcripts).
- Module 1, the four-stage AI design process (intelligence: metrics and scope; business process: strategic role and operational targets; technology: IP and data strategy; tinkering: software plan and "AI cancers"): Week 1 (stages 1 and 2) and Week 10 (stages 3 and 4, the GPT-3 integration cost estimate exercise, the design log as capstone brief).
- Module 2, machine-learning taxonomy (supervised, unsupervised, semi-supervised, reinforcement; parametric and non-parametric; training versus test sets; linear classifiers): Week 1 (done) and Week 5 (clustering, similarity, why embeddings place similar things together).
- Module 3, neural networks (neurons, multi-layer perceptrons, CNNs, RNNs): Week 5 (embeddings come from these networks, one paragraph).
- Module 5, human-computer interaction and intelligent interfaces (the wireframe exercise): Week 9 (chat interfaces, state, loops, where the human stays in control).
- Module 6, Superminds ("from humans in the loop to computers in the group"; specialised versus general intelligence): Week 7 (what an agent is good for and what stays with people) and Week 10.
- Module 7, GANs, deepfakes, the moral-machine exercise: Week 10 (risk section) and a line in Week 9 (deepfake-aware customer channels).
- Module 8, business applications (basic requirements are people and data; explanation; boundary setting, value formation, decision tracing, bias remediation; the resume-screening bias exercise): Week 8 (decision tracing = execution monitoring) and Week 10 (capstone requirements, the bias guardrail).
- The design log: a habit from the MIT course. Every week's Day 5 adds "Design-log entry N": three short answers that connect the week to the product the learner chose in Week 1. By Week 10 the log is the capstone brief.
