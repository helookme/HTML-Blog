---
title: 别让你的博客变成一个人的游戏！给博客加入评论
published: 2026-03-29
description: 本文详细介绍了如何为博客接入开源免费评论系统Giscus
image: "https://image.578113.xyz/posts/giscus.jpg"
tags: [CloudFlare,GitHub,Giscus]
category: 技术教程
draft: false
---
## 事先准备

> 由于Giscus基于GitHub Discussion,所以我们要新建一个仓库

新仓库设置为 *公开* 点击仓库Settings，启用 `Discussion`功能
![此图片无法显示](https://image.578113.xyz/img/giscus1.jpg)

## 开始配置

前往 [Giscus](https://giscus.app/zh-CN)
确保你的库满足显示的所有条件

*映射关系* 重中之重
- 建议选择pathname（基于路径）
- 建议选择 *使用严格的标题匹配 *
- 建议选择 *公告*

最后复制js代码，粘贴到相关文件下即可。
