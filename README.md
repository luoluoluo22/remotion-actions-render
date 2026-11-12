# remotion-actions-render

在 GitHub Actions 上用 **matrix 并发切片** 免费渲染 [Remotion](https://www.remotion.dev) 视频的最小示例。

默认合成 `Demo`：1920×1080、30fps、300 帧（10 秒），带原创音轨（`public/music.wav`）和第 150 帧（5.00 秒）的 2 kHz 同步提示音（`public/sync-hit.wav`）。画面还有渐变背景、标题 **Remotion × GitHub Actions**、帧计数器和匀速进度条，方便检查切片拼接和音画同步。

音轨用 ffmpeg 在仓库里生成，属于原创、可自由使用的占位音频。需要重做时运行 `scripts/generate-audio.sh`。

## 怎么跑

1. 打开仓库的 **Actions** 标签，选择 **Render video**，点 **Run workflow**。
2. `chunks` 默认是 `4`（4 个 runner 各渲一段静音画面，另有一个 job 渲完整音轨，最后用 Remotion 自带的 ffmpeg 拼接并混音）。
3. 跑完后下载名为 `video` 的 artifact，或从对应 [Release](https://github.com/luoluoluo22/remotion-actions-render/releases) 直接下载 `video.mp4`。

推送到 `main` 也会自动按 4 切片渲染一次。

本地预览：

```bash
npm ci
npm run dev
npm run render
```

## 工作流在做什么

1. **plan**：把 300 帧均分成 N 段（最后一段吃掉余数），输出 JSON matrix。
2. **render**（并发）：每台 runner `npm ci`、恢复缓存的 Chrome Headless Shell，然后  
   `npx remotion render Demo out/chunk-XXX.mp4 --frames=START-END --codec=h264 --muted`
3. **render-audio**（与画面切片并行）：整段渲一次音轨  
   `npx remotion render Demo out/audio.aac --codec=aac`
4. **merge**：用 `npx remotion ffmpeg` 无损拼接视频切片（优先 `-c copy`），再把 AAC 音轨 mux 进 `video.mp4`（`-map 0:v -map 1:a -c:v copy -c:a aac -shortest`），上传 artifact 并挂到 GitHub Release。

视频切片保持 `--muted`，完整音轨单独渲染，避免把 AAC 切成多段再拼接时出现爆音或时间轴错位。

为加快重复运行：`setup-node` 会缓存 npm，`node_modules/.remotion`（Chrome Headless Shell）按 Remotion 版本 / lockfile 缓存；merge 不再 `apt install ffmpeg`，改用项目自带的 `npx remotion ffmpeg`。

## 免费额度注意

- **公开仓库**：GitHub Actions 分钟数免费且不设每月上限（仍受公平使用和并发限制）。
- **私有仓库**：免费账户大约每月 2000 分钟，切片并发会按 job 数计费，长视频请谨慎。
- 免费账户最多大约 **20 个并发 job**；单个 workflow 的 matrix 最多 **256** 个 job。切片太多时会排队，不一定更快。
