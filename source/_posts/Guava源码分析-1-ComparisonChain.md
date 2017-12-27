---
title: Guava源码分析(1) --- ComparisonChain
date: 2017-02-17 19:19:30
categories: 源码
tags: [Guava, 源码]
---

## 前言
果然我还是话多，总想在前言整个大新闻orz. 本篇文章主要讲解[`Guava`][1]如何简化`Object`的`toString`和`compareTo`方法的实现，着重分析`ComparisonChain`如何实现懒比较。具体涉及到源码中`MoreObjects`和`ComparisonChain`的实现，附带`Fluent Interface`等...

`Guava`是`Google`提供的`Java`核心工具库，截止当前时刻最新版本为`Guava 21.0`，本文的源码分析也是基于此版本进行的
<!-- more -->

## MoreObjects
自`Java7`之后，`Guava`推荐使用`sun`官方实现的`Objects`，`Guava`本身的`Objects`基本没有任何作用。以前版本的`toString`工具方法也已转移到新类`MoreObjects`之中。我们知道Java原生`toString`方法对于对象会返回`类全名 + @ + 对象地址`；假如为数组对象，则返回`[ + 类型 + @ + 对象地址`，这样非常不友好。我们可以通过`MoreObjects`类来覆写`toString`方法，进行友好输出。如下栗子
```Java
System.out.println(new int[]{1, 2, 3});  //打印 [I@3cd1a2f1

String out = MoreObjects.toStringHelper("MyTestClass").addValue(true).add("second", 12).toString();
System.out.println(out);  //打印 MyTestClass{true, second=12}
```

关于`MoreObjects.toStringHelper`的实现。
`toStringHelper`为`MoreObjects`的静态内部类，通过`MoreObjects.toStringHelper("")`来构造对象。
```Java
//MoreObjects源码，这里只复制关键部分
public final class MoreObjects {
  ...
  public static ToStringHelper toStringHelper(String className) {
    return new ToStringHelper(className);
  }
  ...
  public static final class ToStringHelper {
    private final String className;
    private final ValueHolder holderHead = new ValueHolder();
    private ValueHolder holderTail = holderHead;

    private ToStringHelper(String className) {
      this.className = checkNotNull(className);
    }
  }
  ...
  private MoreObjects() {}
}
```
可以看到`toStringHelper`的构造方法访问权限修饰词为`private`，为什么`MoreObjects`外部类在方法`toStringHelper`中可以访问？
`private`修饰的意思是：**除包含该成员的类之外，其他任何类都无法访问这个成员**。外部类包含内部类，可以理解为包含内部类所有，故也能被访问！

`toStringHelper`类中以`ValueHolder`形式**带头结点的链表**来存储传入的键值对。
```Java
public static final class ToStringHelper {
  private final ValueHolder holderHead = new ValueHolder();
  private ValueHolder holderTail = holderHead;
  ...
  private ValueHolder addHolder() {
    ValueHolder valueHolder = new ValueHolder();
    holderTail = holderTail.next = valueHolder;
    return valueHolder;
  }
  ...
  private ToStringHelper addHolder(String name, @Nullable Object value) {
    ValueHolder valueHolder = addHolder();
    valueHolder.value = value;
    valueHolder.name = checkNotNull(name);
    return this;
  }
  ...
  private static final class ValueHolder {
    String name;
    Object value;
    ValueHolder next;
  }
}
```
对于链表的插入，程序非常优雅的分成**添加结点**和**赋值**两部分，见上源码`无参addHolder`和`有参addHolder`。使用连续赋值进行尾指针调整，`holderTail = holderTail.next = valueHolder`，这样感觉简便的多，可以参考！

