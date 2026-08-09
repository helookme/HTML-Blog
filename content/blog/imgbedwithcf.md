---
title: 用CloudFlare和GitHub制作图床?
published: 2026-02-27
description: 注意，这种行为属于滥用公共资源，本站仅提供技术思路
tags: [CloudFlare,图床,GitHub,搭建]
category: 技术教程
draft: false
---
这种方案可行，但最好还是使用正规图床
# 开始
首先在github账号上新建一个储存库,可见性公开.
点击Repositories
![此图片无法显示](https://image.578113.xyz/img/imgbedwithcf2.jpg)
点击New
![此图片无法显示](https://image.578113.xyz/img/imgbedwithcf1.jpg)
设置储存库，设为公开
![此图片无法显示](https://image.578113.xyz/img/imgbedwithcf3.jpg)
接下来我们需要让AI写一个html代码，内容随意。
![此图片无法显示](https://image.578113.xyz/img/imgbedwithcf4.jpg)
新建一个 `index.html`,把代码复制进去.

使用Git工具将储存库部署到本地，把 `index.html`放到根目录,并创建一个文件夹,名字自己记住就行.

现在你的图床已经部署完成,你只要往那个文件夹里放图片,再利用域名＋目录访问.

MarkDown加入图片代码`![此图片无法显示](https://example.com/xxx/xxx.png/)` 

# 原理
 GitHub提供了类似CloudFlare R2储存桶的服务,并且还免费,速度也不错,就可以搭配CloudFlare Pages实现图床

 - Q:为什么要添加index.html?
   A:因为CloudFlare Pages不能直接部署,需要一个html文件来部署一个空壳网站

   但是 GitHub检测到外链引用过多会停止服务,个人博客一般不被DDOS没什么事