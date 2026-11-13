// Zero-dependency Node server for the App Service slot-swap demo.
// Change VERSION and COLOR on the staging branch, then swap.
const http = require('http');

const VERSION = 'v2';
const COLOR = '#1f9d55';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    return res.end('ok');
  }

  // WEBSITE_SLOT_NAME is not set on this Linux app, so derive the slot from
  // the first part of the host name (a staging slot's host contains "-staging").
  const host = process.env.WEBSITE_HOSTNAME || '';
  const slot = process.env.WEBSITE_SLOT_NAME ||
    (host ? (host.split('.')[0].includes('-staging') ? 'staging' : 'Production') : 'local');
  const slotLabel = process.env.SLOT_LABEL || '(not set)';
  const message = process.env.APP_MESSAGE || '(not set)';
  const instance = process.env.WEBSITE_INSTANCE_ID
    ? process.env.WEBSITE_INSTANCE_ID.slice(0, 8)
    : 'local';

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AZ-104 lab ${VERSION}</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: ${COLOR}; color: #fff;
           min-height: 100vh; display: grid; place-items: center; }
    main { background: rgba(0,0,0,.25); padding: 2rem 3rem; border-radius: 12px; }
    h1 { margin: 0 0 1rem; font-size: 3rem; }
    td { padding: .25rem 1rem .25rem 0; }
  </style>
</head>
<body>
  <main>
    <h1>${VERSION}</h1>
    <table>
      <tr><td>Slot (platform)</td><td>${slot}</td></tr>
      <tr><td>SLOT_LABEL (sticky)</td><td>${slotLabel}</td></tr>
      <tr><td>APP_MESSAGE (swaps)</td><td>${message}</td></tr>
      <tr><td>Instance</td><td>${instance}</td></tr>
    </table>
  </main>
</body>
</html>`);
});

server.listen(process.env.PORT || 8080);
