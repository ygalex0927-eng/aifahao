#!/bin/bash

echo "=== 停止服务 ==="

# 1. 停止后端服务 (PM2)
if command -v pm2 &> /dev/null; then
    echo "停止后端 API..."
    pm2 stop aifahao-api || true
    pm2 delete aifahao-api || true
    pm2 save
else
    echo "未找到 PM2，跳过后端停止..."
fi

# 2. 停止 Nginx 服务
if command -v systemctl &> /dev/null; then
    echo "停止 Nginx..."
    sudo systemctl stop nginx
else
    echo "未找到 systemctl，尝试直接 kill nginx..."
    sudo pkill nginx || true
fi

echo "=== 服务已停止 ==="
