---
title: 分流解析之超简单篇？！
published: 2026-08-09
description: ？！强强？！
image: https://image.578113.xyz/posts/choosethebest.jpg
tags: [CDN,EdgeOne,分流,CloudFlare]
category: 技术教程
draft: false
---
> SkyCeria打赢复活赛了！

### 前言的前言

看到了二叉的教程 感觉还是太难了 自己做了一个分流

> Tip:现在EdgeOne不能优选CloudFlare也在封 此时做分流不太建议喔 并且对SEO似乎也不太友好(

### 前言

你需要:
- 一个CF+EO+华为云国际的账号

### 开始

2x的神秘教程甚至包含了改包 我是一个字也做不到（域名以我的578113.xyz举例）

1. 把二级域 `blog.578113.xyz`转移到华为云
![此图片无法显示](https://image.578113.xyz/img/choosethebest2.jpg)
2. 设置该域名解析到Maker（这个用来访问Maker部署的博客)
>    Why:腾讯云免费SSL最方便的是CNAME认证 这里先把证书领到（或者你用别的认证）

3. 在华为云设置分流:境内/境外
![此图片无法显示](https://image.578113.xyz/img/choosethebest3.jpg)
### 完成！
  