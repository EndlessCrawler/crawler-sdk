---
description: Capture & organize an idea/spec into the SDK refactor plan (specs/SDK_PLAN.md)
argument-hint: idea/spec/question, e.g. "idea: doors should carry destinations"
---

# /sdk-plan — SDK refactor brainstorm

You are helping the user design a **future refactor** of this SDK. This is a long-running, cross-session **brainstorm and specification** effort. Your job is **not** to write code — it is to **collect, organize, pressure-test, and record** the user's ideas and specifications into a single living document:

**`specs/SDK_PLAN.md`** — the plan of record for the refactor.

The user throws ideas one at a time (often across many sessions, on different machines). You fit each one into the right place — the plan for what's in flux, SPECS for settled facts — keep the whole thing coherent, and flag conflicts. **Everything of value must live in `specs/SDK_PLAN.md` and `specs/SDK_SPECS.md`** (and this command) — the conversation is disposable, the documents are the memory. A fresh clone + `/sdk-plan` must be enough to continue seamlessly.

## First, every time this command runs

1. **Read `specs/SDK_PLAN.md` in full** to load the current state (the implementation phases + the open decisions), and **`specs/SDK_SPECS.md`** for the settled specification. This is mandatory — it is where all prior context lives.
2. Skim as needed for grounding: `specs/V2_PLAN.md` (the modernization that must land *before* this refactor; it does the stack work, this plan reshapes the API), `CLAUDE.md` (current architecture & commands), `specs/CODING_STYLE.md`.
3. If `$ARGUMENTS` contains a new idea/spec/question → process it (below). If it's **empty**, don't guess: summarize the current open decisions and ask the user what they want to tackle.

## The context (so a fresh session understands the stakes)

- This SDK is a **game-agnostic level-generation / level-data tool** — it reads, interprets, and canonically serializes generated dungeon/level datasets of any **schema**. It is *not* a game. `ec` (Endless Crawler's format) is the only live schema; `cnc` (Crypts & Caverns) is the first planned different one. `luw` (dead placeholder) has been deleted.
- The refactor happens **after** V2 modernization but **before** the first npm publish, so **there is no back-compat constraint** — APIs can change freely; in-repo consumers and `ec-dapp` move in lockstep.
- Primary consumer of the shipped SDK: **`ec-dapp`** (Endless Crawler).
- The whole motivation: kill the current design's warts (process-global dataset singleton, `Options`-bag threading, `any`-typed views, namespace/`ModuleInterface` ceremony) in favor of a **functional core + thin wrapper**, strong types, explicit state, explicit per-world imports, and a fully documented public API.

## How to process an idea (`$ARGUMENTS`)

1. **Ground it in the real code first.** Before writing anything into the plan, look at the relevant source (cite `file:line`). Ideas are only useful if they connect to what exists.
2. **Flag conflicts — do not silently reconcile.** If the idea contradicts the current implementation, or an earlier decision/idea already in `SDK_PLAN.md`, **stop and say so**, then ask the user how to resolve it. This is one of your most important jobs.
3. **Ask high-leverage questions.** When a choice materially changes the plan, use `AskUserQuestion` with concrete options (code previews help), a recommended lean first, and always an implicit "capture as OPEN, decide later" path. Don't over-ask trivia you can decide with a sensible default — decide it, state it, move on.
4. **Fit it into the document, organized.** Don't just append. Put open decisions, phase updates, and constraints where they belong in the plan, and settled facts into SPECS; update cross-references so the docs stay internally consistent. Prefer editing existing sections over piling on new ones.
5. **Use the established conventions of the docs:**
   - **Single home per fact.** When a point settles, write its final form into **`specs/SDK_SPECS.md`** (the specification — facts and specs only) and reduce its entry in the plan to a `→ SPECS §Section` pointer. The plan owns only what is **in flux** (open decisions) plus the **implementation-phase record**.
   - **Current facts only — no history:** no dates, commit hashes, changelog narration, or supersession trails ("renamed from…", "Update: …", "restored in…"). When something settles or changes, rewrite its entry to the outcome — git history carries the chronology. A closed decision **drops** from the plan's open list (its fact now lives in SPECS); it is not kept as a `CLOSED` tombstone, and SPECS carries no rejected-alternatives or negotiation.
   - Keep the **open-decisions list** (stable numbered ids, each with options + a *Lean* recommendation) and the **implementation-phase list**.
   - When something conflicts with `V2_PLAN.md`, **flag it to the user and ask** — **do not edit `V2_PLAN.md` or any code unless the user explicitly asks.** `specs/SDK_PLAN.md` and `specs/SDK_SPECS.md` are your working surfaces.
6. **Report back concisely** what you captured, where, and any conflict you flagged or question you're asking.

## Boundaries

- **Do not write implementation code.** This command captures ideas into the plan/specs; implementation happens outside it.
- **Only edit `specs/SDK_PLAN.md` and `specs/SDK_SPECS.md`** by default (plan for what's in flux, specs for settled facts). Touching `V2_PLAN.md`, `CLAUDE.md`, or source requires explicit user approval each time.
- **Do not run git write commands** (commit/push/branch) — the user handles git.
- Keep the tone precise and decision-oriented; the doc should read like an engineer's plan of record, not meeting notes.

---

**This invocation's input:**

$ARGUMENTS
