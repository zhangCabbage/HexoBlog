## HexoBlog
This is my blog source file based on [`Hexo`](https://hexo.io/zh-cn/).

## CreateTime
2017/12/27 15:26

## QuickStart
```
1. install node.js
2. install hexo: npm install -g hexo-cli
3. download blog file: git clone git@github.com:zhangCabbage/HexoBlog.git
4. download hexo plugins: cd HexoBlog; npm install
5. hexo g
6. hexo s
7. hexo new "your title"
```

## Q&A
**Q**: hexo Error: The module 'node_modules/dtrace-provider/build/Release/DTraceProviderBindings.node' was compiled against a different Node.js version using

**A**: reference -> [https://github.com/hexojs/hexo/issues/2534](https://github.com/hexojs/hexo/issues/2534)
```
- cd `which hexo'/../..
- rm -rvf node_modules
- npm install
- cd into your hexo-project
- rm -rvf node_modules
- npm install
```


**Q**: fs.SyncWriteStream is deprecated

**A**: reference -> [http://rangerzhou.top/2017/07/27/Hexo%E5%8D%9A%E5%AE%A2%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/](http://rangerzhou.top/2017/07/27/Hexo%E5%8D%9A%E5%AE%A2%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/)
