import type { Instrumentation } from "next";
import { reportEvent } from "@/lib/monitoring";

export const onRequestError: Instrumentation.onRequestError = (_error, request, context) => {
  reportEvent("request_failed", { method: request.method, route: context.routePath, kind: context.routeType });
};
