import hmc = require('hmc-win32');
import Store = require('./Store/index@Renderer');
import electron = require("electron");
import shake from 'hmc-shake';
import path = require('path');
import fs = require('fs-extra');
import fileType from "file-type";
import sanitize = require("sanitize-filename");

const jsonFormat: (json: any, config?: any) => string = require("json-format");
const ftype: (data: Buffer) => { ext: string, mime: string } = require("../file-type");
const push_Global = {
    store:new Store.Store(),
    hmc,
    electron,
    ipcRenderer:electron.ipcRenderer,
    clip:electron.clipboard,
    shake,
    path,
    fs,
    jsonFormat,ftype,sanitize
};
window.console.warn=()=>{};
let push_GlobalEntries = Object.entries(push_Global);
for (let index = 0; index < push_GlobalEntries.length; index++) {
    const [key,fn] = push_GlobalEntries[index];
    // @ts-expect-error
    window[key]=fn;
}

declare var window: Window & typeof globalThis & Declare

export type Declare = typeof push_Global;
export{}