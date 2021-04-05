import { Router, RouterContext, send, Status } from "./deps.ts";
import * as handlers from "./handlers.ts";

const router = new Router();

router
  .get("/", handlers.getIndex)
  .get("/articles/:filename", handlers.getArticle)
  .get("/static/:filename", handlers.getCSS);

export { router };
