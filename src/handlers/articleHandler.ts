import { RouterContext, Status } from "../deps.ts";
import { Parser } from "../parser.ts";

const parser = new Parser();

export async function getArticle(ctx: RouterContext) {
    const filename: string | undefined = ctx.params.filename;
    if (!filename) {
        // TODO:
        // Better handling
        throw new Error("Could not find filename");
    }
    const article = parser.getArticle(filename);
    if (!article) {
        articleNotFound(ctx, `Could not find the article ${filename}`);
        return;
    }
    if (!article.body) {
        article.body = await parser.createMarkdownFromText(article);
    }
    ctx.response.type = "text/html";
    ctx.response.body = article.body;
}

function articleNotFound(ctx: RouterContext, message: string) {
    ctx.response.status = Status.NotFound;
    ctx.render("notFound", {text: message})
}