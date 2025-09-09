import { NodeSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

export class SpanProcessor extends Effect.Service<SpanProcessor>()(
  "SpanProcessor",
  {
    effect: Effect.gen(function* () {
      const token = yield* Config.redacted("AXIOM_TOKEN");
      const dataset = yield* Config.string("AXIOM_DATASET");

      const processor = new BatchSpanProcessor(
        new OTLPTraceExporter({
          url: "https://api.axiom.co/v1/traces",
          headers: {
            Authorization: `Bearer ${Redacted.value(token)}`,
            "X-Axiom-Dataset": dataset,
          },
        })
      );

      const flush = Effect.promise(() => processor.forceFlush());

      return {
        processor,
        flush,
      };
    }),
  }
) {
  static flush = Effect.flatMap(this, (_) => _.flush);
}

const TracingLayer = Effect.gen(function* () {
  const { processor } = yield* SpanProcessor;

  const resource = {
    serviceName: "nextjseffect-backend",
    serviceVersion: "1.0.0",
    attributes: {},
  };

  return NodeSdk.layer(() => ({
    resource,
    spanProcessor: processor,
  }));
}).pipe(Layer.unwrapEffect);

export const mainApiLayer = Layer.empty.pipe(
  Layer.provide(TracingLayer),
  Layer.provideMerge(SpanProcessor.Default)
);
