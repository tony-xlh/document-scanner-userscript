## Write a Tampermonkey Userscript to Scan Documents

Tampermonkey is one of the most popular browser extensions with over 10 million users. It's available for Chrome, Microsoft Edge, Safari, Opera Next, and Firefox. It allows its users to customize and enhance the functionality of their favorite web pages with userscripts. Userscripts are small JavaScript programs that can be used to add new features or modify existing ones on web pages.[^tampermonkey]

In this article, we are going to write a Tampermonkey userscript to add the document scanning function to web pages. [Dynamic Web TWAIN](https://www.dynamsoft.com/web-twain/overview/) is used to provide the ability to scan documents via scanners or cameras.

The userscript adds a floating action button in the bottom-left. If it is clicked, a modal will appear for the users to scan documents. We can copy the scanned document into web apps like Microsoft Office. You can check out the video to see how it works.

<video src="https://user-images.githubusercontent.com/5462205/218029822-ac4fdb77-faaa-4469-a5ca-b1771a8715cd.mp4" data-canonical-src="https://user-images.githubusercontent.com/5462205/218029822-ac4fdb77-faaa-4469-a5ca-b1771a8715cd.mp4" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px;max-width:100%;"></video>

A userscript template looks like the following. We can define the metadata of it and write JavaScript codes.

```js
// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.tampermonkey.net/index.php
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
})();
```

We have to use JavaScript to create elements, add styles and add external libraries.

For convenience, we can write the code in a normal HTML file first and then adapt it as a userscript.

### Write a Document Scanning Page

1. Create a new HTML file with the following template:

   ```html
   <!DOCTYPE html>
   <html>
   <head>
       <title>Dynamic Web TWAIN Sample</title>
       <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0" />
       <style>
       </style>
   </head>
   <body>
     </div>
     <script type="text/javascript">
     </script>
   </body>
   </html>
   ```
   
2. Load the library of Dynamic Web TWAIN from CDN, set its resources path and disable autoload.

   ```js
   init();
   async function init(){
     await loadLibrary("https://unpkg.com/dwt@18.0.0/dist/dynamsoft.webtwain.min.js","text/javascript");
     Dynamsoft.DWT.AutoLoad = false;
     Dynamsoft.DWT.ResourcesPath = "https://unpkg.com/dwt@18.0.0/dist";
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
   ```
   
3. Add a floating action button in the bottom-left. Clicking the button will reveal a modal for document scanning.

   JavaScript:
   
   ```js
   async function init(){
     addButton();
   }

   function addButton(){
   const button = document.createElement("div");
   button.className = "dwt-fab";
   const a = document.createElement("a")
   a.href = "javascript:void(0)";
   const icon = document.createElement("img")
   icon.src = "https://tony-xlh.github.io/document-scanner-userscript/scanner-scan.svg"
   a.appendChild(icon);
   button.appendChild(a);
   document.body.appendChild(button);
   button.addEventListener("click", () => {
     showModal();
   });
   }
   ```
   
   CSS:
   
   ```css
   .dwt-fab {
     position:fixed;
     bottom:0;
     width: 50px;
     height: 50px;
     left: 0;
     margin: 10px;
     border-radius: 50%;
     background: #2196f3;
     pointer-events: auto;
     z-index: 9999;
   }

   .dwt-fab:hover {
     background: #7db1d4;
   }

   .dwt-fab img {
     padding: 10px;
   }
   ```
   
4. Add or show the modal in the `showModal` function and add a button to hide the modal.

   ```js
   let modal;
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
       
       modal.appendChild(header);
     }
     document.querySelector(".dwt-fab").style.display = "none";
     modal.style.display = "";
   }
   
   function hideModal(){
     modal.style.display = "none";
     document.querySelector(".dwt-fab").style.display = "";
   }
   ```
   
   CSS:
   
   ```css
   .dwt-modal {
     position:fixed;
     left: 20px;
     top: 20px;
     width: calc(100% - 40px);
     height: calc(100% - 40px);
     border: 1px solid gray;
     border-radius: 5px;
     background: white;
     z-index: 9999;
   }

   .dwt-header {
     height: 25px;
   }

   .dwt-close-btn {
     float: right;
     margin-right: 5px;
   }
   ```
   
5. In the modal, add a body container which contains a container for the viewer control of Dynamic Web TWAIN and initialize Web TWAIN if it has not been initialized. You may need to [apply for a license](https://www.dynamsoft.com/customer/license/trialLicense?product=dwt) to use Web TWAIN.

   ```js
   let DWObject;
   function showModal(){
      //...
      const body = document.createElement("div");
      body.className = "dwt-body";
      const viewer = document.createElement("div");
      viewer.id = "dwtcontrolContainer";
      body.appendChild(viewer);
      modal.appendChild(body);
      if (!DWObject) {
        initDWT();
      }
   }
   
   function initDWT(){
     Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer',Width: 270, Height: 350 }];
     //Dynamsoft.DWT.ProductKey = "<your license key>"; //a public trial will be used if the key is not specified
     Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', function () {
       console.log("ready");
       DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
       DWObject.Viewer.width = "100%";
       DWObject.Viewer.height = "100%";
       DWObject.SetViewMode(2,2);
     });
     Dynamsoft.DWT.Load();
   }
   ```

6. Add a container for controls. There is a scan button, a copy button, a save button and a status bar.

   ```js
   function showModal(){
     //...
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

     const saveBtn = document.createElement("button");
     saveBtn.innerText = "Save";
     saveBtn.addEventListener("click", () => {
       save();
     });

     const status = document.createElement("div");
     status.className="dwt-status";

     controls.appendChild(scanBtn);
     controls.appendChild(copyBtn);
     controls.appendChild(saveBtn);
     controls.appendChild(status);
   }
   
   function initDWT(){
     console.log("initDWT");
     const status = document.querySelector(".dwt-status"); //add status info
     Dynamsoft.DWT.Containers = [{ ContainerId: 'dwtcontrolContainer',Width: 270, Height: 350 }];
     Dynamsoft.DWT.RegisterEvent('OnWebTwainReady', function () {
       console.log("ready");
       status.innerText = "";  //add status info
       DWObject = Dynamsoft.DWT.GetWebTwain('dwtcontrolContainer');
       DWObject.Viewer.width = "100%";
       DWObject.Viewer.height = "100%";
       DWObject.SetViewMode(2,2);
     });
     status.innerText = "Loading...";  //add status info
     Dynamsoft.DWT.Load();
   }
   ```
   
   CSS:
   
   ```css
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
   ```
   
   The `scan` function scans documents from scanners on desktop devices or cameras on mobile devices:
   
   ```js
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
   ```
   
   The `save` function saves scanned documents into a PDF file.
   
   ```js
   function save(){
     if (DWObject) {
       DWObject.SaveAllAsPDF("Scanned");
     }
   }
   ```
   
   The `copy` function copies the selected image into the clipboard. It uses the Web TWAIN's built-in API for desktop browsers and the [Clipboard API](https://www.dynamsoft.com/codepool/clipboard-api-and-dynamic-web-twain.html) for mobile browsers.
   
   ```js
   function copy(){
     if (DWObject) {
       if (Dynamsoft.Lib.env.bMobile) {
         DWObject.ConvertToBlob(
           [DWObject.CurrentImageIndexInBuffer],
           Dynamsoft.DWT.EnumDWT_ImageType.IT_PNG,
           function(result) {
             CopyBlobToClipboard(result);
           },
           function(errorCode,errorString) {
             console.log("convert failed");
             console.log(errorString);
             alert("Failed");
           });
       }else{
         DWObject.CopyToClipboard(DWObject.CurrentImageIndexInBuffer);
         alert("Copied");
       }
     }
   }

   function CopyBlobToClipboard(blob) {
     var data = [new ClipboardItem({ "image/png": blob})];
     navigator.clipboard.write(data).then(function() {
       alert("Copied");
     }, function() {
       alert("Failed");
     });
   }
   ```
   
All right, we've now finished writing the page. We can then adapt it into a userscript.

### Adapt the Web Page into a Tampermonkey Userscript

1. In the userscript metadata, grant the `GM_addStyle` function to add styles and set `@include` to `*` so that the script works for all web pages.


   ```js
   // ==UserScript==
   // @include *
   // @grant GM_addStyle
   // ==/UserScript==
   ```
   
2. Paste the CSS into the script and load it using `GM_addStyle`.

   ```js
   const CSS = /* css */ `
   .dwt-fab {
     position:fixed;
     bottom:0;
     width: 50px;
     height: 50px;
     left: 0;
     margin: 10px;
     border-radius: 50%;
     background: #2196f3;
     pointer-events: auto;
     z-index: 9999;
   }

   .dwt-fab:hover {
     background: #7db1d4;
   }

   .dwt-fab img {
     padding: 10px;
   }

   .dwt-modal {
     position:fixed;
     left: 20px;
     top: 20px;
     width: calc(100% - 40px);
     height: calc(100% - 40px);
     border: 1px solid gray;
     border-radius: 5px;
     background: white;
     z-index: 9999;
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
   })();
   ```
   
3. Run `init` which loads the Web TWAIN library and adds the floating action button.

   ```js
   (function() {
     'use strict';
     GM_addStyle(CSS);
     init();
   })();
   ```
   
The rest code is the same as the web page's.

## Source Code

Get the source code of the script to have a try:

<https://github.com/tony-xlh/document-scanner-userscript/>

## References

[^tampermonkey]: <https://www.tampermonkey.net/>
