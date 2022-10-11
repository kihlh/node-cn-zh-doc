const { app, BrowserWindow, session, protocol } = require('electron')
const path = require('path')
const fs = require("fs-extra");
let cs = new Set();
let csPath = new Set();
let url = require('url')
let sanitize = require("sanitize-filename");
function ID() { return (Date.now().toString(36) + Math.random().toString(36).slice(2, 7)).toUpperCase() }

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    //show:false,
    webPreferences: {
      nodeIntegration: false,/**启用node */
      webSecurity: false,/**关闭跨域安全限制 */
      contextIsolation: false,/**是否上下文隔离 */
      spellcheck: false,/**拼写检查器 关闭后不会有input红线 */
      nodeIntegrationInWorker: true,/**是否集成node到渲染页面 */
      webviewTag: true,/**允许启用webview标签页*/
      plugins: true,/**允许启用插件 */
      backgroundThrottling: false,/**禁止窗口节流，休眠 */
      enableRemoteModule: true
    },
  })

  // mainWindow.loadURL("https://rustwiki.org");
    mainWindow.loadURL("https://www.electronjs.org/");
  // Open the DevTools.
   mainWindow.webContents.openDevTools();















  let net = require('electron').remote ? require('electron').remote.net : require('electron').net;
  let node_url = require('url');
  let fs = require('fs');
  let path = require('path');
  let util = require('util');

  function download(url, Path, referer) {
    return new Promise(async function (resolve, reject) {
      try {
        if (!url) return reject("Not URL");
        if (typeof referer !== "string") referer = (new node_url.URL(url)).origin || url;
        let request = net.request(url);
        let buffList = new Set;
        request.on('error', error => reject(error));
        request.setHeader("user-agent", "mozilla/5.0 (windows nt 10.0; win64; x64) applewebkit/537.36 (khtml, like gecko) chrome/96.0.4664.45 safari/537.36");
        request.setHeader("sec-ch-ua-platform", '"Windows"');
        request.setHeader("sec-ch-ua", '"Chromium";v="96", "Google Chrome";v="96", ";Not A Brand";v="99"');
        request.setHeader("sec-fetch-site", 'same-origin');
        request.setHeader("sec-ch-ua-mobile", "?0");
        request.setHeader("connection", "keep-alive");
        request.setHeader("referer", referer);
        request.on('response',async (response) => {
          try {
            if (Path) {
              let dir = path.parse(Path).dir;
              if(!fs.existsSync(dir)){await util.promisify(fs.mkdir)(path.parse(Path).dir,{ recursive: true })};
              if(!(await util.promisify(fs.stat)(dir)).isDirectory()){return  reject("dir is not directory ")};
                try {
                  let getData = fs.createWriteStream(Path);
                  response.on('data', data => getData.write(data));
                  response.once('end', () => { getData.end() });
                  getData.once("close", () => { resolve({ body: null, path: Path, response, stream: getData, url, "content-type": response.headers['content-type'] }); });
                  getData.once("error", (error) => reject(error));
                } catch (error) { reject(error) }
              return
            }
            response.on('data', data => buffList.add(data));
            response.once('end', () => {
              let size = 0;
              let buffListArray = [...buffList];
              for (let index = 0; index < buffListArray.length; index++) {
                let buff = buffListArray[index];
                size += buff.byteLength;
              }
              let BuffConcat = Buffer.concat(buffListArray, size);

              resolve({ body: BuffConcat, response, size, url, "content-type": response.headers['content-type'] });
            });
          } catch (error) { reject(error) }
        });
        request.end();
      } catch (error) { reject(error) }
    });
  }

























  const { session } = require('electron')

  // Modify the user agent for all requests to the following urls.
  const filter = {
    urls: ['*://*/*']
  }


  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    console.log("Referer=>", details.url);
    let _parse = url.parse(details.url);
    let GetSanitizeRepPath = sanitize(_parse.pathname.replace(/[\\\/]/g, "_$PATH_SP$_"));
    let SanitizePath = GetSanitizeRepPath.replace(/_\$PATH_SP\$_/g, "/").replace(/[\\\/]+$/, '');
    let Ext = path.parse(SanitizePath).ext;
    let id = ID();
    let Add = {
      url: details.url,
      path: _parse.pathname,
      query: _parse.query,
      search: _parse.search,
      id: id,
      File: path.join(__dirname, "..",_parse.host, id + Ext.replace(/^[^\.]/, '$&.')),
      type: ""
    };
    let size_ = csPath.size;
    csPath.add(Add.url);
    if (size_ != csPath.size) {
      cs.add(Add);
 		     download(Add.url, Add.File,).then(data => {
        Add.type=data["content-type"];
        if(!Ext&&data["content-type"].match(/html/)){
          fs.rename(Add.File,Add.File+".html",function(){
            Add.File=Add.File+".html";
          })
        }
        console.log("download-OKK=> ", Add.url, Add.File);
        Add.download = true;
      }).catch(err => {
        Add.download = false;
        console.log("error=> ", Add.url, Add.File)
      });
    }
    Add.type = details.requestHeaders.Accept
    callback({ requestHeaders: details.requestHeaders })
  })

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})

setInterval(() => {
  fs.writeFileSync(path.join(__dirname, "..",'index.json'), JSON.stringify([...cs]));

}, 5000);



