import { Article, Marked, renderFile, walk } from "./deps.ts";

const articles: Article[] = [];

export class Parser {
  decoder: TextDecoder;
  encoder: TextEncoder;
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder("utf-8");
  }

  /* TODO:
        1. Refactor
        2. Error checking
  */
  async createMarkdownFromText(article: Article): Promise<Uint8Array> {
    const markdown = this.decoder.decode(this.encoder.encode(article.text));
    const markup = Marked.parse(markdown);
    const output = await renderFile(`${Deno.cwd()}/view/article.ejs`, {
      title: article.title,
      articleText: markup.content,
    });
    /* TODO:
          Maybe have a better way to calculate the size
          rather than a hard-coded length of "10,000"
    */
    const result = new Uint8Array(10000);
    await output.read(result);
    return result;
  }

  getArticle(filename: string): Article | undefined {
    for (const article of articles) {
      if (article.filename === filename) {
        return article;
      }
    }
    return undefined;
  }

  /* TODO:
        Allow fetching articles (Markdown files) from a specific URL
  */
  async getArticleList(): Promise<Article[]> {
    if (articles.length > 0) {
      return articles;
    }
    for await (
      const file of walk("./articles", {
        exts: [".md"],
      })
    ) {
      articles.push(await this.createArticle(file.path));
    }
    return articles;
  }

  /* TODO:
        Include time/date metadata into the files for sorting purposes
        e.g.: <meta date="1-1-1970">
  */
  async createArticle(filepath: string): Promise<Article> {
    const text = await Deno.readTextFile("./" + filepath);
    const [title, description, date] = this.getMetadata(text);

    return {
      filename: filepath.split("/")[1],
      title: title,
      description: description,
      date: date,
      text: text,
      link: filepath,
    };
  }

  private getMetadata(data: string): string[] {
    const line = data.split("\n")[0];
    return this.getValueFromMetadata(line);
  }

  private getValueFromMetadata(tag: string): string[] {
    // Only matches values inside of quotation marks
    // -- this is terrible and ad-hoc, but it's working
    // e.g: <meta name="val">
    // returns: val
    const regexp = new RegExp('"([^"]+)"', "g");
    const data = [...tag.matchAll(regexp)];
    const result: string[] = [];

    for (const value of data) {
      result.push(value[1]);
    }
    return result;
  }
}
