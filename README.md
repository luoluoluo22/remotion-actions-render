# remotion-actions-render

在 GitHub Actions 上用 **matrix 并发切片** 免费渲染 [Remotion](https://www.remotion.dev) 视频的最小示例。

默认合成 `Demo`：1920×1080、30fps、300 帧（10 秒）。画面包含渐变背景、标题 **Remotion × GitHub Actions**、帧计数器和一条匀速进度条，方便检查切片拼接是否有跳帧。

## 怎么跑

1. 打开仓库的 **Actions** 标签，选择 **Render video**，点 **Run workflow**。
2. `chunks` 默认是 `4`（4 个 runner 各渲一段，然后用 ffmpeg 无损拼接）。
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
2. **render**（并发）：每台 runner `npm ci`、确保 Chrome 可用，然后  
   `npx remotion render Demo out/chunk-XXX.mp4 --frames=START-END --codec=h264 --muted`
3. **merge**：下载全部分片，用 ffmpeg concat demuxer（优先 `-c copy`，失败则重编码）合成 `video.mp4`，上传 artifact 并挂到 GitHub Release。

切片渲染时加了 `--muted`，避免 AAC 音频在拼接处出现爆音或时间轴错位；成品没有音轨。

## 免费额度注意

- **公开仓库**：GitHub Actions 分钟数免费且不设每月上限（仍受公平使用和并发限制）。
- **私有仓库**：免费账户大约每月 2000 分钟，切片并发会按 job 数计费，长视频请谨慎。
- 免费账户最多大约 **20 个并发 job**；单个 workflow 的 matrix 最多 **256** 个 job。切片太多时会排队，不一定更快。
