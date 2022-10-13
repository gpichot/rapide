import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express, {
  json,
  NextFunction,
  Request as ExRequest,
  Response as ExResponse,
  urlencoded,
} from "express";
import swaggerUi from "swagger-ui-express";
import { ValidateError } from "tsoa";

import { RegisterRoutes } from "../build/routes";

export const app = express();

app.use(
  cors({
    // FIXME
    origin: "*",
  })
);

const prisma = new PrismaClient();
// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());

app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    swaggerUi.generateHTML(await import("../build/swagger.json"), {})
  );
});

app.get("/swagger.json", async (_req: ExRequest, res: ExResponse) => {
  return res.json(await import("../build/swagger.json"));
});

RegisterRoutes(app);

app.use(function errorHandler(
  err: unknown,
  req: ExRequest,
  res: ExResponse,
  next: NextFunction
): ExResponse | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    });
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }

  next();
});
