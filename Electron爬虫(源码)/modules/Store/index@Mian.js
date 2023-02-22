"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const _Store = require("electron-store");
const electron = require("electron");
const ipcMian = electron.ipcMain;
function Store(Options) {
    let _Store_data = new _Store(Options);
    /**
     * 将JSON预处理一遍防止因为夹带私货而报错
     * @param input
    * @returns
    */
    function GetJSON(input) {
        function ToJSONP(input) {
            return JSON.parse(JSON.stringify(input));
        }
        if (input instanceof Set || input instanceof Array) {
            let NewData = new Array();
            for (const iterator of input) {
                NewData.push(iterator);
            }
            return ToJSONP(NewData);
        }
        return ToJSONP(input);
    }
    class StoreRenderer {
        data;
        on;
        Set(key, value) {
            _Store_data.set(Array.isArray(key) ? key.join('.') : key, value || null);
        }
        Get(key) {
            if (!key)
                return GetJSON(_Store_data.store);
            return _Store_data.get(Array.isArray(key) ? key.join('.') : key);
        }
        Has(key) {
            return _Store_data.has(Array.isArray(key) ? key.join('.') : key);
        }
        constructor() {
            this.data = _Store_data.store;
            this.on = function (Type, CallBack) {
                _Store_data.onDidChange(Array.isArray(Type) ? Type.join(".") : Type, function (newValue, oldValue) {
                    if (CallBack)
                        CallBack.apply(_Store_data.store, [newValue, oldValue, Type]);
                });
            };
        }
    }
    function sendAll(channel, ...args) {
        if (!args)
            args = [];
        const WinContentsList = electron.webContents.getAllWebContents();
        return new Promise(async function (resolve, reject) {
            for (const WinConten of WinContentsList) {
                try {
                    WinConten.send(channel, ...args);
                }
                catch (error) {
                }
            }
            resolve(undefined);
        });
    }
    let IpcLinkStore = new StoreRenderer();
    /**Ipc StoreSet */
    function StoreSet(Event, key, value) {
        return IpcLinkStore.Set(key, value);
    }
    /**Ipc StoreHas */
    function StoreHas(Event, key) {
        return IpcLinkStore.Has(key);
    }
    /**Ipc StoreGet */
    function StoreGet(Event, key) {
        return IpcLinkStore.Get(key);
    }
    /**Ipc StoreON */
    function StoreON(Event, key) {
        IpcLinkStore.on(key, function (newValue, oldValue, key) {
            sendAll(`HMC_::_::StoreUpdateForKey_[${key}]`, newValue, oldValue, key, GetJSON(_Store_data.store));
        });
        return true;
    }
    /**Ipc StoreSet */
    function StoreSetSync(Event, key, value) {
        Event.returnValue = IpcLinkStore.Set(key, value);
    }
    /**Ipc StoreHas */
    function StoreHasSync(Event, key) {
        Event.returnValue = IpcLinkStore.Has(key);
    }
    /**Ipc StoreGet */
    function StoreGetSync(Event, key) {
        Event.returnValue = IpcLinkStore.Get(key);
    }
    ipcMian.on("HMC_::Sync::StoreSet", StoreSetSync);
    ipcMian.on("HMC_::Sync::StoreGet", StoreGetSync);
    ipcMian.on("HMC_::Sync::StoreHas", StoreHasSync);
    ipcMian.handle("HMC_::_::StoreSet", StoreSet);
    ipcMian.handle("HMC_::_::StoreGet", StoreGet);
    ipcMian.handle("HMC_::_::StoreHas", StoreHas);
    ipcMian.handle("HMC_::_::StoreON", StoreON);
    _Store_data.onDidAnyChange(function (newValue, oldValue) {
        sendAll(`HMC_::_::StoreUpdateAll`, newValue, oldValue, GetJSON(_Store_data.store));
    });
    return _Store_data;
}
exports.Store = Store;
