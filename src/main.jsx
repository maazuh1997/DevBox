import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Braces, KeyRound, Fingerprint, Binary, Hash, Regex, Clock3, Link2,
  QrCode, Palette, Globe2, FileText, Database, Search, Settings, Star,
  Copy, Check, Download, Trash2, Menu, X, Sun, Moon, Sparkles, ChevronRight,
  ShieldCheck, Zap, Lock, Command, RotateCcw, Maximize2
} from "lucide-react";
import "./styles.css";

const tools = [
  {id:"json", name:"JSON Formatter", desc:"Format, validate and minify JSON", icon:Braces, category:"Formatters"},
  {id:"jwt", name:"JWT Decoder", desc:"Inspect JWT header and payload", icon:KeyRound, category:"Security"},
  {id:"uuid", name:"UUID Generator", desc:"Generate secure random UUIDs", icon:Fingerprint, category:"Generators"},
  {id:"base64", name:"Base64", desc:"Encode and decode Base64 text", icon:Binary, category:"Encoding"},
  {id:"hash", name:"Hash Generator", desc:"Create SHA-256, SHA-384 and SHA-512 hashes", icon:Hash, category:"Security"},
  {id:"regex", name:"Regex Tester", desc:"Test regular expressions instantly", icon:Regex, category:"Text"},
  {id:"timestamp", name:"Timestamp Converter", desc:"Convert Unix timestamps and dates", icon:Clock3, category:"Converters"},
  {id:"url", name:"URL Encoder", desc:"Encode, decode and inspect URLs", icon:Link2, category:"Encoding"},
  {id:"qr", name:"QR Generator", desc:"Create QR codes locally", icon:QrCode, category:"Generators"},
  {id:"color", name:"Color Converter", desc:"Convert HEX, RGB and HSL colors", icon:Palette, category:"Converters"},
  {id:"http", name:"HTTP Tester", desc:"Send requests from your browser", icon:Globe2, category:"Network"},
  {id:"markdown", name:"Markdown", desc:"Preview and format Markdown", icon:FileText, category:"Text"},
  {id:"sql", name:"SQL Formatter", desc:"Clean up SQL queries", icon:Database, category:"Formatters"},{id:"json-diff",name:"JSON Diff",desc:"Compare JSON documents side by side.",category:"Formatters",icon:Braces},{id:"regex-workbench",name:"Regex Workbench",desc:"Live matches, groups and replacement preview.",category:"Text",icon:Regex},{id:"hash-generator",name:"Hash Generator",desc:"SHA hashes for text, locally in your browser.",category:"Security",icon:Hash},{id:"curl-builder",name:"cURL Builder",desc:"Build and copy production-ready cURL commands.",category:"Network",icon:Globe2},{id:"http-client",name:"HTTP Client",desc:"Build, send and inspect HTTP requests.",category:"Network",icon:Globe2},{id:"sql-workbench",name:"SQL Workbench",desc:"Format and inspect SQL locally.",category:"Database",icon:Database},{id:"json-typescript",name:"JSON → TypeScript",desc:"Generate TypeScript interfaces from JSON.",category:"Code Generation",icon:Braces},{id:"openapi-workbench",name:"OpenAPI Workbench",desc:"Explore and inspect OpenAPI specifications.",category:"API",icon:Globe},{id:"data-transform",name:"Data Transform",desc:"Convert YAML, JSON and CSV locally.",category:"Data",icon:Globe2},{id:"jwt-inspector",name:"JWT Inspector",desc:"Decode JWT headers and claims.",category:"Security",icon:Globe2},{id:"markdown-studio",name:"Markdown Studio",desc:"Write and preview Markdown.",category:"Documentation",icon:Globe2},{id:"code-formatter",name:"Code Formatter",desc:"Format and minify code locally.",category:"Code",icon:Globe2},{id:"env-workbench",name:".env Workbench",desc:"Inspect and validate environment variables.",icon:Lock,category:"Security"},{id:"hash-hmac",name:"Hash & HMAC",desc:"Generate SHA hashes and HMAC signatures.",icon:Hash,category:"Security"},{id:"headers-inspector",name:"Headers Inspector",desc:"Inspect HTTP and security headers.",icon:Globe2,category:"Network"},{id:"diff-merge",name:"Diff & Merge",desc:"Compare and merge text or JSON.",icon:FileText,category:"Text"}];

const initialJson = `{
  "name": "DevBox",
  "version": 1,
  "features": ["fast", "private", "browser-based"],
  "active": true
}`;

function copyText(text, setCopied){
  navigator.clipboard?.writeText(text);
  setCopied(true);
  setTimeout(()=>setCopied(false), 1200);
}

function downloadText(name, text){
  const blob = new Blob([text], {type:"text/plain"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=name; a.click();
  URL.revokeObjectURL(url);
}

function uuid(){
  return crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{
    const r=Math.random()*16|0,v=c==="x"?r:(r&3|8); return v.toString(16);
  });
}

async function digest(text, algorithm){
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algorithm, data);
  return [...new Uint8Array(buf)].map(x=>x.toString(16).padStart(2,"0")).join("");
}

function jsonPretty(input){
  try { return {ok:true, value:JSON.stringify(JSON.parse(input),null,2)}; }
  catch(e){ return {ok:false, value:e.message}; }
}

function ToolShell({tool=tools[0], title, subtitle, children, value, onClear}){
  const [copied,setCopied]=useState(false);
  return <div className="tool-shell">
    <div className="tool-head">
      <div className="tool-title">
        <div className="tool-icon"><tool.icon size={19}/></div>
        <div><h2>{title||tool.name}</h2><p>{subtitle||tool.desc}</p></div>
      </div>
      <div className="tool-actions">
        {value !== undefined && <button className="tool-action-btn" title="Copy result" onClick={()=>copyText(String(value),setCopied)}>{copied?<Check size={15}/>:<Copy size={15}/>}<span>{copied?"Copied":"Copy"}</span></button>}
        {value !== undefined && <button className="tool-action-btn" title="Download result" onClick={()=>downloadText(`${tool.id}-output.txt`,String(value))}><Download size={15}/><span>Download</span></button>}
        {onClear && <button className="tool-action-btn subtle" title="Clear tool" onClick={onClear}><Trash2 size={15}/><span>Clear</span></button>}
      </div>
    </div>
    {children}
  </div>
}

