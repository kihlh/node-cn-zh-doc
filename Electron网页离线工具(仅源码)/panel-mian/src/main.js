import { createApp } from 'vue';
// @ts-expect-error
import App from './App.vue';
import ElementPlus from 'element-plus';
import "./mian.css";
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
export const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
export const vm = app.use(ElementPlus).mount('#app');
