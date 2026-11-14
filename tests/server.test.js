import test from 'node:test';
import assert from 'node:assert/strict';
import {createAppServer} from '../scripts/serve.mjs';

test('local API serves status, rejects cross-site traffic and leaves static files usable',async()=>{
  let calls=0;
  const server=createAppServer({status:async()=>({available:true,model:'test-local'}),respond:async()=>{calls++;return {question:'A locally generated question?'};}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    assert.equal((await fetch(base)).status,200);
    assert.equal((await(await fetch(base+'/api/status')).json()).available,true);
    assert.equal((await fetch(base+'/api/coach',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://unrelated.example'},body:'{}'})).status,403);
    assert.equal((await fetch(base+'/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'})).status,400);
    assert.equal((await fetch(base+'/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'a'.repeat(21000)})})).status,413);
    assert.equal((await fetch(base+'/api/coach',{method:'GET'})).status,405);
    assert.equal((await fetch(base+'/api/coach',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,200);
    assert.equal(calls,1);
  }finally{await new Promise(resolve=>server.close(resolve));}
});

test('only one model call runs at a time and cancelling a browser request aborts it',async()=>{
  let started,aborted;
  const entered=new Promise(resolve=>{started=resolve;});
  const cancelled=new Promise(resolve=>{aborted=resolve;});
  const server=createAppServer({status:async()=>({available:true}),respond:async(_input,signal)=>{
    started();
    await new Promise((resolve,reject)=>signal.addEventListener('abort',()=>{aborted();reject(new Error('Cancelled'));},{once:true}));
  }});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/api/coach`;
  const controller=new AbortController();
  const options={method:'POST',headers:{'Content-Type':'application/json'},body:'{}'};
  try{
    const pending=fetch(url,{...options,signal:controller.signal});
    const rejected=assert.rejects(pending);
    await entered;
    assert.equal((await fetch(url,options)).status,503);
    controller.abort();await rejected;
    await Promise.race([cancelled,new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('Model was not aborted')),1000);timer.unref();})]);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
