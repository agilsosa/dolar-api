import { createMiddleware } from 'hono/factory'
import type { StatusCode } from "hono/utils/http-status";
import { z } from "zod";

const responseSchema = z.record(z.string(), z.unknown()).optional();

const errorResponseSchema = z.object({
    message: z.string(),
    code: z.union([z.string(), z.number()]).optional(),
    data: z.unknown().optional(),
});

export const responseMiddleware = createMiddleware(async (c, next) => {
    await next();

    const statusCode = c.res.status;

    const result = responseSchema.safeParse(await c.res.clone().json());

    if (result.error) {
        console.error("Error in JSON structure:");
        console.error(JSON.stringify(result.error.issues, null, 2));
    }

    c.status(statusCode as StatusCode);

    if (statusCode >= 200 && statusCode <= 399 && statusCode) {
        c.res = c.json({
            status: "success",
            data: result.data,
        });
    } else if (statusCode >= 400 && statusCode <= 499) {
        c.res = c.json({
            status: "fail",
            data: result.data,
        });
    } else if (statusCode >= 500) {
        const errorResult = errorResponseSchema.safeParse(
            await c.res.clone().json()
        );

        if (errorResult.error) {
            console.error("Error in JSON structure:");
            console.error(JSON.stringify(errorResult.error.issues, null, 2));
            throw new Error("Error in JSON structure");
        }

        c.res = c.json({
            status: "error",
            message: errorResult.data.message,
            code: errorResult.data.code,
            data: errorResult.data.data,
        });
    }
});