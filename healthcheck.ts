const HOSTNAME = Deno.env.get("BLOG_HOSTNAME") ?? "0.0.0.0";
const PORT = Deno.env.get("BLOG_PORT") ?? "8080";
const PROTOCOL = Deno.env.get("BLOG_ENV") ?? "http://";

const isHealthy = async (): Promise<boolean> => {
  const url = PROTOCOL + HOSTNAME + ":" + PORT;
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
  });

  if (response.status == 200) {
    return true;
  }
  return false;
};

if (import.meta.main) {
  const result = await isHealthy();
  if (result) {
    Deno.exit(0);
  }
  Deno.exit(1);
}
