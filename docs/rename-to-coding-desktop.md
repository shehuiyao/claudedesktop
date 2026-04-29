# Coding Desktop 更名方案

## 这是什么

本项目对外展示名已从 `Claude Desktop` / `Claude Code Desktop` 调整为 `Coding Desktop`。

改名不只是改一个标题。它分成两类：

- 展示名：用户看得到的名字，例如窗口标题、App 名、安装包名、权限弹窗、文档标题。
- 内部标识：系统用来认人的名字，例如 Bundle Identifier、数据目录、npm 包名、Rust crate 名、GitHub 仓库名。

展示名像门头，可以比较快换；内部标识像身份证和仓库钥匙，直接换会影响自动更新、本地数据、反馈配置和历史安装。

## 影响

本次采用“展示名 + 内部标识全量改名”。

用户看到的是 `Coding Desktop`，系统内部也改为：

- Bundle Identifier：`com.coding-desktop.app`
- 本地数据目录：`~/.coding-desktop`
- npm 包名：`coding-desktop`
- Rust crate / bin 名：`coding-desktop`
- GitHub 仓库地址：`shehuiyao/codingdesktop`

为了避免旧数据丢失，新版启动时会把旧目录 `~/.claude-desktop` 中的文件复制到 `~/.coding-desktop`。前端 localStorage 中的旧 key 也会自动复制到新 key。

## 推荐改名范围

### 必须改

| 文件 | 改名前内容 | 目标内容 | 影响 |
| --- | --- | --- | --- |
| `src-tauri/tauri.conf.json` | `productName: "Claude Desktop"` | `productName: "Coding Desktop"` | 影响 `.app` 名、DMG 名、自动更新包名 |
| `src-tauri/tauri.conf.json` | `windows.title` | `Coding Desktop` | 影响窗口标题 |
| `index.html` | `<title>Claude Desktop</title>` | `<title>Coding Desktop</title>` | 影响浏览器/dev 标题 |
| `src/App.tsx` | `Claude Code Desktop` | `Coding Desktop` | 影响应用内默认标题、空状态 |
| `src-tauri/Info.plist` | `Claude Desktop needs access...` | `Coding Desktop needs access...` | 影响 macOS 权限弹窗 |
| `src-tauri/Cargo.toml` | `description = "Claude Code Desktop GUI"` | `description = "Coding Desktop GUI"` | 影响包描述 |
| `src-tauri/capabilities/default.json` | `Default capabilities for Claude Desktop` | `Default capabilities for Coding Desktop` | 影响能力描述 |

### 应同步改

| 文件 | 说明 |
| --- | --- |
| `README.md` | 项目标题、安装说明里的展示名 |
| `docs/design-spec.md` | 设计规范标题 |
| `docs/release-known-issues.md` | 发版问题里旧产物名说明要同步新名字 |
| `scripts/build-dmg.sh` | 手工 DMG 脚本里的 App 路径、DMG 文件名、卷标、提示文案 |
| `AGENTS.md` / `CLAUDE.md` | 项目规则里的构建产物说明和改名注意事项 |

### 内部标识也改

| 位置 | 改名前内容 | 目标内容 | 影响 |
| --- | --- | --- | --- |
| `src-tauri/tauri.conf.json` | `identifier: "com.claude-desktop.app"` | `identifier: "com.coding-desktop.app"` | macOS 会把新版视为新 App 身份 |
| Rust / Tauri 数据路径 | `~/.claude-desktop` | `~/.coding-desktop` | 需要启动迁移旧数据 |
| `package.json` | `name: "claude-desktop"` | `name: "coding-desktop"` | npm 包名和 lock 文件同步变化 |
| `src-tauri/Cargo.toml` | `name = "claude-desktop"` / bin `claude-desktop` | `name = "coding-desktop"` / bin `coding-desktop` | Rust crate/bin 名同步变化 |
| GitHub Release URL | `shehuiyao/claudedesktop` | `shehuiyao/codingdesktop` | 需要仓库同步改名或创建新仓库 |

## 怎么做

### 第一阶段：展示名改名

1. 修改 `src-tauri/tauri.conf.json`
   - `productName` 改为 `Coding Desktop`
   - `app.windows[0].title` 保持 `Coding Desktop`

2. 修改前端展示文案
   - `index.html` 的 `<title>`
   - `src/App.tsx` 中默认标题和空状态标题

3. 修改 macOS 权限说明
   - `src-tauri/Info.plist` 中 Desktop / Documents / Downloads 权限文案

