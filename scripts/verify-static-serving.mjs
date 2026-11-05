import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const candidateDirs = [
  path.resolve("dist", "client"),
  path.resolve(".output", "public"),
];
const publicDir = candidateDirs.find((d) => fs.existsSync(d)) || path.resolve("dist", "client");
console.log(`Verifying static serving from directory: ${publicDir}`);

const server = http.createServer((req, res) => {
  let urlPath = req.url || "/";
  // Strip query strings
  urlPath = urlPath.split("?")[0];

  // If request begins with /Boosting-Lab, strip prefix
  if (urlPath.startsWith("/Boosting-Lab")) {
    urlPath = urlPath.slice("/Boosting-Lab".length);
  }

  if (urlPath === "" || urlPath === "/") {
    urlPath = "/index.html";
  }

  let filePath = path.join(publicDir, urlPath);

  // If path is a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  // If file doesn't exist, check if filePath + .html exists, or fallback to 404.html
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    } else {
      filePath = path.join(publicDir, "404.html");
      res.statusCode = 404;
    }
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".json": "application/json",
      ".woff2": "font/woff2",
    };
    res.setHeader("Content-Type", mimeMap[ext] || "application/octet-stream");
    const content = fs.readFileSync(filePath);
    res.end(content);
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(0, "127.0.0.1", async () => {
  const address = server.address();
  const port = address.port;
  console.log(`Verification static server listening at http://127.0.0.1:${port}/Boosting-Lab/`);

  async function check(url, expectedStatus, expectedContentSnippet) {
    try {
      const resp = await fetch(`http://127.0.0.1:${port}${url}`);
      const text = await resp.text();
      const statusOk = resp.status === expectedStatus;
      const contentOk = expectedContentSnippet ? text.includes(expectedContentSnippet) : true;
      if (statusOk && contentOk) {
        console.log(`[PASS] ${url} -> Status ${resp.status}`);
        return true;
      } else {
        console.error(`[FAIL] ${url} -> Status ${resp.status} (expected ${expectedStatus}), snippet match: ${contentOk}`);
        return false;
      }
    } catch (err) {
      console.error(`[ERROR] ${url} -> ${err.message}`);
      return false;
    }
  }

  const results = [];
  results.push(await check("/Boosting-Lab/", 200, "Boosting Lab"));
  results.push(await check("/Boosting-Lab/fundamentals", 200, "Fundamentals of Boosting"));
  results.push(await check("/Boosting-Lab/adaboost", 200, "AdaBoost: Adaptive Boosting"));
  results.push(await check("/Boosting-Lab/gradient-boosting", 200, "Gradient Boosting Machines"));
  results.push(await check("/Boosting-Lab/xgboost", 200, "XGBoost: Extreme Gradient Boosting"));
  results.push(await check("/Boosting-Lab/algorithms", 200, "Modern Boosting"));
  results.push(await check("/Boosting-Lab/implementation", 200, "Implementation"));
  results.push(await check("/Boosting-Lab/hyperparameters", 200, "Hyperparameter"));
  results.push(await check("/Boosting-Lab/advanced", 200, "Advanced Boosting Techniques"));
  results.push(await check("/Boosting-Lab/case-study", 200, "Credit Risk"));
  results.push(await check("/Boosting-Lab/resources", 200, "Resources &amp; Bibliography"));
  results.push(await check("/Boosting-Lab/unknown-subroute", 404, "Boosting Lab"));

  server.close(() => {
    const allPassed = results.every(Boolean);
    console.log(`Static server verification: ${allPassed ? "ALL 12 TESTS PASSED" : "FAILURES DETECTED"}`);
    process.exit(allPassed ? 0 : 1);
  });
});
