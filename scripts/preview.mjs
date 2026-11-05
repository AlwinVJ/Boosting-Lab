import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const port = Number(process.env["PORT"] || 3000);
const basePath = "/Boosting-Lab/";
const publicDir = path.resolve("dist", "client");

if (!fs.existsSync(publicDir)) {
  console.error("Error: dist/client directory does not exist. Run 'npm run build' first.");
  process.exit(1);
}

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  let pathname = url.pathname;

  // Redirect root / to /Boosting-Lab/
  if (pathname === "/" || pathname === "/Boosting-Lab") {
    res.writeHead(302, { Location: basePath });
    res.end();
    return;
  }

  // Strip basePath prefix
  if (pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length - 1);
  }

  let filePath = path.join(publicDir, pathname);

  // If path is directory or ends in /, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  let statusCode = 200;
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    // Check if :route.html exists
    if (fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    } else {
      // 404 fallback to 404.html (GitHub Pages SPA fallback)
      filePath = path.join(publicDir, "404.html");
      statusCode = 404;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    res.writeHead(statusCode, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(port, () => {
  console.log(`\n==================================================`);
  console.log(`  Boosting Lab — GitHub Pages Local Preview Server`);
  console.log(`==================================================`);
  console.log(`  Local URL:   http://localhost:${port}/Boosting-Lab/`);
  console.log(`  Root Redir:  http://localhost:${port}/ -> /Boosting-Lab/`);
  console.log(`  Serving:     ${publicDir}`);
  console.log(`==================================================\n`);
});
