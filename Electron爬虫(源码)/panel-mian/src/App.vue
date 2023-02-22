<template>
  <div id="mians">
    <div id="mian">
      <a class="mian_open_url_title">打开需要离线的网址</a>
      <el-input v-model="openURL" placeholder="打开的网址" :type="config.openAll?'textarea':'text'" style="width: 85%;" />
      <a class="mian_open_url_title">离线的文件存放位置</a>
      <el-input v-model="storeHandlDir" placeholder="存放位置" />
      <div class="setConfig">
        <el-checkbox v-model="config.download">自动下载</el-checkbox>
        <el-checkbox v-model="config.unique">忽略参数</el-checkbox>
        <el-checkbox v-model="config.theHost">仅限本域名</el-checkbox>
        <el-checkbox v-model="config.downloadUnique">下载不加参数</el-checkbox>
        <el-checkbox v-model="config.orien">替换代理域名</el-checkbox>
        <el-checkbox :disabled="config.unique || config.theHost ? false : true" v-model="config.categorize">不使用随机名称</el-checkbox>
        <el-checkbox v-model="config.openAll">允许多行</el-checkbox>
         <el-input v-model="config.openAll_wait" v-show="config.openAll" class="w-50 m-2" placeholder="延迟时间(随机请逗号分隔)" size="small"></el-input>
      </div>
      <el-button
        color="#626aef"
        style="width: 90%; padding-top: 8px"
        @click.stop="loadURL"
        >开始抓取数据</el-button
      >
      <el-button
        color="#626aef"
        style="width: 90%; margin-top: 8px; margin-left: 0px"
        @click.stop="invoke('STORE_HANDLING_PANEL->download_All')"
        >开始下载</el-button
      >
      <el-button
        type="danger"
        plain
        style="width: 90%; margin-top: 8px; margin-left: 0px"
        @click.stop="removeAllhandlingPanel"
        >清空内容</el-button
      >
      <el-button
        type="success"
        plain
        style="width: 90%; margin-top: 8px; margin-left: 0px"
        @click.stop="invoke('AllhandlingPanel->CategorizedDomainName')"
        :disabled="config.unique || config.theHost ? false : true"
        >按域名规整</el-button
      >
      <div style="width: 90%; margin-top: 8px; margin-left: 0px">
        <el-button type="success" plain @click.stop="invoke('Panel->advance')"
          >➡︎前进</el-button
        >
        <el-button type="success" plain @click.stop="invoke('Panel->backwards')"
          >↪后退</el-button
        >
        <el-button type="success" plain @click.stop="invoke('Panel->refresh')"
          >🗘刷新</el-button
        >
      </div>
      <el-descriptions style="margin-top: 8px" title="数据预览">
        <el-descriptions-item label="数据" style="padding-left: 25px">{{
          tableData.length
        }}</el-descriptions-item>
        <el-descriptions-item label="文件大小" style="padding-left: 35px"
          >0B</el-descriptions-item
        >
        <el-descriptions-item label="已下载" style="padding-left: 25px"
          >0</el-descriptions-item
        >
      </el-descriptions>
    </div>
    <div id="info">
      <el-table :data="tableData" height="100vh" style="width: 100%">
        <el-table-column prop="File" label="文件名" width="180">
          <template #default="scope">
            <a>{{ getPathName(scope.row.File) }}</a>
          </template>
        </el-table-column>
        <el-table-column prop="host" label="域名" width="180" />
        <el-table-column width="100" label="类型">
          <template #default="scope">
            {{ scope.row ? "未知" : "未知" }}
          </template>
        </el-table-column>
        <el-table-column width="180" label="链接">
          <template #default="scope">
            <el-popover
              placement="top-start"
              :title="scope.row.id"
              :width="200"
              trigger="hover"
              :content="scope.row.url"
            >
              <template #reference>
                <el-link type="info">{{
                  scope.row.url.replace(/^(.{15})(?:.+?)$/, "$1...")
                }}</el-link>
              </template>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column prop="address" label="操作">
          <template #default="scope">
            <!-- <div>{{ scope.row.date }}</div> -->
            <el-button-group width="380">
              <el-button
                type="primary"
                size="small"
                color="#626aef"
                @click.stop="removehandlingPanel(scope.row)"
                >删除</el-button
              >
              <el-button
                type="primary"
                size="small"
                color="#626aef"
                :disabled="!scope.row.download"
                >查看</el-button
              >
              <el-button
                type="primary"
                size="small"
                color="#626aef"
                @click.stop="
                  invoke('STORE_HANDLING_PANEL->download', scope.row.id).then(
                    (is_ok) => (scope.row.download = is_ok)
                  )
                "
                :disabled="scope.row.download"
                >下载</el-button
              >
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script lang="ts" >
import { ref, watch } from "vue";
import electron = require("electron");
import type { Declare } from "../../modules/loadAll";
import * as refData from "./ref";
import { openURL, config, tableData, storeHandlDir, filterUrls } from "./ref";
import type { panelHandlingUrlStoreItme } from "./main";
import { ElMessage, ElMessageBox } from "element-plus";

export default {
  data() {
    return {
      tableData,
      openURL,
      config,
      storeHandlDir,
    };
  },
  created() {},
  methods: {
    async loadURL() {
      if (window.fs.existsSync(this.storeHandlDir)) {
        await ElMessageBox.confirm(
          "文件夹已存在是否将文件夹后面添加此链接",
          "文件夹已存在",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          this.storeHandlDir =
            this.storeHandlDir + "\\" + window.sanitize(openURL.value,{"replacement":'_'});
        }).catch(() => {});
      }
      electron.ipcRenderer.invoke("OpenURL", openURL.value);
    },
    getPathName(Path: string) {
      return window.path.basename(Path);
    },
    removeAllhandlingPanel() {
      electron.ipcRenderer.invoke("removeAllhandlingPanel");
      tableData.value.length = 0;
    },
    invoke: electron.ipcRenderer.invoke,
    removehandlingPanel(scope: panelHandlingUrlStoreItme) {
      this.invoke("STORE_HANDLING_PANEL->rm", scope.id);
      if (tableData.value.indexOf(scope) != -1)
        tableData.value.splice(tableData.value.indexOf(scope), 1);
    },
  },
};


declare var window: Window & typeof globalThis & Declare;
</script>