from pathlib import Path
import re

main=Path("src/main.jsx")
css=Path("src/styles.css")
s=main.read_text()

start=s.index("const tools = [")
end=s.index("];", start)+2
new_tools='''const tools = [
  {id:"json-diff",name:"JSON Diff",desc:"Compare JSON documents side by side.",category:"Data",icon:Braces},
  {id:"regex-workbench",name:"Regex Workbench",desc:"Live matches, groups and replacement preview.",category:"Text",icon:Regex},
  {id:"hash-generator",name:"Hash Generator",desc:"SHA hashes for text, locally in your browser.",category:"Security",icon:Hash},
  {id:"curl-builder",name:"cURL Builder",desc:"Build and copy production-ready cURL commands.",category:"API",icon:Globe2},
  {id:"http-client",name:"HTTP Client",desc:"Build, send and inspect HTTP requests.",category:"API",icon:Globe2},
  {id:"sql-workbench",name:"SQL Workbench",desc:"Format and inspect SQL locally.",category:"Database",icon:Database},
  {id:"openapi-workbench",name:"OpenAPI Workbench",desc:"Explore and inspect OpenAPI specifications.",category:"API",icon:Globe2},
  {id:"data-transform",name:"Data Transform",desc:"Convert YAML, JSON and CSV locally.",category:"Data",icon:Globe2},
  {id:"code-formatter",name:"Code Formatter",desc:"Format and minify code locally.",category:"Code",icon:Braces},
  {id:"env-workbench",name:".env Workbench",desc:"Inspect and validate environment variables.",icon:Lock,category:"Security"},
  {id:"hash-hmac",name:"Hash & HMAC",desc:"Generate SHA hashes and HMAC signatures.",icon:Hash,category:"Security"},
  {id:"diff-merge",name:"Diff & Merge",desc:"Compare and merge text or JSON.",icon:FileText,category:"Text"}
];'''
s=s[:start]+new_tools+s[end:]

route=re.compile(r'function getToolFromPath\(\)\{.*?\n\}',re.S)
s=route.sub('''function getToolFromPath(){
  const parts=window.location.pathname.replace(/^\\/+|\\/+$/g,"").split("/").filter(Boolean);
  const slug=parts[0]==="tools"?parts[1]:null;
  return tools.some(t=>t.id===slug)?slug:null;
}''',s,count=1)
nav=re.compile(r'function navigateTo\(id,scrollY=window\.scrollY\)\{.*?\n\}',re.S)
s=nav.sub('''function navigateTo(id){
  const next=id?`/tools/${id}`:"/";
  window.history.pushState({devboxTool:id||null},"",next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}''',s,count=1)

