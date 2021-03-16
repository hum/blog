import { Context, Router } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import parser from "./parser.ts";

const router = new Router();

router.get("/", async (ctx) => {
  ctx.render("index", { articles: await parser.getArticleList() });
});

/* TODO:
  * 1. Route all traffic through this router
  * 2. Handle improper calls outside of the specified paths
  */
export { router };
