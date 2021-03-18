import { Application, send } from "./deps.ts";
import { adapterFactory, engineFactory, viewEngine } from "./deps.ts";
import { router } from "./router.ts";
import parser from "./parser.ts";

const HOSTNAME = Deno.env.get("BLOG_HOSTNAME") ?? "0.0.0.0";
const PORT = Deno.env.get("BLOG_PORT") ?? "8080";

const app = new Application();
const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

app.use(viewEngine(oakAdapter, ejsEngine, {
  viewRoot: "view",
  viewExt: ".ejs",
}));
app.use(router.routes());
app.use(router.allowedMethods());

/* TODO:
    1. Proper erorr logging to a file
    2. Proper handling of the actual errors -- maybe wrappers around them?
*/
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    throw err;
  }
});

/* TODO:
    1. Properly bundle up css files -- compress
    2. Route through router.ts
*/
app.use(async (ctx, next) => {
  const filepath = ctx.request.url.pathname;

  if (filepath.includes(".css")) {
    await send(ctx, filepath, {
      root: `${Deno.cwd()}`,
      gzip: true,
    });
  }
  await next();
});

/* TODO:
    1. Refactor
    2. Error checking
    3. Redirecting to 404 if bad path
*/
app.use(async (ctx, next) => {
  const filepath = ctx.request.url.pathname;

  if (filepath.includes("/articles") && filepath.includes(".md")) {
    const articleFilename = filepath.split("/")[2];

    const article = parser.getArticle(articleFilename);
    if (article) {
      if (!article.body) {
        // Cache the parsed markdown body
        article.body = await parser.createMarkdownFromText(
          article.text,
        );
      }
      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = article.body;
    }
  }
});

/* TODO:
    Add more even listeners for the purpose of logging
*/
app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on ${url}`);
});

/* TODO:
    Error checking
*/
async function run(hostname: string, port: number) {
  const location: string | undefined = Deno.env.get("BLOG_ENV");
  // Only serve over HTTPS in production
  if (location && location == "PRODUCTION") {
    await app.listen({
      hostname: hostname,
      port: port,
      secure: true,
      certFile: "./.conf/tls/cert.crt",
      keyFile: "./.conf/tls/key.key",
    });
  } else {
    await app.listen({
      hostname: hostname,
      port: port,
    });
  }
}

if (import.meta.main) {
  await run(HOSTNAME, Number(PORT));
}
