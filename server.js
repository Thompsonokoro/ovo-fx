const http = require('http');
const fs = require('fs');
const path = require('path');

async function metaFetch(url, token){
  const r = await fetch(url, { headers: { 'auth-token': token } });
  const text = await r.text();
  if(!r.ok) throw new Error('MetaAPI '+r.status+' - '+text.slice(0,120));
  return JSON.parse(text);
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'auth-token, content-type');
  if(req.method === 'OPTIONS'){ res.writeHead(200); return res.end(); }
  try{
    if(req.url === '/api/accounts'){
      const data = await metaFetch('https://mt-provisioning-api-v1.agiliumtrade.ai/users/current/accounts', req.headers['auth-token']);
      res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify(data));
    }
    const mInfo = req.url.match(/^\/api\/accounts\/([^\/]+)\/info$/);
    if(mInfo){
      const data = await metaFetch(`https://mt-client-api-v1.agiliumtrade.ai/users/current/accounts/${mInfo[1]}/account-information`, req.headers['auth-token']);
      res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify(data));
    }
    const mPos = req.url.match(/^\/api\/accounts\/([^\/]+)\/positions$/);
    if(mPos){
      const data = await metaFetch(`https://mt-client-api-v1.agiliumtrade.ai/users/current/accounts/${mPos[1]}/positions`, req.headers['auth-token']);
      res.writeHead(200, {'Content-Type':'application/json'}); return res.end(JSON.stringify(data));
    }
  }catch(e){
    res.writeHead(500, {'Content-Type':'application/json'}); return res.end(JSON.stringify({error:e.message}));
  }
  let file = req.url === '/' ? '/index.html' : req.url;
  let filePath = path.join(__dirname, file);
  if(!fs.existsSync(filePath)){ filePath = path.join(__dirname, 'index.html'); }
  res.writeHead(200, {'Content-Type':'text/html'}); res.end(fs.readFileSync(filePath));
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> console.log('OVO FX running on '+PORT));
