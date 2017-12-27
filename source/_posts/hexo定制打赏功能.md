---
title: hexo定制打赏功能
date: 2017-06-10 22:00:56
categories: 工具
tags: [工具, 博客技术]
---

## 定制hexo样式

个人博客采用`hexo`依托`github`搭建，采用简洁美观的`next`主题。打开`[打赏]`功能后，对`[赏]`字按钮样式一直耿耿于怀。

<!-- more -->
打开`[打赏]`，默认的样式如下：
![](/images/technology/before_shang.png)

见过一个圆形`[赏]`样式之后，从此美观强迫症停不下来！样式如下：
![](/images/technology/after_shang.png)

如何修改呢？

在`hexo/themes/next/layout/_macro/reward.swig`文件中，我们看到[打赏]功能的主要界面代码。

自定义如下标签样式
```
<span>赏</span>
```
↓↓↓
```
<span onmouseover="this.style.color='rgb(236,96,0)';this.style.background='rgb(204,204,204)'" onmouseout="this.style.color='#fff';this.style.background='rgb(236,96,0)'" style="display: inline-block; width: 70px; height: 70px; border-radius: 100%; color: rgb(255, 255, 255); font-style: normal; font-variant: normal; font-weight: 400; font-stretch: normal; font-size: 35px; line-height: 75px; font-family: microsofty; background: rgb(236, 96, 0);">赏</span>
```

## 引用
[打赏按钮· Issue #1143][1]

[1]: https://github.com/iissnan/hexo-theme-next/issues/1143