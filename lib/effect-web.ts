import { Otlp } from "@effect/opentelemetry";
import { FetchHttpClient } from "@effect/platform";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as ManagedRuntime from "effect/ManagedRuntime";

const TracingLayer = Effect.gen(function* () {
  const token = yield* Config.redacted("AXIOM_TOKEN");
  const dataset = yield* Config.string("AXIOM_DATASET");

  return Otlp.layer({
    baseUrl: "/ax",
    resource: { serviceName: "nextjseffect-frontend", serviceVersion: "1.0.0" },
    headers: {
      Authorization: `Bearer ${token}`,
      "X-Axiom-Dataset": dataset,
    },
  });
}).pipe(Layer.unwrapEffect);

export const managedRuntime = ManagedRuntime.make(
  Layer.empty.pipe(
    Layer.provide(TracingLayer),
    Layer.provideMerge(FetchHttpClient.layer),
    Layer.provide(Logger.minimumLogLevel(LogLevel.Debug))
  )
);