start=s.index('function App(){')
end=s.index('\nfunction SideItem',start)
app='''function App(){
  const [active,setActive]=useState(getToolFromPath());
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [mobile,setMobile]=useState(false);
  const [historyItems,setHistoryItems]=useState(()=>{try{const value=JSON.parse(localStorage.getItem("devbox-history")||"[]");return Array.isArray(value)?value:[]}catch(e){return[]}});
  const [settingsOpen,setSettingsOpen]=useState(false);
  const [dark,setDark]=useState(localStorage.getItem("devbox-theme")!=="light");
  const [favorites,setFavorites]=useState(()=>{try{const value=JSON.parse(localStorage.getItem("devbox-favorites")||"[]");return Array.isArray(value)?value:[]}catch(e){return[]}});
  useEffect(()=>{document.documentElement.dataset.theme=dark?"dark":"light";localStorage.setItem("devbox-theme",dark?"dark":"light")},[dark]);
  useEffect(()=>setMeta(active),[active]);
  useEffect(()=>localStorage.setItem("devbox-history",JSON.stringify(historyItems.slice(0,40))),[historyItems]);
  useEffect(()=>{window.__devboxAddHistory=item=>setHistoryItems(prev=>[{...item,id:crypto.randomUUID(),createdAt:Date.now()},...prev.filter(x=>x.toolId!==item.toolId)].slice(0,40));return()=>delete window.__devboxAddHistory},[]);
  useEffect(()=>localStorage.setItem("devbox-favorites",JSON.stringify(favorites)),[favorites]);
  useEffect(()=>{const onPop=()=>{setActive(getToolFromPath());setMobile(false);setQuery("");window.scrollTo({top:0,behavior:"auto"})};window.addEventListener("popstate",onPop);return()=>window.removeEventListener("popstate",onPop)},[]);
  useEffect(()=>{const handler=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.querySelector(".top-search input")?.focus()}if(e.key==="Escape")document.querySelector(".top-search input")?.blur()};window.addEventListener("keydown",handler);return()=>window.removeEventListener("keydown",handler)},[]);
  const filtered=tools.filter(t=>(category==="All"||t.category===category)&&(t.name+" "+t.desc+" "+t.category).toLowerCase().includes(query.toLowerCase()));
  const current=tools.find(t=>t.id===active)||tools[0];
  const favoriteTools=tools.filter(t=>favorites.includes(t.id));
  function toggleFav(id){setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id])}
  function selectTool(id){navigateTo(id);setActive(id);setMobile(false);setQuery("");window.scrollTo({top:0,behavior:"auto"})}
  function goHome(){navigateTo(null);setActive(null);setMobile(false);setQuery("");window.scrollTo({top:0,behavior:"auto"})}
  const content={
    "json-diff":<JsonDiffTool/>,"regex-workbench":<RegexWorkbench/>,"hash-generator":<HashWorkbench/>,"curl-builder":<CurlWorkbench/>,"http-client":<HttpClientWorkbench/>,"sql-workbench":<SqlWorkbench/>,"openapi-workbench":<OpenApiWorkbench/>,"data-transform":<DataTransformWorkbench/>,"code-formatter":<CodeFormatterWorkbench/>,"env-workbench":<EnvWorkbench/>,"hash-hmac":<HashHmacWorkbench/>,"diff-merge":<DiffMergeWorkbench/>
  }[active];
  const categories=["API","Data","Database","Security","Text","Code"];
  if(active&&content)return <div className="app tool-route"><header className="topbar"><button className="workspace-back" onClick={()=>window.history.length>1?window.history.back():goHome()}><ChevronRight size={17}/><span>Back to DevBox</span></button><button className="brand brand-button" onClick={goHome}><div className="brand-mark"><Command size={19}/></div><span>Dev<span>Box</span></span><small>DEVELOPER TOOLKIT</small></button><div className="tool-route-title"><span>{current.category}</span><strong>{current.name}</strong></div><div className="top-actions"><button className="icon-btn" onClick={()=>toggleFav(current.id)} title="Favorite">{favorites.includes(current.id)?<Star fill="currentColor" size={18}/>:<Star size={18}/>}</button><button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="icon-btn" onClick={()=>setSettingsOpen(true)} title="Settings"><Settings size={18}/></button></div></header><main className="tool-route-main"><div className="route-breadcrumb"><button onClick={goHome}>DevBox</button><ChevronRight size={14}/><span>{current.category}</span><ChevronRight size={14}/><strong>{current.name}</strong></div><section className="tool-fullscreen"><div className="tool-fullscreen-head"><div><span className="section-kicker">WORKSPACE</span><h1>{current.name}</h1><p>{current.desc}</p></div><div className="tool-fullscreen-actions"><button className="tool-action-btn" onClick={()=>toggleFav(current.id)}>{favorites.includes(current.id)?<Star fill="currentColor" size={15}/>:<Star size={15}/>} {favorites.includes(current.id)?"Saved":"Save"}</button></div></div><div className="content">{content}</div></section></main>{settingsOpen&&<div className="modal-backdrop" onClick={()=>setSettingsOpen(false)}><div className="settings-modal" onClick={e=>e.stopPropagation()}><div className="settings-head"><div><span className="section-kicker">PREFERENCES</span><h3>DevBox settings</h3></div><button className="icon-btn light" onClick={()=>setSettingsOpen(false)}><X size={17}/></button></div><div className="settings-row"><div><strong>Appearance</strong><span>Switch between dark and light themes.</span></div><button className="setting-toggle" onClick={()=>setDark(!dark)}>{dark?<Moon size={15}/>:<Sun size={15}/>} {dark?"Dark":"Light"}</button></div></div></div>}</div>;
  return <div className="app"><header className="topbar"><button className="brand brand-button" onClick={goHome}><div className="brand-mark"><Command size={19}/></div><span>Dev<span>Box</span></span><small>DEVELOPER TOOLKIT</small></button><div className="top-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search professional tools…"/><kbd>⌘ K</kbd></div><div className="top-actions"><button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button><button className="icon-btn" onClick={()=>setSettingsOpen(true)} title="Settings"><Settings size={18}/></button><button className="mobile-menu" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button></div></header><div className="layout">{mobile&&<button className="sidebar-overlay" aria-label="Close navigation" onClick={()=>setMobile(false)}></button>}<aside className={mobile?"sidebar open":"sidebar"}><div className="sidebar-scroll"><div className="side-label">WORKSPACE</div><button className="home-btn" onClick={goHome}><Sparkles size={17}/> All tools <span>{tools.length}</span></button>{favoriteTools.length>0&&<><div className="side-label">FAVORITES</div>{favoriteTools.map(t=><SideItem key={t.id} tool={t} active={active===t.id} onClick={()=>selectTool(t.id)} fav onFav={()=>toggleFav(t.id)}/>)}</>}<div className="side-label">PROFESSIONAL TOOLS</div>{categories.map(cat=>{const list=filtered.filter(t=>t.category===cat);if(!list.length)return null;return <div className="tool-group" key={cat}><div className="category">{cat}</div>{list.map(t=><SideItem key={t.id} tool={t} active={active===t.id} onClick={()=>selectTool(t.id)} fav={favorites.includes(t.id)} onFav={()=>toggleFav(t.id)}/>)}</div>})}</div><div className="side-bottom"><div className="privacy"><Lock size={15}/><div><strong>Runs locally</strong><span>Your data stays in your browser.</span></div></div><span className="version">DevBox v1.0</span></div></aside><main className="main"><section className="hero"><div className="hero-copy"><div className="eyebrow"><Zap size={14}/> PROFESSIONAL · PRIVATE · BROWSER-FIRST</div><h1><span className="outline-word">DEV</span><br/>TOOLS<br/><span>BUILT FOR WORK.</span></h1><p>A focused developer workspace for API engineering, data transformation, security analysis and everyday engineering workflows.</p><div className="hero-actions"><button className="hero-cta" onClick={()=>selectTool(tools[0].id)}>Open workspace <ChevronRight size={16}/></button><span><Lock size={13}/> No signup required</span></div></div><div className="hero-stats"><div><strong>{tools.length}</strong><span>professional tools</span></div><div><strong>0</strong><span>required APIs</span></div><div><strong>100%</strong><span>browser-first</span></div></div></section><div className="section-heading"><div><span className="section-kicker">ENGINEERING TOOLKIT</span><h2>Focused workspaces for real developer workflows.</h2></div><span className="tool-count">{filtered.length} tools</span></div><div className="category-pills">{["All",...categories].map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="quick-grid">{filtered.map(t=><button className="quick" key={t.id} onClick={()=>selectTool(t.id)}><t.icon size={17}/><span><strong>{t.name}</strong><small>{t.desc}</small></span><ChevronRight size={14}/></button>)}</div><section className="seo-section"><div><span className="section-kicker">DEVBOX</span><h2>Developer utilities without the clutter.</h2><p>Professional, browser-first workspaces for API development, data handling, security analysis and code workflows.</p></div></section><footer><span>© 2026 DevBox</span><span>Built for developers · Privacy first</span><span>Core processing stays local where possible</span></footer></main></div>{settingsOpen&&<div className="modal-backdrop" onClick={()=>setSettingsOpen(false)}><div className="settings-modal" onClick={e=>e.stopPropagation()}><div className="settings-head"><div><span className="section-kicker">PREFERENCES</span><h3>DevBox settings</h3></div><button className="icon-btn light" onClick={()=>setSettingsOpen(false)}><X size={17}/></button></div><div className="settings-row"><div><strong>Appearance</strong><span>Switch between dark and light themes.</span></div><button className="setting-toggle" onClick={()=>setDark(!dark)}>{dark?<Moon size={15}/>:<Sun size={15}/>} {dark?"Dark":"Light"}</button></div></div></div>}</div>
}
'''
s=s[:start]+app+s[end:]
main.write_text(s)

