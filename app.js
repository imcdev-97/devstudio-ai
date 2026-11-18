const editor = document.getElementById("codeEditor");
const numbers = document.getElementById("lineNumbers");
const highlighted = document.getElementById("highlightCode");
const fileLabel = document.getElementById("fileNameLabel");
const editorTitle = document.getElementById("editorTitle");
const statusLabel = document.getElementById("saveStatus");
const STORAGE_KEY = "devstudio-ai-main-dart-v2";
const NAME_KEY = "devstudio-ai-file-name-v2";
const starter = `void main() {
  print('Olá, DevStudio AI!');
}
`;
let fileName = localStorage.getItem(NAME_KEY) || "main.dart";

function escapeHtml(value) {
  return value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function paintCode() {
  const source = editor.value;
  let html = escapeHtml(source);
  html = html.replace(/(\/\/.*)$/gm, '<span class="comment">$1</span>');
  html = html.replace(/('(?:\\\\.|[^'\\\\])*'|"(?:\\\\.|[^"\\\\])*")/g, '<span class="str">$1</span>');
  html = html.replace(/\b(class|const|final|var|void|int|double|String|bool|if|else|for|while|return|import|as|new|this|static|async|await|extends|implements|switch|case|break)\b/g, '<span class="kw">$1</span>');
  html = html.replace(/\b([0-9]+(?:\.[0-9]+)?)\b/g, '<span class="num">$1</span>');
  highlighted.innerHTML = html + (source.endsWith("\n") ? " " : "");
  const count = Math.max(1, source.split("\n").length);
  numbers.textContent = Array.from({length:count},(_,i)=>i+1).join("\n");
  fileLabel.textContent = fileName;
  editorTitle.textContent = fileName;
}
function save(showMessage=true) {
  localStorage.setItem(STORAGE_KEY, editor.value);
  localStorage.setItem(NAME_KEY, fileName);
  statusLabel.textContent = showMessage ? "Salvo neste aparelho" : "Salvamento automático";
}
function syncScroll() {
  highlighted.parentElement.scrollTop = editor.scrollTop;
  highlighted.parentElement.scrollLeft = editor.scrollLeft;
  numbers.scrollTop = editor.scrollTop;
}
editor.value = localStorage.getItem(STORAGE_KEY) ?? starter;
paintCode();
editor.addEventListener("input", () => { paintCode(); save(false); });
editor.addEventListener("scroll", syncScroll);
editor.addEventListener("keyup", updateCursor);
editor.addEventListener("click", updateCursor);
function updateCursor() {
  const before = editor.value.slice(0,editor.selectionStart);
  const line = before.split("\n").length;
  document.getElementById("cursorInfo").textContent = `Linha ${line}`;
}
document.getElementById("saveBtn").addEventListener("click", () => save(true));
document.getElementById("newBtn").addEventListener("click", () => {
  if (!confirm("Criar um novo arquivo? O código atual ficará salvo no navegador.")) return;
  save(false);
  editor.value = "";
  fileName = "novo_arquivo.dart";
  paintCode(); save(true); updateCursor();
});
document.getElementById("renameBtn").addEventListener("click", () => {
  const proposed = prompt("Nome do arquivo:", fileName);
  if (!proposed) return;
  fileName = proposed.endsWith(".dart") ? proposed : proposed + ".dart";
  paintCode(); save(true);
});
document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([editor.value], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=fileName; a.click();
  URL.revokeObjectURL(url);
});
const panel = document.getElementById("dartpadPanel");
document.getElementById("openDartPad").addEventListener("click", () => { panel.classList.remove("hidden"); panel.scrollIntoView({behavior:"smooth"}); });
document.getElementById("closeDartPad").addEventListener("click", () => panel.classList.add("hidden"));
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(()=>{}));
