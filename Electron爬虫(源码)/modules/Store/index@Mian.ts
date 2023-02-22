import _Store = require('electron-store');
import electron = require('electron');
const ipcMian = electron.ipcMain;
export function Store(Options?: _Store.Options<Record<string, unknown>>) {
    let _Store_data = new _Store(Options);
    /**
     * 将JSON预处理一遍防止因为夹带私货而报错
     * @param input 
    * @returns 
    */
    function GetJSON(input: Object | Array<any> | Set<any>): Object | Array<any> {
        function ToJSONP(input: Object | Array<any>) {
            return JSON.parse(JSON.stringify(input));
        }
        if (input instanceof Set || input instanceof Array) {
            let NewData = new Array();
            for (const iterator of input) {
                NewData.push(iterator)
            }
            return ToJSONP(NewData)
        }
        return ToJSONP(input);
    }
    class StoreRenderer {
        data: Record<string, unknown>;
        on: (Type: string | string[], CallBack: any) => void;
        Set(key: string | string[], value?: unknown | any) {
            _Store_data.set(Array.isArray(key) ? key.join('.') : key, value || null);
        }

        Get(key?: string | string[]) {
            if (!key) return GetJSON(_Store_data.store);
            return _Store_data.get(Array.isArray(key) ? key.join('.') : key);
        }

        Has(key: string | string[]) {
            return _Store_data.has(Array.isArray(key) ? key.join('.') : key)
        }

        constructor() {
            this.data = _Store_data.store;
            this.on = function (Type: string | string[], CallBack) {
                _Store_data.onDidChange(Array.isArray(Type) ? Type.join(".") : Type, function (newValue: any, oldValue: any) {
                    if (CallBack) CallBack.apply(_Store_data.store, [newValue, oldValue, Type])
                })
            }
        }

    }
    function sendAll(channel: string, ...args: any[]) {
        if (!args) args = [];
        const WinContentsList = electron.webContents.getAllWebContents();
        return new Promise(async function (resolve, reject) {
            for (const WinConten of WinContentsList) {
                try {
                    WinConten.send(channel, ...args)
                } catch (error) {
                }
            }
            resolve(undefined)
        })

    }
    let IpcLinkStore = new StoreRenderer();
    /**Ipc StoreSet */
    function StoreSet(Event: Electron.IpcMainInvokeEvent, key: string, value?: unknown | any) {
        return IpcLinkStore.Set(key, value)
    }
    /**Ipc StoreHas */
    function StoreHas(Event: Electron.IpcMainInvokeEvent, key: string) {
        return IpcLinkStore.Has(key)
    }
    /**Ipc StoreGet */
    function StoreGet(Event: Electron.IpcMainInvokeEvent, key?: string) {
        return IpcLinkStore.Get(key)
    }
    /**Ipc StoreON */
    function StoreON(Event: Electron.IpcMainInvokeEvent, key: string) {
        IpcLinkStore.on(key, function (newValue: any, oldValue: any, key: string) {
            sendAll(`HMC_::_::StoreUpdateForKey_[${key}]`, newValue, oldValue, key, GetJSON(_Store_data.store))
        })
        return true
    }
    /**Ipc StoreSet */
    function StoreSetSync(Event: Electron.IpcMainInvokeEvent, key: string, value?: unknown | any) {
        Event.returnValue = IpcLinkStore.Set(key, value)
    }
    /**Ipc StoreHas */
    function StoreHasSync(Event: Electron.IpcMainInvokeEvent, key: string) {
        Event.returnValue = IpcLinkStore.Has(key)
    }
    /**Ipc StoreGet */
    function StoreGetSync(Event: Electron.IpcMainInvokeEvent, key?: string) {
        Event.returnValue = IpcLinkStore.Get(key)
    }
    ipcMian.on("HMC_::Sync::StoreSet", StoreSetSync);
    ipcMian.on("HMC_::Sync::StoreGet", StoreGetSync);
    ipcMian.on("HMC_::Sync::StoreHas", StoreHasSync);

    ipcMian.handle("HMC_::_::StoreSet", StoreSet);
    ipcMian.handle("HMC_::_::StoreGet", StoreGet);
    ipcMian.handle("HMC_::_::StoreHas", StoreHas);
    ipcMian.handle("HMC_::_::StoreON", StoreON);
    _Store_data.onDidAnyChange(function (newValue, oldValue,) {
        sendAll(`HMC_::_::StoreUpdateAll`, newValue, oldValue, GetJSON(_Store_data.store));
    });
    return _Store_data;
}

