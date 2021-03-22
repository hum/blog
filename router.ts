import { Router, RouterContext } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import parser from "./parser.ts";
import { send } from "./deps.ts";

const router = new Router();

router
  .get("/", getIndex)
  .get("/articles/:filename", getArticle)
  .get("/static/:filename", getCSS);

async function getIndex(ctx: RouterContext) {
  console.log("Rendering index.html");
  ctx.render("index", { articles: await parser.getArticleList() });
}

async function getArticle(ctx: RouterContext) {
  const filename: string | undefined = ctx.params.filename;
  console.log(`serving article file for ${filename}`);
  if (filename) {
    const article = parser.getArticle(filename);
    if (article) {
      if (!article.body) {
        article.body = await parser.createMarkdownFromText(
          article.text,
        );
      }
      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = article.body;
    }
    // TODO:
    // Handle article not found
  }
  // TODO:
  // Handle undefined filename
}

async function getCSS(ctx: RouterContext) {
  const filename: string | undefined = ctx.params.filename;
  console.log(`serving static file for ${filename}`);
  if (filename) {
    await send(ctx, filename, {
      root: `${Deno.cwd()}/static`,
    });
  }
}

export { router };
