---
title: Permutation --- 字符串的排列
date: 2017-07-15 16:50:43
categories: 算法
tags: [算法, Permutation]
---

## 题目

犯过的错误，我总是会反复再犯。`Permutation` -- 字符串的排列，16年遇到这个问题，特地在code中总结，然而过了一年没怎么刷题的我，又有一点混。下面对解法做概要记录

直接给题目

输入一个字符串,按字典序打印出该字符串中字符的所有排列。例如输入字符串`abc`, 则打印出由字符`a,b,c`所能排列出来的所有字符串: `abc`,`acb`,`bac`,`bca`,`cab`和`cba`。可能有字符重复！

<!--more-->

## 分析

### 解法一 递归
把字符串看成两部分：第一个字符和剩下字符，每次从剩下字符中选择一个作为头字符，之后递归进行。

简单如上说，可能你不知道如何code，我们来分析一下关键点。
1）关于头字符的选择。
对于一个`str(i,j)`的字符，我们从`i`到`j`循环轮流作为头字符。这里有个问题：可能字符串有重复。对字符`aba`，按之前的分析，`a`就会当两次老大，但是这就不公平了啊。`b`(小妾)就会想凭什么`a`(正房)被临幸两次，我才一次，嘤嘤嘤......(老婆：什么...你还想有小妾？逃.....)所以需要控制一下频率，怎么回事，我说话语气怎么不对了，咳咳。。
在临幸到下标`x`时，那么就在`str(i, x-1)`查看有没有被临幸过，如果没有则今晚就翻它的牌子。

2）递归的结束点
我们需要一个递归传递当前字符遍历下标，当下标到字符串结尾时，则停止。

其实很简单，code如下：
```
public ArrayList<String> Permutation(String str) {
    ArrayList<String> res = new ArrayList<>();
    if (str == null || "".equals(str)) return res;
    char[] c = str.toCharArray();
    permutation(c, 0, res);
    
    Collections.sort(res);  //字典序排列
    return res;
}

private void permutation(char[] c, int x, ArrayList<String> res) {
    if (x == c.length) res.add(String.valueOf(c));
    else {
        for (int i = x; i < c.length; i++) {
            if (canSwap(c, x, i)) {  //控制是否交换
                swap(c, x, i);
                permutation(c, x + 1, res);
                swap(c, x, i);
            }
        }
    }
}

private boolean canSwap(char[] c, int i, int j) {
    char tmp = c[j];
    for (int k = i; k < j; k++) {
        if (c[k] == tmp) return false;
    }
    return true;
}

public void swap(char[] nums, int m, int n) {
    char temp = nums[m];
    nums[m] = nums[n];
    nums[n] = temp;
}
```

### 解法二 循环
如下我们有规律的循环遍历，直接产生一个字典序列的排列集。

算法过程描述如下：
1）从后往前，找到第一个顺序前后数对，如34126543中的26，2即为替换数a 
2）从后往前，找到第一个比替换数a大的最小数，很容易知道a之后的数据都是倒序，所以从后往前找第一个比a大的，即比a大的最小数b
3）交换此两个数a、b，根据上面的道理我们知道：交换之后a之后的仍为倒序
4）把a之后的倒序倒置一遍，即变换为顺序。并返回true

```
public ArrayList<String> Permutation(String str) {
    ArrayList<String> res = new ArrayList<String>();
    if (str == null || "".equals(str)) return res;

    char[] c = str.toCharArray();
    Arrays.sort(c);
    do {
        res.add(String.valueOf(c));
    } while (hasNextPermutation(c));

    return res;
}

private boolean hasNextPermutation(char[] c) {
    int x = c.length;
    while (x > 1) {  //注意：排除 < 2的不需排序字符串
        x--;
        if (c[x - 1] < c[x]) {  //注意：只能是小于
            int y = c.length - 1;
            while (c[y] <= c[x - 1]) y--;  //注意：只能一直到大于 c[x - 1] 的数
            swap(c, x - 1, y);
            reverse(c, x, c.length - 1);
            return true;
        }
    }
    reverse(c, 0, c.length - 1);
    return false;
}

public void swap(char[] nums, int m, int n) {
    char temp = nums[m];
    nums[m] = nums[n];
    nums[n] = temp;
}

public void reverse(char[] array, int start, int end) {
    int i = start, j = end;
    while (i < j) {
        swap(array, i++, j--);
    }
}
```

## 扩展
同样是上面的排序，选出m个做全排列。

程序该如何？PS: 写其实只需要稍微改一下上面的代码就行。

具体代码见：[Permutation](https://github.com/zhangCabbage/modelUtil/blob/master/NumberTheory/Permutation.java)