import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createCoach,CoachError} from './coach.mjs';

const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
export function createAppServer(coach=createCoach()){
  let active=false;
  return createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    const json=(status,body)=>{if(res.destroyed)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
    // Keep the model on loopback and reject cross-site browser requests.
    if(!/^((localhost|127\.0\.0\.1)(:\d+)?|\[::1\](:\d+)?)$/.test(req.headers.host||''))return json(403,{error:'Open this demo using its localhost address.'});
    const origin=req.headers.origin;
    if(origin&&origin!==`http://${req.headers.host}`)return json(403,{error:'Cross-site requests are not allowed.'});
    try{
      const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(pathname==='/api/status'&&req.method==='GET')return json(200,await coach.status());
      if(pathname==='/api/coach'){
        if(req.method!=='POST')return json(405,{error:'Use POST for coaching.'});
        if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'Send JSON for coaching.'});
        if(active)return json(503,{error:'Pip is finishing another request. Please try again shortly.'});
        let raw='';
        for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>20000)return json(413,{error:'This explanation is too long.'});}
        let input;try{input=JSON.parse(raw);}catch{return json(400,{error:'The coaching request was not valid JSON.'});}
        if(active)return json(503,{error:'Pip is finishing another request. Please try again shortly.'});
        const controller=new AbortController();
        res.on('close',()=>controller.abort());active=true;
        try{return json(200,await coach.respond(input,controller.signal));}
        finally{active=false;}
      }
      if(pathname.startsWith('/api/'))return json(404,{error:'This coaching endpoint does not exist.'});
      if(!['GET','HEAD'].includes(req.method))return json(405,{error:'Method not allowed.'});
      const filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
      if(!filename.startsWith(root+path.sep))return json(403,{error:'Forbidden'});
      let data;try{data=await readFile(filename);}catch{return json(404,{error:'File not found.'});}
      res.writeHead(200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:data);
    }catch(error){
      if(error instanceof CoachError)return json(error.status,{error:error.message});
      console.error(`Coaching request failed (${error.name||'Error'}).`);
      return json(502,{error:'The local tutor could not finish. Check that Ollama is running, then retry. Your answers are kept.'});
    }
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  createAppServer().listen(4173,'127.0.0.1',()=>console.log('ExplainBack is running at http://127.0.0.1:4173 — local GPT-OSS coaching enabled when Ollama is available.'));
}
