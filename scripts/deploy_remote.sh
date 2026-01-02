#!/bin/bash
set -e

# 配置变量
REPO_URL="https://github.com/ygalex0927-eng/aifahao.git"
APP_DIR="/var/www/aifahao"

echo "=== 开始部署流程 ==="

# 1. 安装基础环境 (如果未安装)
if ! command -v node &> /dev/null; then
    echo "安装 Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

if ! command -v pm2 &> /dev/null; then
    echo "安装 PM2..."
    sudo npm install -g pm2
fi

if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# 2. 准备代码目录
echo "准备代码..."
if [ -d "$APP_DIR" ]; then
    echo "更新代码..."
    cd $APP_DIR
    git pull
else
    echo "克隆代码..."
    sudo mkdir -p /var/www
    sudo chown -R $USER:$USER /var/www
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 3. 恢复 .env 文件 (从上传的临时位置移动过来)
if [ -f /tmp/.env ]; then
    echo "配置环境变量..."
    mv /tmp/.env $APP_DIR/.env
fi

# 4. 安装依赖并构建
echo "安装依赖..."
npm install

echo "构建前端..."
npm run build

# 5. 配置 Nginx
echo "配置 Nginx..."
sudo cp scripts/nginx.conf /etc/nginx/sites-available/aifahao
sudo ln -sf /etc/nginx/sites-available/aifahao /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 6. 启动后端服务
echo "启动后端..."
# 使用 pm2 启动，如果已存在则重启
if pm2 list | grep -q "aifahao-api"; then
    pm2 restart aifahao-api
else
    pm2 start api/server.ts --name "aifahao-api" --interpreter ./node_modules/.bin/tsx
fi

# 保存 PM2 列表以便开机自启
pm2 save
pm2 startup | grep "sudo" | bash || true

echo "=== 部署完成！ ==="
echo "请访问: http://$(curl -s ifconfig.me)"
