export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const country = request.headers.get("cf-ipcountry") || "XX";

    if (url.pathname.startsWith("/secure/")) {
      const code = url.pathname.split("/")[2]?.toUpperCase();
      const object = await env.FLAGS_BUCKET.get(`${code}.png`);
      if (!object) return new Response("Flag Not Found", { status: 404 });
      return new Response(object.body, { headers: { "Content-Type": "image/png" } });
    }

    return new Response(`<h1>Your country is ${country}</h1>`, {
      headers: { "Content-Type": "text/html" }
    });
  }
};
