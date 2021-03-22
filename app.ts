import {
  adapterFactory,
  Application,
  engineFactory,
  isHttpError,
  viewEngine,
} from "./deps.ts";
import { router } from "./router.ts";

const HOSTNAME = Deno.env.get("BLOG_HOSTNAME") ?? "0.0.0.0";
const PORT = Deno.env.get("BLOG_PORT") ?? "8080";

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
        ctx.response.body = { message, status, stack };
        ctx.response.type = "json";
      } else {
        ctx.response.body = `${status} ${message}\n\n ${stack ?? ""}`;
        ctx.response.type = "text/plain";
      }
    } else {
      // TODO:
      // Log to log file instead
      console.log(err);
      throw err;
    }
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

/* 
  TODO:
    Create 404 page
*/

/* TODO:
    Add more even listeners for the purpose of logging
*/
app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`Listening on ${url}`);
});

async function run(hostname: string, port: number) {
  const location: string | undefined = Deno.env.get("BLOG_ENV");
  try {
    // Only serve over HTTPS in production
    if (location && location == "PRODUCTION") {
      await app.listen({
        hostname: hostname,
        port: port,
        secure: true,
        // TODO:
        // Move TSL/SSL to the reverse-proxy layer
        certFile: "./.conf/tls/cert.crt",
        keyFile: "./.conf/tls/key.key",
      });
    } else {
      await app.listen({
        hostname: hostname,
        port: port,
      });
    }
  } catch (err) {
    // TODO:
    // log errors into a rotating log file
    console.log(err);
    throw err;
  }
}

if (import.meta.main) {
  await run(HOSTNAME, Number(PORT));
}
