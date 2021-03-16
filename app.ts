import { Application, send } from "./deps.ts";
import { adapterFactory, engineFactory, viewEngine } from "./deps.ts";
import router from "./router.ts";
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

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err);
    throw err;
  }
});

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

app.use(async (ctx, next) => {
  const filepath = ctx.request.url.pathname;

  if (filepath.includes("/articles") && filepath.includes(".md")) {
    const articleFilename = filepath.split("/")[2];

    const article = parser.getArticle(articleFilename);
    if (article) {
      const body: Uint8Array = await parser.createMarkdownFromText(
        article.text,
      );
      ctx.response.headers.set("Content-Type", "text/html");
      ctx.response.body = body;
    }
  }
});

app.addEventListener('listen', ({secure, hostname, port}) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on ${url}`)
})

async function run(hostname: string, port: number) {
  console.log(`>>> Server is running at ${hostname}:${port}`);
  await app.listen({
    port: port
  });
}

if (import.meta.main) {
  await run(HOSTNAME, Number(PORT));
}
