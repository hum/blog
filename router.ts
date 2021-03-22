import { Parser, Router, RouterContext, send, Status } from "./deps.ts";

const router = new Router();
const parser = new Parser();

router
  .get("/", getIndex)
  .get("/articles/:filename", getArticle)
  .get("/static/:filename", getCSS);

async function getIndex(ctx: RouterContext) {
  ctx.render("index", { articles: await parser.getArticleList() });
}

async function getArticle(ctx: RouterContext) {
  const filename: string | undefined = ctx.params.filename;
  if (filename) {
    const article = parser.getArticle(filename);
    if (article) {
      if (!article.body) {
        article.body = await parser.createMarkdownFromText(article);
      }
      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = article.body;
      return;
    }
    notFound(ctx, "Article was not found.");
    return;
  }
  // Maybe redirect instead?
  notFound(ctx, "Filename was not found.");
}

async function getCSS(ctx: RouterContext) {
  const filename: string | undefined = ctx.params.filename;
  if (filename) {
    await send(ctx, filename, {
      root: `${Deno.cwd()}/static`,
    });
  }
}

function notFound(ctx: RouterContext, message: string) {
  ctx.response.status = Status.NotFound;
  ctx.render("notfound", { text: message });
}

export { router };
