# Google Maps API 网络问题解决方案

由于在中国大陆访问 Google 服务可能会遇到网络问题，这里提供了几种解决方案。

## 解决方案 1: 使用免费代理

运行带代理的测试：
```bash
node api_test_with_proxy.js
```

这个脚本会自动尝试多个免费代理，如果都失败了会尝试直接连接。

## 解决方案 2: 使用官方客户端

运行官方客户端测试：
```bash
node api_test_official_client.js
```

官方客户端通常更稳定，建议优先尝试这个方案。

## 解决方案 3: 配置环境变量代理

### 设置代理环境变量
```bash
# 设置 HTTP 代理
export HTTP_PROXY=http://your-proxy-server:port

# 设置 HTTPS 代理
export HTTPS_PROXY=http://your-proxy-server:port

# 运行测试
node api_test_env_proxy.js
```

### 常用的免费代理服务器
注意：这些代理可能会变化，需要定期更新

1. **HTTP 代理**:
   - `http://proxy.freemyip.com:8080`
   - `http://proxy.webshare.io:80`
   - `http://proxy.proxy-list.download:3128`

2. **SOCKS5 代理**:
   - `socks5://127.0.0.1:1080` (如果你有本地 SOCKS 代理)

## 解决方案 4: 使用 VPN

1. 安装并配置 VPN 客户端
2. 连接到海外服务器
3. 运行原始测试脚本：
   ```bash
   node api_test.js
   ```

## 解决方案 5: 使用替代服务

如果 Google Maps API 持续无法访问，可以考虑：

1. **高德地图 API** (国内)
2. **百度地图 API** (国内)
3. **OpenStreetMap** (免费，全球)

## 测试所有方案

运行以下命令测试所有方案：

```bash
echo "=== 测试原始版本 ==="
node api_test.js

echo -e "\n=== 测试官方客户端 ==="
node api_test_official_client.js

echo -e "\n=== 测试代理版本 ==="
node api_test_with_proxy.js

echo -e "\n=== 测试环境变量代理 ==="
node api_test_env_proxy.js
```

## 故障排除

### 常见错误及解决方案

1. **ENOTFOUND**: 域名解析失败
   - 检查网络连接
   - 尝试使用代理或 VPN

2. **ECONNREFUSED**: 连接被拒绝
   - 检查防火墙设置
   - 尝试不同的代理

3. **ETIMEDOUT**: 连接超时
   - 增加超时时间
   - 尝试更快的代理

4. **API 密钥错误**:
   - 检查 API 密钥是否正确
   - 确认 API 密钥有足够的配额

## 推荐方案

1. 首先尝试 `api_test_official_client.js` (官方客户端)
2. 如果失败，尝试 `api_test_with_proxy.js` (自动代理)
3. 如果还是失败，手动配置代理使用 `api_test_env_proxy.js`
4. 最后考虑使用 VPN 或替代服务