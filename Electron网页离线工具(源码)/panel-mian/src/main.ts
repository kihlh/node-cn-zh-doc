import { createApp } from 'vue';
// @ts-expect-error
import App from './App.vue'
import ElementPlus from 'element-plus';
import "./mian.css";
import 'element-plus/dist/index.css';
import type { Declare } from "../../modules/loadAll";
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const { store, hmc, shake,ipcRenderer } = window;
export const app = createApp(App)
// import {openURL,config,tableData} from "./App";
import * as  refData from "./ref";

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
export const vm = app.use(ElementPlus).mount('#app');


vm.$watch("config", newData => shake.wait("vm.upload.config", 1000, () => {
    // 存储数据
    store.Set("config", refData.config.value);
}), { "deep": true });


vm.$watch("openURL", newData => shake.wait("vm.upload.openURL", 1000, () => {
    // 存储数据
    store.Set("OpenURL", refData.openURL.value);
}));

vm.$watch("storeHandlDir", newData => shake.wait("vm.upload.STORE_HANDLING_PANEL_DIR", 1000, () => {
    // 存储数据
    store.Set("STORE_HANDLING_PANEL_DIR", refData.storeHandlDir.value);
}));


function isTableDataID(id:string|number):boolean {
    for (let index = 0; index < refData.tableData.value.length; index++) {
        const element = refData.tableData.value[index];
        if(element.id==id)return true;
    }
    return false;
}

ipcRenderer.on('handlingPanelWindowSession',function(env,id:string,data:panelHandlingUrlStoreItme){
    if(!isTableDataID(id))refData.tableData.value.unshift(data);
});
ipcRenderer.on('handlingPanelWindowSessionList',function(env,dataList:[string,panelHandlingUrlStoreItme][]){
    for (let index = 0; index < dataList.length; index++) {
        const [id,data] = dataList[index];
        if(!isTableDataID(id))refData.tableData.value.unshift(data);
    }
});
ipcRenderer.invoke("handlingPanelWindowSessionAll");
declare var window: Window & typeof globalThis & Declare;

ipcRenderer.on('STORE_HANDLING_PANEL-update->downloadOK',function(env,id:string,data:panelHandlingUrlStoreItme){
    for (let index = 0; index < refData.tableData.value.length; index++) {
        const _data= refData.tableData.value[index];
        if(_data.id==id)refData.tableData.value[index] =data;
    }
});
ipcRenderer.on('STORE_HANDLING_PANEL-update->any',function(env,id:string,data:panelHandlingUrlStoreItme){
    for (let index = 0; index < refData.tableData.value.length; index++) {
        const _data= refData.tableData.value[index];
        if(_data.id==id)refData.tableData.value[index] =data;
    }
});
export type panelHandlingUrlStoreItme = {
    /**原始链接*/
    url: string,
    /**文件路径 */
    pathName: string,
    /**附加参数 */
    query: string | null,
    /**一个随机的文件ID */
    id: string,
    /**文件路径(写入文件系统的) */
    File: string,
    /**文件处理类型 */
    type: string
    /**域名 */
    host:string
    /**是否已经下载 */
    download:boolean
}