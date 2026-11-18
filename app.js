const DB="devstudio-ai-projects-v3",ACTIVE="devstudio-ai-active-v3";
const STARTER=`void main() {
  print('Olá, DevStudio AI!');
}
`;
const $=id=>document.getElementById(id);
let projects=[];try{projects=JSON.parse(localStorage.getItem(DB)||"[]")}catch{projects=[]}
let activeId=localStorage.getItem(ACTIVE)||null,activeFile="main.dart";
const saveDB=()=>localStorage.setItem(DB,JSON.stringify(projects));
const current=()=>projects.find(p=>p.id===activeId);
const makeId=()=>"p"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function render(){
 $("projectCount").textContent=projects.length+(projects.length===1?" projeto":" projetos");
 const list=$("projectList");list.innerHTML="";
 if(!projects.length){list.innerHTML='<div class="empty-state">Você ainda não tem projetos. Toque em “Novo projeto” para criar o primeiro.</div>';return}
 [...projects].sort((a,b)=>b.updated-a.updated).forEach(p=>{
  const card=document.createElement("article");card.className="project-card";
  const head=document.createElement("div");head.className="project-head";
  const icon=document.createElement("div");icon.className="project-symbol";icon.textContent="{}";
  const wrap=document.createElement("div"),title=document.createElement("h3"),meta=document.createElement("div");
  title.textContent=p.name;meta.className="project-meta";meta.textContent=new Date(p.updated).toLocaleString("pt-BR");
  wrap.append(title,meta);head.append(icon,wrap);
  const desc=document.createElement("p");desc.textContent=Object.keys(p.files).length+" arquivo(s) • Projeto Dart";
  const actions=document.createElement("div");actions.className="card-actions";
  [["Abrir","primary",()=>openProject(p.id)],["Renomear","secondary",()=>renameProject(p.id)],["Excluir","secondary",()=>deleteProject(p.id)]].forEach(([label,style,fn])=>{const b=document.createElement("button");b.className="btn "+style;b.textContent=label;b.onclick=fn;actions.append(b)});
  card.append(head,desc,actions);list.append(card);
 });
}
function createProject(){
 const name=prompt("Nome do novo projeto:");if(!name||!name.trim())return;
 const p={id:makeId(),name:name.trim(),created:Date.now(),updated:Date.now(),files:{"main.dart":STARTER}};
 projects.push(p);saveDB();render();openProject(p.id);
}
function renameProject(id){const p=projects.find(x=>x.id===id);if(!p)return;const n=prompt("Novo nome do projeto:",p.name);if(!n||!n.trim())return;p.name=n.trim();p.updated=Date.now();saveDB();render();if(id===activeId)$("activeProjectName").textContent=p.name}
function deleteProject(id){const p=projects.find(x=>x.id===id);if(!p||!confirm("Excluir o projeto “"+p.name+"”? Esta ação não pode ser desfeita."))return;projects=projects.filter(x=>x.id!==id);saveDB();if(id===activeId){activeId=null;localStorage.removeItem(ACTIVE);$("workspace").classList.add("hidden")}render()}
function openProject(id){activeId=id;localStorage.setItem(ACTIVE,id);const p=current();if(!p)return;activeFile=Object.keys(p.files)[0]||"main.dart";if(!p.files[activeFile])p.files[activeFile]=STARTER;$("activeProjectName").textContent=p.name;$("workspace").classList.remove("hidden");loadFile();$("workspace").scrollIntoView({behavior:"smooth"})}
function loadFile(){const p=current();if(!p)return;$("codeEditor").value=p.files[activeFile]||"";$("fileNameLabel").textContent=activeFile;$("editorTitle").textContent=activeFile;paint();cursor();$("saveStatus").textContent="Salvo neste aparelho"}
function saveCode(){const p=current();if(!p)return;p.files[activeFile]=$("codeEditor").value;p.updated=Date.now();saveDB();$("saveStatus").textContent="Salvo neste aparelho";render()}
function esc(s){return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}
function paint(){let s=esc($("codeEditor").value);s=s.replace(/(\/\/.*)$/gm,'<span class="comment">$1</span>').replace(/('(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*")/g,'<span class="str">$1</span>').replace(/\b(class|const|final|var|void|int|double|String|bool|if|else|for|while|return|import|as|new|this|static|async|await|extends|implements)\b/g,'<span class="kw">$1</span>').replace(/\b([0-9]+(?:\.[0-9]+)?)\b/g,'<span class="num">$1</span>');$("highlightCode").innerHTML=s;$("lineNumbers").textContent=Array.from({length:Math.max(1,$("codeEditor").value.split("\n").length)},(_,i)=>i+1).join("\n")}
function cursor(){const before=$("codeEditor").value.slice(0,$("codeEditor").selectionStart);$("cursorInfo").textContent="Linha "+before.split("\n").length}
function newFile(){const p=current();if(!p)return;let n=prompt("Nome do arquivo:","novo_arquivo.dart");if(!n)return;n=n.trim();if(!n.includes("."))n+=".dart";if(p.files[n]!==undefined){alert("Já existe um arquivo com esse nome.");return}saveCode();p.files[n]="";activeFile=n;p.updated=Date.now();saveDB();loadFile()}
function renameFile(){const p=current();if(!p)return;let n=prompt("Novo nome:",activeFile);if(!n)return;n=n.trim();if(!n.includes("."))n+=".dart";if(n!==activeFile&&p.files[n]!==undefined){alert("Já existe um arquivo com esse nome.");return}p.files[n]=p.files[activeFile];delete p.files[activeFile];activeFile=n;saveDB();loadFile()}
function exportProject(){const p=current();if(!p)return;const blob=new Blob([JSON.stringify(p,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=p.name.replace(/[^a-z0-9-_]/gi,"_")+".json";a.click();URL.revokeObjectURL(url)}
function importFile(file){const r=new FileReader();r.onload=()=>{const content=String(r.result||"");if(file.name.endsWith(".json")){try{const obj=JSON.parse(content);if(obj.name&&obj.files){obj.id=makeId();obj.updated=Date.now();obj.created=Date.now();projects.push(obj);saveDB();render();openProject(obj.id);return}}catch{}alert("Arquivo de projeto inválido.");return}const p={id:makeId(),name:file.name.replace(/\.[^.]+$/,""),created:Date.now(),updated:Date.now(),files:{[file.name]:content}};projects.push(p);saveDB();render();openProject(p.id)};r.readAsText(file)}
$("createProjectBtn").onclick=createProject;$("importProjectBtn").onclick=()=>$("importInput").click();$("importInput").onchange=e=>{if(e.target.files[0])importFile(e.target.files[0]);e.target.value=""};
$("backProjectsBtn").onclick=()=>{$("workspace").classList.add("hidden");window.scrollTo({top:0,behavior:"smooth"})};
$("codeEditor").oninput=()=>{paint();saveCode()};$("codeEditor").onscroll=()=>{$("highlightCode").parentElement.scrollTop=$("codeEditor").scrollTop;$("highlightCode").parentElement.scrollLeft=$("codeEditor").scrollLeft;$("lineNumbers").scrollTop=$("codeEditor").scrollTop};$("codeEditor").onkeyup=cursor;$("codeEditor").onclick=cursor;
$("saveBtn").onclick=saveCode;$("newFileBtn").onclick=newFile;$("renameFileBtn").onclick=renameFile;$("exportProjectBtn").onclick=exportProject;
$("downloadBtn").onclick=()=>{const blob=new Blob([$("codeEditor").value],{type:"text/plain"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=activeFile;a.click();URL.revokeObjectURL(url)};
$("openDartPadBtn").onclick=()=>{$("dartpadPanel").classList.remove("hidden");$("dartpadPanel").scrollIntoView({behavior:"smooth"})};$("closeDartPadBtn").onclick=()=>$("dartpadPanel").classList.add("hidden");
render();if(activeId&&current())openProject(activeId);
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));