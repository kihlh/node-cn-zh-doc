import { ref ,watch} from "vue";
import type {Ref} from "vue";
import type {Declare} from "../../modules/loadAll";
const {store,hmc,electron,ipcRenderer,clip} =window;
import type {panelHandlingUrlStoreItme} from "./main";
export const tableData:Ref<panelHandlingUrlStoreItme[]> = ref([]);

export const openURL = ref(store.await().OpenURL);
export const config = ref({
    // 自动下载
    download: store.await('config.download'),
    // 忽略参数并且不重复下载
    unique: store.await('config.unique'),
    // 当前域名
    theHost: store.await('config.theHost'),
    // 下载不加参数
    downloadUnique: store.await('config.downloadUnique'),
    // 替换代理域名
    orien: store.await('config.orien'),
    // 规整名称(不使用id)
    categorize: store.await('config.categorize'),
    // 每次访问的延迟时间 
    openAll_wait: store.await('config.openAll_wait'),
    // 是否允许打开多次
    openAll: store.await('config.openAll'),
});

export const filterUrls = ref(store.await().filterUrls);
export const storeHandlDir = ref(store.await().STORE_HANDLING_PANEL_DIR);

store.on("config", function (newValue, oldValue) {
    config.value = newValue;
});

store.on("OpenURL", function (newValue, oldValue) {
    openURL.value = newValue;
});

store.on("STORE_HANDLING_PANEL_DIR", function (newValue, oldValue) {
    storeHandlDir.value = newValue;
});

store.on("filterUrls", function (newValue, oldValue) {
    filterUrls.value = newValue;
});
declare var window: Window & typeof globalThis & Declare;