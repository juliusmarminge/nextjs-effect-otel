"use client";

import { HttpClient } from "@effect/platform";
import { ResponseError } from "@effect/platform/HttpClientError";
import { Console, Effect, Stream } from "effect";
import { managedRuntime } from "../lib/effect-web";

export function Client() {
  const handleResponse = Effect.fn("handleResponse")(function* (
    stream: Stream.Stream<Uint8Array, ResponseError>
  ) {
    yield* stream.pipe(
      Stream.decodeText(),
      Stream.tap((text) => Console.log(text)),
      Stream.runDrain
    );
  });

  const hitApi = Effect.fn("hitApi")(function* () {
    const span = yield* Effect.currentSpan;
    const traceId = span.traceId;

    yield* Effect.log("Trace ID").pipe(Effect.annotateLogs({ traceId }));

    const response = yield* HttpClient.get("/api/hello");

    yield* handleResponse(response.stream);
  });

  return (
    <button onClick={() => hitApi().pipe(managedRuntime.runPromise)}>
      Hit API
    </button>
  );
}