function JsonTool(){
  const [input,setInput]=useState(localStorage.getItem("devbox-json")||initialJson);
  const [mode,setMode]=useState("pretty");
  const [sort,setSort]=useState(false);
  const [copied,setCopied]=useState(false);
  const result=useMemo(()=>{
    try{
      let parsed=JSON.parse(input);
      if(sort){
        const order=v=>{
          if(Array.isArray(v))return v.map(order);
          if(v&&typeof v==="object")return Object.keys(v).sort().reduce((o,k)=>(o[k]=order(v[k]),o),{});
          return v;
        };
        parsed=order(parsed);
      }
      return {ok:true,value:mode==="minify"?JSON.stringify(parsed):JSON.stringify(parsed,null,2)};
    }catch(e){
      const match=e.message.match(/position (\\d+)/i);
      const pos=match?Number(match[1]):null;
      const line=pos===null?null:input.slice(0,pos).split("\\n").length;
      return {ok:false,value:e.message,line};
    }
  },[input,mode,sort]);
  useEffect(()=>localStorage.setItem("devbox-json",input),[input]);
  useEffect(()=>{if(!input.trim())return;const timer=setTimeout(()=>window.__devboxAddHistory?.({toolId:"json",tool:"JSON Formatter",preview:input.slice(0,100)}),1000);return()=>clearTimeout(timer)},[input]);
  function loadFile(e){
    const file=e.target.files?.[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>setInput(String(reader.result));
    reader.readAsText(file);
  }
  return <ToolShell tool={tools[0]} value={result.ok?result.value:""} onClear={()=>setInput("")}>
    <div className="tool-controls">
      <div className="segmented"><button className={mode==="pretty"?"active":""} onClick={()=>setMode("pretty")}>Pretty</button><button className={mode==="minify"?"active":""} onClick={()=>setMode("minify")}>Minify</button></div>
      <label className="check"><input type="checkbox" checked={sort} onChange={e=>setSort(e.target.checked)}/> Sort keys</label>
      <label className="file-btn">Open JSON<input type="file" accept=".json,application/json" onChange={loadFile}/></label>
      <span className="hint">UTF-8 · local processing</span>
    </div>
    <div className="split">
      <Editor label="INPUT" value={input} onChange={setInput} placeholder='{"hello":"world"}'/>
      <Panel label="OUTPUT" status={result.ok?"Valid JSON":`Invalid JSON${result.line?` · line ${result.line}`:""}`} statusGood={result.ok}>
        <pre className={result.ok?"code":"error"}>{result.value}</pre>
      </Panel>
    </div>
    <div className="toolbar"><span className="hint">{input.length.toLocaleString()} characters · {input.split("\\n").length} lines</span><button className="text-btn" onClick={()=>copyText(result.ok?result.value:"",setCopied)}>{copied?<Check size={14}/>:<Copy size={14}/>} {copied?"Copied":"Copy output"}</button></div>
  </ToolShell>
}
function JwtTool(){
  const [input,setInput]=useState("");
  const [error,setError]=useState("");
  const [data,setData]=useState(null);
  function decodePart(part){
    const normalized=part.replace(/-/g,"+").replace(/_/g,"/");
    const padded=normalized+"=".repeat((4-normalized.length%4)%4);
    return JSON.parse(decodeURIComponent(atob(padded).split("").map(c=>"%"+("00"+c.charCodeAt(0).toString(16)).slice(-2)).join("")));
  }
  function decode(){
    try{
      const parts=input.trim().split(".");
      if(parts.length!==3)throw Error("A JWT must contain three dot-separated parts.");
      const header=decodePart(parts[0]),payload=decodePart(parts[1]);
      setData({header,payload,signature:parts[2]});setError("");
      window.__devboxAddHistory?.({toolId:"jwt",tool:"JWT Decoder",preview:input.slice(0,100)});
    }catch(e){setData(null);setError(e.message)}
  }
  const exp=data?.payload?.exp;
  const expDate=typeof exp==="number"?new Date(exp*1000):null;
  const expired=expDate?expDate.getTime()<Date.now():false;
  const claims=data?Object.entries(data.payload):[];
  return <ToolShell tool={tools[1]} value={data?JSON.stringify(data,null,2):""} onClear={()=>{setInput("");setData(null);setError("")}}>
    <Editor label="JWT TOKEN" value={input} onChange={setInput} placeholder="eyJhbGciOiJIUzI1NiIs..."/>
    <button className="primary" onClick={decode}>Decode JWT <ChevronRight size={16}/></button>
    {error&&<div className="alert error-box">{error}</div>}
    {data&&<>
      <div className="jwt-status"><div><span>ALGORITHM</span><strong>{data.header.alg||"—"}</strong></div><div><span>TYPE</span><strong>{data.header.typ||"—"}</strong></div><div className={expDate?(expired?"danger":"good-text"):""}><span>EXPIRATION</span><strong>{expDate?`${expired?"Expired":"Valid"} · ${expDate.toLocaleString()}`:"No exp claim"}</strong></div></div>
      <div className="cards"><Panel label="HEADER"><pre className="code">{JSON.stringify(data.header,null,2)}</pre></Panel><Panel label="PAYLOAD"><pre className="code">{JSON.stringify(data.payload,null,2)}</pre></Panel><Panel label="SIGNATURE"><pre className="code wrap">{data.signature}</pre></Panel></div>
      <div className="claims"><div className="panel-head">CLAIMS</div>{claims.map(([k,v])=><div className="claim" key={k}><code>{k}</code><span>{typeof v==="object"?JSON.stringify(v):String(v)}</span></div>)}</div>
    </>}
    <p className="security-note"><ShieldCheck size={15}/> Decoding is local. DevBox does not verify the token signature.</p>
  </ToolShell>
}
function UuidTool(){
  const [items,setItems]=useState([uuid(),uuid(),uuid()]);
  const out=items.join("\n");
  return <ToolShell tool={tools[2]} value={out} onClear={()=>setItems([])}>
    <div className="control-row"><label>COUNT <select value={items.length||1} onChange={e=>setItems(Array.from({length:+e.target.value},uuid))}>{[1,5,10,25,50,100].map(n=><option key={n}>{n}</option>)}</select></label><button className="primary" onClick={()=>setItems(Array.from({length:items.length||1},uuid))}><RotateCcw size={16}/> Regenerate</button></div>
    <Panel label="UUID V4"><pre className="code">{out}</pre></Panel>
  </ToolShell>
}

function Base64Tool(){
  const [input,setInput]=useState("");
  const [mode,setMode]=useState("encode");
  let output="";
  try{ output=mode==="encode"?btoa(unescape(encodeURIComponent(input))):decodeURIComponent(escape(atob(input))); }catch(e){output="Invalid Base64 input."}
  return <ToolShell tool={tools[3]} value={output} onClear={()=>setInput("")}>
    <div className="segmented wide"><button className={mode==="encode"?"active":""} onClick={()=>setMode("encode")}>Encode</button><button className={mode==="decode"?"active":""} onClick={()=>setMode("decode")}>Decode</button></div>
    <div className="split"><Editor label="INPUT" value={input} onChange={setInput} placeholder={mode==="encode"?"Text to encode":"Base64 to decode"}/><Panel label="OUTPUT"><pre className="code wrap">{output}</pre></Panel></div>
  </ToolShell>
}

function HashTool(){
  const [input,setInput]=useState("");
  const [hashes,setHashes]=useState({});
  async function run(){setHashes({sha256:await digest(input,"SHA-256"),sha384:await digest(input,"SHA-384"),sha512:await digest(input,"SHA-512")})}
  return <ToolShell tool={tools[4]} value={JSON.stringify(hashes,null,2)} onClear={()=>{setInput("");setHashes({})}}>
    <Editor label="TEXT" value={input} onChange={setInput} placeholder="Enter text to hash"/>
    <button className="primary" onClick={run}>Generate hashes <Hash size={16}/></button>
    <div className="hash-list">{Object.entries(hashes).map(([k,v])=><div className="hash-row" key={k}><span>{k.toUpperCase()}</span><code>{v}</code></div>)}</div>
  </ToolShell>
}

function RegexTool(){
  const [pattern,setPattern]=useState("\\b([A-Z][a-z]+)\\b");
  const [flags,setFlags]=useState("g");
  const [text,setText]=useState("Hello DevBox. Test Regex here.");
  const [replace,setReplace]=useState("");
  const [mode,setMode]=useState("match");
  let matches=[],error="",replacement="";
  try{
    const safeFlags=flags.includes("g")?flags:flags+"g";
    const r=new RegExp(pattern,safeFlags);
    matches=[...text.matchAll(r)];
    replacement=text.replace(r,replace);
  }catch(e){error=e.message}
  return <ToolShell tool={tools[5]} value={mode==="match"?matches.map(m=>m[0]).join("\\n"):replacement} onClear={()=>setText("")}>
    <div className="segmented wide"><button className={mode==="match"?"active":""} onClick={()=>setMode("match")}>Matches</button><button className={mode==="replace"?"active":""} onClick={()=>setMode("replace")}>Replace</button></div>
    <div className="inline-inputs"><input value={pattern} onChange={e=>setPattern(e.target.value)} placeholder="pattern"/><input className="small-input" value={flags} onChange={e=>setFlags(e.target.value)} placeholder="gim"/></div>
    <Editor label="TEST STRING" value={text} onChange={setText}/>
    {mode==="replace"&&<Editor label="REPLACEMENT" value={replace} onChange={setReplace} placeholder="Replacement text or $1 group"/>}
    {error?<div className="alert error-box">{error}</div>:mode==="match"?<Panel label={`MATCHES · ${matches.length}`}><div className="regex-results">{matches.map((m,i)=><div key={i}><span>#{i+1}</span><code>{m[0]}</code>{m.length>1&&<small>{m.slice(1).map((g,j)=><b key={j}>${j+1}: {g||"∅"}</b>)}</small>}</div>)}</div></Panel>:<Panel label="REPLACEMENT"><pre className="code wrap">{replacement}</pre></Panel>}
  </ToolShell>
}
function TimestampTool(){
  const [timestamp,setTimestamp]=useState(String(Math.floor(Date.now()/1000)));
  const [date,setDate]=useState(new Date().toISOString().slice(0,16));
  const parsed=Number(timestamp);
  const converted=Number.isFinite(parsed)?new Date(parsed*1000).toISOString():"Invalid timestamp";
  const dateTs=Number.isNaN(new Date(date).getTime())?"Invalid date":Math.floor(new Date(date).getTime()/1000);
  return <ToolShell tool={tools[6]} value={`${converted}\n${dateTs}`}>
    <div className="cards two"><Panel label="UNIX → DATE"><input value={timestamp} onChange={e=>setTimestamp(e.target.value)}/><div className="result">{converted}</div></Panel><Panel label="DATE → UNIX"><input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}/><div className="result">{dateTs}</div></Panel></div>
  </ToolShell>
}

function UrlTool(){
  const [input,setInput]=useState("");
  const [mode,setMode]=useState("encode");
  let output="";
  try{output=mode==="encode"?encodeURIComponent(input):decodeURIComponent(input)}catch(e){output="Invalid URL-encoded input."}
  return <ToolShell tool={tools[7]} value={output} onClear={()=>setInput("")}>
    <div className="segmented wide"><button className={mode==="encode"?"active":""} onClick={()=>setMode("encode")}>Encode</button><button className={mode==="decode"?"active":""} onClick={()=>setMode("decode")}>Decode</button></div>
    <div className="split"><Editor label="INPUT" value={input} onChange={setInput} placeholder="https://example.com/?q=hello world"/><Panel label="OUTPUT"><pre className="code wrap">{output}</pre></Panel></div>
  </ToolShell>
}

function QrTool(){
  const [text,setText]=useState("https://devbox.local");
  const qr=`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
  return <ToolShell tool={tools[8]} value={qr}>
    <Editor label="CONTENT" value={text} onChange={setText} placeholder="Text or URL"/>
    <div className="qr-area"><img src={qr} alt="Generated QR code"/><p>Preview uses a QR image service. Other DevBox tools remain fully client-side.</p></div>
  </ToolShell>
}

function ColorTool(){
  const [hex,setHex]=useState("#7c5cff");
  function hexToRgb(h){let x=h.replace("#","");if(x.length===3)x=x.split("").map(c=>c+c).join("");const n=parseInt(x,16);return {r:n>>16&255,g:n>>8&255,b:n&255}}
  const rgb=hexToRgb(hex);
  return <ToolShell tool={tools[9]} value={`HEX: ${hex}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}>
    <div className="color-work"><input className="color-picker" type="color" value={hex} onChange={e=>setHex(e.target.value)}/><input value={hex} onChange={e=>setHex(e.target.value)} /><div className="swatch" style={{background:hex}}/></div>
    <Panel label="VALUES"><div className="value-grid"><div><span>HEX</span><strong>{hex}</strong></div><div><span>RGB</span><strong>rgb({rgb.r}, {rgb.g}, {rgb.b})</strong></div></div></Panel>
  </ToolShell>
}

function HttpTool(){
  const [url,setUrl]=useState("https://jsonplaceholder.typicode.com/todos/1");
  const [method,setMethod]=useState("GET"); const [status,setStatus]=useState(""); const [body,setBody]=useState("");
  async function send(){
    setStatus("Loading…"); try{const r=await fetch(url,{method,headers:{"Content-Type":"application/json"},body:method==="GET"?undefined:body}); const t=await r.text();setStatus(`${r.status} ${r.statusText}\\n\\n${t}`)}catch(e){setStatus(`Request failed. Browser CORS policy may block this endpoint.\\n\\n${e.message}`)}
  }
  return <ToolShell tool={tools[10]} value={status} onClear={()=>setStatus("")}>
    <div className="http-line"><select value={method} onChange={e=>setMethod(e.target.value)}>{["GET","POST","PUT","PATCH","DELETE"].map(x=><option key={x}>{x}</option>)}</select><input value={url} onChange={e=>setUrl(e.target.value)}/><button className="primary" onClick={send}>Send</button></div>
    {method!=="GET"&&<Editor label="REQUEST BODY" value={body} onChange={setBody} placeholder='{"key":"value"}'/>}
    <Panel label="RESPONSE"><pre className="code wrap">{status||"Response will appear here."}</pre></Panel>
  </ToolShell>
}

function MarkdownTool(){
  const [input,setInput]=useState("# DevBox\n\nA **fast** developer toolkit.\n\n- Private\n- Browser-first\n- Free to use");
  function render(md){return md.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`(.*?)`/g,"<code>$1</code>").replace(/^- (.*)$/gm,"<li>$1</li>").replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>")}
  return <ToolShell tool={tools[11]} value={input}><div className="split"><Editor label="MARKDOWN" value={input} onChange={setInput}/><Panel label="PREVIEW"><div className="markdown-preview" dangerouslySetInnerHTML={{__html:render(input)}}/></Panel></div></ToolShell>
}

function SqlTool(){
  const [input,setInput]=useState("SELECT users.id, users.name, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.total > 100 ORDER BY orders.total DESC;");
  const [uppercase,setUppercase]=useState(true);
  const [indent,setIndent]=useState(2);
  const output=useMemo(()=>{
    let s=input.replace(/\s+/g," ").trim();
    const kws=["SELECT","FROM","LEFT JOIN","RIGHT JOIN","INNER JOIN","OUTER JOIN","JOIN","ON","WHERE","AND","OR","GROUP BY","HAVING","ORDER BY","LIMIT","OFFSET","UNION","VALUES","SET","RETURNING"];
    if(uppercase)kws.forEach(k=>s=s.replace(new RegExp("\\\\b"+k.replace(" ","\\\\s+")+"\\\\b","gi"),k));
    kws.forEach(k=>s=s.replace(new RegExp("\\\\s+"+k.replace(" ","\\\\s+")+"\\\\s*","gi"),"\\n"+k+" "));
    s=s.replace(/\\s+AND\\s+/g,"\\n  AND ").replace(/\\s+OR\\s+/g,"\\n  OR ");
    if(indent!==2)s=s.split("\\n").map((line,i)=>i?line.replace(/^  /," ".repeat(indent)):line).join("\\n");
    return s.trim();
  },[input,uppercase,indent]);
  return <ToolShell tool={tools[12]} value={output} onClear={()=>setInput("")}>
    <div className="tool-controls"><label className="check"><input type="checkbox" checked={uppercase} onChange={e=>setUppercase(e.target.checked)}/> Uppercase keywords</label><label className="check">Indent <select value={indent} onChange={e=>setIndent(+e.target.value)}><option value="2">2 spaces</option><option value="4">4 spaces</option></select></label></div>
    <div className="split"><Editor label="SQL" value={input} onChange={setInput}/><Panel label="FORMATTED SQL"><pre className="code wrap">{output}</pre></Panel></div>
  </ToolShell>
}
function Editor({label,value,onChange,placeholder=""}){return <label className="editor"><span>{label}</span><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}
function Panel({label,children,status,statusGood}){return <div className="panel"><div className="panel-head"><span>{label}</span>{status&&<em className={statusGood?"good":"bad"}>{status}</em>}</div>{children}</div>}

const seo = {
  json:{title:"JSON Formatter & Validator",description:"Format, validate and minify JSON instantly in your browser."},
  jwt:{title:"JWT Decoder",description:"Decode JWT headers and payloads locally without sending tokens to a server."},
  uuid:{title:"UUID Generator",description:"Generate secure random UUID v4 identifiers instantly."},
  base64:{title:"Base64 Encoder & Decoder",description:"Encode and decode Base64 text directly in your browser."},
  hash:{title:"Hash Generator",description:"Generate SHA-256, SHA-384 and SHA-512 hashes locally."},
  regex:{title:"Regex Tester",description:"Test JavaScript regular expressions and inspect matches instantly."},
  timestamp:{title:"Unix Timestamp Converter",description:"Convert Unix timestamps to dates and dates to Unix timestamps."},
  url:{title:"URL Encoder & Decoder",description:"Encode and decode URL components instantly."},
  qr:{title:"QR Code Generator",description:"Generate QR codes from text or URLs."},
  color:{title:"Color Converter",description:"Convert HEX colors to RGB values instantly."},
  http:{title:"HTTP Request Tester",description:"Test HTTP requests directly from your browser."},
  markdown:{title:"Markdown Editor & Preview",description:"Write Markdown and preview the rendered result."},
  sql:{title:"SQL Formatter",description:"Format SQL queries for easier reading and debugging."}
};

function setMeta(toolId){
  const meta=seo[toolId]||seo.json;
  document.title=`${meta.title} — DevBox`;
  let desc=document.querySelector('meta[name="description"]');
  if(!desc){desc=document.createElement("meta");desc.name="description";document.head.appendChild(desc)}
  desc.content=meta.description;
}

function getToolFromPath(){
  const base="/DevBox/";
  let path=window.location.pathname;
  if(path.startsWith(base))path=path.slice(base.length);
  else path=path.replace(/^\/+/,"");
  const parts=path.split("/").filter(Boolean);
  const slug=parts[0]==="tools"?parts[1]:null;
  return tools.some(t=>t.id===slug)?slug:null;
}

function navigateTo(id){
  const next=id?`/DevBox/tools/${id}`:"/DevBox/";
  window.history.pushState({devboxTool:id||null},"",next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function WorkspaceModal({items,onClose,onDelete,onClear,onLoad}){
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal"><div className="modal-head"><div><span className="section-kicker">LOCAL WORKSPACE</span><h3>Recent work</h3></div><button className="icon-btn" onClick={onClose}><X size={15}/></button></div>
      {!items.length?<div className="empty-state"><Clock3 size={28}/><strong>No recent work yet</strong><span>Your recent tool activity will appear here.</span></div>:<div className="history-list">{items.map(item=><div className="history-row" key={item.id}><div><strong>{item.tool}</strong><span>{new Date(item.createdAt).toLocaleString()}</span><code>{item.preview}</code></div><div className="history-actions"><button onClick={()=>onLoad(item)}><RotateCcw size={14}/> Load</button><button onClick={()=>onDelete(item.id)}><Trash2 size={14}/></button></div></div>)}</div>}
      {!!items.length&&<button className="danger-link" onClick={onClear}>Clear history</button>}
    </div></div>
}


function JsonDiffTool(){
  const [left,setLeft]=useState('{\n  "name": "DevBox",\n  "version": 1\n}');
  const [right,setRight]=useState('{\n  "name": "DevBox",\n  "version": 2\n}');
  const [ignoreOrder,setIgnoreOrder]=useState(true);
  const result=useMemo(()=>{
    try{
      const a=JSON.parse(left),b=JSON.parse(right);
      const normalize=v=>ignoreOrder&&v&&typeof v==="object"&&!Array.isArray(v)?Object.keys(v).sort().reduce((o,k)=>(o[k]=normalize(v[k]),o),{}):Array.isArray(v)?v.map(normalize):v;
      const aa=JSON.stringify(normalize(a),null,2),bb=JSON.stringify(normalize(b),null,2);
      return {valid:true,same:aa===bb,a:aa,b:bb};
    }catch(e){return {valid:false,error:e.message}}
  },[left,right,ignoreOrder]);
  const copy=v=>navigator.clipboard?.writeText(v);
  return <ToolShell title="JSON Diff" subtitle="Compare JSON documents with normalized key ordering and clear validation feedback.">
    <div className="workbench">
      <div className="workbench-toolbar"><div className="status-line">{result.valid?<><span className={result.same?"status-ok":"status-warn"}>{result.same?"✓ Identical":"⚡ Differences found"}</span></>:<span className="status-error">✕ Invalid JSON</span>}</div><label className="toggle"><input type="checkbox" checked={ignoreOrder} onChange={e=>setIgnoreOrder(e.target.checked)}/><span>Ignore key order</span></label></div>
      <div className="workbench-grid">
        <div className="workbench-pane"><div className="pane-head"><strong>Original</strong><button className="text-btn" onClick={()=>copy(left)}>Copy</button></div><textarea value={left} onChange={e=>setLeft(e.target.value)} spellCheck="false"/></div>
        <div className="workbench-pane"><div className="pane-head"><strong>Compare with</strong><button className="text-btn" onClick={()=>copy(right)}>Copy</button></div><textarea value={right} onChange={e=>setRight(e.target.value)} spellCheck="false"/></div>
      </div>
      <div className="diff-summary">{result.valid?<><div><span>STATUS</span><strong>{result.same?"No changes":"Documents differ"}</strong></div><div><span>ORDER</span><strong>{ignoreOrder?"Ignored":"Compared"}</strong></div></>:<div><span>ERROR</span><strong>{result.error}</strong></div>}</div>
    </div>
  </ToolShell>
}

function RegexWorkbench(){
  const [pattern,setPattern]=useState("\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b");
  const [flags,setFlags]=useState("gi");
  const [text,setText]=useState("Contact DEVBOX@EXAMPLE.COM or hello@example.org.");
  const [replace,setReplace]=useState("");
  const [mode,setMode]=useState("match");
  const result=useMemo(()=>{
    try{
      const re=new RegExp(pattern,flags);
      const matches=[];
      if(flags.indexOf("g")>=0){
        let m;
        while((m=re.exec(text))!==null){
          matches.push({value:m[0],index:m.index,groups:m.slice(1)});
          if(m[0]==="")re.lastIndex++;
        }
      }else{
        const m=re.exec(text);
        if(m)matches.push({value:m[0],index:m.index,groups:m.slice(1)});
      }
      const replaced=mode==="replace"?text.replace(re,replace):text;
      return {ok:true,matches:matches,replaced:replaced};
    }catch(e){
      return {ok:false,error:e.message,matches:[]};
    }
  },[pattern,flags,text,replace,mode]);

  const toggle=function(f){
    setFlags(function(v){
      return v.indexOf(f)>=0?v.replace(f,""):v+f;
    });
  };

  const sanitizeFlags=function(value){
    const allowed="dgimsuvy";
    let output="";
    for(let i=0;i<value.length;i++){
      if(allowed.indexOf(value[i])>=0)output+=value[i];
    }
    return output;
  };

  return <ToolShell title="Regex Workbench" subtitle="Test patterns, inspect capture groups and preview replacements in real time.">
    <div className="workbench">
      <div className="regex-bar">
        <div className="regex-input">
          <span>/</span>
          <input value={pattern} onChange={function(e){setPattern(e.target.value)}} />
          <span>/</span>
          <input className="regex-flags" value={flags} onChange={function(e){setFlags(sanitizeFlags(e.target.value))}} />
        </div>
        <div className="flag-pills">
          <button className={flags.indexOf("g")>=0?"active":""} onClick={function(){toggle("g")}}>g</button>
          <button className={flags.indexOf("i")>=0?"active":""} onClick={function(){toggle("i")}}>i</button>
          <button className={flags.indexOf("m")>=0?"active":""} onClick={function(){toggle("m")}}>m</button>
          <button className={flags.indexOf("s")>=0?"active":""} onClick={function(){toggle("s")}}>s</button>
        </div>
      </div>
      <div className="workbench-grid regex-grid">
        <div className="workbench-pane">
          <div className="pane-head"><strong>Test string</strong><span>{text.length} chars</span></div>
          <textarea value={text} onChange={function(e){setText(e.target.value)}} />
        </div>
        <div className="workbench-pane">
          <div className="pane-head"><strong>Matches</strong><span>{result.matches.length} found</span></div>
          <div className="match-list">
            {result.ok ? result.matches.map(function(m,i){
              return <div className="match-row" key={i}><div><strong>Match {i+1}</strong><code>{m.value}</code></div><span>index {m.index}</span></div>;
            }) : <div className="inline-error">{result.error}</div>}
          </div>
        </div>
      </div>
      <div className="replace-panel">
        <div><strong>Replace</strong><span>Preview replacement output</span></div>
        <input value={replace} onChange={function(e){setReplace(e.target.value)}} placeholder="Replacement text" />
        <button className="primary" onClick={function(){setMode("replace")}}>Preview</button>
      </div>
      {mode==="replace"&&result.ok&&<div className="preview-output"><span>REPLACEMENT PREVIEW</span><pre>{result.replaced}</pre></div>}
    </div>
  </ToolShell>
}

function HashWorkbench(){
  const [input,setInput]=useState("DevBox");
  const [algo,setAlgo]=useState("SHA-256");
  const [output,setOutput]=useState("");
  const run=async()=>{
    const data=new TextEncoder().encode(input);
    const buf=await crypto.subtle.digest(algo,data);
    setOutput([...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join(""));
  };
  useEffect(()=>{run()},[input,algo]);
  return <ToolShell title="Hash Generator" subtitle="Generate cryptographic hashes locally in your browser using the Web Crypto API.">
    <div className="workbench single-workbench">
      <div className="control-row"><label>Algorithm<select value={algo} onChange={e=>setAlgo(e.target.value)}><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option><option>SHA-1</option></select></label><span className="local-badge">LOCAL PROCESSING</span></div>
      <div className="workbench-pane"><div className="pane-head"><strong>Input</strong><span>{input.length} characters</span></div><textarea value={input} onChange={e=>setInput(e.target.value)}/></div>
      <div className="hash-output"><div><span>{algo}</span><button className="text-btn" onClick={()=>navigator.clipboard?.writeText(output)}>Copy</button></div><code>{output||"Generating…"}</code></div>
    </div>
  </ToolShell>
}

function CurlWorkbench(){
  const [method,setMethod]=useState("GET");
  const [url,setUrl]=useState("https://api.example.com/users");
  const [headers,setHeaders]=useState([{key:"Accept",value:"application/json"}]);
  const [body,setBody]=useState("");
  const curl=useMemo(()=>{
    let s=`curl -X ${method} '${url}'`;
    headers.filter(h=>h.key.trim()).forEach(h=>s+=` \\\n  -H '${h.key}: ${h.value}'`);
    if(body.trim())s+=` \\\n  --data '${body.replace(/'/g,"'\\\\''")}'`;
    return s;
  },[method,url,headers,body]);
  return <ToolShell title="cURL Builder" subtitle="Build readable cURL requests and copy them into your terminal or scripts.">
    <div className="workbench">
      <div className="request-line"><select value={method} onChange={e=>setMethod(e.target.value)}>{["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].map(x=><option key={x}>{x}</option>)}</select><input value={url} onChange={e=>setUrl(e.target.value)}/></div>
      <div className="workbench-grid">
        <div className="workbench-pane"><div className="pane-head"><strong>Headers</strong><button className="text-btn" onClick={()=>setHeaders([...headers,{key:"",value:""}])}>+ Add header</button></div><div className="header-editor">{headers.map((h,i)=><div className="header-row" key={i}><input placeholder="Header" value={h.key} onChange={e=>setHeaders(headers.map((x,n)=>n===i?{...x,key:e.target.value}:x))}/><input placeholder="Value" value={h.value} onChange={e=>setHeaders(headers.map((x,n)=>n===i?{...x,value:e.target.value}:x))}/></div>)}</div></div>
        <div className="workbench-pane"><div className="pane-head"><strong>Request body</strong><span>Optional</span></div><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder='{"name":"DevBox"}'/></div>
      </div>
      <div className="generated-code"><div className="pane-head"><strong>Generated cURL</strong><button className="primary" onClick={()=>navigator.clipboard?.writeText(curl)}>Copy cURL</button></div><pre>{curl}</pre></div>
    </div>
  </ToolShell>
}


function HttpClientWorkbench(){
  const [method,setMethod]=useState("GET");
  const [url,setUrl]=useState("https://jsonplaceholder.typicode.com/posts/1");
  const [params,setParams]=useState([{key:"",value:""}]);
  const [headers,setHeaders]=useState([{key:"Accept",value:"application/json"}]);
  const [auth,setAuth]=useState("None");
  const [token,setToken]=useState("");
  const [bodyType,setBodyType]=useState("JSON");
  const [body,setBody]=useState("");
  const [response,setResponse]=useState(null);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [tab,setTab]=useState("body");
  const [history,setHistory]=useState([]);

  const buildUrl=()=>{
    try{
      const u=new URL(url);
      params.filter(p=>p.key.trim()).forEach(p=>u.searchParams.set(p.key,p.value));
      return u.toString();
    }catch(e){return url}
  };

  const send=async()=>{
    setLoading(true);setError("");setResponse(null);
    const started=performance.now();
    try{
      const finalUrl=buildUrl();
      const hs={};
      headers.filter(h=>h.key.trim()).forEach(h=>hs[h.key]=h.value);
      if(auth==="Bearer"&&token)hs.Authorization=`Bearer ${token}`;
      if(auth==="Basic"&&token)hs.Authorization=`Basic ${btoa(token)}`;
      const opts={method,headers:hs};
      if(!["GET","HEAD"].includes(method)&&body){
        opts.body=bodyType==="JSON"?body:body;
        if(bodyType==="JSON"&&!Object.keys(hs).some(k=>k.toLowerCase()==="content-type"))hs["Content-Type"]="application/json";
      }
      const res=await fetch(finalUrl,opts);
      const text=await res.text();
      let parsed=null;try{parsed=JSON.parse(text)}catch(e){}
      const duration=Math.round(performance.now()-started);
      const item={method,url:finalUrl,status:res.status,ok:res.ok,time:duration,at:new Date().toLocaleTimeString()};
      setResponse({status:res.status,statusText:res.statusText,ok:res.ok,time:duration,size:text.length,headers:[...res.headers.entries()],text,parsed});
      setHistory(h=>[item,...h.filter(x=>!(x.method===item.method&&x.url===item.url))].slice(0,10));
    }catch(e){
      setError(e.message||"Request failed. This request may be blocked by CORS.");
    }finally{setLoading(false)}
  };

  const loadHistory=item=>{
    setMethod(item.method);setUrl(item.url);setResponse(null);setError("");
  };
  const copy=v=>navigator.clipboard?.writeText(v);
  const curl=useMemo(()=>{
    let s=`curl -X ${method} '${buildUrl()}'`;
    headers.filter(h=>h.key.trim()).forEach(h=>s+=` \\\n  -H '${h.key}: ${h.value}'`);
    if(auth==="Bearer"&&token)s+=` \\\n  -H 'Authorization: Bearer ${token}'`;
    if(auth==="Basic"&&token)s+=` \\\n  -H 'Authorization: Basic ${btoa(token)}'`;
    if(!["GET","HEAD"].includes(method)&&body)s+=` \\\n  --data '${body.replace(/'/g,"'\\\\''")}'`;
    return s;
  },[method,url,params,headers,auth,token,body]);

  return <ToolShell title="HTTP Client" subtitle="Build, send and inspect HTTP requests directly from your browser.">
    <div className="http-workbench">
      <div className="request-builder">
        <div className="request-line http-request-line">
          <select value={method} onChange={e=>setMethod(e.target.value)}>{["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].map(x=><option key={x}>{x}</option>)}</select>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://api.example.com/endpoint"/>
          <button className="primary send-btn" onClick={send} disabled={loading}>{loading?"Sending…":"Send Request"}</button>
        </div>
        <div className="http-tabs">{[["params","Params"],["headers","Headers"],["auth","Authorization"],["body","Body"],["curl","cURL"]].map(([id,label])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}>{label}</button>)}</div>

        {tab==="params"&&<div className="http-section"><div className="section-line"><strong>Query parameters</strong><button className="text-btn" onClick={()=>setParams([...params,{key:"",value:""}])}>+ Add parameter</button></div>{params.map((p,i)=><div className="key-row" key={i}><input placeholder="Key" value={p.key} onChange={e=>setParams(params.map((x,n)=>n===i?{...x,key:e.target.value}:x))}/><input placeholder="Value" value={p.value} onChange={e=>setParams(params.map((x,n)=>n===i?{...x,value:e.target.value}:x))}/><button className="icon-btn" onClick={()=>setParams(params.filter((_,n)=>n!==i))}>×</button></div>)}</div>}
        {tab==="headers"&&<div className="http-section"><div className="section-line"><strong>Request headers</strong><button className="text-btn" onClick={()=>setHeaders([...headers,{key:"",value:""}])}>+ Add header</button></div>{headers.map((h,i)=><div className="key-row" key={i}><input placeholder="Header" value={h.key} onChange={e=>setHeaders(headers.map((x,n)=>n===i?{...x,key:e.target.value}:x))}/><input placeholder="Value" value={h.value} onChange={e=>setHeaders(headers.map((x,n)=>n===i?{...x,value:e.target.value}:x))}/><button className="icon-btn" onClick={()=>setHeaders(headers.filter((_,n)=>n!==i))}>×</button></div>)}</div>}
        {tab==="auth"&&<div className="http-section auth-section"><label>Type<select value={auth} onChange={e=>setAuth(e.target.value)}><option>None</option><option>Bearer</option><option>Basic</option></select></label>{auth!=="None"&&<label>{auth==="Bearer"?"Token":"Username:Password"}<input value={token} onChange={e=>setToken(e.target.value)} type={auth==="Bearer"?"password":"text"} placeholder={auth==="Bearer"?"Paste bearer token":"user:password"}/></label>}</div>}
        {tab==="body"&&<div className="http-section"><div className="section-line"><strong>Request body</strong><select value={bodyType} onChange={e=>setBodyType(e.target.value)}><option>JSON</option><option>Raw</option></select></div><textarea className="http-body" value={body} onChange={e=>setBody(e.target.value)} placeholder='{"name":"DevBox","role":"developer"}' spellCheck="false"/></div>}
        {tab==="curl"&&<div className="http-section"><div className="section-line"><strong>Generated cURL</strong><button className="text-btn" onClick={()=>copy(curl)}>Copy</button></div><pre className="curl-preview">{curl}</pre></div>}
      </div>

      <div className="response-workspace">
        <div className="response-head"><div><strong>Response</strong>{response&&<span className={response.ok?"status-ok":"status-error"}>{response.status} {response.statusText}</span>}</div>{response&&<div className="response-meta"><span>{response.time} ms</span><span>{response.size} B</span></div>}</div>
        {error?<div className="http-error"><strong>Request failed</strong><span>{error}</span><small>Browser requests can be blocked by the API's CORS policy. Try a CORS-enabled endpoint.</small></div>:
        !response?<div className="http-empty"><strong>Ready to send</strong><span>Configure the request above and press Send Request.</span></div>:
        <div className="response-body">
          <div className="response-tabs"><button className={tab==="response-body"?"active":""} onClick={()=>setTab("response-body")}>Body</button><button onClick={()=>setTab("response-headers")}>Headers ({response.headers.length})</button></div>
          {tab==="response-headers"?<div className="response-headers">{response.headers.map(([k,v])=><div key={k}><code>{k}</code><span>{v}</span></div>)}</div>:<pre className="response-code">{response.parsed?JSON.stringify(response.parsed,null,2):response.text||"(empty response)"}</pre>}
        </div>}
      </div>

      <div className="http-history"><div className="section-line"><strong>Recent requests</strong><span>{history.length}/10</span></div>{history.length?<div className="history-list">{history.map((h,i)=><button key={i} onClick={()=>loadHistory(h)}><span className={`method method-${h.method.toLowerCase()}`}>{h.method}</span><span className="history-url">{h.url}</span><span className={h.ok?"status-ok":"status-error"}>{h.status}</span><span>{h.time} ms</span></button>)}</div>:<div className="history-empty">Requests you send will appear here.</div>}</div>
    </div>
  </ToolShell>
}


function SqlWorkbench(){
  const [dialect,setDialect]=useState("PostgreSQL");
  const [query,setQuery]=useState("SELECT u.id, u.name, COUNT(o.id) AS orders\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id, u.name\nORDER BY orders DESC;");
  const [schema,setSchema]=useState("users(id, name, email)\norders(id, user_id, total, created_at)");
  const [tab,setTab]=useState("query");
  const [copied,setCopied]=useState(false);

  const formatSql=value=>{
    let out=value.replace(/\s+/g," ").trim();
    out=out.replace(/\b(SELECT|FROM|LEFT JOIN|RIGHT JOIN|INNER JOIN|FULL JOIN|JOIN|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|UNION|VALUES|SET|RETURNING)\b/gi,"\n$1");
    out=out.replace(/\b(AND|OR)\b/gi,"\n  $1");
    out=out.replace(/,/g,",\n  ");
    return out.replace(/\n{2,}/g,"\n").trim();
  };

  const minifySql=value=>value.replace(/--.*$/gm,"").replace(/\s+/g," ").trim();
  const formatted=useMemo(()=>formatSql(query),[query]);
  const copy=()=>{
    navigator.clipboard?.writeText(formatted);
    setCopied(true);
    setTimeout(()=>setCopied(false),1200);
  };

  return <ToolShell title="SQL Workbench" subtitle="Format, inspect and work with SQL locally in your browser.">
    <div className="sql-workbench">
      <div className="sql-toolbar">
        <div className="sql-toolbar-left">
          <label>Dialect<select value={dialect} onChange={e=>setDialect(e.target.value)}><option>PostgreSQL</option><option>MySQL</option><option>SQLite</option><option>SQL Server</option><option>Oracle</option></select></label>
          <span className="local-badge">LOCAL PROCESSING</span>
        </div>
        <div className="sql-actions"><button className="text-btn" onClick={()=>setQuery(formatSql(query))}>Format SQL</button><button className="text-btn" onClick={()=>setQuery(minifySql(query))}>Minify</button><button className="primary" onClick={copy}>{copied?"Copied":"Copy"}</button></div>
      </div>
      <div className="sql-tabs"><button className={tab==="query"?"active":""} onClick={()=>setTab("query")}>Query</button><button className={tab==="schema"?"active":""} onClick={()=>setTab("schema")}>Schema Notes</button><button className={tab==="preview"?"active":""} onClick={()=>setTab("preview")}>Formatted Preview</button></div>
      {tab==="query"&&<div className="sql-editor"><div className="editor-head"><span>{dialect}</span><span>{query.length} characters</span></div><textarea value={query} onChange={e=>setQuery(e.target.value)} spellCheck="false"/></div>}
      {tab==="schema"&&<div className="sql-editor"><div className="editor-head"><span>Schema</span><span>Reference only</span></div><textarea value={schema} onChange={e=>setSchema(e.target.value)} spellCheck="false"/></div>}
      {tab==="preview"&&<div className="sql-preview"><pre>{formatted}</pre></div>}
      <div className="sql-footer"><span>Dialect: {dialect}</span><span>Formatting runs entirely in your browser</span></div>
    </div>
  </ToolShell>
}

function JsonTypeGenerator(){
  const [input,setInput]=useState('{\n  "id": 42,\n  "name": "Ada Lovelace",\n  "active": true,\n  "tags": ["developer", "admin"]\n}');
  const [name,setName]=useState("User");
  const [optional,setOptional]=useState(false);
  const result=useMemo(()=>{
    try{
      const value=JSON.parse(input);
      const typeOf=v=>{
        if(v===null)return "unknown";
        if(Array.isArray(v)){
          if(!v.length)return "unknown[]";
          return `${typeOf(v[0])}[]`;
        }
        if(typeof v==="string")return "string";
        if(typeof v==="number")return "number";
        if(typeof v==="boolean")return "boolean";
        return "unknown";
      };
      if(!value||Array.isArray(value)||typeof value!=="object")return {ok:false,error:"Root JSON value must be an object."};
      const lines=Object.entries(value).map(([k,v])=>`  ${JSON.stringify(k)}${optional?"?":""}: ${typeOf(v)};`);
      return {ok:true,output:`export interface ${name.replace(/[^A-Za-z0-9_$]/g,"")||"Root"} {\n${lines.join("\n")}\n}`};
    }catch(e){return {ok:false,error:e.message}};
  },[input,name,optional]);
  return <ToolShell title="JSON → TypeScript" subtitle="Generate TypeScript interfaces from JSON examples without sending data to a server.">
    <div className="code-generator">
      <div className="generator-toolbar"><label>Interface name<input value={name} onChange={e=>setName(e.target.value)}/></label><label className="toggle"><input type="checkbox" checked={optional} onChange={e=>setOptional(e.target.checked)}/><span>Optional properties</span></label><button className="primary" onClick={()=>navigator.clipboard?.writeText(result.output||"")}>Copy TypeScript</button></div>
      <div className="workbench-grid"><div className="workbench-pane"><div className="pane-head"><strong>JSON</strong><span>Input</span></div><textarea value={input} onChange={e=>setInput(e.target.value)} spellCheck="false"/></div><div className="workbench-pane"><div className="pane-head"><strong>TypeScript</strong><span>{result.ok?"Generated":"Error"}</span></div>{result.ok?<pre className="generated-ts">{result.output}</pre>:<div className="inline-error">{result.error}</div>}</div></div>
    </div>
  </ToolShell>
}

function OpenApiWorkbench(){
  const sample=`{
  "openapi": "3.0.3",
  "info": {"title": "Sample API", "version": "1.0.0"},
  "servers": [{"url": "https://api.example.com"}],
  "paths": {
    "/users": {
      "get": {"summary": "List users", "responses": {"200": {"description": "OK"}}},
      "post": {"summary": "Create user", "responses": {"201": {"description": "Created"}}}
    },
    "/users/{id}": {
      "get": {"summary": "Get user", "parameters": [{"name":"id","in":"path","required":true,"schema":{"type":"string"}}], "responses": {"200":{"description":"OK"}}}
    }
  }
}`;
  const [source,setSource]=useState(sample);
  const [tab,setTab]=useState("endpoints");
  const [selected,setSelected]=useState(null);
  const [error,setError]=useState("");
  const parsed=useMemo(()=>{
    try{
      const doc=JSON.parse(source);
      if(!doc||typeof doc!=="object")throw new Error("Specification must be an object.");
      const paths=doc.paths&&typeof doc.paths==="object"?doc.paths:{};
      const endpoints=[];
      Object.entries(paths).forEach(([path,item])=>{
        if(!item||typeof item!=="object")return;
        ["get","post","put","patch","delete","head","options","trace"].forEach(method=>{
          if(item[method])endpoints.push({method:method.toUpperCase(),path:path,operation:item[method]});
        });
      });
      return {ok:true,doc:doc,endpoints:endpoints};
    }catch(e){return {ok:false,error:e.message,endpoints:[]}};
  },[source]);

  const loadSample=()=>{setSource(sample);setError("")};
  const format=()=>{
    try{setSource(JSON.stringify(JSON.parse(source),null,2));setError("")}
    catch(e){setError(e.message)}
  };
  const copyCurl=ep=>{
    const server=parsed.doc.servers&&parsed.doc.servers[0]&&parsed.doc.servers[0].url?parsed.doc.servers[0].url:"https://api.example.com";
    const clean=ep.path.replace(/\{[^}]+\}/g,"VALUE");
    const curl=`curl -X ${ep.method} '${server.replace(/\/$/,"")+clean}'`;
    navigator.clipboard?.writeText(curl);
  };

  return <ToolShell title="OpenAPI Workbench" subtitle="Explore OpenAPI specifications, inspect endpoints and generate request snippets locally.">
    <div className="openapi-workbench">
      <div className="openapi-toolbar">
        <div><span className="local-badge">LOCAL PROCESSING</span>{parsed.ok&&<span className="api-summary">{parsed.doc.info?.title||"Untitled API"} · {parsed.doc.info?.version||"No version"} · {parsed.endpoints.length} endpoints</span>}</div>
        <div className="sql-actions"><button className="text-btn" onClick={loadSample}>Load sample</button><button className="text-btn" onClick={format}>Format JSON</button></div>
      </div>
      <div className="openapi-layout">
        <div className="openapi-spec">
          <div className="editor-head"><span>OpenAPI JSON</span><span>{source.length} chars</span></div>
          <textarea value={source} onChange={e=>setSource(e.target.value)} spellCheck="false"/>
          {error&&<div className="inline-error">{error}</div>}
        </div>
        <div className="openapi-explorer">
          <div className="sql-tabs"><button className={tab==="endpoints"?"active":""} onClick={()=>setTab("endpoints")}>Endpoints</button><button className={tab==="info"?"active":""} onClick={()=>setTab("info")}>Info</button><button className={tab==="servers"?"active":""} onClick={()=>setTab("servers")}>Servers</button></div>
          {tab==="endpoints"&&<div className="endpoint-list">{parsed.endpoints.length?parsed.endpoints.map((ep,i)=><button className="endpoint-row" key={i} onClick={()=>setSelected(ep)}><span className={`method method-${ep.method.toLowerCase()}`}>{ep.method}</span><code>{ep.path}</code><span>{ep.operation.summary||"No summary"}</span></button>):<div className="history-empty">No endpoints found.</div>}</div>}
          {tab==="info"&&<div className="api-info"><div><span>Title</span><strong>{parsed.doc?.info?.title||"—"}</strong></div><div><span>Version</span><strong>{parsed.doc?.info?.version||"—"}</strong></div><div><span>OpenAPI</span><strong>{parsed.doc?.openapi||"—"}</strong></div><div><span>Description</span><strong>{parsed.doc?.info?.description||"No description"}</strong></div></div>}
          {tab==="servers"&&<div className="api-info">{(parsed.doc?.servers||[]).map((server,i)=><div key={i}><span>Server {i+1}</span><strong>{server.url}</strong><small>{server.description||""}</small></div>)}{!parsed.doc?.servers?.length&&<div className="history-empty">No servers defined.</div>}</div>}
          {selected&&<div className="endpoint-detail"><div className="detail-head"><span className={`method method-${selected.method.toLowerCase()}`}>{selected.method}</span><code>{selected.path}</code><button className="icon-btn" onClick={()=>setSelected(null)}>×</button></div><p>{selected.operation.summary||"No summary provided."}</p><div className="detail-actions"><button className="text-btn" onClick={()=>copyCurl(selected)}>Copy cURL</button></div><pre>{JSON.stringify(selected.operation,null,2)}</pre></div>}
        </div>
      </div>
    </div>
  </ToolShell>
}

function DataTransformWorkbench(){
  const [mode,setMode]=useState("YAML → JSON");
  const [input,setInput]=useState("name: DevBox\nversion: 16\nfeatures:\n  - JSON\n  - YAML\n  - CSV");
  const [delimiter,setDelimiter]=useState(",");
  const [error,setError]=useState("");

  const yamlToJson=value=>{
    const lines=value.split(/\r?\n/).filter(line=>line.trim()&&!line.trim().startsWith("#"));
    const root={};
    let current=root;
    lines.forEach(line=>{
      const m=line.match(/^(\s*)([^:#]+):\s*(.*)$/);
      if(!m)return;
      const indent=m[1].length,key=m[2].trim(),raw=m[3].trim();
      const val=raw===""?{}:raw==="true"?true:raw==="false"?false:/^-?\d+(\.\d+)?$/.test(raw)?Number(raw):raw.replace(/^['"]|['"]$/g,"");
      if(indent===0){root[key]=val;if(raw==="")current=root[key]}
    });
    return root;
  };
  const csvToJson=value=>{
    const rows=value.trim().split(/\r?\n/).filter(Boolean);
    if(!rows.length)return [];
    const headers=rows[0].split(delimiter).map(x=>x.trim());
    return rows.slice(1).map(row=>{
      const cells=row.split(delimiter);
      const obj={};
      headers.forEach((h,i)=>obj[h]=cells[i]===undefined?"":cells[i]);
      return obj;
    });
  };
  const convert=()=>{
    try{
      setError("");
      if(mode==="YAML → JSON"){
        setInput(JSON.stringify(yamlToJson(input),null,2));
        setMode("JSON");
      }else if(mode==="JSON → YAML"){
        const obj=JSON.parse(input);
        const lines=[];
        Object.entries(obj).forEach(([k,v])=>{
          if(Array.isArray(v)){lines.push(`${k}:`);v.forEach(x=>lines.push(`  - ${x}`))}
          else if(v&&typeof v==="object"){lines.push(`${k}:`);Object.entries(v).forEach(([a,b])=>lines.push(`  ${a}: ${b}`))}
          else lines.push(`${k}: ${String(v)}`);
        });
        setInput(lines.join("\n"));setMode("YAML");
      }else if(mode==="CSV → JSON"){
        setInput(JSON.stringify(csvToJson(input),null,2));setMode("JSON");
      }else if(mode==="JSON → CSV"){
        const obj=JSON.parse(input);
        const rows=Array.isArray(obj)?obj:[obj];
        const headers=[...new Set(rows.flatMap(x=>Object.keys(x||{})))];
        setInput([headers.join(delimiter),...rows.map(x=>headers.map(h=>String(x?.[h]??"").replaceAll(delimiter," ")).join(delimiter))].join("\n"));setMode("CSV");
      }
    }catch(e){setError(e.message)}
  };
  const reset=()=>{
    setError("");
    if(mode.includes("YAML"))setInput("name: DevBox\nversion: 16\nfeatures:\n  - JSON\n  - YAML\n  - CSV");
    else if(mode.includes("CSV"))setInput("id,name,role\n1,Ada,admin\n2,Grace,developer");
    else setInput('{\n  "name": "DevBox",\n  "version": 16\n}');
  };
  return <ToolShell title="Data Transform" subtitle="Convert YAML, JSON and CSV locally without uploading your data.">
    <div className="data-transform">
      <div className="data-toolbar">
        <label>Conversion<select value={mode} onChange={e=>{setMode(e.target.value);setError("")}}><option>YAML → JSON</option><option>JSON → YAML</option><option>CSV → JSON</option><option>JSON → CSV</option></select></label>
        {mode.includes("CSV")&&<label>Delimiter<input className="delimiter-input" value={delimiter} onChange={e=>setDelimiter(e.target.value.slice(0,1))}/></label>}
        <button className="text-btn" onClick={reset}>Reset</button><button className="primary" onClick={convert}>Convert</button>
      </div>
      <div className="data-editor"><div className="editor-head"><span>{mode.split(" → ")[0]}</span><span>{input.length} characters</span></div><textarea value={input} onChange={e=>setInput(e.target.value)} spellCheck="false"/></div>
      {error&&<div className="inline-error">{error}</div>}
      <div className="data-note">All conversion runs in your browser. No server upload.</div>
    </div>
  </ToolShell>
}

function JwtInspector(){
  const [token,setToken]=useState("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZib3giLCJyb2xlIjoiZGV2ZWxvcGVyIiwiZXhwIjo0MTAyNDQ0ODAwfQ.signature");
  const decodePart=value=>{
    try{
      const normalized=value.replace(/-/g,"+").replace(/_/g,"/");
      const padded=normalized+"=".repeat((4-normalized.length%4)%4);
      return JSON.parse(atob(padded));
    }catch(e){return null}
  };
  const parts=token.split(".");
  const header=decodePart(parts[0]);
  const payload=decodePart(parts[1]);
  const exp=payload?.exp;
  const expiry=exp?new Date(exp*1000):null;
  const expired=expiry?expiry.getTime()<Date.now():false;
  return <ToolShell title="JWT Inspector" subtitle="Decode JWT headers and claims locally. Signature verification requires a secret or public key.">
    <div className="jwt-workbench">
      <div className="jwt-input"><div className="editor-head"><span>JWT TOKEN</span><span>{parts.length===3?"3 segments":"Invalid segments"}</span></div><textarea value={token} onChange={e=>setToken(e.target.value)} spellCheck="false"/></div>
      <div className="jwt-grid">
        <div className="jwt-card"><div className="jwt-card-head"><strong>Header</strong><span>Decoded JSON</span></div><pre>{header?JSON.stringify(header,null,2):"Unable to decode header"}</pre></div>
        <div className="jwt-card"><div className="jwt-card-head"><strong>Payload</strong><span>{expired?"EXPIRED":exp?"Valid expiry":"No expiry claim"}</span></div><pre>{payload?JSON.stringify(payload,null,2):"Unable to decode payload"}</pre>{expiry&&<div className={expired?"jwt-expired":"jwt-valid"}>Expiration: {expiry.toLocaleString()}</div>}</div>
      </div>
      <div className="jwt-note"><strong>Security note</strong><span>Decoding a JWT does not verify its signature. Never paste production secrets or private keys into a browser tool you do not trust.</span></div>
    </div>
  </ToolShell>
}

function MarkdownStudio(){
  const [markdown,setMarkdown]=useState("# DevBox Markdown Studio\n\nBuild **developer documentation** with `inline code`, links, lists and code blocks.\n\n## Features\n\n- Live preview\n- GitHub-style Markdown\n- Browser-local editing");
  const [tab,setTab]=useState("split");
  const [copied,setCopied]=useState(false);

  const escapeHtml=v=>v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const renderMarkdown=v=>{
    let html=escapeHtml(v);
    html=html.replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>");
    html=html.replace(/^\s*[-*] (.*)$/gm,"<li>$1</li>");
    html=html.replace(/(<li>.*<\/li>\n?)+/g,m=>`<ul>${m}</ul>`);
    html=html.replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>");
    html=html.replace(/`([^`]+)`/g,"<code>$1</code>");
    html=html.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
    html=html.replace(/\*([^*]+)\*/g,"<em>$1</em>");
    html=html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    html=html.replace(/^(?!<h\d|<ul|<pre|<\/ul|<li)(.+)$/gm,"<p>$1</p>");
    return {__html:html.replace(/\n{2,}/g,"")};
  };
  const copy=()=>{
    navigator.clipboard?.writeText(markdown);
    setCopied(true);
    setTimeout(()=>setCopied(false),1200);
  };
  return <ToolShell title="Markdown Studio" subtitle="Write, preview and copy developer documentation entirely in your browser.">
    <div className="markdown-studio">
      <div className="md-toolbar">
        <div className="sql-tabs"><button className={tab==="edit"?"active":""} onClick={()=>setTab("edit")}>Editor</button><button className={tab==="split"?"active":""} onClick={()=>setTab("split")}>Split</button><button className={tab==="preview"?"active":""} onClick={()=>setTab("preview")}>Preview</button></div>
        <div className="sql-actions"><button className="text-btn" onClick={()=>setMarkdown("")}>Clear</button><button className="primary" onClick={copy}>{copied?"Copied":"Copy Markdown"}</button></div>
      </div>
      <div className={`md-body md-${tab}`}>
        {(tab==="edit"||tab==="split")&&<div className="md-editor"><div className="editor-head"><span>MARKDOWN</span><span>{markdown.length} chars</span></div><textarea value={markdown} onChange={e=>setMarkdown(e.target.value)} spellCheck="false"/></div>}
        {(tab==="preview"||tab==="split")&&<div className="md-preview"><div className="editor-head"><span>PREVIEW</span><span>LOCAL RENDER</span></div><article dangerouslySetInnerHTML={renderMarkdown(markdown)}/></div>}
      </div>
    </div>
  </ToolShell>
}

function CodeFormatterWorkbench(){
  const [language,setLanguage]=useState("JavaScript");
  const [code,setCode]=useState('const user={name:"Ada",active:true,roles:["admin","developer"]};function greet(name){return "Hello "+name;}');
  const [minified,setMinified]=useState(false);
  const format=value=>{
    if(language==="JSON"){
      try{return JSON.stringify(JSON.parse(value),null,2)}catch(e){return value}
    }
    if(minified)return value.replace(/\s+/g," ").trim();
    return value.replace(/\{/g," {\n  ").replace(/;/g,";\n  ").replace(/\}/g,"\n}").replace(/\n\s*\n/g,"\n");
  };
  const output=useMemo(()=>format(code),[code,language,minified]);
  const copy=()=>navigator.clipboard?.writeText(output);
  return <ToolShell title="Code Formatter & Minifier" subtitle="Format JSON, JavaScript, CSS and HTML snippets locally with instant preview.">
    <div className="formatter-workbench">
      <div className="formatter-toolbar">
        <label>Language<select value={language} onChange={e=>setLanguage(e.target.value)}><option>JavaScript</option><option>JSON</option><option>CSS</option><option>HTML</option></select></label>
        <button className={minified?"text-btn active-tool":"text-btn"} onClick={()=>setMinified(!minified)}>{minified?"Pretty format":"Minify"}</button>
        <button className="primary" onClick={copy}>Copy Output</button>
      </div>
      <div className="formatter-grid">
        <div className="workbench-pane"><div className="pane-head"><strong>Input</strong><span>{code.length} chars</span></div><textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck="false"/></div>
        <div className="workbench-pane"><div className="pane-head"><strong>Output</strong><span>{language}</span></div><pre className="formatter-output">{output}</pre></div>
      </div>
    </div>
  </ToolShell>
}

function EnvWorkbench(){
  const [source,setSource]=useState("APP_NAME=DevBox\nAPP_ENV=development\nAPI_URL=https://api.example.com\nDEBUG=true\n# SECRET_KEY=replace-me");
  const [showSecrets,setShowSecrets]=useState(false);
  const parse=()=>{
    const rows=[]; const seen=new Set(); const errors=[];
    source.split(/\r?\n/).forEach((line,i)=>{
      const trimmed=line.trim(); if(!trimmed||trimmed.startsWith("#"))return;
      const m=trimmed.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if(!m){errors.push(`Line ${i+1}: invalid assignment`);return}
      if(seen.has(m[1]))errors.push(`Line ${i+1}: duplicate key ${m[1]}`);
      seen.add(m[1]); rows.push({key:m[1],value:m[2].replace(/^(['"])(.*)\1$/,"$2")});
    });
    return {rows,errors};
  };
  const data=parse();
  const masked=v=>showSecrets?v:(v.length?`${v.slice(0,2)}${"•".repeat(Math.min(12,Math.max(2,v.length-2)))}`:"");
  const example=data.rows.map(x=>`${x.key}=${x.key.toLowerCase().includes("key")||x.key.toLowerCase().includes("secret")||x.key.toLowerCase().includes("token")?"":"${"+x.key+"}"}`).join("\n");
  const copy=()=>navigator.clipboard?.writeText(showSecrets?source:example);
  return <ToolShell title=".env Workbench" subtitle="Inspect, validate, mask and generate environment files locally.">
    <div className="env-workbench">
      <div className="env-toolbar"><span className="local-badge">LOCAL PROCESSING</span><span>{data.rows.length} variables · {data.errors.length} issues</span><button className="text-btn" onClick={()=>setShowSecrets(!showSecrets)}>{showSecrets?"Mask values":"Reveal values"}</button><button className="primary" onClick={copy}>Copy {showSecrets?".env":".env.example"}</button></div>
      <div className="env-grid">
        <div className="workbench-pane"><div className="pane-head"><strong>.env Input</strong><span>{source.length} chars</span></div><textarea value={source} onChange={e=>setSource(e.target.value)} spellCheck="false"/></div>
        <div className="env-table"><div className="pane-head"><strong>Variables</strong><span>{data.rows.length}</span></div>{data.rows.length?data.rows.map(x=><div className="env-row" key={x.key}><code>{x.key}</code><span>{masked(x.value)}</span></div>):<div className="history-empty">No variables found.</div>}</div>
      </div>
      {data.errors.length>0&&<div className="inline-error">{data.errors.join(" · ")}</div>}
      <div className="data-note">Secret values are masked by default. Nothing is uploaded.</div>
    </div>
  </ToolShell>
}

function HashHmacWorkbench(){
  const [input,setInput]=useState("DevBox makes developer workflows faster.");
  const [secret,setSecret]=useState("devbox-secret");
  const [algorithm,setAlgorithm]=useState("SHA-256");
  const [output,setOutput]=useState("");
  const [hmac,setHmac]=useState("");
  const [busy,setBusy]=useState(false);
  const hex=buffer=>Array.from(new Uint8Array(buffer)).map(b=>b.toString(16).padStart(2,"0")).join("");
  const run=async()=>{
    setBusy(true);
    try{
      const alg=algorithm;
      const digest=await crypto.subtle.digest(alg,new TextEncoder().encode(input));
      const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:alg},false,["sign"]);
      const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(input));
      setOutput(hex(digest));setHmac(hex(sig));
    }catch(e){setOutput(e.message);setHmac("")}finally{setBusy(false)}
  };
  useEffect(()=>{run()},[algorithm]);
  return <ToolShell title="Hash & HMAC" subtitle="Generate cryptographic hashes and HMAC signatures with the browser Web Crypto API.">
    <div className="hash-workbench">
      <div className="formatter-toolbar"><label>Algorithm<select value={algorithm} onChange={e=>setAlgorithm(e.target.value)}><option>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></label><button className="primary" onClick={run}>{busy?"Generating…":"Generate"}</button></div>
      <div className="hash-inputs"><div className="workbench-pane"><div className="pane-head"><strong>Message</strong><span>{input.length} chars</span></div><textarea value={input} onChange={e=>setInput(e.target.value)}/></div><div className="workbench-pane"><div className="pane-head"><strong>HMAC Secret</strong><span>Local only</span></div><input className="hash-secret" value={secret} onChange={e=>setSecret(e.target.value)} type="password"/></div></div>
      <div className="hash-results"><div><span>HASH · {algorithm}</span><code>{output||"—"}</code><button className="text-btn" onClick={()=>navigator.clipboard?.writeText(output)}>Copy</button></div><div><span>HMAC · {algorithm}</span><code>{hmac||"—"}</code><button className="text-btn" onClick={()=>navigator.clipboard?.writeText(hmac)}>Copy</button></div></div>
      <div className="data-note">Uses Web Crypto. HMAC output is not a password vault and secrets are not stored.</div>
    </div>
  </ToolShell>
}

function HeadersInspector(){
  const [source,setSource]=useState("Content-Type: application/json\nAuthorization: Bearer example-token\nCache-Control: no-store\nX-Content-Type-Options: nosniff\nX-Frame-Options: DENY\nStrict-Transport-Security: max-age=31536000");
  const rows=source.split(/\r?\n/).map(x=>x.match(/^\s*([^:]+):\s*(.*)$/)).filter(Boolean).map(m=>({key:m[1].trim(),value:m[2].trim()}));
  const security=["strict-transport-security","content-security-policy","x-content-type-options","x-frame-options","referrer-policy","permissions-policy"];
  const present=new Set(rows.map(x=>x.key.toLowerCase()));
  const missing=security.filter(x=>!present.has(x));
  return <ToolShell title="HTTP Headers Inspector" subtitle="Parse headers, search values and review common security headers locally.">
    <div className="headers-workbench">
      <div className="workbench-pane"><div className="pane-head"><strong>Raw Headers</strong><span>{rows.length} headers</span></div><textarea value={source} onChange={e=>setSource(e.target.value)} spellCheck="false"/></div>
      <div className="headers-results"><div className="security-summary"><strong>Security headers</strong><span>{security.length-missing.length}/{security.length} detected</span></div>{rows.map((x,i)=><div className="header-row" key={i}><code>{x.key}</code><span>{x.value}</span></div>)}</div>
      {missing.length>0&&<div className="header-warning"><strong>Not detected</strong><span>{missing.join(", ")}</span></div>}
    </div>
  </ToolShell>
}

function DiffMergeWorkbench(){
  const [left,setLeft]=useState("const user = {\n  name: \"Ada\",\n  role: \"admin\"\n};");
  const [right,setRight]=useState("const user = {\n  name: \"Ada Lovelace\",\n  role: \"developer\"\n};");
  const [mode,setMode]=useState("Text");
  const lines=useMemo(()=>{
    const a=left.split(/\r?\n/),b=right.split(/\r?\n/),max=Math.max(a.length,b.length);
    return Array.from({length:max},(_,i)=>({n:i+1,a:a[i]??"",b:b[i]??"",changed:(a[i]??"")!==(b[i]??"")}));
  },[left,right]);
  const merge=()=>setRight(left);
  const formatJson=v=>{try{return JSON.stringify(JSON.parse(v),null,2)}catch{return v}};
  const applyMode=v=>mode==="JSON"?formatJson(v):v;
  return <ToolShell title="Diff & Merge" subtitle="Compare two text or JSON documents side by side and merge changes locally.">
    <div className="diff-workbench">
      <div className="formatter-toolbar"><label>Mode<select value={mode} onChange={e=>setMode(e.target.value)}><option>Text</option><option>JSON</option></select></label><button className="text-btn" onClick={()=>{setLeft(applyMode(left));setRight(applyMode(right))}}>Format</button><button className="primary" onClick={merge}>Use left → right</button></div>
      <div className="diff-editors"><div className="workbench-pane"><div className="pane-head"><strong>Original</strong><span>{left.split(/\r?\n/).length} lines</span></div><textarea value={left} onChange={e=>setLeft(e.target.value)} spellCheck="false"/></div><div className="workbench-pane"><div className="pane-head"><strong>Modified</strong><span>{right.split(/\r?\n/).length} lines</span></div><textarea value={right} onChange={e=>setRight(e.target.value)} spellCheck="false"/></div></div>
      <div className="diff-list">{lines.map(x=><div className={x.changed?"diff-row changed":"diff-row"} key={x.n}><span>{x.n}</span><code>{x.a||" "}</code><code>{x.b||" "}</code></div>)}</div>
      <div className="data-note">{lines.filter(x=>x.changed).length} changed line{lines.filter(x=>x.changed).length===1?"":"s"} · browser-local comparison</div>
    </div>
  </ToolShell>
}
function App(){
  const [active,setActive]=useState(getToolFromPath());
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [mobile,setMobile]=useState(false);
  const [workspaceOpen,setWorkspaceOpen]=useState(false);
  const [historyItems,setHistoryItems]=useState(()=>{
    try{
      const value=JSON.parse(localStorage.getItem("devbox-history")||"[]");
      return Array.isArray(value)?value:[];
    }catch(e){return []}
  });
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [dark,setDark]=useState(localStorage.getItem("devbox-theme")!=="light");
  const [favorites,setFavorites]=useState(()=>{
    try{
      const value=JSON.parse(localStorage.getItem("devbox-favorites")||"[]");
      return Array.isArray(value)?value:[];
    }catch(e){return []}
  });
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("devbox-theme",dark?"dark":"light")},[dark]);
  useEffect(()=>setMeta(active),[active]);
  useEffect(()=>{
    const onPop=()=>{setActive(getToolFromPath());setMobile(false);setQuery("");window.scrollTo({top:0,behavior:"auto"})};
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);
  useEffect(()=>localStorage.setItem("devbox-history",JSON.stringify(historyItems.slice(0,40))),[historyItems]);
  const addHistory=item=>setHistoryItems(prev=>[{...item,id:crypto.randomUUID(),createdAt:Date.now()},...prev.filter(x=>x.toolId!==item.toolId)].slice(0,40));
  useEffect(()=>{window.__devboxAddHistory=addHistory;return()=>delete window.__devboxAddHistory},[]);
  useEffect(()=>localStorage.setItem("devbox-favorites",JSON.stringify(favorites)),[favorites]);
  useEffect(()=>{
    const handler=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.querySelector(".top-search input")?.focus()}
      if(e.key==="Escape")document.querySelector(".top-search input")?.blur()
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[]);
  const filtered=tools.filter(t=>(category==="All"||t.category===category)&&(t.name+" "+t.desc+" "+t.category).toLowerCase().includes(query.toLowerCase()));
  const current=tools.find(t=>t.id===active)||tools[0];
  const favoriteTools=tools.filter(t=>favorites.includes(t.id));
  function toggleFav(id){setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id])}
  function selectTool(id){
    if(!tools.some(t=>t.id===id))return;
    setActive(id);
    navigateTo(id);
    setMobile(false);
    setQuery("");
    window.scrollTo({top:0,behavior:"auto"});
  }
  const content={
    json:<JsonTool/>,jwt:<JwtTool/>,uuid:<UuidTool/>,base64:<Base64Tool/>,hash:<HashTool/>,regex:<RegexTool/>,timestamp:<TimestampTool/>,url:<UrlTool/>,qr:<QrTool/>,color:<ColorTool/>,http:<HttpTool/>,markdown:<MarkdownTool/>,sql:<SqlTool/>,
    "json-diff":<JsonDiffTool/>,"regex-workbench":<RegexWorkbench/>,"hash-generator":<HashWorkbench/>,"curl-builder":<CurlWorkbench/>,"http-client":<HttpClientWorkbench/>,
    "env-workbench":<EnvWorkbench/>,"hash-hmac":<HashHmacWorkbench/>,"headers-inspector":<HeadersInspector/>,"diff-merge":<DiffMergeWorkbench/>
  }[active]||<JsonTool/>;

  return <div className="app">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Command size={19}/></div><span>Dev<span>Box</span></span><small>DEVELOPER TOOLKIT</small></div>
      <div className="top-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tools…"/><kbd>⌘ K</kbd></div>
      <div className="top-actions"><button className="icon-btn" title="Workspace" onClick={()=>setWorkspaceOpen(true)}><Clock3 size={16}/></button><button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="icon-btn" onClick={()=>setSettingsOpen(true)} title="Settings"><Settings size={18}/></button><button className="mobile-menu" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button></div>
    </header>
    <div className="layout">
      {mobile&&<button className="sidebar-overlay" aria-label="Close navigation" onClick={()=>setMobile(false)}></button>}
      <aside className={mobile?"sidebar open":"sidebar"}>
        <div className="sidebar-scroll">
        <div className="side-label">WORKSPACE</div>
        <button className="home-btn" onClick={()=>selectTool("json")}><Sparkles size={17}/> All tools <span>{tools.length}</span></button>
        {favoriteTools.length>0&&<><div className="side-label">FAVORITES</div>{favoriteTools.map(t=><SideItem key={t.id} tool={t} active={active===t.id} onClick={()=>selectTool(t.id)} fav onFav={()=>toggleFav(t.id)}/>)}</>}
        <div className="side-label">TOOLS</div>
        {["Formatters","Security","Generators","Encoding","Text","Converters","Network"].map(cat=>{
          const list=filtered.filter(t=>t.category===cat); if(!list.length)return null;
          return <div className="tool-group" key={cat}><div className="category">{cat}</div>{list.map(t=><SideItem key={t.id} tool={t} active={active===t.id} onClick={()=>selectTool(t.id)} fav={favorites.includes(t.id)} onFav={()=>toggleFav(t.id)}/>)}</div>
        })}
        </div>
        <div className="side-bottom"><div className="privacy"><Lock size={15}/><div><strong>Runs locally</strong><span>Your data stays in your browser.</span></div></div><span className="version">DevBox v1.0</span></div>
      </aside>
      <main className="main">
        <div className="breadcrumb"><span>DevBox</span><ChevronRight size={14}/><strong>{current.name}</strong><button className="favorite-main" onClick={()=>toggleFav(current.id)}>{favorites.includes(current.id)?<Star fill="currentColor" size={17}/>:<Star size={17}/>}</button></div>
        <section className="hero">
          <div className="hero-copy"><div className="eyebrow"><Zap size={14}/> FAST · PRIVATE · BROWSER-FIRST</div><h1><span className="outline-word">DEV</span><br/>TOOLS<br/><span>REIMAGINED.</span></h1><p>One focused workspace for the utilities developers reach for every day. Fast, expressive and private by design.</p><div className="hero-actions"><button className="hero-cta" onClick={()=>selectTool("json")}>Explore tools <ChevronRight size={16}/></button><span><Lock size={13}/> No signup required</span></div></div>
          <div className="hero-stats"><div><strong>{tools.length}</strong><span>tools</span></div><div><strong>0</strong><span>required APIs</span></div><div><strong>100%</strong><span>browser-first</span></div></div>
        </section>
        <div className="section-heading"><div><span className="section-kicker">TOOLKIT</span><h2>Everything you need, one click away.</h2></div><span className="tool-count">{filtered.length} tools</span></div>
        <div className="category-pills">{["All","Formatters","Security","Generators","Encoding","Text","Converters","Network"].map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="quick-grid">{filtered.map(t=><button className={active===t.id?"quick active":"quick"} key={t.id} onClick={()=>selectTool(t.id)}><t.icon size={17}/><span><strong>{t.name}</strong><small>{t.desc}</small></span><ChevronRight size={14}/></button>)}</div>
        <div className="content">{content}</div>
        <section className="seo-section">
          <div>
            <span className="section-kicker">ABOUT THIS TOOL</span>
            <h2>{seo[current.id]?.title||current.name}</h2>
            <p>{seo[current.id]?.description||current.desc} DevBox is designed to keep routine developer workflows fast, distraction-free and private. Wherever possible, processing happens locally in your browser.</p>
          </div>
          <div className="seo-points">
            <div><Lock size={16}/><strong>Privacy first</strong><span>No account required for core tools.</span></div>
            <div><Zap size={16}/><strong>Instant results</strong><span>Client-side processing means no round trip.</span></div>
            <div><ShieldCheck size={16}/><strong>Developer focused</strong><span>Simple inputs, clear outputs and useful actions.</span></div>
          </div>
        </section>
        <footer><span>© 2026 DevBox</span><span>Built for developers · Privacy first</span><span>All processing stays local where possible</span></footer>
      </main>
    </div>
    {settingsOpen&&<div className="modal-backdrop" onClick={()=>setSettingsOpen(false)}><div className="settings-modal" onClick={e=>e.stopPropagation()}><div className="settings-head"><div><span className="section-kicker">PREFERENCES</span><h3>DevBox settings</h3></div><button className="icon-btn light" onClick={()=>setSettingsOpen(false)}><X size={17}/></button></div><div className="settings-row"><div><strong>Appearance</strong><span>Switch between the editorial dark and light themes.</span></div><button className="setting-toggle" onClick={()=>setDark(!dark)}>{dark?<Moon size={15}/>:<Sun size={15}/>} {dark?"Dark":"Light"}</button></div><div className="settings-row"><div><strong>Favorites</strong><span>{favorites.length} saved tool{favorites.length===1?"":"s"} stored locally.</span></div><button className="setting-danger" onClick={()=>setFavorites([])}>Clear favorites</button></div><div className="settings-row"><div><strong>Privacy</strong><span>Core tools process data in your browser.</span></div><span className="local-badge"><Lock size={13}/> Local-first</span></div></div></div>}
  </div>
}

function SideItem({tool,active,onClick,fav,onFav}){return <div className={active?"side-item active":"side-item"}><button onClick={onClick}><tool.icon size={16}/><span>{tool.name}</span></button><button className="side-star" onClick={e=>{e.stopPropagation();onFav()}}>{fav?<Star size={13} fill="currentColor"/>:<Star size={13}/>}</button></div>}

createRoot(document.getElementById("root")).render(<App/>);
