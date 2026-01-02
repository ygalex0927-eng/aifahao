#!/bin/bash
set -e

# 配置
APP_NAME="aifahao"
APP_DIR="/var/www/$APP_NAME"
REPO_URL="https://github.com/ygalex0927-eng/aifahao.git"

echo "=== 开始替换项目为: $APP_NAME ==="

# 1. 环境检查与安装
if ! command -v node &> /dev/null; then
    echo "正在安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "正在安装 PM2..."
    sudo npm install -g pm2
fi

if ! command -v nginx &> /dev/null; then
    echo "正在安装 Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 2. 清理旧服务与配置 (关键步骤：释放端口)
echo "清理旧服务..."
# 停止所有 PM2 进程 (也可以只停止特定的，但为了彻底替换，这里停止所有)
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

echo "清理 Nginx 配置..."
# 移除所有已启用的站点配置，防止端口 80 冲突
sudo rm -f /etc/nginx/sites-enabled/*

# 3. 部署新代码
echo "部署代码到 $APP_DIR ..."
if [ -d "$APP_DIR" ]; then
    # 如果目录存在，强制重置并拉取最新
    cd "$APP_DIR"
    git fetch --all
    git reset --hard origin/main
    git pull
else
    # 首次克隆
    sudo mkdir -p /var/www
    sudo chown -R $USER:$USER /var/www
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# 4. 恢复环境变量
# 如果之前手动上传过 .env 到 /tmp 或其他地方，这里尝试恢复
if [ -f "/tmp/.env" ]; then
    echo "发现临时环境变量文件，正在恢复..."
    cp /tmp/.env "$APP_DIR/.env"
fi

if [ ! -f "$APP_DIR/.env" ]; then
    echo "警告: 未找到 .env 文件！服务可能无法正常启动。"
    echo "请手动创建: nano $APP_DIR/.env"
fi

# 5. 安装依赖与构建
echo "安装依赖..."
npm install

echo "构建前端..."
npm run build

# 6. 配置新 Nginx
echo "应用 Nginx 配置..."
sudo cp scripts/nginx.conf "/etc/nginx/sites-available/$APP_NAME"
# 重新链接
sudo ln -sf "/etc/nginx/sites-available/$APP_NAME" "/etc/nginx/sites-enabled/"
# 检查配置并重启
sudo nginx -t
sudo systemctl reload nginx

# 7. 启动新后端
echo "启动后端服务..."
pm2 start api/server.ts --name "$APP_NAME-api" --interpreter ./node_modules/.bin/tsx
pm2 save
pm2 startup | grep "sudo" | bash || true

echo "=== 替换完成！ ==="
echo "新项目已上线，访问地址: http://$(curl -s ifconfig.me)"
