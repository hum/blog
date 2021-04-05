import { RouterContext, send } from "../deps.ts";
import { Parser } from "../parser.ts";

const parser = new Parser();

export async function getIndex(ctx: RouterContext) {
    ctx.render("index", {articles: await parser.getArticleList()});
}

export async function getCSS(ctx: RouterContext) {
    const filename: string | undefined = ctx.params.filename;
    if (filename) {
        await send(ctx, filename, {
            root: `${Deno.cwd()}/static`
        });
    }
}