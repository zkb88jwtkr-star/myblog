# 部署说明（Umami + Waline）

以下步骤假设你在 CentOS 上用 Nginx 提供静态站点，同时用 Docker Compose 跑 Umami + Postgres + Waline + MongoDB。

## 1) 准备目录与环境变量

```bash
mkdir -p /opt/blog-deploy
cp -r deploy/* /opt/blog-deploy/
cd /opt/blog-deploy
```

创建 `.env`（不要提交到前端）：

```bash
cat > .env <<'EOF'
POSTGRES_PASSWORD=CHANGE_ME_POSTGRES
UMAMI_APP_SECRET=CHANGE_ME_UMAMI_SECRET
MONGO_PASSWORD=CHANGE_ME_MONGO
WALINE_JWT_SECRET=CHANGE_ME_WALINE
EOF
```

说明：
- `UMAMI_APP_SECRET` 请使用随机长字符串。
- `WALINE_JWT_SECRET` 也应为随机字符串。

## 2) 启动 Docker Compose

```bash
docker compose up -d
docker compose ps
```

## 3) 配置 Nginx 反代

将 `deploy/nginx.conf` 放到 `/etc/nginx/conf.d/blog.conf`，并根据你的站点实际目录修改 `root`：

```bash
cp /opt/blog-deploy/nginx.conf /etc/nginx/conf.d/blog.conf
nginx -t
systemctl reload nginx
```

## 4) 初始化 Umami

1. 打开 `http://<你的IP>/umami`，按提示创建管理员账号。
2. 进入 Umami 后台添加一个 Website，记录 **Website ID**。
3. 为该 Website 生成 Share 链接，记录 **Share ID**。
4. 在 `hugo.toml` 中填写：

```toml
[params.umami]
  url = "http://<你的IP>/umami"
  websiteId = "YOUR_UMAMI_WEBSITE_ID"
  shareId = "YOUR_UMAMI_SHARE_ID"
  endpoint = "stats"
```

## 5) 初始化 Waline

1. 打开 `http://<你的IP>/waline/ui` 初始化管理员。
2. 在 `hugo.toml` 中填写：

```toml
[params.waline]
  serverURL = "http://<你的IP>/waline"
```

## SQLite 方案（可选）

Waline 也可以使用 SQLite，适合轻量个人站点，部署简单但不适合高并发与横向扩展。
示例（替换 waline + mongo）：

```yaml
  waline:
    image: lizheming/waline:latest
    environment:
      TZ: Asia/Shanghai
      SQLITE_PATH: /app/data/db.sqlite
      JWT_SECRET: ${WALINE_JWT_SECRET}
      SITE_NAME: "My Blog"
      SITE_URL: "http://your-server"
    volumes:
      - ./waline-data:/app/data
    ports:
      - "8360:8360"
```

## 说明

- 如果没有域名，全部使用服务器 IP 即可。
- Umami/Waline 使用子路径 `/umami/` 和 `/waline/`，请保持 Nginx 反代一致。
