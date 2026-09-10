# QINGWA — Project Index

青蛙（FROG755）的个人索引站。瑞士国际主义排版 + 入口切换式单页结构，收录 AI 多智能体协同、开发者工具、内容生产流水线、数据监控与嵌入式方向的真实项目。

线上地址：https://frog755.github.io

## 结构

```
index.html              单页入口（所有视图由 JS 渲染）
assets/css/style.css    样式：12 列网格 / hairline / 青蛙绿单色强调 / 明暗双主题
assets/js/data.js       全部文案与项目数据 —— 加项目只改这个文件
assets/js/app.js        视图切换、项目详情、示波器、粒子背景
material/               历史素材
```

> 站点不收录任何本地路径与私人信息；如需修改名称或联系方式，改 `assets/js/data.js` 顶部的 `SITE` 即可。

## 四个入口

| 入口 | 内容 |
| --- | --- |
| `00 INDEX` | 总览：大标题、身份卡、示波器波形、入口卡片、精选项目 |
| `01 PROJECTS` | 全部项目列表，按六个分类筛选，点击任意行右侧滑出详情面板 |
| `02 NOTES` | 文章与写作方法论 |
| `03 ABOUT` | 个人简介、设计主张、硬件到 AI 的技能栈、联系方式 |

顶部 Tab 切换，也支持键盘 `1`–`4`；右上角可切换明暗主题与粒子背景开关。

## 维护

- **新增 / 修改项目**：编辑 `assets/js/data.js` 里的 `PROJECTS` 数组，页面自动渲染，无需动 HTML。
- **改分类**：改 `CATEGORIES`，筛选按钮与详情标签同步更新。
- **改个人信息 / 品牌**：改同文件顶部的 `SITE` 与 `ABOUT`。

## 依赖

粒子背景使用 Three.js（CDN 引入）。加载失败时页面自动降级为静态背景，其余功能不受影响。

## 部署

推送到 `main` 分支后，`.github/workflows/jekyll-gh-pages.yml` 自动构建并发布到 GitHub Pages。
