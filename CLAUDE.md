# Claude Desktop - 项目规则

## 语言
- 始终使用中文与用户交流，包括代码注释中的说明性文字

## 技术栈
- Tauri v2 + React + TypeScript
- 后端: Rust (src-tauri/)
- 前端: React + Tailwind CSS (src/)
- 包管理: npm

## 开发规范

### 前后端通信
- 前端调用后端命令统一使用 `invoke` (`@tauri-apps/api/core`)，不要直接使用 Tauri 插件的高级封装（如 `@tauri-apps/plugin-updater` 的 `check()`），除非确认插件所需的基础设施已完备
- 新增 Rust 命令后必须在 `lib.rs` 的 `tauri::generate_handler![]` 中注册

### 版本更新
- 更新检查通过 Rust 后端 `check_for_update` 命令，走 GitHub API
- 不使用 Tauri updater plugin 的前端 `check()` — 它依赖 Release 中的 `latest.json`，当前发布流程未包含该文件
- 下载更新通过 `download_and_install_update` 命令，下载 DMG 后自动打开

### 代码风格
- React 组件使用函数式组件 + hooks
- 状态管理用 useState/useCallback/useRef，不引入额外状态库
- CSS 使用 Tailwind + CSS 变量 (var(--xxx)) 支持主题切换

## 版本发布流程

当用户要求发布新版本时，按以下步骤执行：

### 1. 更新版本号（4 处同步）
- `package.json` → `"version"`
- `src-tauri/tauri.conf.json` → `"version"`
- `src/components/StatusBar.tsx` → `APP_VERSION`
- `src-tauri/src/lib.rs` → `APP_VERSION`

### 2. 提交并推送
```bash
git add -A
git commit -m "chore: vX.Y.Z - 简要描述"
git push
```

### 3. 构建 DMG
```bash
npm run tauri build
```
- 构建产物：`src-tauri/target/release/bundle/dmg/Claude Desktop_X.Y.Z_aarch64.dmg`
- 签名私钥缺失的报错可忽略（不影响 DMG 生成）

### 4. 创建 GitHub Release
```bash
gh release create vX.Y.Z "src-tauri/target/release/bundle/dmg/Claude Desktop_X.Y.Z_aarch64.dmg" \
  --title "vX.Y.Z" \
  --notes "更新内容..."
```

### 5. 验证
```bash
curl -s -H "User-Agent: claude-desktop-updater" \
  https://api.github.com/repos/shehuiyao/claudedesktop/releases/latest
```
确认 `tag_name` 为新版本，且 assets 中包含 DMG 文件。