## ComparisonChain
Java中实现类的一个比较器Comparator，有时也略麻烦。对于一个有三个成员的类`People`，它的比较器的实现如下：
```Java
class Person {
  private String lastName;
  private String firstName;
  private int zipCode;
}

  //compareTo方法，很不直观
  public int compareTo(Person other) {
    int cmp = lastName.compareTo(other.lastName);
    if (cmp != 0) {
      return cmp;
    }
    cmp = firstName.compareTo(other.firstName);
    if (cmp != 0) {
      return cmp;
    }
    return Integer.compare(zipCode, other.zipCode);
  }

  //基于ComparisonChain的实现，则非常直观。
  public int compareTo(Foo that) {
    return ComparisonChain.start()
            .compare(this.aString, that.aString)
            .compare(this.anInt, that.anInt)
            .compare(this.anEnum, that.anEnum, Ordering.natural().nullsLast())
            .result();
  }
```
从上面的代码我们可以发现：基于`ComparisonChain`实现的比较器非常直观。
这里先介绍一下，上面这个可以连续引用方法的接口方式为[`Fluent Interface`][2]。通过在方法中返回对象本身(`return this`)，可以很容易实现。

`ComparisonChain`最关键的是能实现**懒比较**：执行比较操作直至发现非零的结果，在那之后的比较输入将被忽略。拿上面的栗子来说，也就是当`aString`能比较出两个对象的大小后，之后的`anInt`和`anEnum`就不再比较，更快速！那么如何实现**懒比较coding**呢？

`ComparisonChain`类源码如下：
```Java
public abstract class ComparisonChain {
  private ComparisonChain() {}

  public static ComparisonChain start() {
    return ACTIVE;
  }

  private static final ComparisonChain ACTIVE =
      new ComparisonChain() {
        ...
        @Override
        public ComparisonChain compare(int left, int right) {
          return classify(Ints.compare(left, right));
        }
        ...
        ComparisonChain classify(int result) {
          return (result < 0) ? LESS : (result > 0) ? GREATER : ACTIVE;
        }

        @Override
        public int result() {
          return 0;
        }
      };

  private static final ComparisonChain LESS = new InactiveComparisonChain(-1);

  private static final ComparisonChain GREATER = new InactiveComparisonChain(1);
}
```
抽象类`ComparisonChain`的`start`方法返回一个实现了抽象类的实例对象`ACTIVE`，此实例对象每个抽象方法实现都覆盖一层`classify`操作，来判断返回`ACTIVE`、`GREATER`、`LESS`哪个`ComparisonChain`实例对象。

`ACTIVE`对象表示两对象比较结果为`0`的`ComparisonChain`实例，`GREATER`对象表示两对象比较结果为`1`的`ComparisonChain`实例，`LESS`对象表示两对象比较结果为`-1`的`ComparisonChain`实例。

我们再来看一下表示`GREATER`、`LESS`的实现类`InactiveComparisonChain`
```Java
private static final class InactiveComparisonChain extends ComparisonChain {
  final int result;

  InactiveComparisonChain(int result) {
    this.result = result;
  }
  ...
  @Override
  public ComparisonChain compare(int left, int right) {
    return this;
  }

  @Override
  public ComparisonChain compare(long left, long right) {
    return this;
  }
  ...
  @Override
  public int result() {
    return result;
  }
}
```
所有抽象方法实现均只返回自身(`return this`)，不进行任何操作。ok如此便进行了编码上的懒实现，各位看官群众们知道其中缘由了么？

那么我来分析一下：
每次比较通过`classify`方法处理，结果都会是`ACTIVE`、`GREATER`、`LESS`一种，它们都是`ComparisonChain`抽象类的实现实例对象，故而可以构成`Fluent Interface`。

而如果比较返回的是`GREATER`或`LESS`，由于其`compare`实现为`return this`，不进行任何处理，故而忽略`ComparisonChain.start().compare(this.aString, that.aString).compare(this.anInt, that.anInt).result()`有结果之后的比较输入`.compare(this.anInt, that.anInt)...`

## 参考链接
[`关于接口设计，还有Fluent Interface，这种有趣的接口设计风格`](http://www.raychase.net/263)
[`[Google Guava] 1.3-常见Object方法`](http://ifeve.com/google-guava-commonobjectutilities/)

[1]:https://github.com/google/guava
[2]:https://zh.wikipedia.org/wiki/%E6%B5%81%E5%BC%8F%E6%8E%A5%E5%8F%A3
