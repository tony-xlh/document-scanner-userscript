// ==UserScript==
// @name     Document Scanner
// @namespace  https://www.dynamsoft.com
// @version    0.1
// @description  Add a document scanning button to your web pages.
// @author     Lihang Xu
// @match    https://www.bing.com
// @icon     https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant    none
// ==/UserScript==

let modal;
let DWObject;

const CSS = /* css */ `
.dwt-fab {
  position:absolute;
  bottom:0;
  width: 50px;
  height: 50px;
  left: 0;
  margin: 10px;
  border-radius: 50%;
  background: #2196f3;
  pointer-events: auto;
}

.dwt-fab:hover {
  background: #7db1d4;
}

.dwt-fab img {
  padding: 10px;
}

.dwt-modal {
  position:absolute;
  left: 20px;
  top: 20px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  border: 1px solid gray;
  border-radius: 5px;
  background: white;
}

.dwt-header {
  height: 25px;
}

.dwt-close-btn {
  float: right;
  margin-right: 5px;
}

.dwt-body {
  text-align: center;
  height: calc(100% - 25px);
}

.dwt-controls {
  text-align: center;
  height: 50px;
}

#dwtcontrolContainer {
  width: 100%;
  height: calc(100% - 50px);
}
`;

(function() {
  'use strict';
  GM_addStyle(CSS);
  console.log("DWT userscript loaded");
  init();
  // Your code here...
})();

async function init(){
  await loadLibrary("https://unpkg.com/dwt@18.0.0/dist/dynamsoft.webtwain.min.js","text/javascript");
  Dynamsoft.DWT.AutoLoad = false;
  Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@18.0.0/dist";
  addButton();
}

function addButton(){
  const button = document.createElement("div");
  button.className = "dwt-fab";
  const a = document.createElement("a")
  a.href = "javascript:void(0)";
  const icon = document.createElement("img")
  icon.src = "scanner-scan.svg"
  a.appendChild(icon);
  button.appendChild(a);
  document.body.appendChild(button);
  button.addEventListener("click", () => {
    showModal();
  });
}

function showModal(){
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "dwt-modal";
    document.body.appendChild(modal);
    const header = document.createElement("div");
    const closeBtn = document.createElement("div");
    closeBtn.className = "dwt-close-btn";
    closeBtn.innerText = "x";
    header.appendChild(closeBtn);
    header.className = "dwt-header";
    closeBtn.addEventListener("click", () => {
      hideModal();
    });
    const body = document.createElement("div");
    body.className = "dwt-body";
    const viewer = document.createElement("div");
    viewer.id = "dwtcontrolContainer";
    const controls = document.createElement("div");
    controls.className = "dwt-controls";
    const scanBtn = document.createElement("button");
    scanBtn.innerText = "Scan";
    scanBtn.addEventListener("click", () => {
      scan();
    });
    
    const copyBtn = document.createElement("button");
    copyBtn.innerText = "Copy selected";
    copyBtn.addEventListener("click", () => {
      copy();
    });

    controls.appendChild(scanBtn);
    controls.appendChild(copyBtn);
    body.appendChild(viewer);
    body.appendChild(controls);
    modal.appendChild(header);
    modal.appendChild(body);
    if (!DWObject) {
      initDWT();
    }
  }
  document.querySelector(".dwt-fab").style.display = "none";
  modal.style.display = "";
}

function hideModal(){
  modal.style.display = "none";
  document.querySelector(".dwt-fab").style.display = "";
}

function scan(){
  if (DWObject) {
    if (Dynamsoft.Lib.env.bMobile) {
      DWObject.Addon.Camera.scanDocument();
    }else {
      DWObject.SelectSource(function () {
        DWObject.OpenSource();
        DWObject.AcquireImage();
      },
        function () {
          console.log("SelectSource failed!");
        }
      );
    }
  }
}

function copy(){
  if (DWObject) {
    DWObject.CopyToClipboard(DWObject.CurrentImageIndexInBuffer);
    alert("Copied");
  }
}

function initDWT(){
  console.log("initDWT");
  Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer',Width: 270, Height: 350 }];
  Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', function () {
    console.log("ready");
    DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
    DWObject.Viewer.width = "100%";
    DWObject.Viewer.height = "100%";
    DWObject.SetViewMode(2,2);
  });
  Dynamsoft.DWT.Load();
}

function loadLibrary(src,type){
  return new Promise(function (resolve, reject) {
    let scriptEle = document.createElement("script");
    scriptEle.setAttribute("type", type);
    scriptEle.setAttribute("src", src);
    document.body.appendChild(scriptEle);
    scriptEle.addEventListener("load", () => {
      console.log(src+" loaded")
      resolve(true);
    });
    scriptEle.addEventListener("error", (ev) => {
      console.log("Error on loading "+src, ev);
      reject(ev);
    });
  });
}
