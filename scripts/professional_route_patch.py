from pathlib import Path
import re

main=Path("src/main.jsx")
s=main.read_text()
router='''function getToolFromPath(){
  const path=String(window.location.pathname||"");
  const base="/DevBox/";
  const relative=path.indexOf(base)===0?path.slice(base.length):path.replace(/^\\/+/,"");
  const parts=relative.split("/").filter(Boolean);
  const slug=parts[0]==="tools"?parts[1]:null;
  return tools.some(t=>t.id===slug)?slug:null;
}

function navigateTo(id){
  const next=id?`/DevBox/tools/${id}`:"/DevBox/";
  window.history.pushState({devboxTool:id||null},"",next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

'''
if "function getToolFromPath()" not in s:
    s=s.replace("function App(){",router+"function App(){",1)
else:
    s=re.sub(r'function getToolFromPath\(\)\{.*?\n\}\n\nfunction navigateTo\(id\)\{.*?\n\}\n\n',router,s,count=1,flags=re.S)

start=s.find("const tools = [")
end=s.find("];",start)
if start<0 or end<0: raise SystemExit("tools registry not found")
registry='''const tools = [
  {id:"http-client",name:"HTTP Client",desc:"Build, send and inspect HTTP requests.",category:"API",icon:Globe2},
  {id:"openapi-workbench",name:"OpenAPI Workbench",desc:"Explore and inspect OpenAPI specifications.",category:"API",icon:Globe2},
  {id:"curl-builder",name:"cURL Builder",desc:"Build and copy production-ready cURL commands.",category:"API",icon:Globe2},
  {id:"json-diff",name:"JSON Diff",desc:"Compare JSON documents side by side.",category:"Data",icon:Braces},
  {id:"data-transform",name:"Data Transform",desc:"Convert YAML, JSON and CSV locally.",category:"Data",icon:Braces},
  {id:"sql-workbench",name:"SQL Workbench",desc:"Format and inspect SQL locally.",category:"Database",icon:Database},
  {id:"jwt-inspector",name:"JWT Inspector",desc:"Decode JWT headers and claims.",category:"Security",icon:KeyRound},
  {id:"hash-generator",name:"Hash Generator",desc:"Generate SHA-256, SHA-384 and SHA-512 hashes.",category:"Security",icon:Hash},
  {id:"hash-hmac",name:"Hash & HMAC",desc:"Generate SHA hashes and HMAC signatures.",category:"Security",icon:Hash},
  {id:"env-workbench",name:".env Workbench",desc:"Inspect and validate environment variables.",category:"Security",icon:Lock},
  {id:"regex-workbench",name:"Regex Workbench",desc:"Live matches, groups and replacement preview.",category:"Text",icon:Regex},
  {id:"diff-merge",name:"Diff & Merge",desc:"Compare and merge text or JSON.",category:"Text",icon:FileText},
  {id:"markdown-studio",name:"Markdown Studio",desc:"Write and preview Markdown.",category:"Documentation",icon:FileText},
  {id:"code-formatter",name:"Code Formatter",desc:"Format and minify code locally.",category:"Code",icon:Braces},
  {id:"json-typescript",name:"JSON → TypeScript",desc:"Generate TypeScript interfaces from JSON.",category:"Code",icon:Braces},
  {id:"headers-inspector",name:"Headers Inspector",desc:"Inspect HTTP and security headers.",category:"API",icon:Globe2}
]'''
s=s[:start]+registry+s[end+2:]

old='''  function selectTool(id){
    if(!tools.some(t=>t.id===id))return;
    setActive(id);
    navigateTo(id);
    setMobile(false);
    setQuery("");
    window.scrollTo({top:0,behavior:"auto"});
  }'''
new='''  function selectTool(id){
    if(id!==null&&!tools.some(t=>t.id===id))return;
    setActive(id);
    navigateTo(id);
    setMobile(false);
    setQuery("");
    window.scrollTo({top:0,behavior:"auto"});
  }'''
s=s.replace(old,new,1)
s=s.replace('onClick={()=>selectTool("json")}', 'onClick={()=>selectTool(null)}', 1)

categories='["API","Data","Database","Security","Text","Code","Documentation"]'
s=re.sub(r'\["Formatters","Security","Generators","Encoding","Text","Converters","Network"\]',categories,s,count=1)
s=re.sub(r'\["All","Formatters","Security","Generators","Encoding","Text","Converters","Network"\]', '["All","API","Data","Database","Security","Text","Code","Documentation"]',s,count=1)

content_pattern=r'  const content=\{.*?\n  \}\[active\]\|\|<JsonTool/>;'
content_replacement='''  const content={
    "json-diff":<JsonDiffTool/>,"regex-workbench":<RegexWorkbench/>,"hash-generator":<HashWorkbench/>,"curl-builder":<CurlWorkbench/>,"http-client":<HttpClientWorkbench/>,"sql-workbench":<SqlWorkbench/>,"json-typescript":<JsonTypeGenerator/>,"openapi-workbench":<OpenApiWorkbench/>,"data-transform":<DataTransformWorkbench/>,"jwt-inspector":<JwtInspector/>,"markdown-studio":<MarkdownStudio/>,"code-formatter":<CodeFormatterWorkbench/>,"env-workbench":<EnvWorkbench/>,"hash-hmac":<HashHmacWorkbench/>,"headers-inspector":<HeadersInspector/>,"diff-merge":<DiffMergeWorkbench/>
  }[active]||null;'''
s,n=re.subn(content_pattern,content_replacement,s,count=1,flags=re.S)
if n!=1: raise SystemExit("content map not found")

s=s.replace('document.title=`${meta.title} — DevBox`;', 'document.title=active?`${meta.title} — DevBox`:"DevBox — Developer Toolkit";')
main.write_text(s)

css=Path("src/professional-cleanup.css")
css.write_text('''/* DevBox professional cleanup */
.quick-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border-top:1px solid var(--db-border);border-left:1px solid var(--db-border)}
.quick{height:78px;border-radius:0;border-top:0;border-left:0}
.quick svg:first-child{width:18px;height:18px;flex:0 0 18px}
.quick svg:last-child{width:14px;height:14px;flex:0 0 14px}
.quick span{min-width:0;display:flex;flex-direction:column;gap:4px}
.quick strong,.quick small{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tool-icon{width:36px!important;height:36px!important;min-width:36px!important;max-width:36px!important;display:grid!important;place-items:center!important;border-radius:50%!important}
.tool-icon svg{width:18px!important;height:18px!important;max-width:18px!important;max-height:18px!important}
.openapi-workbench .tool-icon,.openapi-workbench svg{max-width:18px;max-height:18px}
.openapi-layout{min-width:0}.openapi-spec,.openapi-explorer{min-width:0}
.openapi-spec textarea{width:100%;max-width:100%}
.endpoint-row{min-width:0}.endpoint-row code,.endpoint-row>span{min-width:0}
.category-pills{overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}.category-pills::-webkit-scrollbar{display:none}
.sidebar .side-item{min-width:0}.sidebar .side-item button:first-child{min-width:0}.sidebar .side-item button:first-child span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.content:empty{display:none}.content{min-width:0}
@media(max-width:1050px){.quick-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:760px){.quick-grid{grid-template-columns:1fr}.quick{height:70px}}
''')

imp='import "./professional-cleanup.css";'
if imp not in s:
    s=s.replace('import "./styles.css";', 'import "./styles.css";\n'+imp)
    main.write_text(s)
print("professional registry, navigation and UI cleanup applied")
