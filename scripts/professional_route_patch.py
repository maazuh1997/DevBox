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
old='''  function selectTool(id){
    const scrollY=window.scrollY;
    setActive(id);
    navigateTo(id,scrollY);
    setMobile(false);
    setQuery("");
    requestAnimationFrame(()=>window.scrollTo({top:scrollY,behavior:"auto"}));
  }'''
new='''  function selectTool(id){
    if(!tools.some(t=>t.id===id))return;
    setActive(id);
    navigateTo(id);
    setMobile(false);
    setQuery("");
    window.scrollTo({top:0,behavior:"auto"});
  }'''
if old in s:s=s.replace(old,new,1)
main.write_text(s)
print("routing fixed")
