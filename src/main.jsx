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
{id:"base64-file",name:"Base64 File Encoder",desc:"Encode files and UTF-8 text or decode Base64 back into downloadable files",icon:Binary,category:"Developer Assets"},
{id:"uuid-batch",name:"UUID Batch Generator",desc:"Generate secure UUID v4 identifiers in bulk with copy and export",icon:Fingerprint,category:"Security & Config"},
{id:"url-inspector",name:"URL Inspector & Builder",desc:"Parse URL components and safely edit query parameters",icon:Link2,category:"Web & API"},
{id:"curl-builder",name:"cURL Builder",desc:"Build and copy safe cURL commands from request settings",icon:Globe2,category:"Web & API"},
{id:"json-diff",name:"JSON Diff",desc:"Compare JSON documents and optionally ignore object key order",icon:Braces,category:"Data & Database"},
{id:"jwt-inspector",name:"JWT Inspector",desc:"Decode JWT headers, payload claims and expiry details",icon:KeyRound,category:"Security & Config"},
{id:"regex-workbench",name:"Regex Workbench",desc:"Test regular expressions, inspect capture groups and preview replacements",icon:Regex,category:"Developer Workflow"},
{id:"timestamp-converter",name:"Unix Timestamp Converter",desc:"Convert Unix timestamps to dates and dates back to Unix time",icon:Clock3,category:"Developer Workflow"},
{id:"color-converter",name:"Color Converter",desc:"Convert HEX colors to RGB and preview color values",icon:Palette,category:"App & Asset Studio"},
{id:"webhook-sender",name:"Webhook Request Tester",desc:"Send HTTP requests to webhook endpoints and inspect responses",icon:Globe2,category:"API & Backend"},
{id:"api-mock-builder",name:"API Mock Response Builder",desc:"Compose realistic JSON API responses with status and headers",icon:Braces,category:"Testing & Data"},
{id:"image-compressor",name:"Image Compressor",desc:"Resize and compress images to optimized JPEG, PNG or WebP files",icon:Palette,category:"App & Asset Studio"},
{id:"svg-optimizer",name:"SVG Optimizer",desc:"Clean, minify and inspect SVG markup before shipping",icon:Braces,category:"App & Asset Studio"},
{id:"sql-seed",name:"SQL Seed Data Generator",desc:"Generate realistic INSERT statements for local development and tests",icon:Database,category:"Data & Database"},
{id:"app-icon-studio",name:"App Icon Studio",desc:"Create and export scalable application icon assets",icon:Palette,category:"App & Asset Studio"},
{id:"jwt-secret",name:"JWT Secret Generator",desc:"Generate cryptographically secure signing secrets",icon:KeyRound,category:"Security & Config"},
{id:"sample-files",name:"Sample Files Library",desc:"Download JSON, CSV, SQL, XML and config fixtures",icon:Download,category:"Developer Assets"},
{id:"env-generator",name:"Environment File Builder",desc:"Compose and download validated .env files",icon:Lock,category:"Security & Config"},
{id:"docker-compose",name:"Docker Compose Builder",desc:"Generate app, database and cache service stacks",icon:Database,category:"DevOps"},
{id:"gitignore-builder",name:".gitignore Builder",desc:"Create stack-aware ignore rules for your project",icon:FileText,category:"DevOps"},
{id:"mock-data",name:"Mock Data Studio",desc:"Generate schema-driven JSON and CSV test data",icon:Binary,category:"Testing & Data"},
{id:"api-scaffold",name:"API Scaffold Generator",desc:"Generate Express route and controller starter code",icon:Globe2,category:"Code Generation"},
{id:"cron-builder",name:"Cron Expression Studio",desc:"Build cron expressions with readable descriptions",icon:Clock3,category:"Developer Workflow"},
{id:"json-schema",name:"JSON Schema Generator",desc:"Infer reusable JSON Schema from sample payloads",icon:Braces,category:"Code Generation"},
{id:"pwa-manifest",name:"PWA Manifest Builder",desc:"Generate installable web app metadata and icon declarations",icon:Globe2,category:"Web & PWA"},
{id:"robots-sitemap",name:"Robots & Sitemap Generator",desc:"Build robots.txt and XML sitemaps for your website",icon:FileText,category:"Web & PWA"},
{id:"github-actions",name:"GitHub Actions Builder",desc:"Generate Node.js CI workflows with dependency caching",icon:Zap,category:"DevOps"},
{id:"nginx-builder",name:"Nginx Config Builder",desc:"Create reverse proxy and static-site server blocks",icon:Globe2,category:"DevOps"},
{id:"http-client",name:"HTTP API Workbench",desc:"Build requests, headers, auth, query params and inspect API responses",icon:Globe2,category:"API & Backend"},
{id:"sql-workbench",name:"SQL Workbench",desc:"Format SQL and work with query and schema notes",icon:Database,category:"Data & Database"},
{id:"json-typescript",name:"JSON to TypeScript",desc:"Generate typed interfaces from real JSON samples",icon:Braces,category:"Code Generation"},
{id:"openapi-workbench",name:"OpenAPI Workbench",desc:"Explore API endpoints and generate cURL snippets from specs",icon:FileText,category:"API & Backend"},
{id:"data-transform",name:"Data Transform Studio",desc:"Convert JSON, CSV and YAML with browser-local processing",icon:Binary,category:"Data & Database"},
{id:"markdown-studio",name:"Markdown Studio",desc:"Write technical docs with a live preview",icon:FileText,category:"Documentation"},
{id:"code-formatter",name:"Code Formatter",desc:"Format and minify common code snippets",icon:Braces,category:"Code Generation"},
{id:"hash-hmac",name:"Hash & HMAC",desc:"Generate SHA digests and HMAC signatures using Web Crypto",icon:Fingerprint,category:"Security & Config"},
{id:"headers-inspector",name:"HTTP Headers Inspector",desc:"Inspect response headers and common security headers",icon:ShieldCheck,category:"API & Backend"},
{id:"diff-merge",name:"Diff & Merge",desc:"Compare and merge text or JSON documents",icon:Binary,category:"Developer Workflow"},
{id:"env-workbench",name:".env Inspector",desc:"Validate environment variables and mask sensitive values",icon:Lock,category:"Security & Config"}
];


// Storage is optional: browsers can deny access in private/restricted contexts.
function readStorage(key, fallback = null){
  try { return window.localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}
function writeStorage(key, value){
  try { window.localStorage.setItem(key, String(value)); return true; }
  catch { return false; }
}

const categories = ["All", ...new Set(tools.map(tool => tool.category))];

const initialJson = `{
  "name": "DevBox",
  "version": 1,
  "features": ["fast", "private", "browser-based"],
  "active": true
}`;

async function copyText(text, setCopied){
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(String(text));
    setCopied(true);
    setTimeout(()=>setCopied(false), 1200);
  } catch {
    setCopied(false);
  }
}

function downloadText(name, text){
  let url;
  const a = document.createElement("a");
  try{
    const blob = new Blob([text], {type:"text/plain;charset=utf-8"});
    url = URL.createObjectURL(blob);
    a.href=url;
    a.download=String(name||"download.txt").replace(/[\\r\\n\\0]/g,"_");
    a.style.display="none";
    document.body.appendChild(a);
    a.click();
  }catch{
    // Downloads are best-effort in restricted browser contexts.
  }finally{
    a.remove();
    if(url) window.setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }
}

function uuid(){
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    return [...bytes].map((b,i)=>[4,6,8,10].includes(i)?"-"+b.toString(16).padStart(2,"0"):b.toString(16).padStart(2,"0")).join("").replace(/^-/,"");
  }
  throw new Error("Secure UUID generation is not available in this browser context.");
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
  const [input,setInput]=useState(readStorage("devbox-json")||initialJson);
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
  useEffect(()=>writeStorage("devbox-json",input),[input]);
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
  const parsedDate=new Date(parsed*1000);
  const converted=Number.isFinite(parsed)&&!Number.isNaN(parsedDate.getTime())?parsedDate.toISOString():"Invalid timestamp";
  const dateTs=Number.isNaN(new Date(date).getTime())?"Invalid date":Math.floor(new Date(date).getTime()/1000);
  return <ToolShell tool={tools.find(t=>t.id==="timestamp-converter")} value={`${converted}\n${dateTs}`}>
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
  return <ToolShell tool={tools[8]} value={text}>
    <Editor label="CONTENT" value={text} onChange={setText} placeholder="Text or URL"/>
    <div className="qr-area"><div className="qr-placeholder"><QrCode size={42}/><strong>Private QR generation</strong><p>QR output is temporarily unavailable until an on-device encoder is integrated. Your content is not sent to a third-party service.</p></div></div>
  </ToolShell>
}

