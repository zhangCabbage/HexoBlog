---
title: Majority Number --- 出现次数超过数组长度1/n的数字
date: 2017-04-10 20:23:37
categories: 算法
tags: [算法]
---

## 题目

为了循序渐进的说明问题，我们先给出如下问题：找出数组中出现次数超过其长度`1/2`的数字？
要求时间复杂度`O(n)`, 空间复杂度`O(1)`

<!--more-->

## 分析
这道题在`剑指offer`、`leetcode`、`lintcode`等很多地方都能看到。

最容易想到的解法：统计各不同元素出现个数，大于`1/2`即为解，但是如此空间复杂度就达不到要求。

排序统计：先排个序，再统计，似乎能达到`O(1)`的空间复杂度。不过比较排序算法的最快时间复杂度为`O(nlogn)`, 为了达到要求只能使用`O(n)`的排序算法，`基数排序`似乎能满足需求。

本篇博文`基数排序`不是我们的重点（桶排序、计数排序、基数排序的区别大家能弄明白么？广告：之后可能会写关于排序的专题，有兴趣请持续关注白菜君的博客...），我们要说的是`抵消算法`。超过一半的数字，如果与剩余和它不同的数相抵消，最后剩下的数就是出现次数超过一半的数字。

Java代码如下:
```
public static int more_1_2(int[] nums) throws Exception {
    int x = 0;
    int cnt = 0;
    for (int i = 0; i < nums.length; i++) {
        if (cnt == 0) {
            x = nums[i];
            cnt++;
        } else {
            if (x != nums[i]) cnt--;
            else cnt++;
        }
    }
    //判断是否有这样的数
    cnt = 0;
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == x) cnt++;
    }
    if (cnt > nums.length / 2) return x;
    else throw new Exception("数组不存在超过1/2的元素");
}
```

## 扩展

### 扩展问题
找出数组中出现次数超过其长度`1/3`的数字？要求时间复杂度`O(n)`, 空间复杂度`O(1)`

### 头脑风暴
[`头脑风暴`][1]百度百科关键词会跟上`一种创造能力的集体训练法`，在我这里日常却是`头脑风暴(精神错乱状态)`。

有兴趣的了解博主脑回路的可以继续往下看，如果时间紧(哥们儿分分钟几百万上下，赶紧的)，那就请移步下个小节。

我曾试图把数组分成3个部分
```
+-----------+-----------+-----------+
|    <1>    |    <2>    |    <3>    |
+-----------+-----------+-----------+
|  0 - 1/3  | 1/3 - 2/3 |  2/3 - 1  |
+-----------+-----------+-----------+
```
对`<1,2>`、`<1,3>`、`<2,3>`、这三个部分分别采用`1/2`的方式，想着在`2/3`中超过`1/3`不就是超过`1/2`么？

再经过一番头脑风波，发现忽略了一种情况：假如超过`1/3`的元素分别分布在`<1>`、`<2>`、`<3>`中，而这三部分其中任意两部分加起来都不超过`1/2`!!

如果在我这个思路下，你有什么想法，欢迎在博文下方评论告知。

### 洗脑风暴
下面开始洗脑，把人民群众拉回共产主义正确道路上来。

主要思路：
```
我们知道超过1/3次数的数字个数不超过2个。类似抵消的思想，假如有3个数不相同，那么我们就让它们抵消掉。

两个int存储两个数，两个int分别存储两个数出现的次数cnt。
遍历数组遇到相同的cnt++, 遇到与两个数都不同的，那么两个数对应的cnt--。
```

代码如下：
```
/**
 * 我是个很懒的人，能写一行的代码绝不写两行. 所以使用数组来存储，也导致代码中break的问题
 * 注意我为什么使用break
 *
 * @param nums
 * @return
 */
public static List<Integer> more_1_3(int[] nums) {
    List<Integer> res = new ArrayList<>();
    if (nums.length < 3) {
        for (int i = 0; i < nums.length; i++) {
            if (i == 1 && nums[1] == nums[0]) continue;
            res.add(nums[i]);
        }
        return res;
    }

    int[] tmp = new int[2];
    int[] cnt = new int[2];
    for (int i = 0; i < nums.length; i++) {
        if (nums[i] == tmp[0]) cnt[0]++;
        else if (nums[i] == tmp[1]) cnt[1]++;
        else if (cnt[0] == 0) {
            tmp[0] = nums[i];
            cnt[0]++;
        } else if (cnt[1] == 0) {
            tmp[1] = nums[i];
            cnt[1]++;
        } else {
            cnt[0]--;
            cnt[1]--;
        }
    }

    //验证两数是否为超过1/3元素
    cnt = new int[2];
    for (int i = 0; i < nums.length; i++) {
        for (int j = 0; j < tmp.length; j++) {
            if (nums[i] == tmp[j]) {
                cnt[j]++;
                break;  //这里加break, 防止连续两次+1的情况。eg: {0, 0, 0}
            }
        }
    }
    for (int i = 0; i < tmp.length; i++) {
        if (cnt[i] > nums.length / 3) {
            res.add(tmp[i]);
        }
    }
    return res;
}
```

## 后记
之后`1/n`的情况自然而然就能扩展出去了，大家可以在如下地址进行练习：

leetcode: [Majority Element II | LeetCode OJ][2]
lintcode: [Majority Number II][3]

打完收工！

读者：这是什么武功？
博主：想学啊你，我教你啊。。。


[1]: http://baike.baidu.com/link?url=sgSk4xe30_4Xxr4W9oQisqt_mcRrtGRilnh9EzZjBLqp9DkXqolv8c2Yc6MahCY0C4PswiU3pBaK9vTp1V8JzeXIL1wBf1qGkumcGex1GiQkU7GqB4Mazqcp0TeB748y
[2]: https://leetcode.com/problems/majority-element-ii/
[3]: http://www.lintcode.com/en/problem/majority-number-ii/