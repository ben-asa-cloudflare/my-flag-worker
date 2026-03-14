export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const email = request.headers.get("cf-access-authenticated-user-email") || "Unknown User";
    const country = request.headers.get("cf-ipcountry") || "XX";
    const timestamp = new Date().toUTCString();

    if (path.startsWith("/secure/") && path.split("/")[2]) {
      const targetCountry = path.split("/")[2].toLowerCase();
      const fileName = `${targetCountry}.png`;

      const object = await env.FLAGS_BUCKET.get(fileName);

      if (object === null) {
        return new Response("Flag asset not found in R2", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Content-Type", "image/png"); // Appropriate content type
      return new Response(object.body, { headers });
    }

    if (path === "/secure" || path === "/secure/") {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <body>
          <p>${email} authenticated at ${timestamp} from 
            <a href="/secure/${country.toLowerCase()}">${country}</a>
          </p>
        </body>
        </html>
      `;

      return new Response(htmlContent, {
        headers: { "Content-Type": "text/html" },
      });
    }
    
  },
};
