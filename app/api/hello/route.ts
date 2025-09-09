import * as HttpApp from "@effect/platform/HttpApp";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import { Stream } from "effect";
import * as Effect from "effect/Effect";
import * as ManagedRuntime from "effect/ManagedRuntime";
import * as NextServer from "next/server";
import { mainApiLayer, SpanProcessor } from "../../../lib/effect-node";

const app = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest;

  yield* Effect.log("Go request", req.url);

  return yield* HttpServerResponse.stream(
    Stream.fromIterable(["1", "2", "3", "4", "5"]).pipe(Stream.encodeText)
  );
});

const managedRuntime = ManagedRuntime.make(mainApiLayer);
const runtime = await managedRuntime.runtime();
const handler = HttpApp.toWebHandlerRuntime(runtime)(app);

export const GET = async (request: Request) => {
  NextServer.after(() => managedRuntime.runPromise(SpanProcessor.flush));
  return handler(request);
};
