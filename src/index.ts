import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import { responseMiddleware } from "./middleware/response";

const app = new Hono().basePath("/api");

app.use(responseMiddleware);

app.get("/dolar", async (c) => {
  let dolarValue = "";

  try {
    const result = await fetch("https://www.bcv.org.ve/", {
      tls: {
        rejectUnauthorized: false,
      },
    });

    const rewriter = new HTMLRewriter();

    rewriter.on("div#dolar strong", {
      text(text) {
        if (text.text) {
          dolarValue = text.text;
        }
      },
    });

    await rewriter.transform(result).text();

    return c.json(
      {
        dolar: parseFloat(dolarValue.replace(",", ".")),
      },
      200
    );
  } catch (e) {
    console.error(e);
    return c.json(
      {
        message: e,
      },
      500
    );
  }
});

app.onError((err, c) => {
  const statusCode: StatusCode = 500;
  const content: Record<string, unknown> = { message: "Internal server error" };

  return c.json(content, statusCode);
});

app.notFound((c) => {
  return c.json({ route: `Route ${c.req.path} not found` }, 404);
});

export default app;
