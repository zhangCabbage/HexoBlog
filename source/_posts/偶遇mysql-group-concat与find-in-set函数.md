---
title: 偶遇mysql group_concat与find_in_set函数
date: 2017-06-08 22:19:33
categories: Mysql
tags: [mysql, SQL]
---

## 偶遇需求

逛论坛，偶然看到下面这个问题，因为最近一直在写`Hive SQL`，就意起试图解决(装b，逃...)

```
device、order2张表。
每完成一个订单，会插入数据到order表里，记录一些数据，包括device_id,时间，状态（已支付）等……（没有订单就不插入数据到order表）
device 表里面就是一些设备信息。

需要的结果是：
展示（一段时间内），每一天，有哪些设备没有订单；

举栗子：

今天设备 abc 没有订单 昨天bd没有订单
2017-06-08 a,b,c
2017-06-07 b,d
```
思考一下，试试...
<!-- more -->

## 探索

首先，我们新建两个表，来进行之后的尝试。
```
device
+-----------+
| device_id |
+-----------+
|     1     |
|     2     |
|     3     |
|     4     |
|     5     |
+-----------+

order
+---------------------+----------+-----------+
|      time           | order_id | device_id |
+---------------------+----------+-----------+
| 2017-06-08 00:00:00 |     1    |     1     |
| 2017-06-08 00:00:00 |     2    |     2     |
| 2017-06-07 00:00:00 |     3    |     1     |
+---------------------+----------+-----------+
```

要找没有订单的设备，条件是device表中不在日订单中。我们试图以`time`来进行`group by`，并尝试合成每组的`device_id`。通过查找mysql聚合函数，被我查到[`group_concat`](https://dev.mysql.com/doc/refman/5.7/en/group-by-functions.html#function_group-concat)。

虽然不知道对之后有没有帮助，我们先了解一下其效果，如下：
```
select time, GROUP_CONCAT(device_id) as device_list
from order
group by time;

结果如下:
+---------------------+--------------------+
|      time           |    device_list     |
+---------------------+--------------------+
| 2017-06-07 00:00:00 |        1           |
| 2017-06-08 00:00:00 |        1,2         |
+---------------------+--------------------+
```

其次，我们如何找出所有设备中当天没有订单的设备呢？组合`group_concat`之后的表与`device`表，我们知道`from a, b`如果不使用`join on`语句，即为两表的笛卡尔积。
```
select *
from 
(
    select time, GROUP_CONCAT(device_id) as device_list
    from order
    group by time
)a, device
order by time;

+---------------------+--------------------+-------------+
|      time           |    device_list     |  device_id  |
+---------------------+--------------------+-------------+
| 2017-06-07 00:00:00 |        1           |      1      |
| 2017-06-07 00:00:00 |        1           |      2      |
| 2017-06-07 00:00:00 |        1           |      3      |
| 2017-06-07 00:00:00 |        1           |      4      |
| 2017-06-07 00:00:00 |        1           |      5      |
| 2017-06-08 00:00:00 |        1,2         |      1      |
| 2017-06-08 00:00:00 |        1,2         |      2      |
| 2017-06-08 00:00:00 |        1,2         |      3      |
| 2017-06-08 00:00:00 |        1,2         |      4      |
| 2017-06-08 00:00:00 |        1,2         |      5      |
+---------------------+--------------------+-------------+
```

之后，如果去过滤取得`device_id not in group_concat_list`。很可惜，`group_concat`返回的是string_list。不过幸运的是，mysql函数中提供了一个解决函数[`find_in_set`](https://dev.mysql.com/doc/refman/5.7/en/string-functions.html#function_find-in-set)。
效果如下：
```
> SELECT FIND_IN_SET('b','a,b,c,d');
> 2
```

## 结论
通过上面的探索，我们最终尝试出最终可以的解决方案如下：
```
select time, GROUP_CONCAT(device_id) as device_list
from (
    select time, GROUP_CONCAT(device_id) as device_list
    from order
    group by time
)tmp, device
where FIND_IN_SET(device_id, device_list) = 0
group by time;

结果如下：
+---------------------+--------------------+
|      time           |    device_list     |
+---------------------+--------------------+
| 2017-06-07 00:00:00 |     2,3,4,5        |
| 2017-06-08 00:00:00 |     3,4,5          |
+---------------------+--------------------+
```

水一篇博客，赶紧滚去写论文去惹...