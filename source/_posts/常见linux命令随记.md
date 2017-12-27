---
title: 常见linux命令随记
date: 2017-07-07 22:11:03
categories: linux
tags: [linux, 命令行]
---

## 开胃菜
linux命令以多练习方能熟练，所以本文主要以常见的一些linux查询场景为例，记录常见linux命令的使用。说明：以下示例命令为在mac os上测试ok

**词频统计**
给一个文件`words.txt`，内容如下所示：
```
the day is sunny the the
the sunny is is
```
统计单词出现的频率，并按照词频倒序排列。要求输出如下：
```
the 4
is 3
sunny 2
day 1
```
<!-- more -->

## 答案
```
cat words.txt | tr -s ' ' '\n' | sort | uniq -c | sort -r | awk '{ print $2, $1 }'
```
这里大致说下以上命令的使用：

### tr
tr意为 translate，用来进行字符进行替换、压缩和删除。
```
-d delete 删除
-s squeeze 压缩

eg:
> echo 'HELLO WORLD' | tr 'A-Z' 'a-z'
> hello world

> echo 'hello    world!' | tr -s ' ' ' '
> hello world!
第一个为原字符集，第二个为替换成的目标字符集
```
参考：[tr命令][1]

### sort
sort顾名思义排序
```
-r reverse 反转
-u unique 不同
```
参考：[sort命令][2]

### uniq
通常和sort一起使用
```
-c count 记录重复个数

eg: 对文件words.txt          the
                            day
                            is
                            sunny
                            the
                            the
                            sunny
                            is
                            is

> cat words.txt | uniq
> the
  day
  is
  sunny
  the
  sunny
  is
可以看到直接用unqi还是会有重复的，所以才会和sort配合使用
```
参考：[uniq命令][3]

### grep
grep（global search regular expression(RE) and print out the line，全面搜索正则表达式并把行打印出来）是一种强大的文本搜索工具。
```
-E  --extended-regexp  #将样式为延伸的普通表示法来使用
-f <规则文件>  --file=<规则文件>  #指定规则文件，其内容含有一个或多个规则样式，让grep查找符合规则条件的文件内容，格式为每行一个规则样式
-n  --line-number  #在显示符合样式的那一行之前，标示出该行的列数编号
-c  --count  #计算符合样式的列数
```
下面举例说明使用方法
过滤一个文件中的有效电话号码，有效电话号码格式为：
`(xxx) xxx-xxxx` or `xxx-xxx-xxxx`，x为数字
现有一个文件file.txt为
```
987-123-4567
123 456 7890
(123) 456-7890
```
**方法一  ----------  [-E]**
```
-E 使用扩展的正常的正则表达式过滤
grep -E '^\(\d{3}\) \d{3}-\d{4}$' file.txt
or
cat file.txt | grep -E '^(\(\d{3}\) |\d{3}-)\d{3}-\d{4}$'
```

**方法二  ----------  [-f]**
```
写一个规则文件pattern.txt:
^\d\{3\}-\d\{3\}-\d\{4\}$
^(\d\{3\}) \d\{3\}-\d\{4\}$

筛选命令为：
grep file.txt -nf pattern.txt
or
grep file.txt -cf pattern.txt
```
参考：[每天一个linux命令（39）：grep 命令][4]

### awk
使用方法：
`awk '{pattern + action}' filenames`
eg:
```
cat file.txt | awk 'BEGIN {print "Begin!"}  {print $1} END {print "End!"}'
awk工作流程：
先执行BEGING，然后读取文件，读入有/n换行符分割的一条记录，然后将记录按指定的域分隔符划分域，填充域，
$0则表示所有域,$1表示第一个域,$n表示第n个域,随后开始执行模式所对应的动作action。接着开始读入第二条记录······
直到所有的记录都读完，最后执行END操作。

常见内置变量
NF        浏览记录的域的个数
NR        已读的记录数
```
示例：
对一个文件file.txt，其内容为：
```
name age
alice 21
ryan 30
```
需要把它转化为如下形式 (相当于矩阵的反转)：
```
name alice ryan
age 21 30
```
给出示例代码为：
```
awk '
{
    for (i = 1; i <= NF; i++) {
        if(NR == 1) {
            s[i] = $i;
        } else {
            s[i] = s[i] " " $i;
        }
    }
}
END {
    for (i = 1; s[i] != ""; i++) {
        print s[i];
    }
}' file.txt
```
参考：[linux awk命令详解][5]

## 其他小菜
**1、统计某一目录下文件数目**
```
ls -l | wc -l
```
参考链接：[每天一个linux命令（40）：wc命令][6]

**2、统计某一目录下普通文件个数**
```
ls -l | grep '^-' | wc -l

ls -l 结果如下：
-rw-r--r--    1 zhang_zack  staff   174  7  7 22:11 db.json
drwxr-xr-x  291 zhang_zack  staff  9894  2 22 19:37 node_modules
第一个d表示是否为文件夹
```

[1]: http://man.linuxde.net/tr
[2]: http://man.linuxde.net/sort
[3]: http://man.linuxde.net/uniq
[4]: http://www.cnblogs.com/peida/archive/2012/12/17/2821195.html
[5]: http://www.cnblogs.com/ggjucheng/archive/2013/01/13/2858470.html
[6]: http://www.cnblogs.com/peida/archive/2012/12/18/2822758.html