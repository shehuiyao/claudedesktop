# Launchpad 启动命令规范

## 为什么要规范
不同项目的启动方式不一样：前端通常是端口 + npm/yarn 命令，后端可能要进 Python/conda 环境。Launchpad 每张卡片都会开一个独立终端，但如果命令里使用 `source activate`，服务挂掉后 shell 可能仍停留在 py 环境里，下一次手动启动就容易受污染。

## 推荐写法
### 前端项目
```bash
PORT=3010 npm start
```

```bash
BROWSER=none HOST=0.0.0.0 PORT=3019 npm run start
```

### Python 后端项目
优先使用 `conda run`，不要让当前 shell 长时间停在激活环境里：
```bash
conda run -n pf-backend-py37 python app.py --debug=1 --mode=3 --port=8898
```

或者使用虚拟环境里的 Python 绝对路径：
```bash
/Users/senguoyun/miniconda3/envs/pf-backend-py37/bin/python app.py --debug=1 --mode=3 --port=8898
```

### 必须 activate 时
如果项目必须 `source activate`，启动命令要把退出清理写在同一段里：
```bash
source activate pf-backend-py37 && python app.py --debug=1 --mode=3; conda deactivate
```

## Launchpad 操作建议
- 服务运行中需要重新拉起时，优先点“重启”，它会销毁旧终端再开新终端。
- 不建议把“退出 py 环境”单独做成一张卡片；环境清理应该跟后端启动命令绑定在一起。
- 每张卡片只负责一个长期运行服务，前后端完整联动用分组来管理。
- 正常关闭软件时，Launchpad 会尝试关闭它启动的终端和子进程；如果软件崩溃或被强制结束，系统通常会断开 PTY，但不能保证所有服务都退出。
- 需要确认系统里还有哪些服务在跑时，点击“检测运行”；它会按 Launchpad 项目的工作目录匹配正在监听端口的进程。
- 闪退后再次打开，点击“检测运行”可以把匹配到的项目标记为“系统运行”，但不能重新接回旧终端输出；需要看日志或停止服务时，根据检测结果里的 PID/端口处理。
- “检测运行”结果里的“关闭”会按 PID 发送终止信号，只用于明确属于当前 Launchpad 项目的进程。
