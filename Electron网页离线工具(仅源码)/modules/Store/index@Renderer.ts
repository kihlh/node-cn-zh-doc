import electron = require('electron');
import hmc = require('hmc-win32');

function awaitResults(Results: Promise<any>): void {
    let results_OK = false;
    Results.finally(function () {
        results_OK = true;
    })
    while (results_OK) {
        hmc.sleep(10);
    }
}

class Store {
    /**
     * 数据体 实时更新
     */
    store?: { [key: string]: any };
    constructor() {
        let _this = this;
        electron.ipcRenderer.invoke("HMC_::_::StoreGet").then(data => this.store = data)

        electron.ipcRenderer.on(`HMC_::_::StoreUpdateAll`, function (event, newValue, oldValue, store) {
            _this.store = newValue
        })
    }
    /**
     * 从长存储中读取默认用户设置
     * @param key 
     * @returns 
     */
    async Get(key: string|string[]): Promise<any> {
        return electron.ipcRenderer.invoke("HMC_::_::StoreGet",  Array.isArray(key)?key.join('.'):key)
    }
    /**
     * 从长存储中读取默认用户设置
     * @param key 
     * @returns 
     */
     get(key: string|string[]){
        return electron.ipcRenderer.sendSync("HMC_::Sync::StoreGet", Array.isArray(key)?key.join('.'):key)
    }
    /**
     * 从长存储中设置默认用户设置
     * @param key 
     * @param Value 
     * @returns 
     */
    async Set(key: string|string[], Value: any) {
        if(Value instanceof Object||Array.isArray(Value)){
            Value=JSON.parse(JSON.stringify(Value));
        }
        return electron.ipcRenderer.invoke("HMC_::_::StoreSet",  Array.isArray(key)?key.join('.'):key, Value)
    }
    /**
     * 从长存储中设置默认用户设置
     * @param key 
     * @param Value 
     * @returns 
     */
    set(key: string|string[], Value: any) {
        if(Value instanceof Object||Array.isArray(Value)){
            Value=JSON.parse(JSON.stringify(Value));
        }
        return electron.ipcRenderer.sendSync("HMC_::Sync::StoreSet", Array.isArray(key)?key.join('.'):key, Value);
    }
    /**
     * 从长存储中判断是否存在该key
     * @param key 
     * @param Value 
     * @returns 
     */
    async Has(key: string|string[]): Promise<boolean> {
        return electron.ipcRenderer.invoke("HMC_::_::StoreHas",  Array.isArray(key)?key.join('.'):key)
    }
    /**
     * 从长存储中判断是否存在该key
     * @param key 
     * @param Value 
     * @returns 
     */
    has(key: string|string[]): boolean {
        return electron.ipcRenderer.sendSync("HMC_::Sync::StoreHas",  Array.isArray(key)?key.join('.'):key);
    }
    /**
     * 从长存储中监听数据
     * @param key 
     * @param Value 
     * @returns 
     */
    on(key: string | undefined|string[], CallBack: (this: { [key: string]: any }, newValue: any, oldValue: any, key: string, store?: { [key: string]: any }) => void) {
       if(Array.isArray(key))key = key.join('.');
        if (key === "all" || typeof key == "undefined") {
            electron.ipcRenderer.on(`HMC_::_::StoreUpdateAll`, function (event, newValue, oldValue, store) {
                CallBack && CallBack.apply(store, [newValue, oldValue,key?Array.isArray(key)?key.join('.'):key:"all", store,])
            })
            return
        }
        electron.ipcRenderer.invoke("HMC_::_::StoreON", key)
        electron.ipcRenderer.on(`HMC_::_::StoreUpdateForKey_[${key}]`, function (event, newValue, oldValue, store) {
            CallBack && CallBack.apply(store, [newValue, oldValue,  key?Array.isArray(key)?key.join('.'):key:"all"])
        })
    }
    /**
     * 当store数据初始化完成的时候将返回到 then
     * @returns 
     */
    $nextTick() {
        return new Promise((resolve, reject) => {
            let _this = this;
            if (_this.store) return resolve(this.store)
            let nextTickID = setInterval(() => {
                if (_this.store) resolve(this.store);
                clearInterval(nextTickID)
                // console.log("clearInterval_nextTickID");

            }, 50)
        })
    }
    await():{ [key: string]: any };
    await(key:string|string[]): any;
    /**
     * 未完成初始化前阻塞进程
     */
    await(key?:string|string[]): unknown {
        if(this.store&&key){
            return this.get(key)
        }
        if(this.store)return this.store;
        awaitResults(this.$nextTick());
        if(key){
            return this.get(key)
        }
        return this.store ? this.store : {};
    }
}

interface Store {
    on(key: string, CallBack: (this: { [key: string]: any }, newValue: any, oldValue: any) => void): void;
    on(key: "all" | undefined, CallBack: (this: { [key: string]: any }, newValue: { [key: string]: any }, oldValue: { [key: string]: any }, key: string, store?: { [key: string]: any }) => void): void;

}

export { Store }