# DDNS

基于`dnspod`的`ddns`工具，定时请求`dnspod`的`api`更新域名解析记录，若记录不存在则添加，记录发生变动则修改。

## 打包

安装依赖:

```bash
yarn
```

编译为二进制可执行文件(基于`pkg`):

```bash
# linux
npm run package:linux

# windows
npm run package:win
```

## 使用

自行打包或在`relase`中下载已经打好的二进制文件，直接运行即可:

```bash
ddns -c <config>
```

使用`pm2`:

```bash
pm2 start ddns --name ddns -- -c <config>
```

`<config>`为`utf8`编码的`yaml`格式配置文件,示例:

```yaml
application:
  # 每隔多久检查同步一次,单位分钟
  interval: 15
auth:
  # dnspod账户的token
  token: dnspod-token
  # dnspod账户的授权id
  id: dnspod-id
log:
  # 日志输出级别
  level: info
domains: # 要解析的域名列表
  - domain: example.com # 要解析的域名
    # 要解析的域名记录列表
    records:
      - name: sub1 # 域名记录的名称,sub1.example.com
        value: local ipv6 # 记录的值,若为local ipv6,则自动探测机器的公网ipv6地址
        type: AAAA # 记录类型
        ttl: 600 # ttl值,单位秒
        enabled: 1 # 是否生效
      - name: @
        value: 192.168.18.223
        type: A
        ttl: 600
        enabled: 1
```
