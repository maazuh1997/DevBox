from pathlib import Path
import re

main=Path("src/main.jsx")
s=main.read_text()

def replace(pattern,replacement,label):
    global s
    s,n=re.subn(pattern,replacement,s,count=1,flags=re.S)
    if n!=1: raise SystemExit(label+" not found")

replace(r'function getToolFromPath\(\)\{.*?\n\}', '''function getToolFromPath(){
  const base="/DevBox/";
  let path=window.location.pathname;
  if(path.startswith(base))path=path.slice(base.length);
  else path=path.replace(/^\\/+/,"");
  const parts=path.split("/").filter(Boolean);
  const slug=parts[0]==="tools"?parts[1]:null;
  return tools.some(t=>t.id===slug)?slug:null;
}''',"getToolFromPath")
replace(r'function navigateTo\(id(?:,scrollY=window\.scrollY)?\)\{.*?\n\}', '''function navigateTo(id){
  const next=id?`/DevBox/tools/${id}`:"/DevBox/";
  window.history.pushState({devboxTool:id||null},"",next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}''',"navigateTo")
main.write_text(s)
print("base-aware routing patched")
