import {
  adapterFactory,
  Application,
  engineFactory,
  isHttpError,
  log,
  viewEngine,
} from "./deps.ts";
import { router } from "./router.ts";

const HOSTNAME = Deno.env.get("BLOG_HOSTNAME") ?? "0.0.0.0";
const PORT = Deno.env.get("BLOG_PORT") ?? "8080";
const OUTSIDE_PORT = Deno.env.get("OUTSIDE_PORT") ?? "0000";

const app = new Application();
const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();

app.use(viewEngine(oakAdapter, ejsEngine, {
  viewRoot: "view",
  viewExt: ".ejs",
}));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      ctx.response.status = err.status;
      const { message, status, stack } = err;
      if (ctx.request.accepts("json")) {
        ctx.response.body = { message, status };
        ctx.response.type = "json";
      } else {
        ctx.response.body = `${status} ${message}`;
        ctx.response.type = "text/plain";
      }
    }
    throw err;
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("error", (event) => {
  log.error(event.error);
});

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  const outUrl = `${protocol}${hostname ?? "localhost"}:${OUTSIDE_PORT}`;
  console.log(`Listening on:\n   -> Container URL: ${url}\n   -> Outside URL: ${outUrl}`);
});

/* 
  TODO:
  Handle HTTP ConnectionReset error.
    as described in: https://github.com/denoland/deno/issues/8107
*/
async function run(hostname: string, port: number) {
  const location: string | undefined = Deno.env.get("BLOG_ENV");
  // Only serve over HTTPS in production
  if (location && location == "PRODUCTION") {
    await app.listen({
      hostname: hostname,
      port: port,
      secure: true,
      // TODO:
      // Move TSL/SSL to the reverse-proxy layer
      certFile: "../.conf/tls/cert.crt",
      keyFile: "../.conf/tls/key.key",
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
