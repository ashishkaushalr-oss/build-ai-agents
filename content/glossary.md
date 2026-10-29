## Glossary

Every technical term in the course, in plain English, in the order you meet them.
| Term | Plain English | Week |
|---|---|---|
| LLM (large language model) | A program trained on huge amounts of text to predict the next word; Claude is one | 1 |
| Token | A chunk of text about three-quarters of a word long; the unit the model reads and is billed in | 1 |
| Context window | Everything the model can see at once in one conversation, measured in tokens | 1 |
| Hallucination | A confident, fluent, wrong answer produced by prediction filling a gap | 1 |
| Multimodal | Able to take images, PDFs and audio as input, not just text | 1 |
| Artifact | A document, web page, chart or small app Claude produces in a side panel | 1 |
| Prompt | The instructions you give the model | 2 |
| System prompt | The standing instructions applied to a whole conversation, set once | 2 |
| XML tags | Labels like `<rules>` that separate and name parts of a prompt | 2 |
| Guardrails | Rules that stop an assistant doing things it should not, even under attack | 2 |
| Few-shot | Giving the model two or three examples so it copies the pattern | 2 |
| Project (Claude) | A workspace with permanent files and instructions shared by all its chats | 3 |
| Context engineering | Choosing what the model sees, in what order, and when, across many steps | 4 |
| Needle in a haystack | A test that hides one fact in a long document to see if the model can find it | 4 |
| Prompt caching | Storing the unchanging part of a prompt so the API does not re-read it; cheaper and faster | 4 |
| Pruning | Removing context that is no longer needed | 4 |
| Embedding | A list of numbers that represents the meaning of a piece of text | 5 |
| Vector | Another word for that list of numbers | 5 |
| Chunking | Splitting a document into pieces small enough to embed and retrieve | 5 |
| Vector store | A database that finds the stored vectors closest in meaning to a query | 5 |
| RAG | Retrieval-Augmented Generation: find the relevant chunks, then let the model answer from them | 5 |
| Citation | A pointer to the exact chunk or page an answer came from | 5 |
| n8n | A visual tool for building automations by connecting nodes | 6 |
| Node | One box in n8n that does one job | 6 |
| Trigger | The node that starts a workflow when something happens | 6 |
| Webhook | A URL that starts a workflow when another system sends a request to it | 6 |
| JSON | The text format all data between nodes is written in: objects and arrays | 6 |
| Expression | n8n code like `{{ $json.name }}` that pulls a value out of the data | 6 |
| Data pinning | Freezing a node's output so you can build downstream without re-running the trigger | 6 |
| Agent | A model that decides which tools to call, in what order, to reach a goal | 7 |
| Tool | An action the agent can take, with a name, description and inputs | 7 |
| Memory (buffer) | Stored recent messages so the agent remembers the conversation | 7 |
| Output parser | A component that forces the agent's final answer into a fixed data shape | 7 |
| REST API | A way for programs to talk over the web using URLs and JSON | 7 |
| Console / Workbench | Anthropic's developer site and its prompt-testing tool | 8 |
| API key | A secret string that lets a program use the API and spend money; never share it | 8 |
| Rate limit | The maximum requests or tokens allowed per minute | 8 |
| Tool schema | The JSON definition of a tool: name, description, inputs and types | 8 |
| Function calling | Another name for tool calling | 8 |
| KPI | Key Performance Indicator, a number a business tracks, like revenue or margin | 8 |
| Execution log | The record of every step, context and tool result from one run | 8 |
| Streaming | Showing the reply word by word as it is generated | 9 |
| Session ID | A code identifying one user's conversation so memory stays separate | 9 |
| iframe | An HTML tag that shows one web page inside another | 9 |
| Allowed origins | A list of websites permitted to call your webhook | 9 |
| WhatsApp Cloud API | Meta's official way for programs to send and receive WhatsApp messages | 9 |