4. 修改构建和说明文档
   - `README.md`
   - `docs/design-spec.md`
   - `docs/release-known-issues.md`
   - `scripts/build-dmg.sh`
   - `AGENTS.md`
   - `CLAUDE.md`

### 第二阶段：迁移本地数据

新版启动时执行迁移：

- 旧目录：`~/.claude-desktop`
- 新目录：`~/.coding-desktop`

迁移采用复制方式：新目录里不存在的文件才从旧目录复制过来。这样新版能读到旧数据，同时旧目录还在，方便必要时回滚排查。

需要迁移的文件包括：

- `.github_token`
- `feedback.json`
- `skill_usage.json`
- `.volc_key`

前端 localStorage 也做同样兼容：

- `claude-desktop-codex-permission-modes` → `coding-desktop-codex-permission-modes`
- `claude-desktop-launchpad-projects` → `coding-desktop-launchpad-projects`
- `claude-desktop-pinned-projects` → `coding-desktop-pinned-projects`

### 第三阶段：验证构建产物名

改 `productName` 后，Tauri 产物名会跟着变化。不要靠旧经验猜文件名，必须读取真实产物：

```bash
npm run build
npm run tauri build
find src-tauri/target/release/bundle -maxdepth 3 -type f | sort
```

重点检查：

- `macos/Coding Desktop.app`
- `macos/Coding Desktop.app.tar.gz`
- `macos/Coding Desktop.app.tar.gz.sig`
- `dmg/Coding Desktop_X.Y.Z_aarch64.dmg`

如果实际文件名不同，以真实产物为准。

### 第四阶段：更新自动更新 latest.json

`latest.json` 里的 URL 必须指向真实上传到 GitHub Release 的文件名。

例如上传文件名是：

```text
Coding Desktop.app.tar.gz
```

URL 里要么使用带转义空格的路径：

```text
Coding%20Desktop.app.tar.gz
```

要么发布时先复制成无空格资产名，例如：

```text
Coding.Desktop.app.tar.gz
```

然后 `latest.json` 也使用同一个资产名。关键原则是：上传什么名字，`latest.json` 就写什么名字。

## 迁移风险

### 自动更新

全量改名会同时改变 App 身份、产物名和 Release 地址。

风险点在 Release 资产和 `latest.json`：

- 旧名：`Claude Desktop.app.tar.gz`
- 新名：`Coding Desktop.app.tar.gz`

如果 `latest.json` 仍指向旧名，App 会检查到更新但下载失败。

### 本地数据

新版会把旧目录复制到新目录：

```text
~/.claude-desktop  ->  ~/.coding-desktop
```

旧目录不会删除。后续确认新版本稳定后，可再决定是否手动清理。

### Bundle Identifier

本轮改为 `com.coding-desktop.app`。macOS 会把它当成另一个 App，可能出现：

- 旧 App 和新 App 并存
- 自动更新无法从旧 App 平滑升级
- 权限授权需要重新申请
- 用户数据和系统偏好可能分离

这是预期变化。发版前需要确认用户安装和自动更新策略是否接受这个变化。

## 发版检查清单

改名发版前必须检查：

- [ ] App 窗口标题显示 `Coding Desktop`
- [ ] App 图标下应用名显示 `Coding Desktop`
- [ ] macOS 权限弹窗显示 `Coding Desktop`
- [ ] `npm run build` 通过
- [ ] `npm run tauri build` 通过
- [ ] 真实产物名已确认，不靠手写猜测
- [ ] DMG、`.app.tar.gz`、`.sig` 都存在
- [ ] `latest.json` 的 URL 和上传资产名一致
- [ ] GitHub Release 上传 DMG、更新包、`latest.json`
- [ ] 已从旧版本验证自动更新能下载新包
- [ ] `AGENTS.md` / `CLAUDE.md` 的产物说明已同步
- [ ] `docs/release-known-issues.md` 的旧文件名说明已同步新名字
- [ ] 旧目录 `~/.claude-desktop` 的数据能迁移到 `~/.coding-desktop`
- [ ] localStorage 里的旧配置能迁移到新 key
- [ ] GitHub 仓库 `shehuiyao/codingdesktop` 已存在或已完成重命名

## 当前建议结论

当前执行方案：

- 对外统一叫 `Coding Desktop`
- 发布产物名跟随 `Coding Desktop`
- 内部包名统一为 `coding-desktop`
- Bundle Identifier 改为 `com.coding-desktop.app`
- 本地数据目录改为 `~/.coding-desktop`
- 启动时从旧目录 `~/.claude-desktop` 自动迁移数据
