"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const hmc = require("hmc-win32");
const Store = require("./Store/index@Renderer");
const electron = require("electron");
const hmc_shake_1 = __importDefault(require("hmc-shake"));
const path = require("path");
const fs = require("fs-extra");
const sanitize = require("sanitize-filename");
const jsonFormat = require("json-format");
const ftype = require("../file-type");
const push_Global = {
    store: new Store.Store(),
    hmc,
    electron,
    ipcRenderer: electron.ipcRenderer,
    clip: electron.clipboard,
    shake: hmc_shake_1.default,
    path,
    fs,
    jsonFormat, ftype, sanitize
};
window.console.warn = () => { };
let push_GlobalEntries = Object.entries(push_Global);
for (let index = 0; index < push_GlobalEntries.length; index++) {
    const [key, fn] = push_GlobalEntries[index];
    // @ts-expect-error
    window[key] = fn;
}
