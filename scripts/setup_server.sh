#!/bin/bash

# 停止脚本在遇到错误时继续执行
set -e

echo "开始初始化服务器环境..."

# 1. 更新系统软件包
echo "正在更新系统软件包..."
sudo apt update && sudo apt upgrade -y

# 2. 安装基础工具
echo "正在安装 curl 和 git..."
sudo apt install -y curl git unzip

# 3. 安装 Node.js 20.x (LTS)
echo "正在安装 Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. 安装 PM2 (进程管理工具)
echo "正在安装 PM2..."
sudo npm install -g pm2

# 5. 安装 Nginx (Web 服务器)
echo "正在安装 Nginx..."
sudo apt install -y nginx

# 6. 验证安装
echo "-----------------------------------"
echo "环境安装完成！版本信息如下："
echo "Node.js: $(node -v)"
echo "NPM: $(npm -v)"
echo "Nginx: $(nginx -v 2>&1 | grep -o 'nginx/[^ ]*')"
echo "-----------------------------------"
