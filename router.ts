import { Context, Router } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import Article from "./models/article.ts";
import parser from "./parser.ts";

const router = new Router();

router.get("/", async (ctx) => {
  ctx.render("index", { articles: await parser.getArticleList() });
});

export default router;
