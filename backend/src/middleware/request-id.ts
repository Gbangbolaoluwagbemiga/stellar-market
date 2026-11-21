import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { runWithRequestContext } from "../lib/request-context";

const REQUEST_ID_MAX_LENGTH = 128;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

function isValidRequestId(value: string): boolean {
  return value.length > 0 && value.length <= REQUEST_ID_MAX_LENGTH && REQUEST_ID_PATTERN.test(value);
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incomingRequestId = req.header("X-Request-ID")?.trim();
  const requestId = incomingRequestId && isValidRequestId(incomingRequestId) ? incomingRequestId : randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  runWithRequestContext({ requestId }, () => next());
}
