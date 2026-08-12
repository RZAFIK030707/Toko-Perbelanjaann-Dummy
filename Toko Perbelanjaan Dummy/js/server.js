const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const publicRoot = path.join(__dirname, '..');
const dataDir = path.join(publicRoot, 'data');
const contactsFile = path.join(dataDir, 'contacts.json');
const ordersFile = path.join(dataDir, 'orders.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function parseRequestBody(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > 1e6) {
      req.connection.destroy();
    }
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body || '{}');
      callback(null, data);
    } catch (error) {
      callback(error);
    }
  });
}

function appendToJsonFile(filePath, data, callback) {
  ensureDataDir();
  fs.readFile(filePath, 'utf8', (err, content) => {
    let list = [];
    if (!err && content) {
      try {
        list = JSON.parse(content);
      } catch (error) {
        list = [];
      }
    }

    list.push(data);
    fs.writeFile(filePath, JSON.stringify(list, null, 2), 'utf8', callback);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {});
    return;
  }

  if (pathname === '/api/contact' && req.method === 'POST') {
    parseRequestBody(req, (err, body) => {
      if (err) {
        sendJson(res, 400, { error: 'Payload JSON tidak valid.' });
        return;
      }

      const { name, email, message } = body;
      if (!name || !email || !message) {
        sendJson(res, 400, { error: 'Semua kolom harus diisi.' });
        return;
      }

      const entry = {
        id: Date.now(),
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      };

      appendToJsonFile(contactsFile, entry, (writeErr) => {
        if (writeErr) {
          sendJson(res, 500, { error: 'Gagal menyimpan data kontak.' });
          return;
        }

        sendJson(res, { message: 'Pesan kontak berhasil diterima.' });
      });
    });

    return;
  }

  if (pathname === '/api/order' && req.method === 'POST') {
    parseRequestBody(req, (err, body) => {
      if (err) {
        sendJson(res, 400, { error: 'Payload JSON tidak valid.' });
        return;
      }

      const { name, phone, address, payment, cart } = body;
      if (!name || !phone || !address || !payment || !Array.isArray(cart)) {
        sendJson(res, 400, { error: 'Data pesanan tidak lengkap.' });
        return;
      }

      const order = {
        id: Date.now(),
        name,
        phone,
        address,
        payment,
        cart,
        createdAt: new Date().toISOString(),
      };

      appendToJsonFile(ordersFile, order, (writeErr) => {
        if (writeErr) {
          sendJson(res, 500, { error: 'Gagal menyimpan data pesanan.' });
          return;
        }

        sendJson(res, { message: 'Pesanan berhasil diterima.' });
      });
    });

    return;
  }

  let filePath = path.join(publicRoot, 'html', 'index.html');
  if (pathname && pathname !== '/' && pathname !== '/index.html') {
    const safePath = pathname.replace(/^\/+/, '').replace(/\.\.(\/|\\)/g, '');
    filePath = path.join(publicRoot, safePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Halaman tidak ditemukan');
      return;
    }

    serveFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
