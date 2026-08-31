from pathlib import Path
import re

main=Path("src/main.jsx")
s=main.read_text()
start=s.find("const tools = [")
if start<0: raise SystemExit("tools registry not found")
end=s.find("];",start)
if end<0: raise SystemExit("tools registry end not found")
registry='''const tools = [
  {id:"json-diff",name:"JSON Diff",desc:"Compare JSON documents side by side.",category:"Data",icon:Braces},
  {id:"regex-workbench",name:"Regex Workbench",desc:"Live matches, groups and replacement preview.",category:"Text",icon:Regex},
  {id:"hash-generator",name:"Hash Generator",desc:"Create SHA-256, SHA-384 and SHA-512 hashes.",category:"Security",icon:Hash},
  {id:"curl-builder",name:"cURL Builder",desc:"Build and copy production-ready cURL commands.",category:"API",icon:Globe2},
  {id:"http-client",name:"HTTP Client",desc:"Build, send and inspect HTTP requests.",category:"API",icon:Globe2},
  {id:"sql-workbench",name:"SQL Workbench",desc:"Format and inspect SQL locally.",category:"Database",icon:Database},
  {id:"json-typescript",name:"JSON → TypeScript",desc:"Generate TypeScript interfaces from JSON.",category:"Code",icon:Braces},
  {id:"openapi-workbench",name:"OpenAPI Workbench",desc:"Explore and inspect OpenAPI specifications.",category:"API",icon:Globe2},
  {id:"data-transform",name:"Data Transform",desc:"Convert YAML, JSON and CSV locally.",category:"Data",icon:Globe2},
  {id:"jwt-inspector",name:"JWT Inspector",desc:"Decode JWT headers and claims.",category:"Security",icon:KeyRound},
  {id:"markdown-studio",name:"Markdown Studio",desc:"Write and preview Markdown.",category:"Documentation",icon:FileText},
  {id:"code-formatter",name:"Code Formatter",desc:"Format and minify code locally.",category:"Code",icon:Braces},
  {id:"env-workbench",name:".env Workbench",desc:"Inspect and validate environment variables.",category:"Security",icon:Lock},
  {id:"hash-hmac",name:"Hash & HMAC",desc:"Generate SHA hashes and HMAC signatures.",category:"Security",icon:Hash},
  {id:"headers-inspector",name:"Headers Inspector",desc:"Inspect HTTP and security headers.",category:"API",icon:Globe2},
  {id:"diff-merge",name:"Diff & Merge",desc:"Compare and merge text or JSON.",category:"Text",icon:FileText}
]'''
s=s[:start]+registry+s[end+2:]
main.write_text(s)

css=Path("src/styles.css")
c=css.read_text()
cleanup='''\n/* Professional UI cleanup */\n.tool-icon{width:34px;height:34px;min-width:34px;display:grid;place-items:center}.tool-icon svg{width:17px;height:17px}.tool-title h2{letter-spacing:-.15px}.tool-action-btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#ddd);background:var(--surface,#fff);color:var(--text,#30323d);border-radius:7px;padding:7px 9px;font-size:10px}.tool-action-btn:hover{border-color:rgba(124,92,255,.45);color:#684bdd}.section-heading{display:flex;align-items:end;justify-content:space-between;gap:20px;padding:25px 0 10px}.section-heading h2{margin:4px 0 0;font-size:18px;letter-spacing:-.4px}.section-kicker{font-size:9px;letter-spacing:1.2px;font-weight:800;color:#8e909a}.tool-count{font-size:10px;color:#9698a2}.category-pills{display:flex;gap:6px;flex-wrap:wrap;padding:8px 0}.category-pills button{border:1px solid var(--line,#ddd);background:var(--surface,#fff);color:#858792;border-radius:7px;padding:6px 10px;font-size:10px}.category-pills button.active{background:rgba(124,92,255,.1);border-color:rgba(124,92,255,.3);color:#684bdd}.quick{min-width:0}.quick span{min-width:0;display:flex;flex-direction:column;gap:2px}.quick strong,.quick small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.quick small{font-size:8px;color:#999ba5}.tool-route-main{padding-top:14px}.tool-fullscreen{box-shadow:0 18px 60px rgba(20,20,40,.05)}.tool-fullscreen-head h1{letter-spacing:-.6px}.modal-backdrop{position:fixed;inset:0;background:rgba(5,6,10,.55);backdrop-filter:blur(8px);z-index:100;display:grid;place-items:center;padding:20px}.settings-modal{width:min(460px,100%);background:var(--surface,#fff);border:1px solid var(--line,#ddd);border-radius:14px;box-shadow:0 24px 80px rgba(0,0,0,.2);padding:20px}.settings-head{display:flex;justify-content:space-between;align-items:flex-start}.settings-head h3{margin:4px 0 0;font-size:18px}.settings-row{margin-top:22px;border-top:1px solid var(--line,#eee);padding-top:18px;display:flex;align-items:center;justify-content:space-between;gap:20px}.settings-row div{display:flex;flex-direction:column;gap:4px}.settings-row span{font-size:10px;color:#9698a2}.setting-toggle{border:1px solid var(--line,#ddd);background:var(--surface,#fff);color:var(--text,#30323d);border-radius:8px;padding:8px 11px;font-size:10px;display:flex;align-items:center;gap:6px}.sidebar-overlay{display:none}@media(max-width:760px){.sidebar-overlay{display:block;position:fixed;inset:68px 0 0;background:rgba(0,0,0,.28);border:0;z-index:14}.section-heading{align-items:flex-start}.tool-route-main{padding:10px}.tool-fullscreen-head p{max-width:100%}}\n'''
if "/* Professional UI cleanup */" not in c:css.write_text(c+cleanup)
print("professional UI cleanup applied")
