# OpenAI Support Assistant Migration

Verified against official OpenAI docs on 2026-04-01.

Primary sources:

- https://developers.openai.com/api/docs/models/gpt-5.4
- https://developers.openai.com/api/docs/guides/latest-model
- https://developers.openai.com/api/docs/guides/prompt-guidance
- https://developers.openai.com/api/docs/guides/reasoning
- https://developers.openai.com/api/docs/guides/function-calling
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/tools-tool-search

## Repo inventory

This repo does not contain a direct OpenAI SDK integration today.

Observed ownership boundary:

- `app/dashboard/support/support-console.tsx`
  - Renders the support assistant transcript.
  - Expects the backend to return `merchantContext`, `conversation`, `citations`, and escalation metadata.
- `app/api/proxy/[...path]/route.ts`
  - Proxies `/v1/support/*` requests to the backend service.
- `app/lib/server-api.ts`
  - Resolves the backend base URL.
- `app/dashboard/console-data.ts`
  - Reads support overview data from `/v1/support/conversations`.

Not present in this repo:

- `openai` SDK dependency
- direct `api.openai.com` calls
- `responses.create` or `chat.completions.create`
- prompt files or inline system/developer instructions for the support assistant
- local function/tool schemas for the assistant

Conclusion:

- The actual model choice, prompt, tool wiring, and OpenAI response parsing live in the backend behind `/v1/support/chat`.
- The smallest safe migration path is to keep the frontend and proxy contract stable and migrate the backend service to the latest supported OpenAI path.

## Smallest migration plan

1. Keep the existing frontend API contract unchanged.
2. Move the backend support assistant to the Responses API if it is still on Chat Completions.
3. Set the model to `gpt-5.4`.
4. Start with `reasoning: { effort: "low" }` for this workflow.
   - This is an inference from the current product surface: the assistant is read-only, merchant-aware, tool/retrieval-heavy, and latency-sensitive.
   - If the current assistant is already fast and reliable, test `none` as a follow-up optimization.
5. Preserve current answer length first.
   - Use `text: { verbosity: "medium" }` initially.
   - Clamp brevity in the prompt rather than making a larger output-style change on day one.
6. Prefer `previous_response_id` for multi-turn state.
   - This is the simplest way to preserve reasoning context across turns in Responses.
7. Keep the current backend-to-frontend payload shape.
   - Do not replace the current support payload with the raw Responses API object.

## Recommended backend request shape

```ts
const response = await client.responses.create({
  model: "gpt-5.4",
  instructions: supportAssistantPrompt,
  previous_response_id: previousResponseId ?? undefined,
  reasoning: { effort: "low" },
  text: { verbosity: "medium" },
  input: [
    {
      role: "user",
      content: userMessage,
    },
  ],
  tools,
});
```

If the backend runs a tool loop, keep using the existing application tools and map the final result back into the current support payload.

Suggested backend mapping:

- `response.output_text` -> assistant message body
- tool-derived source metadata -> `citations`
- backend escalation policy result -> `escalationRecommended` and `escalationReason`
- internal conversation state -> `previous_response_id`

## Prompt migration

Use the GPT-5.4 prompt template in `docs/openai-support-assistant-prompt.md`.

Smallest safe prompt changes for this workflow:

- add an explicit output contract
- add tool persistence and dependency checks
- add missing-context gating
- add a verification loop
- add citation and grounding rules
- keep answers concise and operational

These changes match OpenAI's GPT-5.4 guidance for tool-heavy, long-horizon, and evidence-sensitive assistants.

## Manual review items

### API surface

- If the backend still uses Chat Completions, request formatting must change from `messages` to Responses-style `input` and `instructions`.
- If you adopt `previous_response_id`, remember that previous instructions are not automatically carried into the next response. Send the assistant instructions each turn.

### Phase handling

- For long-running or tool-heavy GPT-5.4 flows, OpenAI recommends preserving assistant message `phase`.
- Use `phase: "commentary"` for intermediate assistant updates and `phase: "final_answer"` for completed answers.
- If you manually replay assistant history instead of using `previous_response_id`, preserve the original `phase` values exactly.
- Missing `phase` can cause commentary or preambles to be mistaken for final answers.

### Prompt/tool behavior

- If the backend emits preambles before tool calls, confirm the transcript storage layer can distinguish commentary from final answers.
- If the backend uses many tools or large schemas, consider `tool_search`.
  - Only `gpt-5.4` and later support it.
  - This is optional, not required for the smallest migration.
- If the assistant uses function tools, review tool schemas for strictness.
  - Responses normalizes omitted `strict` settings into strict mode behavior.
  - Previously optional fields can become required unless you set `strict: false`.

### Parameter compatibility

- `temperature`, `top_p`, and `logprobs` are only supported on GPT-5.4 when `reasoning.effort` is `none`.
- If the current backend sends those parameters with a higher reasoning setting, remove or gate them before switching to GPT-5.4.

### Response shape

- Keep the current frontend payload stable:
  - `merchantContext`
  - `conversation`
  - `conversation.messages[].content`
  - `conversation.messages[].citations`
  - `escalationRecommended`
  - `escalationReason`
- Safe optional additions the frontend can ignore:
  - message `phase`
  - backend-only `previous_response_id`
  - model or usage metadata

### Structured outputs

- Only use Structured Outputs if the backend needs a machine-readable model response.
- If you need structured non-tool output, prefer `text.format` with JSON Schema over JSON mode.
- The current frontend contract does not require replacing assistant prose with structured JSON.

## Validation checklist

- Verify the assistant still answers with the same top-level payload expected by `support-console.tsx`.
- Verify citations remain attached only to supported claims.
- Verify escalation still triggers for read-only limits, operational risk, or missing grounding.
- Verify multi-turn conversations do not lose context between responses.
- Verify commentary and final answers are not merged incorrectly if `phase` is adopted.
- Verify latency and verbosity remain acceptable before increasing reasoning effort.
