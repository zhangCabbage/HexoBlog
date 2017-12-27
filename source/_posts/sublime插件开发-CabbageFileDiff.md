---
title: sublime插件开发 -- CabbageFileDiff
date: 2017-05-21 22:33:24
categories: 工具
tags: [工具, 插件]
---

## 需求来了

最近总是需要review旧的业务代码进行重构，这个过程中涉及不少sql字段的比较。可类比比较两个无序字符串数组的异同，跟普通的`filediff`需求略微不同。虽然可以写一个脚本来处理，但是这样每次都需要对比较的字段新建文件。而通常的应用场景是想直接把内容复制到`sublime view`缓存中进行比较，而不需要新建文件。

我试图寻找此需求的sublime插件：[`FileDiffs`](https://packagecontrol.io/packages/FileDiffs)、[`Compare Side-By-Side`](https://packagecontrol.io/packages/Compare%20Side-By-Side)等，由于无法进行无序比较，效果都不是很好。之后尝试接入sublime plugin API，参考`FileDiffs`的展示效果，做个简易的适合自己需求的小插件`Cabbage File Diff`。
<!-- more -->

## 开发之前
Sublime插件开发使用`python`语言(我假设读者已经熟练掌握python：)，笔者使用的sublime版本为：Sublime Text3。值得一提的是**Sublime Text3基于Python3**（Sublime Text2基于Python2，据作者猜测）。之前一直把Sublime Text仅仅作为一个编辑器，现在才惊觉这货简直就是一个Python交互式shell啊！`ctrl + 反单引号`打开sublime命令行交互界面，输入`print("Hello World!")`一个新世界的大门打开。

## 开发
关于Sublime插件的开发，网上已经有不少很好的教程。尽管如此，为了阅读流畅性以及更通俗易懂的引导大家(请开始你的表演)...

打开Sublime，在菜单栏选择`Tools`>`Developer`>`New Plugin...`，编辑文件如下：
```
import sublime
import sublime_plugin

class ExampleCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        self.view.insert(edit, 0, "Hello, World!")
```
保存文件为任意文件名.py至Packages文件夹下，关于sublime插件API的继承接口`sublime_plugin.TextCommand`问题，之后再进行描述。关于类名问题，名称最后要以`Command`结尾，前面的`Example`名称进行 1）单词分割 2）_连接 3）首字母小写 转变后为此命令调用名称。eg: `CabbageFileDiffCommand`其调用命令为`cabbage_file_diff`。

在sublime控制台中输入`view.run_command('example')`，即在界面中插入"Hello, World!"（view为当前编辑框，可控制台自动导入）。

[Sublime插件开发API手册[中文版]](http://mux.alimama.com/posts/549#sublime.View)在编写插件时，可以随时参考API。

Sublime Plugin可继承的类有如下四个：
- TextCommand: 通过View对象来访问选择的/缓存区的内容，最为常用
- WindowCommand: 通过Window对象来引用当前窗口
- ApplicationCommand: 既不能引用文字内容，也不能引用窗口，无视之
- EventListener: 文档发生改变时的事件处理

ok，介绍到这里就可以对着API开发了。这里再提一句，如下代码参考[`SublimeFileDiffs fork`](https://github.com/zhangCabbage/SublimeFileDiffs)，原地址：[`SublimeFileDiffs`](https://github.com/colinta/SublimeFileDiffs)。

直接开撕代码，注释讲解，方便大家很快的了解重点。**一个view即为编辑器中一个tab**！
```
import sublime
import sublime_plugin


class CabbageFileDiffCommand(sublime_plugin.TextCommand):
    """
    main command
    
    """
    def run(self, edit):
        views = self.view.window().views() #获取当前tab其窗口实例，并获取所有打开的 tab view
        if len(views) != 2:
            # 只比较两个打开的tab
            return

        contents = []
        for v in views:
            #遍历所有 tab view
            this_content = v.substr(sublime.Region(0, v.size())) #view选中全部区域
            this_content = sorted(this_content.split()) #分割，排序
            contents.append(this_content)
        diffs = self.file_diff(contents[0], contents[1])

        scratch = self.view.window().new_file() #新建一个tab
        scratch.set_scratch(True)
        scratch.set_syntax_file('Packages/Diff/Diff.tmLanguage') #tab中的语法格式，方便更明显的看到结果
        scratch.run_command('my_dump', {'diffs': diffs}) #到要插入的比较结果的 tab view下执行插入命令，并传入命令参数


    def file_diff(self, first_content, second_content):
        """[summary]
        比较 first tab 和 second tab 内容的排序后的内容，按需拼接格式并返回输出

        Diff.tmLanguage的语法格式：
            空格开头的灰色
            +开头绿色
            -开头红色

        约定最后结果灰色为两文件共有，+开头为+++ first文件独有，-开头为--- second文件独有
        @@  3,+1,-1  @@，其中无符号为共有单词个数，正数为first文件独有单词个数，负数为second文件独有单词个数
        """
        ...
        return result


class MyDumpCommand(sublime_plugin.TextCommand):
    def run(self, edit, diffs):
        self.view.insert(edit, 0, diffs)
```

最后添加右键菜单，在同一路径下新建`Context.sublime-menu`文件，文件内容
其中`{ "caption": "-" }`为菜单分割
```
[
   { "caption": "-" }, 
   { "caption": "Cabbage File Diff", "command": "cabbage_file_diff" },
   { "caption": "-" }
]
```
到此，娱乐项目结束。ヾ(｡｀Д´｡)是的，就是这么水（逃。。。

## 示例演示
给两个文件
```
Hello World
zhang
jiahua
```
与
```
zhang
jiahua
hai
zeiwang
```
点击右键如下图：
![](/images/technology/sublime1.jpg)
然后结果即如下图：
![](/images/technology/sublime2.jpg)

## 参考链接
[编写你的第一个sublime插件](http://zxhfighter.github.io/blog/javascript/2013/07/30/sublime-plugin.html)
