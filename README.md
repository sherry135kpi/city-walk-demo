# 🚶 CityWalk Demo

一个基于 **uni-app (Vue 3)** 的「城市漫步 / 城市徒步」示例应用。提供精选城市漫步路线，支持路线浏览、筛选、搜索、路线详情查看与收藏管理。主题倡导 **绿色出行，发现城市的文化与美好**。

## ✨ 功能特性

- **路线首页**：顶部标题、关键字搜索、标签筛选、路线卡片列表
- **路线总览**：按真实经纬度方位排布所有路线起点，点击图钉快速直达详情
- **路线详情**：途经点（waypoints）列表、步行距离、预计耗时、路径说明
- **我的收藏**：收藏/取消收藏喜欢的路线，在个人页统一管理
- **响应式 H5**：支持桌面与手机浏览器访问（H5 端已开启局域网监听）

## 🛠 技术栈

| 技术 | 说明 |
| ---- | ---- |
| uni-app | 跨端开发框架（H5 / App / 小程序统一代码） |
| Vue 3 | 组合式 API |
| SCSS | 样式预处理（`uni.scss`） |
| 本地数据 | `common/data.js` 中的静态路线数据 |

## 📄 页面结构

| 页面 | 路径 | 说明 |
| ---- | ---- | ---- |
| 首页 | `pages/index/index` | 路线搜索 / 筛选 / 总览 / 列表 |
| 路线详情 | `pages/detail/detail` | 途经点、距离、耗时、备注 |
| 我的收藏 | `pages/fav/fav` | 收藏的路线列表 |
| 我的 | `pages/me/me` | 个人信息与入口 |

底部导航栏：**首页 / 收藏 / 我的**。

## 🚀 运行方式

### 方式一：HBuilderX（推荐）

1. 用 [HBuilderX](https://www.dcloud.io/hbuilderx.html) 打开本项目
2. 选择 **运行 → 运行到浏览器（Chrome）**
3. H5 端口已在 `manifest.json` 中配置为 `http://0.0.0.0:8088/`
4. 需手机同步调试时，手机与电脑处于同一局域网，访问 `http://<电脑IP>:8088/`

### 方式二：命令行（可选）

安装依赖并启动：

```bash
# 若项目已生成 package.json 可执行：
npm install
npm run dev:h5
```

## 🗺️ 地图底图说明

首页「路线总览」区域的**底图**依赖高德地图。若要显示具体地图瓦片，请在 `manifest.json` → `h5` 节点补充高德 map 的 **key**。未配置 key 时，列表、路径线与详情功能均正常，仅底图区域为空白/占位。

## 📁 目录结构

```
citywalk demo/
├─ common/
│  └─ data.js            # 路线/途经点/收藏 本地数据
├─ pages/
│  ├─ index/index.vue    # 首页
│  ├─ detail/detail.vue  # 路线详情
│  ├─ fav/fav.vue        # 我的收藏
│  └─ me/me.vue          # 我的
├─ static/               # 静态资源（tabbar 图标等）
├─ App.vue
├─ main.js
├─ manifest.json         # 全局配置（含 H5 端口）
├─ pages.json            # 页面路由与 tabBar 配置
└─ uni.scss              # 全局样式
```

## 📄 License

仅作为学习 / 示例用途。
