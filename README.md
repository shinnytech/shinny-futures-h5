# shinny-futures-h5

一个开源的 HTML5 期货行情交易终端。

## 功能说明

* [x] 期货合约行情报价。
* [x] K线图，Tick图，盘口报价。
* [x] 登录期货交易账户。
* [x] 查看账户资金。
* [x] 下单交易。
* [x] 查看账户持仓记录，委托单记录。
* [x] 银期转账及转账记录。


## 如何使用

### 1. 将项目克隆到本地

    git clone https://github.com/shinnytech/shinny-futures-h5

### 2. 在项目目录下运行任意 http server

可以选择任意一种熟悉的开发环境来运行。

* NodeJs 环境下
    1. 安装 nodejs。
    
    2. 安装 http-server `npm install -g http-server`。
    
    3. 项目目录下运行 `http-server -a 0.0.0.0 -p 8888`。
    
    4. 浏览器打开 `http://127.0.0.1:8888/`。

* Python 环境下
    1. 安装 python。
    
    2. 查看 python 版本 `python -V` 。
    
    3. 项目目录下运行：
        
        `python -m http.server` (python版本 3.X)
        
        `python -m SimpleHTTPServer` (python版本 2.X)
  
    4. 浏览器打开 `http://127.0.0.1:8000/`。
    
* Chrome 浏览器插件
    1. 安装 Chrome 浏览器。
    
    2. 在 Chrome 浏览器安装 [web-server-for-chrome](https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb) 插件。
    
    3. 在 **web-server-for-chrome** 插件中选择项目文件夹，输入端口号，即可在浏览器访问。

