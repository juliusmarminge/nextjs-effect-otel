"use client";

import { HttpClient } from "@effect/platform";
import { Effect } from "effect";
import { managedRuntime } from "../lib/effect-web";

export function Client() {
  const hitApi = Effect.gen(function* () {
    const span = yield* Effect.currentSpan;
    const traceId = span.traceId;

    yield* Effect.log("Trace ID").pipe(Effect.annotateLogs({ traceId }));

    yield* HttpClient.get("/api/hello");
  });

  return (
    <button onClick={() => hitApi.pipe(managedRuntime.runPromise)}>
      Hit API
    </button>
  );
}