css_text=css.read_text()
marker='/* DevBox professional routing UI */'
if marker not in css_text:
    css_text += '''\n\n/* DevBox professional routing UI */\n.tool-route{min-height:100vh}.brand-button{border:0;background:transparent;color:inherit;cursor:pointer;padding:0;text-align:left}.workspace-back{display:flex;align-items:center;gap:6px;border:0;background:transparent;color:var(--muted,#999);cursor:pointer;font:inherit}.workspace-back svg{transform:rotate(180deg)}.tool-route-title{display:flex;align-items:center;gap:10px;margin-left:auto;margin-right:20px}.tool-route-title span{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted,#999)}.tool-route-title strong{font-size:14px}.tool-route-main{width:100%;padding:18px 28px 48px}.route-breadcrumb{display:flex;align-items:center;gap:7px;margin:0 auto 14px;max-width:1500px;color:var(--muted,#999);font-size:12px}.route-breadcrumb button{border:0;background:none;color:inherit;cursor:pointer;font:inherit}.tool-fullscreen{max-width:1500px;margin:0 auto;min-height:calc(100vh - 150px);border:1px solid rgba(128,128,128,.18);border-radius:18px;background:rgba(255,255,255,.02);overflow:hidden}.tool-fullscreen-head{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 24px;border-bottom:1px solid rgba(128,128,128,.16)}.tool-fullscreen-head h1{margin:4px 0 3px;font-size:25px}.tool-fullscreen-head p{margin:0;color:var(--muted,#999)}.tool-fullscreen-actions{display:flex;gap:8px}.tool-fullscreen .content{padding:0}.tool-fullscreen .tool-shell{border:0;border-radius:0;min-height:calc(100vh - 265px)}.tool-fullscreen .tool-head{position:sticky;top:68px;z-index:20;background:var(--surface,#111);backdrop-filter:blur(14px)}.tool-icon{width:36px!important;height:36px!important;min-width:36px!important}.tool-icon svg{width:18px!important;height:18px!important}@media(max-width:900px){.workspace-back span,.tool-route-title{display:none}.tool-route-main{padding:12px 14px 30px}.tool-fullscreen-head{align-items:flex-start;padding:18px}.tool-fullscreen-head h1{font-size:21px}}@media(max-width:600px){.tool-fullscreen{border-radius:12px}.tool-fullscreen-head{display:block}.tool-fullscreen-actions{margin-top:12px}.tool-fullscreen .tool-head{top:68px}}\n'''
    css.write_text(css_text)
print("patched")
