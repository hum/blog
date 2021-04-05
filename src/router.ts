import { Router, RouterContext, send, Status } from "./deps.ts";
import { Parser } from "./parser.ts";

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
  if (!filename) {
    // TODO:
    // Better handling
    throw new Error("Could not find filename");
  }
  const article = parser.getArticle(filename);
  if (!article) {
    notFound(ctx, "Could not find article");
    return;
  }
  if (!article.body) {
    article.body = await parser.createMarkdownFromText(article);
  }
  ctx.response.type = "text/html";
  ctx.response.body = article.body;
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
