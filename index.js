export default {
  async fetch(request, env) {

    
    // CREATE AN OBJECT FROM THE URL AND GRAB THE PATH FROM IT
    const url = new URL(request.url);
    const path = url.pathname;

    
    // GET THE HEADERS FROM INBOUND REQUEST AND THE TIME
    const email = request.headers.get("cf-access-authenticated-user-email") || "Unknown User";
    const country = request.headers.get("cf-ipcountry") || "XX";
    const timestamp = new Date().toUTCString();

    
    // GET THE FLAG FROM R2 AND RETURN IN RESPONSE
    if (path.startsWith("/secure/") && path.split("/")[2]) {
      const targetCountry = path.split("/")[2].toLowerCase();
      const fileName = `${targetCountry}.png`;
      const object = await env.FLAGS_BUCKET.get(fileName);
      if (object === null) {
        return new Response("Flag asset not found in R2", { status: 404 });
      }
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("Content-Type", "image/png");   // SET THE CONTENT TYPE
      return new Response(object.body, { headers });
    }

    
    // CREATE VARIABLE CONTAINING HTML AND THE LITERALS DEFINED ABOVE AND RETURN IN RESPONSE
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
