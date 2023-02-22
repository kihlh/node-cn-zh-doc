"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const electron = require("electron");
const hmc = require("hmc-win32");
function awaitResults(Results) {
    let results_OK = false;
    Results.finally(function () {
        results_OK = true;
    });
    while (results_OK) {
        hmc.sleep(10);
    }
}
class Store {
    /**
     * 数据体 实时更新
     */
    store;
    constructor() {
        let _this = this;
        electron.ipcRenderer.invoke("HMC_::_::StoreGet").then(data => this.store = data);
        electron.ipcRenderer.on(`HMC_::_::StoreUpdateAll`, function (event, newValue, oldValue, store) {
            _this.store = newValue;
        });
    }
    /**
     * 从长存储中读取默认用户设置
     * @param key
     * @returns
     */
    async Get(key) {
        return electron.ipcRenderer.invoke("HMC_::_::StoreGet", Array.isArray(key) ? key.join('.') : key);
    }
    /**
     * 从长存储中读取默认用户设置
     * @param key
     * @returns
     */
    get(key) {
        return electron.ipcRenderer.sendSync("HMC_::Sync::StoreGet", Array.isArray(key) ? key.join('.') : key);
    }
    /**
     * 从长存储中设置默认用户设置
     * @param key
     * @param Value
     * @returns
     */
    async Set(key, Value) {
        if (Value instanceof Object || Array.isArray(Value)) {
            Value = JSON.parse(JSON.stringify(Value));
        }
        return electron.ipcRenderer.invoke("HMC_::_::StoreSet", Array.isArray(key) ? key.join('.') : key, Value);
    }
    /**
     * 从长存储中设置默认用户设置
     * @param key
     * @param Value
     * @returns
     */
    set(key, Value) {
        if (Value instanceof Object || Array.isArray(Value)) {
            Value = JSON.parse(JSON.stringify(Value));
        }
        return electron.ipcRenderer.sendSync("HMC_::Sync::StoreSet", Array.isArray(key) ? key.join('.') : key, Value);
    }
    /**
     * 从长存储中判断是否存在该key
     * @param key
     * @param Value
     * @returns
     */
    async Has(key) {
        return electron.ipcRenderer.invoke("HMC_::_::StoreHas", Array.isArray(key) ? key.join('.') : key);
    }
    /**
     * 从长存储中判断是否存在该key
     * @param key
     * @param Value
     * @returns
     */
    has(key) {
        return electron.ipcRenderer.sendSync("HMC_::Sync::StoreHas", Array.isArray(key) ? key.join('.') : key);
    }
    /**
     * 从长存储中监听数据
     * @param key
     * @param Value
     * @returns
     */
    on(key, CallBack) {
        if (Array.isArray(key))
            key = key.join('.');
        if (key === "all" || typeof key == "undefined") {
            electron.ipcRenderer.on(`HMC_::_::StoreUpdateAll`, function (event, newValue, oldValue, store) {
                CallBack && CallBack.apply(store, [newValue, oldValue, key ? Array.isArray(key) ? key.join('.') : key : "all", store,]);
            });
            return;
        }
        electron.ipcRenderer.invoke("HMC_::_::StoreON", key);
        electron.ipcRenderer.on(`HMC_::_::StoreUpdateForKey_[${key}]`, function (event, newValue, oldValue, store) {
            CallBack && CallBack.apply(store, [newValue, oldValue, key ? Array.isArray(key) ? key.join('.') : key : "all"]);
        });
    }
    /**
     * 当store数据初始化完成的时候将返回到 then
     * @returns
     */
    $nextTick() {
        return new Promise((resolve, reject) => {
            let _this = this;
            if (_this.store)
                return resolve(this.store);
            let nextTickID = setInterval(() => {
                if (_this.store)
                    resolve(this.store);
                clearInterval(nextTickID);
                // console.log("clearInterval_nextTickID");
            }, 50);
        });
    }
    /**
     * 未完成初始化前阻塞进程
     */
    await(key) {
        if (this.store && key) {
            return this.get(key);
        }
        if (this.store)
            return this.store;
        awaitResults(this.$nextTick());
        if (key) {
            return this.get(key);
        }
        return this.store ? this.store : {};
    }
}
exports.Store = Store;