function ColorTool(){
  const [hex,setHex]=useState("#7c5cff");
  const valid=/^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim());
  const normalized=hex.startsWith("#")?hex:"#"+hex;
  function hexToRgb(value){let x=value.replace("#","");if(x.length===3)x=x.split("").map(c=>c+c).join("");const n=parseInt(x,16);return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
  const rgb=valid?hexToRgb(normalized):null;
  const output=valid?`HEX: ${normalized}\nRGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`:"Enter a valid 3- or 6-digit HEX color.";
  return <ToolShell tool={tools.find(t=>t.id==="color-converter")} value={output}>
    <div className="color-work"><input className="color-picker" type="color" value={valid?normalized:"#000000"} onChange={e=>setHex(e.target.value)}/><input aria-label="HEX color value" maxLength={7} value={hex} onChange={e=>setHex(e.target.value)} placeholder="#7c5cff"/><div className="swatch" style={{background:valid?normalized:"transparent"}}/></div>
    {!valid&&<div className="alert error-box" role="status">Enter a valid HEX value, such as #7c5cff or #abc.</div>}
    {valid&&<Panel label="VALUES"><div className="value-grid"><div><span>HEX</span><strong>{normalized.toUpperCase()}</strong></div><div><span>RGB</span><strong>rgb({rgb.r}, {rgb.g}, {rgb.b})</strong></div></div></Panel>}
  </ToolShell>
}

function HttpTool(){
  const [url,setUrl]=useState("https://jsonplaceholder.typicode.com/todos/1");
  const [method,setMethod]=useState("GET"); const [status,setStatus]=useState(""); const [body,setBody]=useState("");
  async function send(){
    let parsed;
    try {
      parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
      if (parsed.username || parsed.password) throw new Error("Do not put credentials in the URL. Use request headers instead.");
    } catch (e) {
      setStatus(e.message || "Enter a valid absolute HTTP(S) URL.");
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    setStatus("Loading…");
    try {
      const r = await fetch(parsed.href, {method, headers: {"Content-Type":"application/json"}, body: method === "GET" ? undefined : body, signal: controller.signal});
      const t = await r.text();
      setStatus(`${r.status} ${r.statusText}\\n\\n${t}`);
    } catch(e) {
      setStatus(e.name === "AbortError" ? "Request timed out after 20 seconds." : `Request failed. Browser CORS policy may block this endpoint.\\n\\n${e.message}`);
    } finally {
      clearTimeout(timeout);
    }
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
  return <ToolShell tool={tools[11]} value={input}><div className="split"><Editor label="MARKDOWN" value={input} onChange={setInput}/><Panel label="PREVIEW"><pre className="markdown-preview markdown-safe-preview">{input}</pre></Panel></div></ToolShell>
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

const legacyToolAliases = {
  jwt:"jwt-inspector", "jwt-inspector":"jwt-inspector",
  hash:"hash-hmac", "hash-generator":"hash-hmac", "hash-hmac":"hash-hmac",
  regex:"regex-workbench", "regex-workbench":"regex-workbench",
  http:"http-client", "http-client":"http-client",
  markdown:"markdown-studio", "markdown-studio":"markdown-studio",
  sql:"sql-workbench", "sql-workbench":"sql-workbench",
  "json-typescript":"json-typescript", "json-diff":"json-diff",
  uuid:"uuid-batch", base64:"base64-file", timestamp:"timestamp-converter", url:"url-inspector", color:"color-converter",
  json:"data-transform", "curl-builder":"curl-builder", "headers-inspector":"headers-inspector",
  "data-transform":"data-transform", "openapi-workbench":"openapi-workbench",
  "code-formatter":"code-formatter", "env-workbench":"env-workbench", "diff-merge":"diff-merge",
  "app-icon-studio":"app-icon-studio", "jwt-secret":"jwt-secret", "sample-files":"sample-files",
  "env-generator":"env-generator", "docker-compose":"docker-compose", "gitignore-builder":"gitignore-builder",
  "mock-data":"mock-data", "api-scaffold":"api-scaffold", "cron-builder":"cron-builder", "json-schema":"json-schema",
  "http-client":"http-client", "sql-workbench":"sql-workbench", "json-typescript":"json-typescript",
  "openapi-workbench":"openapi-workbench", "data-transform":"data-transform", "markdown-studio":"markdown-studio",
  "code-formatter":"code-formatter", "hash-hmac":"hash-hmac", "headers-inspector":"headers-inspector",
  "diff-merge":"diff-merge", "env-workbench":"env-workbench"
,
  "pwa-manifest":"pwa-manifest", "robots-sitemap":"robots-sitemap", "github-actions":"github-actions", "nginx-builder":"nginx-builder", "image-compressor":"image-compressor", "svg-optimizer":"svg-optimizer", "sql-seed":"sql-seed", "base64-file":"base64-file", "uuid-batch":"uuid-batch", "url-inspector":"url-inspector", "webhook-sender":"webhook-sender", "api-mock-builder":"api-mock-builder"
};
function canonicalToolId(id){return legacyToolAliases[id]||null}
function getToolFromPath(){
  const path=String(window.location.pathname||"");
  const base="/DevBox/";
  const relative=path.indexOf(base)===0?path.slice(base.length):path.replace(/^\/+/, "");
  const parts=relative.split("/").filter(Boolean);
  const slug=parts[0]==="tools"?parts[1]:null;
  const canonical=canonicalToolId(slug);
  return tools.some(t=>t.id===canonical)?canonical:null;
}
function navigateTo(id){
  const next=id?`/DevBox/tools/${id}`:"/DevBox/";
  window.history.pushState({devboxTool:id||null},"",next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function WorkspaceModal({items,onClose,onDelete,onClear,onLoad}){
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal"><div className="modal-head"><div><span className="section-kicker">LOCAL ACTIVITY</span><h3>Recent tools</h3></div><button className="icon-btn" onClick={onClose}><X size={15}/></button></div>
      {!items.length?<div className="empty-state"><Clock3 size={28}/><strong>No recent work yet</strong><span>Your recent tool activity will appear here.</span></div>:<div className="history-list">{items.map(item=><div className="history-row" key={item.id}><div><strong>{item.tool}</strong><span>{new Date(item.createdAt).toLocaleString()}</span><code>{item.preview}</code></div><div className="history-actions"><button onClick={()=>onLoad(item)}><RotateCcw size={14}/> Open tool</button><button onClick={()=>onDelete(item.id)}><Trash2 size={14}/></button></div></div>)}</div>}
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
    const quote=value=>"'"+String(value).replace(/'/g,"'\\''")+"'";
    try{
      const parsed=new URL(url);
      if(!["http:","https:"].includes(parsed.protocol)||parsed.username||parsed.password)throw new Error();
      let s=`curl -X ${method} ${quote(parsed.toString())}`;
      headers.filter(h=>h.key.trim()).forEach(h=>s+=` \\\n  -H ${quote(`${h.key}: ${h.value}`)}`);
      if(body.trim())s+=` \\\n  --data ${quote(body)}`;
      return s;
    }catch{return "Enter a valid HTTP(S) URL without embedded credentials."}
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

  const encodeBase64Utf8=value=>btoa(unescape(encodeURIComponent(value)));

  const buildUrl=()=>{
    const u=new URL(url);
    if(!["http:","https:"].includes(u.protocol))throw new Error("Only HTTP and HTTPS URLs are supported.");
    if(u.username||u.password)throw new Error("Remove credentials from the URL and use the Authorization tab instead.");
    params.filter(p=>p.key.trim()).forEach(p=>u.searchParams.set(p.key,p.value));
    return u.toString();
  };

  const send=async()=>{
    setLoading(true);setError("");setResponse(null);
    const started=performance.now();
    const controller=new AbortController();
    const timeoutId=setTimeout(()=>controller.abort(),20000);
    try{
      const finalUrl=buildUrl();
      const hs={};
      headers.filter(h=>h.key.trim()).forEach(h=>{
        const key=h.key.trim();
        if(/[\\r\\n:]/.test(key)||/[\\r\\n]/.test(h.value))throw new Error("Header names or values contain invalid newline characters.");
        hs[key]=h.value;
      });
      if(auth==="Bearer"&&token)hs.Authorization=`Bearer ${token}`;
      if(auth==="Basic"&&token){
        try{hs.Authorization=`Basic ${encodeBase64Utf8(token)}`}
        catch{throw new Error("Basic authorization credentials could not be encoded.")}
      }
      const opts={method,headers:hs,signal:controller.signal};
      if(!["GET","HEAD"].includes(method)&&body){
        opts.body=body;
        if(bodyType==="JSON"&&!Object.keys(hs).some(k=>k.toLowerCase()==="content-type"))hs["Content-Type"]="application/json";
        if(bodyType==="JSON"){try{JSON.parse(body)}catch{throw new Error("Request body is not valid JSON.")}}
      }
      const res=await fetch(finalUrl,opts);
      const text=await res.text();
      let parsed=null;try{parsed=JSON.parse(text)}catch(e){}
      const duration=Math.round(performance.now()-started);
      const item={method,url:finalUrl,status:res.status,ok:res.ok,time:duration,at:new Date().toLocaleTimeString()};
      setResponse({status:res.status,statusText:res.statusText,ok:res.ok,time:duration,size:text.length,headers:[...res.headers.entries()],text,parsed});
      setHistory(h=>[item,...h.filter(x=>!(x.method===item.method&&x.url===item.url))].slice(0,10));
    }catch(e){
      setError(e.name==="AbortError"?"Request timed out after 20 seconds.":e.message||"Request failed. This request may be blocked by CORS.");
    }finally{clearTimeout(timeoutId);setLoading(false)}
  };

  const loadHistory=item=>{
    setMethod(item.method);setUrl(item.url);setResponse(null);setError("");
  };
  const copy=v=>navigator.clipboard?.writeText(v);
  const curl=useMemo(()=>{
    // POSIX single-quote escaping prevents shell metacharacters from changing command meaning.
    const quote=value=>"'"+String(value).replace(/'/g,"'\\''")+"'";
    try{
      let s=`curl -X ${method} ${quote(buildUrl())}`;
      headers.filter(h=>h.key.trim()).forEach(h=>s+=` \\\n  -H ${quote(`${h.key}: ${h.value}`)}`);
      if(auth==="Bearer"&&token)s+=` \\\n  -H ${quote(`Authorization: Bearer ${token}`)}`;
      if(auth==="Basic"&&token)s+=` \\\n  -H ${quote(`Authorization: Basic ${encodeBase64Utf8(token)}`)}`;
      if(bodyType==="JSON"&&body&&!headers.some(h=>h.key.trim().toLowerCase()==="content-type"))s+=` \\\n  -H ${quote("Content-Type: application/json")}`;
      if(!["GET","HEAD"].includes(method)&&body)s+=` \\\n  --data ${quote(body)}`;
      return s;
    }catch{return "Enter a valid HTTP(S) URL to generate cURL."}
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
      if(!value||!/^[A-Za-z0-9_-]+$/.test(value))return null;
      const normalized=value.replace(/-/g,"+").replace(/_/g,"/");
      const padded=normalized+"=".repeat((4-normalized.length%4)%4);
      const binary=atob(padded);
      const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
      return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(bytes));
    }catch(e){return null}
  };
  const parts=token.trim().split(".");
  const structurallyValid=parts.length===3&&parts.every(Boolean);
  const header=structurallyValid?decodePart(parts[0]):null;
  const payload=structurallyValid?decodePart(parts[1]):null;
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

  const escapeHtml=v=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const renderMarkdown=v=>{
    let html=escapeHtml(v);
    html=html.replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>");
    html=html.replace(/^\s*[-*] (.*)$/gm,"<li>$1</li>");
    html=html.replace(/(<li>.*<\/li>\n?)+/g,m=>`<ul>${m}</ul>`);
    html=html.replace(/```([\s\S]*?)```/g,"<pre><code>$1</code></pre>");
    html=html.replace(/`([^`]+)`/g,"<code>$1</code>");
    html=html.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
    html=html.replace(/\*([^*]+)\*/g,"<em>$1</em>");
    html=html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(match,label,destination)=>{try{const url=new URL(destination,window.location.href);if(!["http:","https:","mailto:"].includes(url.protocol))return label;return `<a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer">${label}</a>`}catch{return label}});
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
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0}
function zipStore(entries){const enc=new TextEncoder(),locals=[],centrals=[];let offset=0;for(const e of entries){const n=enc.encode(e.name),d=typeof e.data==="string"?enc.encode(e.data):e.data,c=crc32(d),l=new Uint8Array(30+n.length+d.length),v=new DataView(l.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint32(14,c,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,n.length,true);l.set(n,30);l.set(d,30+n.length);locals.push(l);const z=new Uint8Array(46+n.length),q=new DataView(z.buffer);q.setUint32(0,0x02014b50,true);q.setUint16(4,20,true);q.setUint16(6,20,true);q.setUint16(8,0x0800,true);q.setUint32(16,c,true);q.setUint32(20,d.length,true);q.setUint32(24,d.length,true);q.setUint16(28,n.length,true);q.setUint32(42,offset,true);z.set(n,46);centrals.push(z);offset+=l.length}const size=centrals.reduce((a,x)=>a+x.length,0),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,size,true);v.setUint32(16,offset,true);return new Blob([...locals,...centrals,end],{type:"application/zip"})}
function downloadBlob(name,blob){const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function canvasBlob(canvas){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("Image export failed.")),"image/png"))}
function AppIconStudio(){
 const [file,setFile]=useState(null),[preview,setPreview]=useState(""),[name,setName]=useState("My App"),[fit,setFit]=useState("contain"),[bg,setBg]=useState("#ffffff"),[target,setTarget]=useState("all"),[busy,setBusy]=useState(false),[status,setStatus]=useState("");
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
 function choose(e){const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith("image/")){setStatus("Choose an image file.");return}if(f.size>15*1024*1024){setStatus("Image must be smaller than 15 MB.");return}setFile(f);setPreview(URL.createObjectURL(f));setStatus("")}
 async function generate(){setBusy(true);setStatus("");try{const img=new Image();if(preview){img.src=preview;await new Promise((ok,no)=>{img.onload=ok;img.onerror=()=>no(new Error("Unable to read this image."))})}
 const android=[["mdpi",48],["hdpi",72],["xhdpi",96],["xxhdpi",144],["xxxhdpi",192]],ios=[[20,2,"iphone"],[20,3,"iphone"],[29,2,"iphone"],[29,3,"iphone"],[40,2,"iphone"],[40,3,"iphone"],[60,2,"iphone"],[60,3,"iphone"],[20,1,"ipad"],[20,2,"ipad"],[29,1,"ipad"],[29,2,"ipad"],[40,1,"ipad"],[40,2,"ipad"],[76,1,"ipad"],[76,2,"ipad"],[83.5,2,"ipad"],[1024,1,"ios-marketing"]],web=[16,32,48,180,192,512],spec=[];
 if(target==="all"||target==="android")android.forEach(([d,n])=>spec.push({path:"android/mipmap-"+d+"/ic_launcher.png",size:n}));
 if(target==="all"||target==="ios")ios.forEach(([n,scale,idiom])=>spec.push({path:"ios/AppIcon.appiconset/icon-"+String(n).replace(".","_")+"@"+scale+"x.png",size:Math.round(n*scale),logical:n,scale,idiom}));
 if(target==="all"||target==="web")web.forEach(n=>spec.push({path:"web/icon-"+n+".png",size:n}));
 const entries=[],iosMeta=[];
 for(const item of spec){const c=document.createElement("canvas");c.width=c.height=item.size;const ctx=c.getContext("2d");ctx.fillStyle=bg;ctx.fillRect(0,0,item.size,item.size);
 if(img.naturalWidth){const scale=(fit==="cover"?Math.max:Math.min)(item.size/img.width,item.size/img.height),w=img.width*scale,h=img.height*scale;ctx.drawImage(img,(item.size-w)/2,(item.size-h)/2,w,h)}else{ctx.fillStyle="#6757e8";ctx.beginPath();ctx.roundRect(item.size*.08,item.size*.08,item.size*.84,item.size*.84,item.size*.2);ctx.fill();ctx.fillStyle="#fff";ctx.font="bold "+Math.floor(item.size*.48)+"px Arial";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText((name.trim()[0]||"A").toUpperCase(),item.size/2,item.size/2)}
 const blob=await canvasBlob(c);entries.push({name:item.path,data:new Uint8Array(await blob.arrayBuffer())});if(item.logical)iosMeta.push({filename:item.path.split("/").pop(),idiom:item.idiom,scale:item.scale+"x",size:item.logical+"x"+item.logical})}
 if(target==="all"||target==="ios")entries.push({name:"ios/AppIcon.appiconset/Contents.json",data:JSON.stringify({images:iosMeta,info:{author:"xcode",version:1}},null,2)});
 if(target==="all"||target==="web")entries.push({name:"web/manifest.webmanifest",data:JSON.stringify({name,short_name:name.slice(0,12),start_url:"./",scope:"./",display:"standalone",icons:[192,512].map(n=>({src:"./icon-"+n+".png",sizes:n+"x"+n,type:"image/png"}))},null,2)});
 entries.push({name:"README.txt",data:"Generated locally by DevBox App Icon Studio. Verify target platform specifications before release."});downloadBlob((name.trim().replace(/[^a-z0-9_-]+/gi,"-")||"app")+"-icons.zip",zipStore(entries));setStatus("Generated "+spec.length+" PNG icon assets and downloaded the ZIP.")}catch(e){setStatus(e.message||"Generation failed.")}finally{setBusy(false)}}
 return <ToolShell title="App Icon Studio" subtitle="Upload your app artwork and export platform-ready icon sizes for Android, iOS and web."><div className="icon-studio"><div className="icon-studio-controls"><label className="action-field"><span>APP NAME</span><input value={name} onChange={e=>setName(e.target.value)}/></label><label className="upload-drop"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={choose}/><strong>{file?file.name:"Choose your app logo or image"}</strong><small>PNG, JPG, WEBP or SVG · up to 15 MB</small></label><label className="action-field"><span>IMAGE FIT</span><select value={fit} onChange={e=>setFit(e.target.value)}><option value="contain">Contain — no crop</option><option value="cover">Cover — fill square</option></select></label><label className="action-field"><span>BACKGROUND</span><input type="color" value={bg} onChange={e=>setBg(e.target.value)}/></label><label className="action-field"><span>EXPORT TARGET</span><select value={target} onChange={e=>setTarget(e.target.value)}><option value="all">Android + iOS + Web</option><option value="android">Android only</option><option value="ios">iOS only</option><option value="web">Web / PWA only</option></select></label><button className="primary" disabled={busy} onClick={generate}>{busy?"Generating…":"Generate icon pack"} <Download size={15}/></button>{status&&<p className="icon-message">{status}</p>}<p className="data-note">Creates actual PNG files at platform sizes and packages them in a ZIP. Image processing stays in your browser.</p></div><div className="icon-preview-stage"><div className="icon-preview-frame" style={{background:bg}}>{preview?<img src={preview} alt="App icon preview"/>:<span>{(name.trim()[0]||"A").toUpperCase()}</span>}</div><strong>{name||"Your application"}</strong><small>Live icon preview</small></div></div></ToolShell>
}
function JwtSecretGenerator(){
 const [bytes,setBytes]=useState('64'),[secret,setSecret]=useState('');
 function generate(){const a=crypto.getRandomValues(new Uint8Array(Number(bytes)));setSecret(Array.from(a,x=>x.toString(16).padStart(2,'0')).join(''))}
 return <ToolShell title="JWT Secret Generator" subtitle="Generate high-entropy signing secrets using the browser cryptographic random generator." value={secret?'JWT_SECRET='+secret:''}><div className="advanced-controls"><label className="action-field"><span>SECRET STRENGTH</span><select value={bytes} onChange={e=>setBytes(e.target.value)}><option value="32">256-bit · 32 bytes</option><option value="48">384-bit · 48 bytes</option><option value="64">512-bit · 64 bytes</option><option value="96">768-bit · 96 bytes</option></select></label><button className="primary" onClick={generate}><KeyRound size={15}/> Generate secure secret</button><pre className="generated-secret">{secret||'Your secret will appear here.'}</pre>{secret&&<Panel label=".ENV ENTRY"><code>JWT_SECRET={secret}</code></Panel>}<p className="data-note">Generated locally with crypto.getRandomValues. Do not commit production secrets to Git; use your host's secret manager.</p></div></ToolShell>
}
function samplePdf(){
 const clean=x=>String(x).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)").replace(/[^\x20-\x7E]/g,"?");
 const lines=["DEVBOX SAMPLE DOCUMENT","Sample file for upload and preview testing","","This PDF is generated locally in your browser.","Use it to test document upload, preview and text extraction.","","Reference: DEVBOX-PDF-001","Email: sample@example.test"];
 const stream="BT /F1 18 Tf 54 760 Td ("+clean(lines[0])+") Tj /F1 11 Tf 0 -34 Td "+lines.slice(1).map(x=>"0 -24 Td ("+clean(x)+") Tj").join(" ")+" ET";
 const objs=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>","<< /Length "+stream.length+" >>\nstream\n"+stream+"\nendstream"];
 let pdf="%PDF-1.4\n";const offsets=[0];for(let i=0;i<objs.length;i++){offsets.push(new TextEncoder().encode(pdf).length);pdf+=(i+1)+" 0 obj\n"+objs[i]+"\nendobj\n"}const xref=new TextEncoder().encode(pdf).length;pdf+="xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n"+offsets.slice(1).map(x=>String(x).padStart(10,"0")+" 00000 n \n").join("")+"trailer\n<< /Size "+(objs.length+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF";return new Blob([pdf],{type:"application/pdf"});
}
function sampleDocx(){
 const xml=x=>String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 const ps=["DevBox Sample Document","An editable DOCX fixture for upload and preview testing.","Project: Sample Workspace","Owner: Ada Lovelace","Status: In progress","This document contains several paragraphs for parser testing."].map((x,i)=>'<w:p>'+(i===0?'<w:pPr><w:pStyle w:val="Title"/></w:pPr>':"")+'<w:r><w:t xml:space="preserve">'+xml(x)+'</w:t></w:r></w:p>').join("");
 return zipStore([{name:"[Content_Types].xml",data:'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'},{name:"_rels/.rels",data:'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'},{name:"word/document.xml",data:'<?xml version="1.0" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+ps+'<w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr></w:body></w:document>'}]);
}
function sampleXlsx(){
 const rows=[["id","name","email","role"],[1,"Ada Lovelace","ada@example.test","admin"],[2,"Grace Hopper","grace@example.test","developer"],[3,"Alan Turing","alan@example.test","tester"]];
 const col=n=>{let out="";while(n){n--;out=String.fromCharCode(65+n%26)+out;n=Math.floor(n/26)}return out};
 const body=rows.map((row,r)=>'<row r="'+(r+1)+'">'+row.map((v,c)=>{const ref=col(c+1)+(r+1);return typeof v==="number"?'<c r="'+ref+'"><v>'+v+'</v></c>':'<c r="'+ref+'" t="inlineStr"><is><t>'+String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</t></is></c>'}).join("")+'</row>').join("");
 return zipStore([{name:"[Content_Types].xml",data:'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'},{name:"_rels/.rels",data:'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},{name:"xl/workbook.xml",data:'<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Users" sheetId="1" r:id="rId1"/></sheets></workbook>'},{name:"xl/_rels/workbook.xml.rels",data:'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'},{name:"xl/worksheets/sheet1.xml",data:'<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+body+'</sheetData></worksheet>'}]);
}
function samplePptx(){
 const text=["DevBox Sample Presentation","A sample slide for upload and preview testing","Generated locally in your browser"];
 const shapes=text.map((t,i)=>'<p:sp><p:nvSpPr><p:cNvPr id="'+(i+2)+'" name="Text '+i+'"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="914400" y="'+(914400+i*900000)+'"/><a:ext cx="8000000" cy="600000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="'+(i===0?2800:1600)+'"/><a:t>'+t+'</a:t></a:r><a:endParaRPr lang="en-US"/></a:p></p:txBody></p:sp>').join("");
 return zipStore([{name:"[Content_Types].xml",data:'<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>'},{name:"_rels/.rels",data:'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>'},{name:"ppt/presentation.xml",data:'<?xml version="1.0"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst><p:sldSz cx="9144000" cy="5143500"/></p:presentation>'},{name:"ppt/_rels/presentation.xml.rels",data:'<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/></Relationships>'},{name:"ppt/slides/slide1.xml",data:'<?xml version="1.0"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvGrpSpPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>'+shapes+'</p:spTree></p:cSld></p:sld>'}]);
}
const sampleFiles=[
 {name:"sample-document.pdf",type:"PDF",category:"Documents",description:"One-page PDF for upload, preview and text extraction.",make:samplePdf},
 {name:"sample-document.docx",type:"Word DOCX",category:"Documents",description:"Editable document with headings and paragraphs.",make:sampleDocx},
 {name:"sample-spreadsheet.xlsx",type:"Excel XLSX",category:"Documents",description:"Workbook with synthetic user records.",make:sampleXlsx},
 {name:"sample-presentation.pptx",type:"PowerPoint PPTX",category:"Documents",description:"Slide deck fixture for document previews.",make:samplePptx},
 {name:"users.json",type:"JSON",category:"Data",description:"Synthetic user records and example.test emails.",make:()=>new Blob([JSON.stringify([{id:1,name:"Ada Lovelace",email:"ada@example.test",role:"admin"},{id:2,name:"Grace Hopper",email:"grace@example.test",role:"developer"}],null,2)],{type:"application/json"})},
 {name:"products.csv",type:"CSV",category:"Data",description:"Product rows with prices and categories.",make:()=>new Blob(["id,name,category,price\n101,Keyboard,Accessories,79.99\n102,USB-C Hub,Accessories,49.50\n103,4K Monitor,Displays,399.00\n"],{type:"text/csv"})},
 {name:"sample.xml",type:"XML",category:"Data",description:"Nested XML for parser and upload tests.",make:()=>new Blob(['<?xml version="1.0"?><catalog><item id="101"><name>Keyboard</name><price currency="USD">79.99</price></item></catalog>'],{type:"application/xml"})},
 {name:"schema.sql",type:"SQL",category:"Data",description:"Relational users and orders schema.",make:()=>new Blob(["CREATE TABLE users (id INTEGER PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(255) UNIQUE);\nCREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id), total DECIMAL(10,2));\n"],{type:"text/plain"})},
 {name:"README.md",type:"Markdown",category:"Developer",description:"Project README fixture with setup steps.",make:()=>new Blob(["# Sample Project\n\nA fixture README for documentation previews.\n\n## Install\n\nnpm install\nnpm run dev\n"],{type:"text/markdown"})},
 {name:".env.example",type:"Environment",category:"Developer",description:"Safe environment template with placeholders.",make:()=>new Blob(["NODE_ENV=development\nPORT=3000\nDATABASE_URL=mongodb://localhost:27017/sample\nJWT_SECRET=replace-with-a-secure-secret\n"],{type:"text/plain"})},
 {name:"Dockerfile",type:"Docker",category:"Developer",description:"Node.js container starter using a non-root user.",make:()=>new Blob(["FROM node:22-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY . .\nENV NODE_ENV=production\nUSER node\nCMD [\"node\", \"server.js\"]\n"],{type:"text/plain"})},
 {name:"nginx.conf",type:"Nginx",category:"Developer",description:"Reverse proxy server block fixture.",make:()=>new Blob(["server {\n listen 80;\n server_name localhost;\n location / { proxy_pass http://app:3000; proxy_set_header Host $host; }\n}\n"],{type:"text/plain"})},
 {name:"sample-image.svg",type:"SVG",category:"Images",description:"Scalable illustration for image upload testing.",make:()=>new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#ece9ff"/><circle cx="600" cy="400" r="210" fill="#7356e8"/><text x="600" y="420" text-anchor="middle" font-family="Arial" font-size="72" fill="white">DevBox</text></svg>'],{type:"image/svg+xml"})},
 {name:"sample.html",type:"HTML",category:"Developer",description:"Semantic HTML fixture for browser previews.",make:()=>new Blob(["<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><title>Sample page</title><main><h1>Hello from DevBox</h1><p>HTML upload fixture.</p></main></html>"],{type:"text/html"})}
];
function SampleFiles(){
 const [category,setCategory]=useState("All"),[query,setQuery]=useState(""),[busy,setBusy]=useState(false),[status,setStatus]=useState("");
 const categories=["All",...new Set(sampleFiles.map(x=>x.category))],filtered=sampleFiles.filter(x=>(category==="All"||x.category===category)&&(x.name+" "+x.type+" "+x.description).toLowerCase().includes(query.toLowerCase()));
 async function downloadAll(){setBusy(true);setStatus("");try{const entries=[];for(const item of filtered){const blob=await item.make();entries.push({name:item.name,data:new Uint8Array(await blob.arrayBuffer())})}downloadBlob("devbox-sample-files.zip",zipStore(entries));setStatus("Prepared "+entries.length+" sample files in a ZIP.")}catch(e){setStatus(e.message||"Could not create bundle.")}finally{setBusy(false)}}
 return <ToolShell title="Sample Files Library" subtitle="Download real document, spreadsheet, presentation, image and developer fixtures for testing uploads and previews."><div className="sample-library"><div className="sample-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search sample files…"/><select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(x=><option key={x}>{x}</option>)}</select><button className="primary" disabled={busy||!filtered.length} onClick={downloadAll}>{busy?"Preparing…":"Download filtered ZIP"} <Download size={14}/></button></div><div className="sample-category-row">{categories.map(x=><button key={x} className={category===x?"active":""} onClick={()=>setCategory(x)}>{x}</button>)}</div><div className="sample-grid">{filtered.map(item=><article className="sample-card" key={item.name}><div className="sample-file-icon">{item.name.split(".").pop().toUpperCase()}</div><div className="sample-card-copy"><strong>{item.name}</strong><span>{item.type} · {item.category}</span><p>{item.description}</p></div><button className="text-btn" onClick={async()=>{try{downloadBlob(item.name,await item.make())}catch(e){setStatus(e.message)}}}>Download <Download size={13}/></button></article>)}</div>{status&&<p className="icon-message">{status}</p>}<p className="data-note">Office files are generated locally as editable formats. All records are synthetic and example.test emails are reserved for documentation. No files are uploaded.</p></div></ToolShell>
}
function EnvGenerator(){const [rows,setRows]=useState([{key:'NODE_ENV',value:'development'},{key:'PORT',value:'3000'},{key:'DATABASE_URL',value:'mongodb://localhost:27017/app'},{key:'JWT_SECRET',value:'replace-me'}]);const output=rows.map(r=>r.key+'='+r.value.replace(/[\r\n]/g,'')).join('\n');return <ToolShell title="Environment File Builder" subtitle="Compose and download environment files with variable-name validation." value={output}><div className="env-rows">{rows.map((r,i)=><div className="env-row" key={i}><input value={r.key} onChange={e=>setRows(x=>x.map((v,n)=>n===i?{...v,key:e.target.value}:v))} placeholder="VARIABLE_NAME"/><input value={r.value} onChange={e=>setRows(x=>x.map((v,n)=>n===i?{...v,value:e.target.value}:v))} placeholder="value"/><button className="text-btn" onClick={()=>setRows(x=>x.filter((_,n)=>n!==i))}>Remove</button><small>{r.key&&!/^[A-Za-z_][A-Za-z0-9_]*$/.test(r.key)?'Invalid variable name':''}</small></div>)}</div><div className="advanced-footer"><button className="text-btn" onClick={()=>setRows(x=>[...x,{key:'',value:''}])}>+ Add variable</button><button className="primary" onClick={()=>downloadText('.env',output)}>Download .env <Download size={14}/></button></div><Panel label="PREVIEW"><pre className="code">{output}</pre></Panel><p className="data-note">Keep .env files out of source control. Share placeholders in .env.example instead.</p></ToolShell>}
function DockerComposeBuilder(){const [db,setDb]=useState('postgres'),[redis,setRedis]=useState(true);const output='services:\n  app:\n    build: .\n    ports: ["3000:3000"]\n    env_file: .env\n    depends_on:\n      '+db+': { condition: service_healthy }\n'+(redis?'  redis:\n    image: redis:7-alpine\n    restart: unless-stopped\n':'')+'  '+db+':\n    image: '+(db==='postgres'?'postgres:16-alpine':'mongo:7')+'\n    restart: unless-stopped\n    volumes:\n      - '+db+'-data:/var/lib/'+db+'\n    healthcheck:\n      test: ["CMD-SHELL", "'+(db==='postgres'?'pg_isready -U postgres':'mongosh --eval \'db.adminCommand("ping")\'')+'"]\n      interval: 10s\n      timeout: 5s\n      retries: 5\nvolumes:\n  '+db+'-data:\n';return <ToolShell title="Docker Compose Builder" subtitle="Generate a multi-service app stack with persistent storage and health checks." value={output}><div className="advanced-controls"><label className="action-field"><span>DATABASE</span><select value={db} onChange={e=>setDb(e.target.value)}><option value="postgres">PostgreSQL</option><option value="mongo">MongoDB</option></select></label><label className="check"><input type="checkbox" checked={redis} onChange={e=>setRedis(e.target.checked)}/> Include Redis</label></div><Panel label="DOCKER-COMPOSE.YML"><pre className="code">{output}</pre></Panel><button className="primary" onClick={()=>downloadText('docker-compose.yml',output)}>Download YAML <Download size={14}/></button><p className="data-note">Configure credentials through secrets or environment variables before production use. Review database volume paths for your selected image.</p></ToolShell>}
function GitignoreBuilder(){const rules={Node:'node_modules/\ndist/\n.env\n.env.*\n!.env.example\nnpm-debug.log*',React:'coverage/\n.vite/\n.next/\nbuild/',Python:'__pycache__/\n*.py[cod]\n.venv/\n.env',macOS:'.DS_Store\n.AppleDouble',Windows:'Thumbs.db\nehthumbs.db\nDesktop.ini',VSCode:'.vscode/*\n!.vscode/extensions.json',JetBrains:'.idea/\n*.iml',Docker:'*.log\n.docker/'};const [chosen,setChosen]=useState(['Node','React','macOS','VSCode']);const output=[...new Set(chosen.flatMap(x=>rules[x].split('\n')))].join('\n')+'\n';return <ToolShell title=".gitignore Builder" subtitle="Select the technologies in your project and generate ignore rules." value={output}><div className="stack-picker">{Object.keys(rules).map(x=><label key={x}><input type="checkbox" checked={chosen.includes(x)} onChange={e=>setChosen(a=>e.target.checked?[...a,x]:a.filter(v=>v!==x))}/>{x}</label>)}</div><Panel label="GENERATED .GITIGNORE"><pre className="code">{output}</pre></Panel><button className="primary" onClick={()=>downloadText('.gitignore',output)}>Download .gitignore <Download size={14}/></button></ToolShell>}
function MockDataStudio(){const [count,setCount]=useState('10'),[format,setFormat]=useState('json');const data=Array.from({length:Math.min(500,Math.max(1,Number(count)||1))},(_,i)=>({id:i+1,name:['Alex Morgan','Sam Taylor','Jordan Lee'][i%3],email:'user'+(i+1)+'@example.test',active:i%2===0,createdAt:new Date(Date.UTC(2024,0,i+1)).toISOString()}));const output=format==='json'?JSON.stringify(data,null,2):['id,name,email,active,createdAt',...data.map(x=>[x.id,x.name,x.email,x.active,x.createdAt].join(','))].join('\n');return <ToolShell title="Mock Data Studio" subtitle="Generate repeatable JSON or CSV fixtures for local development and tests." value={output}><div className="advanced-controls"><ActionField label="RECORD COUNT (1–500)" value={count} onChange={setCount} type="number"/><label className="action-field"><span>FORMAT</span><select value={format} onChange={e=>setFormat(e.target.value)}><option value="json">JSON</option><option value="csv">CSV</option></select></label></div><Panel label="GENERATED DATA"><pre className="code">{output.slice(0,12000)}</pre></Panel><p className="data-note">Synthetic records only; emails use example.test. Preview is capped, download contains the full generated dataset.</p></ToolShell>}
function ApiScaffold(){const [resource,setResource]=useState('users');const [model,setModel]=useState('User');const output='// routes/'+resource+'.routes.js\nimport { Router } from "express";\nimport { list'+model+'s, create'+model+' } from "../controllers/'+resource+'.controller.js";\nconst router = Router();\nrouter.get("/", list'+model+'s);\nrouter.post("/", create'+model+');\nexport default router;\n\n// controllers/'+resource+'.controller.js\nexport async function list'+model+'s(req,res,next){ try { res.json({data:[]}); } catch(error){ next(error); } }\nexport async function create'+model+'(req,res,next){ try { res.status(201).json({data:req.body}); } catch(error){ next(error); } }\n';return <ToolShell title="API Scaffold Generator" subtitle="Generate a minimal Express router and controller pair." value={output}><div className="advanced-controls"><ActionField label="RESOURCE NAME" value={resource} onChange={setResource}/><ActionField label="MODEL NAME" value={model} onChange={setModel}/></div><Panel label="GENERATED JAVASCRIPT"><pre className="code">{output}</pre></Panel><button className="primary" onClick={()=>downloadText(resource+'-scaffold.js',output)}>Download scaffold <Download size={14}/></button><p className="data-note">Starter code only. Add authentication, authorization, validation, persistence, rate limiting and tests before production use.</p></ToolShell>}
function CronStudio(){const [minute,setMinute]=useState('*/5'),[hour,setHour]=useState('*'),[day,setDay]=useState('*'),[month,setMonth]=useState('*'),[week,setWeek]=useState('*');const expression=[minute,hour,day,month,week].join(' ');return <ToolShell title="Cron Expression Studio" subtitle="Compose a standard five-field cron expression." value={expression}><div className="cron-fields">{[['Minute',minute,setMinute],['Hour',hour,setHour],['Day of month',day,setDay],['Month',month,setMonth],['Day of week',week,setWeek]].map(([label,value,change])=><label className="action-field" key={label}><span>{label.toUpperCase()}</span><input value={value} onChange={e=>change(e.target.value)}/></label>)}</div><div className="cron-output"><span>CRON EXPRESSION</span><strong>{expression}</strong><p>{minute==='*/5'?'Runs every five minutes':minute==='*'&&hour==='*'?'Runs every minute':'Custom schedule — verify in your target scheduler.'}</p></div><p className="data-note">Cron dialects vary. Validate special tokens and day-of-week numbering against your deployment scheduler.</p></ToolShell>}
function JsonSchemaGenerator(){const [input,setInput]=useState('{"id":1,"name":"Ada","active":true,"tags":["admin"]}');const schema=useMemo(()=>{try{const infer=v=>v===null?{type:'null'}:Array.isArray(v)?{type:'array',items:v.length?infer(v[0]):{}}:typeof v==='object'?{type:'object',properties:Object.fromEntries(Object.entries(v).map(([k,x])=>[k,infer(x)])),required:Object.keys(v),additionalProperties:false}:{type:typeof v==='number'?(Number.isInteger(v)?'integer':'number'):typeof v};return {ok:true,text:JSON.stringify({$schema:'https://json-schema.org/draft/2020-12/schema',...infer(JSON.parse(input))},null,2)}}catch(e){return {ok:false,text:e.message}}},[input]);return <ToolShell title="JSON Schema Generator" subtitle="Infer a Draft 2020-12 schema from a representative JSON payload." value={schema.ok?schema.text:''}><div className="split"><Editor label="SAMPLE JSON" value={input} onChange={setInput}/><Panel label="GENERATED SCHEMA" status={schema.ok?'Generated':'Invalid JSON'} statusGood={schema.ok}><pre className="code">{schema.text}</pre></Panel></div><p className="data-note">A single sample cannot infer optional fields or all variants. Review required properties and unions before production validation.</p></ToolShell>}
function ActionField({label,value,onChange,placeholder,type='text'}){return <label className="action-field"><span>{label}</span><input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></label>}

function PwaManifestBuilder(){
 const [name,setName]=useState("My Application"),[short,setShort]=useState("MyApp"),[start,setStart]=useState("/"),[theme,setTheme]=useState("#6757e8"),[bg,setBg]=useState("#ffffff"),[display,setDisplay]=useState("standalone");
 const manifest=JSON.stringify({id:start,start_url:start,scope:"/",name,short_name:short,display,orientation:"any",background_color:bg,theme_color:theme,icons:[192,512].map(n=>({src:"/icons/icon-"+n+".png",sizes:n+"x"+n,type:"image/png",purpose:"any maskable"}))},null,2);
 return <ToolShell title="PWA Manifest Builder" subtitle="Create install metadata and icon declarations for your progressive web app." value={manifest}><div className="generator-fields"><ActionField label="APPLICATION NAME" value={name} onChange={setName}/><ActionField label="SHORT NAME" value={short} onChange={setShort}/><ActionField label="START URL" value={start} onChange={setStart}/><label className="action-field"><span>DISPLAY MODE</span><select value={display} onChange={e=>setDisplay(e.target.value)}><option>standalone</option><option>fullscreen</option><option>minimal-ui</option><option>browser</option></select></label><ActionField label="THEME COLOR" value={theme} onChange={setTheme}/><ActionField label="BACKGROUND COLOR" value={bg} onChange={setBg}/></div><Panel label="MANIFEST.WEBMANIFEST"><pre className="code">{manifest}</pre></Panel><button className="primary" onClick={()=>downloadText("manifest.webmanifest",manifest)}>Download manifest <Download size={14}/></button><p className="data-note">Create the referenced PNG sizes with App Icon Studio and place them in your site's /icons directory.</p></ToolShell>
}
function RobotsSitemapBuilder(){
 const [domain,setDomain]=useState("https://example.com"),[paths,setPaths]=useState("/\n/about\n/contact\n/blog"),[disallow,setDisallow]=useState("/admin/\n/api/"),[allow,setAllow]=useState(true);
 const base=domain.trim().replace(/\/$/,""),urls=paths.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(x=>base+(x.startsWith("/")?x:"/"+x));
 const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(x=>'  <url><loc>'+x.replace(/&/g,"&amp;")+'</loc></url>').join("\n")+'\n</urlset>';
 const robots="User-agent: *\n"+(allow?"Allow: /\n":"Disallow: /\n")+disallow.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(x=>"Disallow: "+x).join("\n")+"\nSitemap: "+base+"/sitemap.xml\n";
 return <ToolShell title="Robots & Sitemap Generator" subtitle="Generate robots.txt directives and an XML sitemap from your public URLs." value={robots+"\n"+sitemap}><div className="generator-fields"><ActionField label="WEBSITE ORIGIN" value={domain} onChange={setDomain}/><label className="action-field"><span>PUBLIC PATHS (ONE PER LINE)</span><textarea value={paths} onChange={e=>setPaths(e.target.value)}/></label><label className="action-field"><span>DISALLOW PATHS</span><textarea value={disallow} onChange={e=>setDisallow(e.target.value)}/></label><label className="check"><input type="checkbox" checked={allow} onChange={e=>setAllow(e.target.checked)}/> Allow public crawling</label></div><div className="split"><Panel label="ROBOTS.TXT"><pre className="code">{robots}</pre><button className="text-btn" onClick={()=>downloadText("robots.txt",robots)}>Download robots.txt</button></Panel><Panel label="SITEMAP.XML"><pre className="code">{sitemap}</pre><button className="text-btn" onClick={()=>downloadText("sitemap.xml",sitemap)}>Download sitemap.xml</button></Panel></div><p className="data-note">Review canonical URLs and private routes before publishing crawler directives.</p></ToolShell>
}
function GithubActionsBuilder(){
 const [node,setNode]=useState("22"),[manager,setManager]=useState("npm"),[command,setCommand]=useState("npm run build"),[testCommand,setTestCommand]=useState("npm test"),[test,setTest]=useState(true),[deploy,setDeploy]=useState(false);
 const install=manager==="npm"?"npm ci":manager==="pnpm"?"pnpm install --frozen-lockfile":"yarn install --immutable";
 const workflow="name: CI\non:\n  push:\n    branches: [main]\n  pull_request:\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: "+node+"\n          cache: "+manager+"\n"+(manager==="npm"?"":"      - name: Enable package manager\n        run: corepack enable\n")+"      - name: Install dependencies\n        run: "+install+"\n"+(test?"      - name: Run tests\n        run: "+testCommand+"\n":"")+"      - name: Build\n        run: "+command+"\n"+(deploy?"      - name: Deployment placeholder\n        run: echo \"Configure deployment provider and credentials\"\n":"");
 return <ToolShell title="GitHub Actions Builder" subtitle="Generate a Node.js CI workflow with dependency caching, tests and build steps." value={workflow}><div className="generator-fields"><ActionField label="NODE VERSION" value={node} onChange={setNode}/><label className="action-field"><span>PACKAGE MANAGER</span><select value={manager} onChange={e=>setManager(e.target.value)}><option>npm</option><option>pnpm</option><option>yarn</option></select></label><ActionField label="BUILD COMMAND" value={command} onChange={setCommand}/>{test&&<ActionField label="TEST COMMAND" value={testCommand} onChange={setTestCommand}/>}<label className="check"><input type="checkbox" checked={test} onChange={e=>setTest(e.target.checked)}/> Include test step</label><label className="check"><input type="checkbox" checked={deploy} onChange={e=>setDeploy(e.target.checked)}/> Add deployment placeholder</label></div><Panel label=".GITHUB/WORKFLOWS/CI.YML"><pre className="code">{workflow}</pre></Panel><button className="primary" onClick={()=>downloadText("ci.yml",workflow)}>Download workflow <Download size={14}/></button><p className="data-note">Review test scripts and lockfile setup before committing. Deployment remains a placeholder until your provider and credentials are configured.</p></ToolShell>
}
function NginxBuilder(){
 const [domain,setDomain]=useState("example.com"),[port,setPort]=useState("3000"),[mode,setMode]=useState("proxy"),[spa,setSpa]=useState(false);
 const config=mode==="proxy"?"server {\n    listen 80;\n    server_name "+domain+";\n    location / {\n        proxy_pass http://127.0.0.1:"+port+";\n        proxy_http_version 1.1;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n}":"server {\n    listen 80;\n    server_name "+domain+";\n    root /var/www/"+domain+";\n    index index.html;\n    location / {\n        "+(spa?"try_files $uri $uri/ /index.html;":"try_files $uri $uri/ =404;")+"\n    }\n    location ~* \\.(css|js|png|jpg|jpeg|svg|woff2)$ {\n        expires 30d;\n        add_header Cache-Control \"public, immutable\";\n    }\n}";
 return <ToolShell title="Nginx Config Builder" subtitle="Create reverse-proxy or static-site server blocks with common production headers." value={config}><div className="generator-fields"><ActionField label="DOMAIN" value={domain} onChange={setDomain}/><label className="action-field"><span>SERVER TYPE</span><select value={mode} onChange={e=>setMode(e.target.value)}><option value="proxy">Node / API reverse proxy</option><option value="static">Static website</option></select></label>{mode==="proxy"&&<ActionField label="UPSTREAM PORT" value={port} onChange={setPort}/>}{mode==="static"&&<label className="check"><input type="checkbox" checked={spa} onChange={e=>setSpa(e.target.checked)}/> SPA fallback to index.html</label>}</div><Panel label="NGINX SERVER CONFIG"><pre className="code">{config}</pre></Panel><button className="primary" onClick={()=>downloadText("devbox-nginx.conf",config)}>Download config <Download size={14}/></button><p className="data-note">Validate with nginx -t and configure real TLS certificates, permissions, limits and upstream health checks before production.</p></ToolShell>
}

function ImageCompressor(){
 const [file,setFile]=useState(null),[preview,setPreview]=useState(""),[quality,setQuality]=useState(0.78),[width,setWidth]=useState(""),[format,setFormat]=useState("image/webp"),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState("");
 useEffect(()=>{if(!file){setPreview("");return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file]);
 async function compress(){if(!file)return;setBusy(true);setError("");setResult(null);try{
 const image=await createImageBitmap(file),maxW=Number(width)>0?Number(width):image.width,scale=Math.min(1,maxW/image.width),w=Math.max(1,Math.round(image.width*scale)),h=Math.max(1,Math.round(image.height*scale)),canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext("2d");if(!ctx)throw Error("Canvas is unavailable.");if(format==="image/jpeg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,w,h)}ctx.drawImage(image,0,0,w,h);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error("Could not encode image.")),format,quality)),ext=format==="image/jpeg"?"jpg":format==="image/png"?"png":"webp";
 setResult({blob,name:(file.name.replace(/\.[^.]+$/,"")||"image")+"-optimized."+ext,original:file.size,width:w,height:h});image.close?.();
 }catch(e){setError(e.message||"Compression failed.")}finally{setBusy(false)}}
 function save(){if(!result)return;const url=URL.createObjectURL(result.blob),a=document.createElement("a");a.href=url;a.download=result.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <ToolShell title="Image Compressor" subtitle="Compress and resize images directly in your browser. No upload service or account required.">
 <div className="generator-fields"><label className="action-field">IMAGE FILE<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{setFile(e.target.files?.[0]||null);setResult(null);setError("")}}/></label>
 <label className="action-field">OUTPUT FORMAT<select value={format} onChange={e=>{setFormat(e.target.value);setResult(null)}}><option value="image/webp">WebP (recommended)</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG (lossless)</option></select></label>
 <label className="action-field">MAXIMUM WIDTH (PX)<input type="number" min="1" max="12000" placeholder="Keep original width" value={width} onChange={e=>setWidth(e.target.value)}/></label>
 <label className="action-field">QUALITY · {Math.round(quality*100)}%<input type="range" min="0.2" max="1" step="0.01" value={quality} onChange={e=>setQuality(Number(e.target.value))}/></label></div>
 <div className="image-compress-preview">{preview?<img src={preview} alt="Selected image preview"/>:<div className="image-empty"><Palette size={28}/><strong>Choose an image to get started</strong><span>PNG, JPEG or WebP · processed locally</span></div>}</div>
 <div className="advanced-footer"><span className="data-note">{file?file.name+" · "+(file.size/1024).toFixed(1)+" KB":"Select an image; large files depend on available device memory."}</span><button className="primary" disabled={!file||busy} onClick={compress}>{busy?"Compressing…":"Compress image"}</button></div>
 {error&&<div className="alert error-box">{error}</div>}
 {result&&<div className="image-result"><div><strong>{result.name}</strong><span>{result.width+" × "+result.height+"px · "+(result.blob.size/1024).toFixed(1)+" KB"}</span><small>{result.blob.size<=result.original?Math.round((1-result.blob.size/result.original)*100)+"% smaller":Math.round((result.blob.size/result.original-1)*100)+"% larger — try lower quality or WebP"}</small></div><button className="primary" onClick={save}><Download size={14}/> Download</button></div>}
 <p className="data-note">Transparency is preserved in PNG/WebP. JPEG output uses a white background. Very large images may require substantial device memory.</p></ToolShell>
}
function SvgOptimizer(){
 const [input,setInput]=useState(""),[output,setOutput]=useState(""),[error,setError]=useState(""),[stats,setStats]=useState(null);
 function optimize(){setError("");setOutput("");setStats(null);try{
 if(!input.trim())throw Error("Paste SVG markup or load an .svg file first.");const doc=new DOMParser().parseFromString(input,"image/svg+xml");if(doc.querySelector("parsererror"))throw Error("The SVG markup is not valid XML.");
 const root=doc.documentElement;if(root.localName!=="svg")throw Error("The document root must be an SVG element.");
 doc.querySelectorAll("script,foreignObject,metadata,title,desc").forEach(n=>n.remove());[root,...doc.querySelectorAll("*")].forEach(el=>[...el.attributes].forEach(attr=>{if(/^on/i.test(attr.name)||/javascript\s*:/i.test(attr.value))el.removeAttribute(attr.name)}));
 const walker=doc.createTreeWalker(root,NodeFilter.SHOW_COMMENT),comments=[];while(walker.nextNode())comments.push(walker.currentNode);comments.forEach(n=>n.remove());
 let xml=new XMLSerializer().serializeToString(root).replace(/>\s+</g,"><").replace(/\s{2,}/g," ").trim();if(!/xmlns=/.test(xml))xml=xml.replace("<svg","<svg xmlns=\"http://www.w3.org/2000/svg\"");
 setOutput(xml);setStats({before:new Blob([input]).size,after:new Blob([xml]).size});
 }catch(e){setError(e.message)}}
 function load(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setInput(String(reader.result));reader.readAsText(file)}
 return <ToolShell title="SVG Optimizer" subtitle="Validate, clean and minify SVG markup with conservative browser-local cleanup." value={output}>
 <div className="sample-toolbar" style={{padding:14}}><label className="file-btn">Open SVG<input type="file" accept=".svg,image/svg+xml" onChange={load}/></label><button className="primary" onClick={optimize}>Optimize SVG <Zap size={14}/></button></div>
 <div className="split"><Editor label="SVG INPUT" value={input} onChange={setInput} placeholder="<svg xmlns=&quot;http://www.w3.org/2000/svg&quot;>…"/><Panel label="OPTIMIZED OUTPUT" status={stats?(stats.after/1024).toFixed(2)+" KB":"Waiting for input"} statusGood={!!stats}><pre className="code">{output||"Optimized SVG will appear here."}</pre></Panel></div>
 {error&&<div className="alert error-box">{error}</div>}
 {stats&&<div className="advanced-footer"><span className="data-note">{(stats.before/1024).toFixed(2)+" KB → "+(stats.after/1024).toFixed(2)+" KB · "+Math.round((1-stats.after/stats.before)*100)+"% size change"}</span><button className="primary" onClick={()=>downloadText("optimized.svg",output)}><Download size={14}/> Download SVG</button></div>}
 <p className="data-note">Lightweight cleanup, not a full SVGO replacement. Removes scripts, foreignObject content, metadata and event-handler attributes; inspect output before production use.</p></ToolShell>
}
function SqlSeedGenerator(){
 const [table,setTable]=useState("users"),[rows,setRows]=useState(10),[dialect,setDialect]=useState("postgres"),[seed,setSeed]=useState(42);
 const names=["Avery Chen","Jordan Smith","Taylor Morgan","Riley Patel","Casey Brown","Morgan Lee","Jamie Wilson","Alex Rivera","Sam Khan","Drew Taylor","Robin Garcia","Cameron Ali"],emails=["avery","jordan","taylor","riley","casey","morgan","jamie","alex","sam","drew","robin","cameron"];
 const valid=/^[A-Za-z_][A-Za-z0-9_]*$/.test(table),safeTable=valid?table:"users",q=dialect==="mysql"?String.fromCharCode(96):"\"",esc=v=>String(v).replace(/'/g,"''");
 const tuples=Array.from({length:Math.min(500,Math.max(1,Number(rows)||1))},(_,i)=>{const n=(i+Math.abs(Number(seed)||0))%names.length,id=i+1,active=i%4!==0,created=new Date(Date.UTC(2025,0,1)+i*86400000).toISOString();return "("+id+", '"+esc(names[n])+"', '"+emails[n]+id+"@example.test', '"+(active?"active":"inactive")+"', '"+created+"')"});
 const output="INSERT INTO "+q+safeTable+q+" ("+["id","name","email","status","created_at"].map(c=>q+c+q).join(", ")+") VALUES\n"+tuples.join(",\n")+";";
 return <ToolShell title="SQL Seed Data Generator" subtitle="Create repeatable INSERT fixtures for local development, demos and automated tests." value={output}>
 <div className="generator-fields"><label className="action-field">TABLE NAME<input value={table} onChange={e=>setTable(e.target.value)} placeholder="users"/></label><label className="action-field">SQL DIALECT<select value={dialect} onChange={e=>setDialect(e.target.value)}><option value="postgres">PostgreSQL</option><option value="mysql">MySQL / MariaDB</option></select></label><label className="action-field">ROW COUNT · MAX 500<input type="number" min="1" max="500" value={rows} onChange={e=>setRows(Math.min(500,Math.max(1,Number(e.target.value)||1)))}/></label><label className="action-field">SEED<input type="number" value={seed} onChange={e=>setSeed(Number(e.target.value)||0)}/></label></div>
 {!valid&&<div className="alert error-box">Use a simple SQL identifier: letters, numbers and underscores; it must not start with a number.</div>}
 <Panel label="SQL INSERT STATEMENTS"><pre className="code">{output}</pre></Panel>
 <div className="advanced-footer"><span className="data-note">{tuples.length+" rows · deterministic sample records · example.test emails"}</span><button className="primary" disabled={!valid} onClick={()=>downloadText("seed-data.sql",output)}><Download size={14}/> Download SQL</button></div>
 <p className="data-note">Fixed demo schema: id, name, email, status, created_at. Review column types and constraints against your actual database before running.</p></ToolShell>
}


function Base64FileTool(){
 const [mode,setMode]=useState("text-encode"),[input,setInput]=useState(""),[file,setFile]=useState(null),[filename,setFilename]=useState("decoded-file.bin"),[mime,setMime]=useState("application/octet-stream"),[output,setOutput]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[decoded,setDecoded]=useState(null);
 function bytesToBase64(bytes){let binary="";const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)}
 async function run(){
  setError("");setOutput("");setDecoded(null);setBusy(true);
  try{
   if(mode==="text-encode"){if(!input)throw Error("Enter text to encode.");setOutput(bytesToBase64(new TextEncoder().encode(input)))}
   else if(mode==="file-encode"){if(!file)throw Error("Choose a file first.");if(file.size>10*1024*1024)throw Error("For browser performance, files are limited to 10 MB.");setOutput(bytesToBase64(new Uint8Array(await file.arrayBuffer())))}
   else{
    const compact=input.replace(/\s+/g,"");if(!compact)throw Error("Paste Base64 content to decode.");if(compact.length>15*1024*1024)throw Error("Decoded data is too large for this browser tool.");
    let binary;try{binary=atob(compact)}catch{throw Error("Invalid Base64. Check the input and padding.")};
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));const blob=new Blob([bytes],{type:mime||"application/octet-stream"});setDecoded(blob);setOutput("Decoded "+bytes.length.toLocaleString()+" bytes successfully.");
   }
  }catch(e){setError(e.message||"Operation failed.")}finally{setBusy(false)}
 }
 function download(){if(mode==="decode"&&decoded){const url=URL.createObjectURL(decoded),a=document.createElement("a");a.href=url;a.download=filename||"decoded-file.bin";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}else if(output)downloadText(mode==="file-encode"?"file.base64.txt":"encoded.base64.txt",output)}
 return <ToolShell title="Base64 File Encoder" subtitle="Encode UTF-8 text or files, and decode Base64 into a downloadable file. All processing stays in your browser." value={output}>
  <div className="generator-fields"><label className="action-field">OPERATION<select value={mode} onChange={e=>{setMode(e.target.value);setOutput("");setError("");setDecoded(null)}}><option value="text-encode">Encode text</option><option value="file-encode">Encode file (max 10 MB)</option><option value="decode">Decode Base64</option></select></label>
  {mode==="file-encode"?<label className="action-field">SOURCE FILE<input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>:mode==="decode"?<><label className="action-field">OUTPUT FILE NAME<input value={filename} onChange={e=>setFilename(e.target.value)}/></label><label className="action-field">MIME TYPE<input value={mime} onChange={e=>setMime(e.target.value)} placeholder="application/octet-stream"/></label></>:null}</div>
  {mode!=="file-encode"&&<div className="generator-fields"><label className="action-field full-width"> {mode==="decode"?"BASE64 INPUT":"TEXT TO ENCODE"}<textarea rows="8" value={input} onChange={e=>setInput(e.target.value)} placeholder={mode==="decode"?"Paste Base64 content here…":"Enter text to encode as Base64…"}/></label></div>}
  {mode==="file-encode"&&<p className="data-note" style={{padding:"0 16px"}}>{file?file.name+" · "+(file.size/1024).toFixed(1)+" KB":"Choose any file up to 10 MB."}</p>}
  <div className="sample-toolbar" style={{padding:14}}><button className="primary" disabled={busy} onClick={run}>{busy?"Processing…":mode==="decode"?"Decode Base64":"Encode Base64"} <Zap size={14}/></button></div>
  {error&&<div className="alert error-box">{error}</div>}
  {output&&<div className="base64-output"><pre className="code">{output}</pre>{mode==="decode"&&decoded&&<span className="data-note">Binary data is ready to download.</span>}<button className="primary" onClick={download}><Download size={14}/> {mode==="decode"?"Download decoded file":"Download Base64 text"}</button></div>}
  <p className="data-note" style={{padding:"0 16px 14px"}}>Base64 is an encoding, not encryption. Do not use it to protect secrets. File encoding is limited to 10 MB.</p>
 </ToolShell>
}
function UuidBatchTool(){
 const [count,setCount]=useState(20),[format,setFormat]=useState("standard"),[uppercase,setUppercase]=useState(false),[items,setItems]=useState([]);
 function generate(){try{const next=Array.from({length:Math.min(1000,Math.max(1,Number(count)||1))},()=>{let id=crypto.randomUUID();if(format==="compact")id=id.replace(/-/g,"");if(format==="braces")id="{"+id+"}";return uppercase?id.toUpperCase():id});setItems(next)}catch{setItems([])}}
 const output=items.join("\n");
 return <ToolShell title="UUID Batch Generator" subtitle="Generate cryptographically secure UUID v4 identifiers in bulk for fixtures, databases and test data." value={output}>
  <div className="generator-fields"><label className="action-field">NUMBER OF UUIDS · MAX 1,000<input type="number" min="1" max="1000" value={count} onChange={e=>setCount(Math.min(1000,Math.max(1,Number(e.target.value)||1)))}/></label><label className="action-field">FORMAT<select value={format} onChange={e=>setFormat(e.target.value)}><option value="standard">Standard (hyphenated)</option><option value="compact">Compact (no hyphens)</option><option value="braces">Braces</option></select></label><label className="check"><input type="checkbox" checked={uppercase} onChange={e=>setUppercase(e.target.checked)}/> Uppercase output</label></div>
  <div className="sample-toolbar" style={{padding:14}}><button className="primary" onClick={generate}>Generate {Math.min(1000,Math.max(1,Number(count)||1))} UUIDs <Zap size={14}/></button>{items.length>0&&<button className="text-btn" onClick={()=>downloadText("devbox-uuids.txt",output)}><Download size={14}/> Export .txt</button>}</div>
  {items.length>0?<div className="uuid-list">{items.map((id,i)=><div className="uuid-row" key={i}><code>{id}</code><button className="text-btn" onClick={()=>copyText(id,()=>{})}><Copy size={13}/></button></div>)}</div>:<div className="empty-state"><Fingerprint size={26}/><strong>Your UUIDs will appear here</strong><span>Generate a batch to get started.</span></div>}
  <p className="data-note" style={{padding:"0 16px 14px"}}>Uses the browser's crypto.randomUUID() API. Requires a secure context (HTTPS or localhost); no network request is made.</p>
 </ToolShell>
}
function UrlInspectorTool(){
 const [raw,setRaw]=useState("https://example.com/products?category=books&page=2#reviews"),[key,setKey]=useState(""),[value,setValue]=useState(""),[error,setError]=useState("");
 const parsed=useMemo(()=>{try{return {url:new URL(raw),error:""}}catch(e){return {url:null,error:"Enter a complete, valid URL including https://"}}},[raw]);
 function updateParam(k,v){if(!parsed.url||!k.trim())return;const u=new URL(parsed.url);u.searchParams.set(k,v);setRaw(u.toString());setKey("");setValue("");setError("")}
 function removeParam(k){if(!parsed.url)return;const u=new URL(parsed.url);u.searchParams.delete(k);setRaw(u.toString())}
 const u=parsed.url,parts=u?[["Protocol",u.protocol],["Hostname",u.hostname],["Port",u.port||"(default)"],["Pathname",u.pathname],["Username",u.username||"(none)"],["Hash",u.hash||"(none)"],["Origin",u.origin]]:[];
 return <ToolShell title="URL Inspector & Builder" subtitle="Inspect URL components, decode query parameters and build updated URLs without sending network requests." value={u?u.toString():""}>
  <div className="generator-fields"><label className="action-field full-width">URL<input value={raw} onChange={e=>{setRaw(e.target.value);setError("")}} placeholder="https://example.com/path?key=value"/></label></div>
  {parsed.error&&<div className="alert error-box" style={{margin:16}}>{parsed.error}</div>}
  {u&&<><div className="url-parts-grid">{parts.map(([label,val])=><div className="url-part" key={label}><span>{label}</span><code>{val}</code></div>)}</div>
  <Panel label="QUERY PARAMETERS"><div className="url-query-list">{[...u.searchParams.entries()].length?[...u.searchParams.entries()].map(([k,v],i)=><div className="url-query-row" key={i}><code>{k}</code><span>{v}</span><button className="text-btn" onClick={()=>removeParam(k)}><Trash2 size={13}/> Remove</button></div>):<p className="data-note">This URL has no query parameters.</p>}</div></Panel>
  <div className="generator-fields"><label className="action-field">PARAMETER NAME<input value={key} onChange={e=>setKey(e.target.value)} placeholder="sort"/></label><label className="action-field">PARAMETER VALUE<input value={value} onChange={e=>setValue(e.target.value)} placeholder="newest"/></label></div>
  <div className="sample-toolbar" style={{padding:14}}><button className="primary" disabled={!key.trim()} onClick={()=>updateParam(key,value)}>Add / update parameter <Link2 size={14}/></button><button className="text-btn" onClick={()=>{const clean=new URL(u);clean.search="";setRaw(clean.toString())}}>Clear all parameters</button></div>
  <Panel label="UPDATED URL"><pre className="code">{u.toString()}</pre></Panel></>}
  <p className="data-note" style={{padding:"0 16px 14px"}}>URL parsing is local. Query values are decoded for display and safely re-encoded when updated. No request is sent to the URL.</p>
 </ToolShell>
}


function WebhookSender(){
 const [url,setUrl]=useState("https://httpbin.org/post"),[method,setMethod]=useState("POST"),[headers,setHeaders]=useState('{"Content-Type":"application/json"}'),[body,setBody]=useState('{"event":"user.created","data":{"id":"usr_123","email":"dev@example.com"}}'),[timeout,setTimeoutMs]=useState("15000"),[result,setResult]=useState(null),[busy,setBusy]=useState(false);
 async function send(){
  setResult(null);let parsedHeaders;
  try{parsedHeaders=JSON.parse(headers||"{}");if(!parsedHeaders||Array.isArray(parsedHeaders)||typeof parsedHeaders!=="object")throw Error("Headers must be a JSON object.");}
  catch(e){setResult({error:"Invalid headers JSON: "+e.message});return}
  try{const target=new URL(url);if(!["http:","https:"].includes(target.protocol))throw Error("Only HTTP and HTTPS URLs are supported.");}
  catch(e){setResult({error:e.message||"Enter a valid absolute URL."});return}
  const controller=new AbortController(),started=performance.now();const timer=window.setTimeout(()=>controller.abort(),Math.min(30000,Math.max(1000,Number(timeout)||15000)));
  setBusy(true);
  try{
   const response=await fetch(url,{method,headers:parsedHeaders,body:["GET","HEAD"].includes(method)?undefined:body,signal:controller.signal});
   const textBody=await response.text();let formatted=textBody;try{formatted=JSON.stringify(JSON.parse(textBody),null,2)}catch{}
   setResult({status:response.status,statusText:response.statusText,ok:response.ok,elapsed:Math.round(performance.now()-started),headers:[...response.headers.entries()],body:formatted});
  }catch(e){setResult({error:e.name==="AbortError"?"Request timed out.":e.message+" — the target may block browser requests with CORS."})}
  finally{window.clearTimeout(timer);setBusy(false)}
 }
 const output=result?JSON.stringify(result,null,2):"";
 return <ToolShell title="Webhook Request Tester" subtitle="Send an HTTP request to a webhook or API endpoint and inspect its response." value={output} onClear={()=>setResult(null)}>
  <div className="generator-fields"><label className="action-field">METHOD<select value={method} onChange={e=>setMethod(e.target.value)}>{["GET","POST","PUT","PATCH","DELETE","HEAD"].map(m=><option key={m}>{m}</option>)}</select></label><label className="action-field full-width">REQUEST URL<input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://your-service.com/webhook"/></label></div>
  <Editor label="HEADERS · JSON OBJECT" value={headers} onChange={setHeaders} />
  {!["GET","HEAD"].includes(method)&&<Editor label="REQUEST BODY" value={body} onChange={setBody}/>}
  <div className="control-row"><label>TIMEOUT <select value={timeout} onChange={e=>setTimeoutMs(e.target.value)}><option value="5000">5 seconds</option><option value="10000">10 seconds</option><option value="15000">15 seconds</option><option value="30000">30 seconds</option></select></label><button className="primary" disabled={busy||!url.trim()} onClick={send}>{busy?"Sending…":"Send request"} <Zap size={15}/></button></div>
  {result&&<Panel label="RESPONSE" status={result.error?"Request failed":String(result.status)+" "+result.statusText} statusGood={result.ok}>{result.error?<pre className="error">{result.error}</pre>:<><div className="jwt-status"><div><span>HTTP STATUS</span><strong>{result.status}</strong></div><div><span>DURATION</span><strong>{result.elapsed} ms</strong></div><div><span>RESULT</span><strong>{result.ok?"Success":"HTTP error"}</strong></div></div><h4>Response headers</h4><pre className="code">{result.headers.map(([k,v])=>k+": "+v).join("\\n")||"(none exposed)"}</pre><h4>Response body</h4><pre className="code wrap">{result.body||"(empty response)"}</pre></>}</Panel>}
  <p className="data-note" style={{padding:"0 16px 14px"}}>Browser limitation: cross-origin requests require the endpoint to allow your site's origin through CORS. This tool cannot receive inbound public webhooks or bypass CORS. Do not send production secrets to untrusted endpoints.</p>
 </ToolShell>
}
function ApiMockBuilder(){
 const [status,setStatus]=useState("200"),[delay,setDelay]=useState("0"),[headers,setHeaders]=useState('{"Content-Type":"application/json","Cache-Control":"no-store"}'),[body,setBody]=useState('{"success":true,"message":"Request completed","data":{"id":"item_001","name":"Sample item","active":true},"meta":{"page":1,"total":1}}'),[envelope,setEnvelope]=useState(false),[error,setError]=useState("");
 let parsed=null,headerObject=null;
 try{parsed=JSON.parse(body);if(envelope)parsed={status:Number(status),delayMs:Number(delay),data:parsed};}catch(e){error="Response body is not valid JSON: "+e.message}
 try{headerObject=JSON.parse(headers);if(!headerObject||Array.isArray(headerObject)||typeof headerObject!=="object")throw Error("Headers must be a JSON object.");}catch(e){error=error||"Headers are invalid: "+e.message}
 const output=error?"":JSON.stringify({status:Number(status),headers:headerObject,body:parsed},null,2);
 return <ToolShell title="API Mock Response Builder" subtitle="Create reusable mock API response fixtures for frontend development and automated tests." value={output} onClear={()=>{setBody("{}");setError("")}}>
  <div className="generator-fields"><label className="action-field">HTTP STATUS<select value={status} onChange={e=>setStatus(e.target.value)}>{["200","201","202","204","400","401","403","404","409","422","429","500","503"].map(n=><option key={n}>{n}</option>)}</select></label><label className="action-field">SIMULATED DELAY<select value={delay} onChange={e=>setDelay(e.target.value)}><option value="0">No delay</option><option value="250">250 ms</option><option value="500">500 ms</option><option value="1000">1 second</option><option value="2000">2 seconds</option></select></label></div>
  <Editor label="RESPONSE BODY · JSON" value={body} onChange={setBody}/>
  <Editor label="RESPONSE HEADERS · JSON" value={headers} onChange={setHeaders}/>
  <label className="check" style={{padding:"8px 16px"}}><input type="checkbox" checked={envelope} onChange={e=>setEnvelope(e.target.checked)}/> Wrap body with status and delay metadata</label>
  {error?<div className="alert error-box" style={{margin:16}}>{error}</div>:<Panel label="MOCK RESPONSE FIXTURE" status="Valid JSON" statusGood><pre className="code">{output}</pre></Panel>}
  <div className="sample-toolbar" style={{padding:14}}><button className="primary" disabled={!!error} onClick={()=>downloadText("api-mock-response.json",output)}><Download size={14}/> Download JSON fixture</button></div>
  <p className="data-note" style={{padding:"0 16px 14px"}}>Exports a fixture only; it does not start a network server or intercept real API traffic. Use the generated JSON in your mock service or test setup.</p>
 </ToolShell>
}

function App(){
  const initialTool=getToolFromPath();
  const [active,setActive]=useState(initialTool||"json");
  const [view,setView]=useState(initialTool?"workspace":"catalog");
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [mobile,setMobile]=useState(false);
  const [workspaceOpen,setWorkspaceOpen]=useState(false);
  const [historyItems,setHistoryItems]=useState(()=>{
    try{
      const value=JSON.parse(readStorage("devbox-history","[]"));
      return Array.isArray(value)?value.map(item=>({...item,toolId:canonicalToolId(item.toolId)})).filter(item=>item.toolId):[];
    }catch{return []}
  });
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [dark,setDark]=useState(readStorage("devbox-theme")!=="light");
  const [favorites,setFavorites]=useState(()=>{
    try{
      const value=JSON.parse(readStorage("devbox-favorites","[]"));
      return Array.isArray(value)?[...new Set(value.map(canonicalToolId).filter(Boolean))]:[];
    }catch{return []}
  });
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";writeStorage("devbox-theme",dark?"dark":"light")},[dark]);
  useEffect(()=>{
    if(!import.meta.env.PROD||!("serviceWorker" in navigator))return;
    const base=import.meta.env.BASE_URL||"/";
    navigator.serviceWorker.register(`${base}sw.js`,{scope:base}).catch(()=>{});
  },[]);

  useEffect(()=>setMeta(active),[active]);
  useEffect(()=>{
    const onPop=()=>{
      const next=getToolFromPath();
      setActive(next||"json");
      setView(next?"workspace":"catalog");
      setMobile(false);
      setQuery("");
      window.scrollTo({top:0,behavior:"auto"});
    };
    window.addEventListener("popstate",onPop);
    return()=>window.removeEventListener("popstate",onPop);
  },[]);
  useEffect(()=>writeStorage("devbox-history",JSON.stringify(historyItems.slice(0,40))),[historyItems]);
  const addHistory=item=>{const toolId=canonicalToolId(item.toolId)||item.toolId;setHistoryItems(prev=>[{...item,toolId,id:uuid(),createdAt:Date.now()},...prev.filter(x=>x.toolId!==toolId)].slice(0,40));};
  useEffect(()=>{window.__devboxAddHistory=addHistory;return()=>delete window.__devboxAddHistory},[]);
  useEffect(()=>writeStorage("devbox-favorites",JSON.stringify(favorites)),[favorites]);
  useEffect(()=>{
    const handler=e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.querySelector(".top-search input")?.focus()}
      if(e.key==="Escape"){setQuery("");document.querySelector(".top-search input")?.blur();setMobile(false)}
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[]);
  const filtered=tools.filter(t=>(category==="All"||t.category===category)&&(t.name+" "+t.desc+" "+t.category).toLowerCase().includes(query.toLowerCase()));
  const searchResults=query.trim()?tools.filter(t=>(t.name+" "+t.desc+" "+t.category).toLowerCase().includes(query.toLowerCase())).slice(0,7):[];
  const current=tools.find(t=>t.id===active)||tools[0];
  const favoriteTools=tools.filter(t=>favorites.includes(t.id));
  const recentTools=historyItems.map(item=>tools.find(t=>t.id===item.toolId)).filter((t,i,a)=>t&&a.findIndex(x=>x.id===t.id)===i).slice(0,5);
  function toggleFav(id){setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id])}
  function showCatalog(){
    setActive("json");setView("catalog");setCategory("All");setQuery("");setMobile(false);
    navigateTo(null);window.scrollTo({top:0,behavior:"smooth"});
  }
  function selectTool(id){
    const canonical=canonicalToolId(id);
    if(!tools.some(t=>t.id===canonical))return;
    const selected=tools.find(t=>t.id===canonical);
    addHistory({toolId:canonical,tool:selected.name,preview:selected.desc});
    setActive(canonical);setView("workspace");setMobile(false);setQuery("");
    navigateTo(canonical);window.scrollTo({top:0,behavior:"smooth"});
  }
  const content={"app-icon-studio":<AppIconStudio/>,"jwt-secret":<JwtSecretGenerator/>,"sample-files":<SampleFiles/>,"env-generator":<EnvGenerator/>,"docker-compose":<DockerComposeBuilder/>,"gitignore-builder":<GitignoreBuilder/>,"mock-data":<MockDataStudio/>,"api-scaffold":<ApiScaffold/>,"cron-builder":<CronStudio/>,"json-schema":<JsonSchemaGenerator/>,"http-client":<HttpClientWorkbench/>,"sql-workbench":<SqlWorkbench/>,"json-typescript":<JsonTypeGenerator/>,"openapi-workbench":<OpenApiWorkbench/>,"data-transform":<DataTransformWorkbench/>,"markdown-studio":<MarkdownStudio/>,"code-formatter":<CodeFormatterWorkbench/>,"hash-hmac":<HashHmacWorkbench/>,"headers-inspector":<HeadersInspector/>,"diff-merge":<DiffMergeWorkbench/>,"env-workbench":<EnvWorkbench/>,"pwa-manifest":<PwaManifestBuilder/>,"robots-sitemap":<RobotsSitemapBuilder/>,"github-actions":<GithubActionsBuilder/>,"nginx-builder":<NginxBuilder/>,"image-compressor":<ImageCompressor/>,"svg-optimizer":<SvgOptimizer/>,"sql-seed":<SqlSeedGenerator/>,"base64-file":<Base64FileTool/>,"uuid-batch":<UuidBatchTool/>,"url-inspector":<UrlInspectorTool/>,"curl-builder":<CurlWorkbench/>,"json-diff":<JsonDiffTool/>,"jwt-inspector":<JwtInspector/>,"regex-workbench":<RegexWorkbench/>,"timestamp-converter":<TimestampTool/>,"color-converter":<ColorTool/>,"webhook-sender":<WebhookSender/>,"api-mock-builder":<ApiMockBuilder/>}[active]||<AppIconStudio/>;

  return <div className="app">
    <header className="topbar">
      <button className="brand brand-button" onClick={showCatalog} aria-label="Go to DevBox home"><div className="brand-mark"><Command size={18}/></div><span>Dev<span>Box</span></span><small>DEVELOPER WORKSPACE</small></button>
      <div className="top-search">
        <Search size={17}/>
        <input value={query} onChange={e=>setQuery(e.target.value)} onFocus={()=>{if(view==="catalog")setCategory("All")}} placeholder="Search tools by name or task…" aria-label="Search developer tools"/>
        <kbd>⌘ K</kbd>
        {searchResults.length>0&&<div className="search-results">{searchResults.map(t=><button key={t.id} onMouseDown={e=>e.preventDefault()} onClick={()=>selectTool(t.id)}><span className="search-result-icon"><t.icon size={16}/></span><span><strong>{t.name}</strong><small>{t.category} · {t.desc}</small></span><ChevronRight size={15}/></button>)}</div>}
        {query.trim()&&!searchResults.length&&<div className="search-results search-empty"><span>No matching tools</span><button onClick={()=>setQuery("")}>Clear search</button></div>}
      </div>
      <div className="top-actions">
        <button className="icon-btn" title="Recent tools" aria-label="Recent tools" onClick={()=>setWorkspaceOpen(true)}><Clock3 size={17}/></button>
        <button className="icon-btn" onClick={()=>setDark(!dark)} title={dark?"Switch to light theme":"Switch to dark theme"} aria-label="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
        <button className="icon-btn" onClick={()=>setSettingsOpen(true)} title="Settings" aria-label="Settings"><Settings size={18}/></button>
        <button className="mobile-menu" onClick={()=>setMobile(!mobile)} aria-label={mobile?"Close navigation":"Open navigation"}>{mobile?<X/>:<Menu/>}</button>
      </div>
    </header>
    <div className="layout">
      {mobile&&<button className="sidebar-overlay" aria-label="Close navigation" onClick={()=>setMobile(false)}></button>}
      <aside className={mobile?"sidebar open":"sidebar"}>
        <div className="sidebar-scroll">
          <div className="side-label">WORKSPACE</div>
          <button className={view==="catalog"?"home-btn active":"home-btn"} onClick={showCatalog}><Sparkles size={16}/> All tools <span>{tools.length}</span></button>
          {favoriteTools.length>0&&<><div className="side-label">PINNED</div>{favoriteTools.map(t=><SideItem key={t.id} tool={t} active={active===t.id&&view==="workspace"} onClick={()=>selectTool(t.id)} fav onFav={()=>toggleFav(t.id)}/>)}</>}
          <div className="side-label">BROWSE BY CATEGORY</div>
          {categories.slice(1).map(cat=>{
            const list=tools.filter(t=>t.category===cat);
            if(!list.length)return null;
            return <details className="tool-group" key={cat}><summary className="category">{cat}<span>{list.length}</span><ChevronRight size={13}/></summary><div className="tool-group-items">{list.map(t=><SideItem key={t.id} tool={t} active={active===t.id&&view==="workspace"} onClick={()=>selectTool(t.id)} fav={favorites.includes(t.id)} onFav={()=>toggleFav(t.id)}/>)}</div></details>
          })}
        </div>
        <div className="side-bottom"><div className="privacy"><Lock size={15}/><div><strong>Local-first by default</strong><span>Core utilities run in your browser.</span></div></div><span className="version">DevBox · {tools.length} developer tools</span></div>
      </aside>
      <main className="main">
        {view==="workspace"?<>
          <div className="breadcrumb"><button onClick={showCatalog}>All tools</button><ChevronRight size={14}/><span>{current.category}</span><ChevronRight size={14}/><strong>{current.name}</strong><button className="favorite-main" aria-label={favorites.includes(current.id)?"Remove favorite":"Add favorite"} title={favorites.includes(current.id)?"Remove favorite":"Add favorite"} onClick={()=>toggleFav(current.id)}>{favorites.includes(current.id)?<Star fill="currentColor" size={17}/>:<Star size={17}/>}</button></div>
          <div className="workspace-toolbar"><button className="back-to-tools" onClick={showCatalog}><ChevronRight size={15}/> All tools</button><span className="workspace-category">{current.category}</span></div>
          <div className="workspace-view"><div className="content">{content}</div></div>
        </>:<>
          <section className="hero">
            <div className="hero-copy"><div className="eyebrow"><Zap size={14}/> THE DEVELOPER WORKFLOW TOOLBOX</div><h1>What are you<br/><span>building today?</span></h1><p>Find the right utility, open it, and get straight to work. Simple tools for everyday developer tasks — all in one workspace.</p><div className="hero-meta"><span><Lock size={13}/> Local-first</span><span><ShieldCheck size={13}/> Privacy-minded</span><span><Zap size={13}/> Ready in seconds</span></div></div>
            <div className="hero-stats"><div><strong>{tools.length}</strong><span>advanced tools</span></div><div><strong>0</strong><span>accounts needed</span></div></div>
          </section>
          <section className="catalog-section">
            <div className="section-heading"><div><span className="section-kicker">TOOL DIRECTORY</span><h2>Find the right tool for the job</h2><p className="catalog-subtitle">Browse by category or search for what you want to accomplish.</p></div><span className="tool-count">{filtered.length} of {tools.length}</span></div>
            {recentTools.length>0&&<section className="discovery-section"><div className="discovery-heading"><div><span className="section-kicker">PICK UP WHERE YOU LEFT OFF</span><h3>Recently used</h3></div><button className="subtle-link" onClick={()=>setWorkspaceOpen(true)}>View activity</button></div><div className="recent-row">{recentTools.map(t=><button className="recent-tool" key={t.id} onClick={()=>selectTool(t.id)}><t.icon size={16}/><span>{t.name}</span><ChevronRight size={14}/></button>)}</div></section>}
            {favoriteTools.length>0&&<section className="discovery-section"><div className="discovery-heading"><div><span className="section-kicker">YOUR PINNED TOOLS</span><h3>Favorites</h3></div></div><div className="recent-row">{favoriteTools.slice(0,6).map(t=><button className="recent-tool" key={t.id} onClick={()=>selectTool(t.id)}><Star size={14} fill="currentColor"/><span>{t.name}</span><ChevronRight size={14}/></button>)}</div></section>}
            <div className="category-pills">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}<span>{c==="All"?tools.length:tools.filter(t=>t.category===c).length}</span></button>)}</div>
            {filtered.length?<div className="quick-grid">{filtered.map(t=><button className="quick" key={t.id} onClick={()=>selectTool(t.id)}><span className="quick-icon"><t.icon size={18}/></span><span className="quick-copy"><strong>{t.name}</strong><small>{t.desc}</small><em>{t.category}</em></span><ChevronRight className="quick-arrow" size={16}/></button>)}</div>:<div className="catalog-empty"><Search size={22}/><h3>No tools found</h3><p>Try a different keyword or clear the category filter.</p><button className="text-btn" onClick={()=>{setQuery("");setCategory("All")}}>Clear filters</button></div>}
          </section>
          <section className="trust-strip"><div><Lock size={17}/><span><strong>Local-first</strong><small>Your content stays in your browser where possible.</small></span></div><div><ShieldCheck size={17}/><span><strong>No account needed</strong><small>Open a tool and get straight to work.</small></span></div><div><Zap size={17}/><span><strong>Focused workflows</strong><small>Clear controls and useful output, without clutter.</small></span></div></section>
        </>}
        <footer><span>© 2026 DevBox</span><span>Built for developers · Privacy first</span><span>Local processing where supported</span></footer>
      </main>
    </div>
    {workspaceOpen&&<WorkspaceModal items={historyItems} onClose={()=>setWorkspaceOpen(false)} onDelete={id=>setHistoryItems(items=>items.filter(x=>x.id!==id))} onClear={()=>setHistoryItems([])} onLoad={item=>{setWorkspaceOpen(false);selectTool(item.toolId)}}/>}
    {settingsOpen&&<div className="modal-backdrop" onClick={()=>setSettingsOpen(false)}><div className="settings-modal" onClick={e=>e.stopPropagation()}><div className="settings-head"><div><span className="section-kicker">PREFERENCES</span><h3>DevBox settings</h3></div><button className="icon-btn light" onClick={()=>setSettingsOpen(false)}><X size={17}/></button></div><div className="settings-row"><div><strong>Appearance</strong><span>Choose a theme that stays consistent across your workspace.</span></div><button className="setting-toggle" onClick={()=>setDark(!dark)}>{dark?<Moon size={15}/>:<Sun size={15}/>} {dark?"Dark":"Light"}</button></div><div className="settings-row"><div><strong>Favorites</strong><span>{favorites.length} pinned tool{favorites.length===1?"":"s"} saved on this device.</span></div><button className="setting-danger" onClick={()=>setFavorites([])}>Clear favorites</button></div><div className="settings-row"><div><strong>Privacy</strong><span>Core utilities process content locally when supported.</span></div><span className="local-badge"><Lock size={13}/> Local-first</span></div></div></div>}
  </div>
}
function SideItem({tool,active,onClick,fav,onFav}){return <div className={active?"side-item active":"side-item"}><button onClick={onClick}><tool.icon size={16}/><span>{tool.name}</span></button><button className="side-star" onClick={e=>{e.stopPropagation();onFav()}}>{fav?<Star size={13} fill="currentColor"/>:<Star size={13}/>}</button></div>}

createRoot(document.getElementById("root")).render(<App/>);
