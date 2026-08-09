---
title: Fuwari博客搭建教程
published: 2026-02-19
description: "CloudFlare+GitHub无敌辣！"
image: "https://image.578113.xyz/posts/fuwari.png"
tags:
  - Fuwari
  - 搭建
  - 教程
  - 博客
category: 技术教程
draft: false
---
# 前言
  本来是不想写这个教程的,但是看好多人都问我还是决定写一个咯
# 所需东西
  - 一个GitHub账号
  - 一个Cloudflare账号及域名（域名非必须）
  - 会和豆包聊天的脑子
# 开始吧！
  请先fork仓库:https://github.com/saicaca/fuwari
  ![此图片无法显示](https://image.578113.xyz/img/fuwari1.jpg)
  安装以下工具
    Git:[git-scm.com]()
    node.js:网上自己搜
  打开"最近添加",点那个Git(最好选择基于cmd的,可以复制)

  将你的仓库部署到本地:`git clone <仓库URL>` (注意你Git前面的路径,这将是你本地的部署位置)

  安装全局npm(国内速度较慢 可以用镜像):`npm install -g pnpm` 

  在项目根目录部署相关依赖(例如你刚才的Git前地址是C:/Administrator,你的仓库名为blog,那么你的项目根目录地址为C:/Administrator/blog):`pnpm install`以及 `pnpm add sharp`


>   在你部署在本地的项目中,会有一些示例文章,图标,头像等 我们需要一一删除

- 在 `/src/content/posts`中,有一些示例的文章,帮助你更好的掌握Fuwari.我们可以删掉
- 在 `/src/config.ts`中,有一些博客的配置文件,这里不多赘述,自行更改.
- 在 `astro.config.mjs`中第34行将 `site:`后改为你自己的博客地址,如 `site:blog.91787878.xyz`

  Fuwari博客基于MarkDown语法,请前往[https://markdown.com.cn/basic-syntax/]()学习


# 发布更新/文章
  我们需要将更改发布到GitHub

 - `git config --global user.name "Github用户名"`
 - `git config --global user.email "你注册GitHub的邮箱"`
 - 更改为ssh `git remote set-url origin git@github.com:xxx/xxx`
   ![此图片无法显示](https://image.578113.xyz/img/fuwari2.jpg)

  但是,上传是需要秘钥的,不然GitHub无法验证你的身份,你如果没有配置过是无法上传的.
  - 在Git中输入命令 `$ssh-keygen -t rsa -C "你注册GitHub的邮箱"`它会自动生成一个秘钥并保存在 `C:\User\.ssh`
  - 打开 `C:\User\.ssh`,打开你生成的秘钥(名字含pub那个),用记事本打开,复制其中所有内容
  - 登录GitHub账户,进入 Settings > SSH and GPG keys,点击 New SSH key,粘贴秘钥并保存
  继续上传部署:
  - 在项目根目录使用Git运行 `git add .`注意有空格
  - 发布本地提交 `git commit -m "项目初始化"`
  - 提交到GitHub `git push`

 博客已在GitHub部署完成
## 使用免费的CloudFlare Pages部署博客
   CloudFlare真是大善人(๑◝ᴗ◜๑)
- 打开CloudFlare Workers And Pages页面
- 新建一个Pages,选择Continue with GitHub
  ![此图片无法显示](https://image.578113.xyz/img/fuwari3.jpg)
  - 选择你的仓库
  - 设置构建命令 `pnpm build`
  - 设置构建输出目录 `dist`
 等待部署完成,绑定你的自定义域名即可访问你的博客!