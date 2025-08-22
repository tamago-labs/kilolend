import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
};

app.prepare().then(() => {
    createServer(httpsOptions, (req ,res) => {
        const parsedUrl = parse(req.url || '', true);
        handle(req, res, parsedUrl);
    }).listen(443, () => {
        console.log('> ✅ HTTPS server running at https://localhost');
    });
});