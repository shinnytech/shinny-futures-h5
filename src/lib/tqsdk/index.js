/* eslint-disable camelcase */

/**
 * @module TQSDK
 */

import 'core-js/stable/set-immediate'
import axios from 'axios'
import { TqQuoteWebsocket, TqTradeWebsocket, TqRecvOnlyWebsocket } from './tqwebsocket'
import DataManager from './datamanage'
import EventEmitter from 'eventemitter3'
import { RandomStr, ParseSettlementContent, IsEmptyObject } from './utils'
import { Quote, Chart } from './datastructure'

// 支持多账户登录
//    * @fires TQSDK#ready 收到合约基础数据（全局只出发一次）
// @fires TQSDK#rtn_data 数据更新（每一次数据更新触发）
// @fires TQSDK#rtn_brokers 收到期货公司列表（全局只出发一次）
// @fires TQSDK#notify 收到通知对象
// @fires TQSDK#error 发生错误(目前只有一种：合约服务下载失败)

/**
 * @external EventEmitter
 */
/**
 * @extends EventEmitter
 * @alias module:TQSDK
 */
class Tqsdk extends EventEmitter {
  /**
   * @param {object} [opts={}] 描述 TQSDK 构造参数
   * @param {string} [opts.symbolsServerUrl=https://openmd.shinnytech.com/t/md/symbols/latest.json] 合约服务地址
   * @param {string} [opts.wsQuoteUrl=wss://openmd.shinnytech.com/t/md/front/mobile] 行情连接地址
   * @param {boolean} [opts.autoInit=true] TQSDK 初始化后立即开始行情连接
   * @param {object} [opts.data={}] 存储数据对象
   * @param {object} [wsOption={}] 描述 TQSDK 构造参数
   * @param {number} [wsOption.reconnectInterval=3000] websocket 自动重连时间间隔
   * @param {number} [wsOption.reconnectMaxTimes=2] websocket 自动重连最大次数
   * @param {object} [wsOption.WebSocket=WebSocket] 浏览器 WebSocket 对象，在 nodejs 运行时，需要传入 WebSocket
   *
   * @fires TQSDK#ready
   * @fires TQSDK#rtn_data
   * @fires TQSDK#rtn_brokers
   * @fires TQSDK#notify
   * @fires TQSDK#error
   *
   * @example
   * // 浏览器
   * const tqsdk = new TQSDK()
   * tqsdk.on('ready', function () {
   *   console.log(tqsdk.getQuote('SHFE.au2006'))
   * })
   * tqsdk.on('rtn_brokers', function (brokers) {
   *   console.log(brokers)
   * })

   * @example
   * // nodejs
   * const TQSDK = require('./dist/umd/tqsdk-nocache')
   * const WebSocket = require('ws')
   * const tqsdk = new TQSDK({}, {WebSocket})
   * tqsdk.on('ready', function () {
   *   console.log(tqsdk.getQuote('SHFE.au2006'))
   * })
   * tqsdk.on('rtn_brokers', function (brokers) {
   *   console.log(brokers)
   * })
   *
   * @example
   * // 1 autoInit 为 true，构造函数会执行 tqsdk.initMdWebsocket(), tqsdk.initTdWebsocket(), 代码中不需要再运行
   * // 推荐使用这种初始化方式
   * const tqsdk = new TQSDK({autoInit: true}) // 等价于 const tqsdk = new TQSDK()
   * tqsdk.on('ready', function(){
   *   console.log(tqsdk.getQuote('DCE.m2009'))
   * })
   *
   * // 2 autoInit 为 false，构造函数不会去执行 tqsdk.initMdWebsocket(), tqsdk.initTdWebsocket()
   * // 在代码中需要的地方再执行
   * const tqsdk = new TQSDK({autoInit: false})
   * tqsdk.initMdWebsocket()
   * // 如果不运行 tqsdk.initMdWebsocket()， 则不会有 ready 事件发生
   * tqsdk.on('ready', function(){
   *   console.log(tqsdk.getQuote('DCE.m2009'))
   * })
   */
  constructor ({
    symbolsServerUrl = 'https://openmd.shinnytech.com/t/md/symbols/latest.json',
    wsQuoteUrl = 'wss://openmd.shinnytech.com/t/md/front/mobile',
    clientSystemInfo = 'aa',
    clientAppId = 'SHINNY_XQ_1.0',
    autoInit = true,
    data = {
      klines: {},
      quotes: {},
      charts: {},
      ticks: {},
      trade: {}
    }
  } = {}, wsOption = {}) {
    super()
    this._insUrl = symbolsServerUrl
    this._mdUrl = wsQuoteUrl
    this.clientSystemInfo = clientSystemInfo
    this.clientAppId = clientAppId
    this.wsOption = wsOption
    this._prefix = 'TQJS_'

    const self = this
    this.dm = new DataManager(data)
    /**
     * @event TQSDK#rtn_data
     * @type {null}
     */
    this.dm.on('data', function () {
      self.emit('rtn_data', null)
    })

    this.brokers_list = null
    this.brokers = null
    this.trade_accounts = {} // 添加账户
    this.subscribeQuotesSet = new Set() // 所有需要订阅的合约
    this.quotesWs = null
    this.quotesInfo = {}
    if (autoInit) {
      // 自动执行初始化
      this.initMdWebsocket()
      this.initTdWebsocket()
    }
  }

  /**
   * 初始化行情链接
   * @fires TQSDK#ready
   *
   * @example
   * const tqsdk = new TQSDK({autoInit: false})
   * tqsdk.initMdWebsocket()
   * tqsdk.on('ready', function(){
   *   console.log(tqsdk.getQuote('DCE.m2009'))
   * })
   */
  initMdWebsocket () {
    if (this.quotesWs) return
    const self = this
    axios.get(this._insUrl, {
      headers: { Accept: 'application/json; charset=utf-8' }
    }).then(response => {
      self.quotesInfo = response.data
      /**
       * @event TQSDK#ready
       * @type {null}
       */
      self.emit('ready')
      self.emit('rtn_data', null)
    }).catch(error => {
      /**
       * @event TQSDK#error
       * @type {Error} error
       */
      self.emit('error', error)
      console.error('Error: ' + error.message)
      return error
    })
    this.quotesWs = new TqQuoteWebsocket(this._mdUrl, this.dm, this.wsOption)
  }

  /**
   * 初始化交易链接
   * @fires TQSDK#rtn_brokers
   * @example
   * const tqsdk = new TQSDK({autoInit: false})
   * tqsdk.initMdWebsocket()
   * tqsdk.initTdWebsocket()
   * tqsdk.on('rtn_brokers', function(brokers){
   *   console.log(brokers)
   * })
   */
  initTdWebsocket () {
    if (this.brokers) return
    const self = this
    // 支持分散部署的交易中继网关
    axios.get('https://files.shinnytech.com/broker-list.json', {
      headers: { Accept: 'application/json; charset=utf-8' }
    }).then(response => {
      self.brokers_list = response.data
      self.brokers = Object.keys(response.data).filter(x => !x.endsWith(' ')).sort()
      /**
       * @event TQSDK#rtn_brokers
       * @type {list} 期货公司列表
       */
      self.emit('rtn_brokers', self.brokers)
    }).catch(error => {
      self.emit('error', error)
      console.error('Error: ' + error.message)
      return error
    })
  }

  /**
   * 添加 websocket 数据源
   * @private
   * @param {string} url
   */
  addWebSocket (url = '') {
    if (url) return new TqRecvOnlyWebsocket(url, this.dm, this.wsOption)
    return null
  }

  /**
   * 获取数据
   * @param {object} payload
   * @param {object} payload.name
   * @param {object} [payload.bid] 当 name in ['user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade']
   * @param {object} [payload.user_id] 当 name in ['user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade']
   * @param {object} [payload.currency] 当 name='account'
   * @param {object} [payload.symbol] 当 name in ['position', 'quote', 'ticks', 'klines']
   * @param {object} [payload.order_id] 当 name='order'
   * @param {object} [payload.trade_id] 当 name='trade'
   * @param {object} [payload.trading_day] 当 name='his_settlement'
   * @param {object} [payload.chart_id] 当 name='chart'
   * @param {object} [payload.input] 当 name='quotes'
   * @param {object} [payload.duration] 当 name='klines'
   * @returns {object|null}
   */
  get ({
    // 交易 ['users', 'user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade']
    // 结算单 ['his_settlements', 'his_settlement'] @20190618新增
    // 行情 ['quotes', 'quote', 'ticks', 'klines', 'charts', 'chart']
    name = 'users',
    bid = '',
    user_id = '', // 以下 name 有效 ['user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade']
    currency = 'CNY', // 以下 name 有效 ['account']
    symbol = '', // 以下 name 有效 ['position'] ['quote', 'ticks', 'klines']
    order_id = '', // 以下 name 有效 ['order']
    trade_id = '', // 以下 name 有效 ['trade']
    trading_day = '', // 以下 name 有效 ['his_settlement']
    chart_id = '', // 以下 name 有效 ['chart']
    input = '', // 以下 name 有效 ['quotes']
    duration = 0 // 以下 name 有效 ['klines']
  } = {}) {
    if (name === 'users') {
      return Object.keys(this.trade_accounts)
    }
    if (user_id) {
      // get 交易相关数据
      let user = this._getAccountInfoByPaths({ bid, user_id }, [])
      if (user === null) {
        user = this.dm.getByPath('trade', user_id)
      }
      if (name === 'user') {
        return user
      }
      if (['session', 'accounts', 'positions', 'orders', 'trades', 'his_settlements'].indexOf(name) > -1) {
        return user && user[name] ? user[name] : null
      } else if (user && user[name + 's']) {
        const k = name === 'account' ? currency : name === 'position' ? symbol : name === 'order' ? order_id : name === 'trade' ? trade_id : name === 'his_settlement' ? trading_day : ''
        return user[name + 's'][k]
      }
      return null
    } else {
      // get 行情相关数据
      if (name === 'quotes') {
        return input ? this.get_quotes_by_input(input) : []
      }
      if (name === 'quote') return this.getQuote(symbol)
      if (name === 'klines') return this.getKlines(symbol, duration)
      if (name === 'ticks') return this.getTicks(symbol)
      if (name === 'charts') return this.dm.getByPath(['charts'])
      if (name === 'chart') return this.dm.getByPath(['charts', chart_id])
    }
  }

  /**
   * 获取数据对象
   * @param {list} pathArray
   * @param {object} dm 获取对象数据源，默认为当前实例的 datamanager
   * @returns {object|null}
   *
   * @example
   * // 获取某个合约下市时间
   * // 推荐使用这种方式，先获取 quote 对象的引用
   * let quote = tqdsk.getQuote('SHFE.au2006')
   * let dt = quote.expire_datetime
   *
   * // 以上代码等价于
   * let dt = tqsdk.getByPath(['quotes', 'SHFE.au2006', 'expire_datetime'])
   */
  getByPath (pathArray, dm = this.dm) {
    return dm.getByPath(pathArray)
  }

  /**
   * 根据输入字符串查询合约列表
   * @param {string} input
   * @param {string} filterOption 查询合约列表条件限制
   * @param {boolean} filterOption.symbol=true 是否根据合约ID匹配
   * @param {boolean} filterOption.pinyin=true 是否根据拼音匹配
   * @param {boolean} filterOption.include_expired=false 匹配结果是否包含已下市合约
   * @param {boolean} filterOption.future=true 匹配结果是否包含期货合约
   * @param {boolean} filterOption.future_index=false 匹配结果是否包含期货指数
   * @param {boolean} filterOption.future_cont=false 匹配结果是否包含期货主连
   * @param {boolean} filterOption.option=false 匹配结果是否包含期权
   * @param {boolean} filterOption.combine=false 匹配结果是否包含组合
   * @returns {list} [symbol, ...]
   *
   * @example
   * const tqsdk = new TQSDK()
   * const quote = tqsdk.getQuote('SHFE.au2006')
   * tqsdk.on('ready', function () {
   *   console.log(tqsdk.getQuotesByInput('huangjin'))
   *   console.log(tqsdk.getQuotesByInput('doupo', { future_index: true, future_cont: true }))
   * })
   */
  getQuotesByInput (input, filterOption = {}) {
    if (typeof input !== 'string') return []
    const option = {
      input: input.toLowerCase(),
      symbol: typeof filterOption.symbol === 'boolean' ? filterOption.symbol : true, // 是否根据合约ID匹配
      pinyin: typeof filterOption.pinyin === 'boolean' ? filterOption.pinyin : true, // 是否根据拼音匹配
      include_expired: typeof filterOption.include_expired === 'boolean' ? filterOption.include_expired : false, // 匹配结果是否包含已下市合约
      FUTURE: typeof filterOption.future === 'boolean' ? filterOption.future : true, // 匹配结果是否包含期货合约
      FUTURE_INDEX: typeof filterOption.future_index === 'boolean' ? filterOption.future_index : false, // 匹配结果是否包含期货指数
      FUTURE_CONT: typeof filterOption.future_cont === 'boolean' ? filterOption.future_cont : false, // 匹配结果是否包含期货主连
      OPTION: typeof filterOption.option === 'boolean' ? filterOption.option : false, // 匹配结果是否包含期权
      COMBINE: typeof filterOption.combine === 'boolean' ? filterOption.combine : false // 匹配结果是否包含组合
    }
    const result = []
    for (const symbol in this.quotesInfo) {
      if (this._filterSymbol(option, this.quotesInfo[symbol])) {
        result.push(symbol)
      }
    }
    return result
  }

  /**
   * @private
   * @param {object} filterOption 筛选条件
   * @param {object} quote 合约对象
   * @returns {list}
   */
  _filterSymbol (filterOption, quote) {
    if (filterOption[quote.class] && (filterOption.include_expired || (!filterOption.include_expired && !quote.expired))) {
      if (filterOption.symbol) {
        if (quote.underlying_product) {
          const [ex_id, product_id] = quote.underlying_product.toLowerCase().split('.')
          if (ex_id === filterOption.input || product_id === filterOption.input) {
            return true
          }
        } else if (quote.product_id && quote.product_id.toLowerCase() === filterOption.input) {
          return true
        } else if (filterOption.input.length > 2 && quote.instrument_id.toLowerCase().indexOf(filterOption.input) > -1) {
          return true
        }
      }
      if (filterOption.pinyin) {
        const pyArray = quote.py.split(',')
        for (const py of pyArray) {
          if (py.indexOf(filterOption.input) > -1) return true
        }
      }
    }
    return false
  }

  /**
   * 根据合约代码获取合约对象
   * @param {string} symbol 合约代码
   * @returns {object}
   *
   * @example
   * const tqsdk = new TQSDK()
   * const quote = tqsdk.getQuote('SHFE.au2006')
   * tqsdk.on('rtn_data', function () {
   *   console.log(quote.last_price, quote.pre_settlement)
   * })
   */
  getQuote (symbol) {
    if (symbol === '') return {}
    if (!this.quotesInfo[symbol]) return {}
    const symbolObj = this.dm.setDefault(['quotes', symbol], new Quote())
    if (!symbolObj.class) {
      // quotesInfo 中的 last_price
      // eslint-disable-next-line camelcase
      const last_price = symbolObj.last_price ? symbolObj.last_price : this.quotesInfo[symbol].last_price
      Object.assign(symbolObj, this.quotesInfo[symbol], { last_price })
    }
    this.subscribeQuotesSet.add(symbol)
    this.subscribeQuote()
    return symbolObj
  }

  /**
   * 请求 K 线图表
   * @param {object} payload
   * @param {string} payload.chart_id 图表 id
   * @param {string} payload.symbol 合约代码
   * @param {number} payload.duration 图表周期，0 表示 tick, 1e9 表示 1s, UnixNano 时间
   * @param {number} payload.view_width 图表柱子宽度
   * @param {number} payload.left_kline_id 指定一个K线id，向右请求view_width个数据
   * @param {number} payload.trading_day_start 指定交易日，返回对应的数据
   * @param {number} payload.trading_day_count 请求交易日天数
   * @param {number} payload.focus_datetime 使得指定日期的K线位于屏幕第M个柱子的位置
   * @param {number} payload.focus_position 使得指定日期的K线位于屏幕第M个柱子的位置
   * @returns {object} chart
   *
   * @example
   * let tqsdk = new TQSDK()
   * let chart = tqsdk.setChart({symbol: 'SHFE.au2006', duration: 60 * 1e9, view_width: 100})
   * tqsdk.on('rtn_data', function(){
   *   console.log('chart.right_id', chart && chart.right_id)
   * })
   */
  setChart (payload) {
    const content = {}
    if (payload.trading_day_start || payload.trading_day_count) {
      // 指定交易日，返回对应的数据
      content.trading_day_start = payload.trading_day_start ? payload.trading_day_start : 0
      // trading_day_count 请求交易日天数
      content.trading_day_count = payload.trading_day_count ? payload.trading_day_count : 3600 * 24 * 1e9
    } else {
      content.view_width = payload.view_width ? payload.view_width : 500
      if (payload.left_kline_id) {
        // 指定一个K线id，向右请求N个数据
        content.left_kline_id = payload.left_kline_id
      } else if (payload.focus_datetime) {
        // 使得指定日期的K线位于屏幕第M个柱子的位置
        content.focus_datetime = payload.focus_datetime // 日线及以上周期是交易日，其他周期是时间，UnixNano 北京时间
        content.focus_position = payload.focus_position ? payload.focus_position : 0
      }
    }
    const sendChart = Object.assign({
      aid: 'set_chart',
      chart_id: payload.chart_id ? payload.chart_id : (this._prefix + 'kline_chart'),
      ins_list: payload.ins_list ? payload.ins_list.join(',') : payload.symbol,
      duration: payload.duration
    }, content)
    this.quotesWs.send(sendChart)
    return this.dm.setDefault(['charts', sendChart.chart_id], new Chart(sendChart))
  }

  /**
   * 获取 chart 对象
   * @param {string} chart_id
   * @returns {object} {}
   */
  getChart (chart_id) {
    if (chart_id === '') return null
    return this.dm.getByPath(['charts', chart_id])
  }

  /**
   * 获取 K 线序列
   * @param {string} symbol
   * @param {number} dur
   * @returns {object} {data, last_id}
   */
  getKlines (symbol, dur) {
    if (symbol === '') return null
    let ks = this.dm.getByPath(['klines', symbol, dur])
    if (!ks || !ks.data || ks.last_id === -1) {
      this.dm.mergeData({
        klines: {
          [symbol]: {
            [dur]: {
              trading_day_end_id: -1,
              trading_day_start_id: -1,
              last_id: -1,
              data: {}
            }
          }
        }
      }, false, false)
      ks = this.dm.getByPath(['klines', symbol, dur])
    }
    return ks
  }

  /**
   * 获取 Ticks 序列
   * @param {string} symbol
   * @returns {object} {data, last_id}
   */
  getTicks (symbol) {
    if (symbol === '') return null
    const ts = this.dm.getByPath(['ticks', symbol])
    if (!ts || !ts.data) {
      this.dm.mergeData({
        ticks: {
          [symbol]: {
            last_id: -1, data: {}
          }
        }
      }, false, false)
    }
    return this.dm.getByPath(['ticks', symbol])
  }

  /**
   * 判断某个对象是否最近一次有变动
   * @param {object|list} target|pathArray 检查变动的对象或者路径数组
   * @returns {boolean}
   *
   * @example
   * let tqsdk = new TQSDK()
   * let quote = tqsdk.getQuote('DCE.m2006')
   * let quote1 = tqsdk.getQuote('DCE.cs2006')
   * tqsdk.on('rtn_data', function(){
   *   if (tqsdk.isChanging(quote)) {
   *     console.log('DCE.m2006 updated', quote.datetime, quote.last_price, quote.volume)
   *   }
   *   if (tqsdk.isChanging(['quotes', 'DCE.cs2006'])) {
   *     console.log('DCE.cs2006 updated', quote1.datetime, quote1.last_price, quote1.volume)
   *   }
   * })
   */
  isChanging (target) {
    if (target && target._epoch && target._root && target._root._epoch) return target._epoch === target._root._epoch
    if (Array.isArray(target)) return this.dm.isChanging(target)
    return false
  }

  /**
   * 订阅合约, 手动订阅合约
   * @param {list|string} quotes=[]
   *
   * @example
   * let tqsdk = new TQSDK()
   * tqsdk.subscribeQuote('SHFE.au2006')
   * tqsdk.subscribeQuote(['SHFE.au2006', 'DCE.m2008'])
   */
  subscribeQuote (quotes = []) {
    const beginSize = this.subscribeQuotesSet.size
    // 所有持仓合约
    for (const k in this.trade_accounts) {
      const pos = this.getPositions(this.trade_accounts[k])
      if (pos) {
        for (const symbol in pos) {
          this.subscribeQuotesSet.add(symbol)
        }
      }
    }
    quotes = typeof quotes === 'string' ? quotes.split(',') : quotes
    for (const s of quotes) {
      this.subscribeQuotesSet.add(s) // this.subscribeQuotesSet 记录 subscribeQuote 过的合约
    }
    // this.subscribeQuotesSet 只增不减，所以只要判断 size 是否相等
    if (beginSize === this.subscribeQuotesSet.size) return
    this.quotesWs.send({
      aid: 'subscribe_quote',
      ins_list: [].concat(...this.subscribeQuotesSet).join(',')
    })
  }

  /// /////////// 交易 /////////// ///

  /**
   * 添加期货账户
   * @param {object} payload
   * @param {string} payload.bid 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.password 密码
   * @returns {object} account {bid, user_id, password, ws, dm}
   *
   * @example
   * const tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
   *   tqsdk.login(account) // 发送登录期货账户的请求
   * })
   * tqsdk.on('rtn_data', function(){
   *   console.log(tqsdk.isLogined(account))
   * })
   */
  addAccount (payload) {
    // bid,user_id 作为 key
    if (!this.brokers) {
      console.error('交易信息未初始化')
      return
    }
    if (payload.bid && payload.user_id && payload.password) {
      if (this.brokers.indexOf(payload.bid) === -1) {
        console.error('不支持该期货公司')
        return null
      }
      const key = this._getAccountKey(payload)
      if (key && !this.trade_accounts[key]) {
        // 每个交易连接使用一个新的 DataManager
        const dm = new DataManager({
          trade: {
            [payload.user_id]: {
              accounts: {
                CNY: {}
              },
              trades: {},
              positions: {},
              orders: {},
              his_settlements: {}
            }
          }
        })
        const urls = [
          this.brokers_list[payload.bid].url + '?access_token=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJobi1MZ3ZwbWlFTTJHZHAtRmlScjV5MUF5MnZrQmpLSFFyQVlnQ0UwR1JjIn0.eyJqdGkiOiJkYzEzMzBkYS1lMWZkLTQzYTItOWU3Ny1hNWE5M2U3NWY2YzEiLCJleHAiOjE2MTI0MDMwNDgsIm5iZiI6MCwiaWF0IjoxNTgwODY3MDQ4LCJpc3MiOiJodHRwczovL2F1dGguc2hpbm55dGVjaC5jb20vYXV0aC9yZWFsbXMvc2hpbm55dGVjaCIsInN1YiI6IjRiYjJhMGRjLTI2ZDEtNDNmNS05ZDY3LTk5ZGM1ZGRhOGNmZSIsInR5cCI6IkJlYXJlciIsImF6cCI6InNoaW5ueV93ZWIiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI2Y2Y4NzZhZS1jOGQ0LTRlMWEtYjFlNS00Mjk5NTI2ZTZhYjkiLCJhY3IiOiIxIiwic2NvcGUiOiJhdHRyaWJ1dGVzIiwiZ3JhbnRzIjp7ImZlYXR1cmVzIjpbIiJdLCJhY2NvdW50cyI6WyIqIl19fQ.Doy459Bacf4RzJDU5g_wxaKa9S736AHx8DSoBI3qOKnNuq8exCDqCgk6fxhwlfnzm_dJhMGi-VS8SquqrT3U00wB_ODJ0GN7HqVUdiXxKLKNwL7d3vqPHKqtEq0srVYDMZ6wGWQj8v7jjv0omeqt9Y1OZvjNC9pOo_Jb44umYcfGXQMdPbUtN1IxL_YosVdiTblHaDymaFrx7qiJWDT0pXBacysA2_rhG1mBlRkd0GYmiu07giXhNW_ZCyvXne5t1bMDC53mxByzqKXILNUvp4c3j0FkoVVdUyLkac4wZMREzZmchWfy5OpH9PvCfpnc-CS-ZPDB_XAQVAXkuf2TeQ',
          this.brokers_list[payload.bid].url
        ]
        const ws = new TqTradeWebsocket(urls, dm, this.wsOption)
        const self = this
        dm.on('data', function () {
          self.emit('rtn_data', null)
        })
        ws.on('notify', function (n) {
          /**
           * @event TQSDK#notify
           * @type {object} 交易通知
           * @property {bid}
           * @property {user_id}
           * @property {code}
           * @property {level}
           * @property {type}
           * @property {content}
           */
          self.emit('notify', Object.assign(n, {
            bid: payload.bid,
            user_id: payload.user_id
          }))
        })
        this.trade_accounts[key] = {
          bid: payload.bid,
          user_id: payload.user_id,
          password: payload.password,
          ws,
          dm
        }
      }
      return this.trade_accounts[key]
    } else {
      return null
    }
  }

  /**
   * 删除期货账户
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   */
  removeAccount (payload) {
    const key = this._getAccountKey(payload)
    if (this.trade_accounts[key]) {
      this.trade_accounts[key].ws.close() // close 相应的 websocket
      delete this.trade_accounts[key]
    }
  }

  /**
   * 登录期货账户
   * @param {object} payload
   * @param {string} payload.bid 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.password 密码
   *
   * @example
   * const tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.login(account) // 发送登录期货账户的请求
   * })
   * tqsdk.on('rtn_data', function(){
   *   console.log(tqsdk.isLogined(account))
   * })
   */
  login (payload) {
    let account = this._getAccountRef(payload)
    if (IsEmptyObject(account)) {
      account = this.addAccount(payload)
    }
    const loginContent = { aid: 'req_login' }
    if (this.clientAppId) {
      loginContent.client_app_id = this.clientAppId
      loginContent.client_system_info = this.clientSystemInfo
    }
    if (account && account.ws) {
      loginContent.bid = payload.bid
      loginContent.user_name = payload.user_id
      loginContent.password = payload.password || account.password
      account.ws.send(loginContent)
    }
  }

  /**
   * 判断账户是否登录 [x]
   * @param {object} payload
   * @param {string} [payload.bid]
   * @param {string} payload.user_id
   * @returns {boolean}
   */
  isLogined (payload) {
    const account = this._getAccountRef(payload)
    if (account && account.dm) {
      const session = account.dm.getByPath(['trade', payload.user_id, 'session'])
      const trade_more_data = account.dm.getByPath(['trade', account.user_id, 'trade_more_data'])
      if (session && session.trading_day && trade_more_data === false) {
        return true
      }
    }
    return false
  }

  /**
   * 刷新账户信息，用于账户资金没有同步正确
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   */
  refreshAccount (payload) {
    const account = this._getAccountRef(payload)
    if (account && account.ws) {
      account.ws.send({ aid: 'qry_account_info' })
      account.ws.send({ aid: 'qry_account_register' })
    }
  }

  /**
   * 刷新全部账户信息，用于账户资金没有同步正确
   */
  refreshAccounts () {
    for (const key in this.trade_accounts) {
      this.trade_accounts[key].ws.send({ aid: 'qry_account_info' })
      this.trade_accounts[key].ws.send({ aid: 'qry_account_register' })
    }
  }

  /**
   * 获取全部账户信息
   * @returns {list}
   *
   * @example
   * const tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * const account1 = { bid: '快期模拟', user_id: 'test1234', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.login(account) // 发送登录期货账户的请求
   *   tqsdk.login(account1) // 发送登录期货账户的请求
   *   // ........
   *   const accounts = tqsdk.getAllAccounts()
   *   console.log(accounts)
   * })
   */
  getAllAccounts (payload) {
    const result = []
    Object.values(this.trade_accounts).forEach(function (v) {
      result.push({ bid: v.bid, user_id: v.user_id, password: v.password })
    })
    return result
  }

  /**
   * 获取账户资金信息
   * @param {object} payload
   * @param {string} [payload.bid]
   * @param {string} payload.user_id
   * @returns {object|null}
   *
   * @example
   * const tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
   *   tqsdk.login(account) // 发送登录期货账户的请求
   * })
   * tqsdk.on('rtn_data', function(){
   *   if (tqsdk.isLogined(account)) {
   *     let account = tqsdk.getAccount(account)
   *     console.log(account.balance, account.risk_ratio)
   *   }
   * })
   */
  getAccount (payload) {
    return this._getAccountInfoByPaths(payload, ['accounts', 'CNY'])
  }

  /**
   * 获取期货账户对象唯一 key 值
   * @private
   * @param {object} payload
   * @param {string} [payload.bid]
   * @param {string} payload.user_id
   * @returns {string} payload.bid + ',' + payload.user_id or ''
   */
  _getAccountKey (payload) {
    if (payload && payload.user_id) {
      if (payload.bid) {
        return payload.bid + ',' + payload.user_id
      } else {
        // 如果用户只传了 user_id ，并且 user_id 唯一
        let bid = ''
        for (const key in this.trade_accounts) {
          if (payload.user_id === this.trade_accounts[key].user_id) {
            if (bid) return '' // 已经有过相同的 user_id
            bid = this.trade_accounts[key].bid
          }
        }
        return bid + ',' + payload.user_id
      }
    }
    return ''
  }

  /**
   * 获取期货账户对象
   * @private
   * @param {object} payload
   * @param {string} [payload.bid]
   * @param {string} payload.user_id
   * @returns {object} account = {bid, user_id, password, ws, dm}
   */
  _getAccountRef (payload) {
    const key = this._getAccountKey(payload)
    return this.trade_accounts[key] || {}
  }

  /**
   * 下单
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.exchange_id 交易所
   * @param {string} payload.instrument_id 合约名称
   * @param {string} payload.direction 方向 [`BUY` | `SELL`]
   * @param {string} payload.offset 开平 [`OPEN` | `CLOSE` | `CLOSETODAY`]
   * @param {string} payload.price_type=LIMIT 限价 [`LIMIT` | `ANY`]
   * @param {number} payload.limit_price 价格
   * @param {number} payload.volume 手数
   * @returns {object} order={order_id, status, ...}
   *
   * @example
   * let tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
   *   tqsdk.login(account) // 发送登录期货账户的请求
   * })
   * tqsdk.on('rtn_data', function(){
   *   if (!tqsdk.isLogined(account)) return
   *   let order = tqsdk.insertOrder(Object.assign({
   *       exchange_id: 'SHFE',
   *       instrument_id: 'au2006',
   *       direction: 'BUY',
   *       offset: 'OPEN',
   *       price_type: 'LIMIT',
   *       limit_price: 359.62,
   *       volume: 2
   *   }, account))
   *   console.log(order.orderId, order.status, order.volume_left)
   * })
   */
  insertOrder (payload) {
    if (!this.isLogined(payload)) return null
    const account = this._getAccountRef(payload)
    const orderId = this._prefix + RandomStr(8)
    const _order_common = {
      user_id: payload.user_id,
      order_id: orderId,
      exchange_id: payload.exchange_id,
      instrument_id: payload.instrument_id,
      direction: payload.direction,
      offset: payload.offset,
      price_type: payload.price_type ? payload.price_type : 'LIMIT', // "LIMIT" "ANY"
      limit_price: Number(payload.limit_price),
      volume_condition: 'ANY', // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD' // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)
    }
    const _orderInsert = Object.assign({
      aid: 'insert_order',
      volume: payload.volume
    }, _order_common)
    account.ws.send(_orderInsert) // 发送下单请求
    const _orderInit = Object.assign({
      volume_orign: payload.volume, // 总报单手数
      status: 'ALIVE', // 委托单状态, (ALIVE=有效, FINISHED=已完)
      volume_left: payload.volume // 未成交手数
    }, _order_common)
    account.dm.mergeData({
      trade: {
        [payload.user_id]: {
          orders: {
            [orderId]: _orderInit
          }
        }
      }
    }, false, false)
    return account.dm.getByPath(['trade', payload.user_id, 'orders', orderId])
  }

  /**
   * 下单，但是平仓单会自动先平今再平昨，不需要用户区分 CLOSE | CLOSETODAY
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.exchange_id 交易所
   * @param {string} payload.instrument_id 合约名称
   * @param {string} payload.direction 方向 [`BUY` | `SELL`]
   * @param {string} payload.offset 开平 [`OPEN` | `CLOSE`]
   * @param {string} payload.price_type=LIMIT 限价 [`LIMIT` | `ANY`]
   * @param {number} payload.limit_price 价格
   * @param {number} payload.volume 手数
   * @returns {list} list=[{order_id, status, ...}, ...] 返回委托单数组，可能拆分为多个单
   */
  autoInsertOrder (payload) {
    if (!this.is_logined(payload)) return null
    /* payload : {symbol, exchange_id, ins_id, direction, price_type, limit_price, offset, volume} */
    const initOrder = {
      bid: payload.bid,
      user_id: payload.user_id,
      exchange_id: payload.exchange_id,
      instrument_id: payload.instrument_id,
      direction: payload.direction,
      price_type: payload.price_type ? payload.price_type : 'LIMIT', // "LIMIT" "ANY"
      volume_condition: 'ANY',
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD',
      limit_price: Number(payload.limit_price)
    }
    if ((payload.exchange_id === 'SHFE' || payload.exchange_id === 'INE') && payload.offset === 'CLOSE') {
      const position = this.getPosition({
        bid: payload.bid,
        user_id: payload.user_id,
        symbol: payload.exchange_id + '.' + payload.instrument_id
      })
      // 拆单，先平今再平昨
      let closeTodayVolume = 0
      if (payload.direction === 'BUY' && position.volume_short_today > 0) {
        closeTodayVolume = Math.min(position.volume_short_today, payload.volume)
      } else if (payload.direction === 'SELL' && position.volume_long_today > 0) {
        closeTodayVolume = Math.min(position.volume_long_today, payload.volume)
      }
      const ordersArray = []
      if (closeTodayVolume > 0) {
        const _order1 = this.insert_order(Object.assign({
          offset: 'CLOSETODAY',
          volume: closeTodayVolume
        }, initOrder))
        ordersArray.push(_order1)
      }
      if (payload.volume - closeTodayVolume > 0) {
        const _order2 = this.insert_order(Object.assign({
          offset: 'CLOSE',
          volume: payload.volume - closeTodayVolume
        }, initOrder))
        ordersArray.push(_order2)
      }
      return ordersArray
    } else {
      return [this.insert_order(Object.assign({
        offset: payload.offset,
        volume: payload.volume
      }, initOrder))]
    }
  }

  /**
   * 撤销委托单
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.order_id 委托单 id
   */
  cancelOrder (payload) {
    const account = this._getAccountRef(payload)
    if (account && account.ws) {
      account.ws.send({
        aid: 'cancel_order',
        user_id: payload.user_id,
        order_id: payload.order_id
      })
    }
  }

  /**
   * 获取账户某个合约的持仓信息
   * @param {object} payload
   * @param {string} [payload.bid]
   * @param {string} payload.user_id
   * @param {string} payload.symbol 合约名称
   * @returns {object|null}
   *
   * @example
   * const tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
   *   tqsdk.login(account) // 发送登录期货账户的请求
   * })
   * tqsdk.on('rtn_data', function(){
   *   if (tqsdk.isLogined(account)) {
   *     let pos = tqsdk.getPosition(Object.assign({ symbol: 'SHFE.au2006' }, account))
   *     console.log(pos)
   *   }
   * })
   */
  getPosition (payload) {
    return this._getAccountInfoByPaths(payload, ['positions', payload.symbol])
  }

  /**
   * 获取账户全部持仓信息
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @returns {object|null}
   *
   * @example
   * const tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
   *   tqsdk.login(account) // 发送登录期货账户的请求
   * })
   * tqsdk.on('rtn_data', function(){
   *   if (tqsdk.isLogined(account)) {
   *     let pos = tqsdk.getPositions(account)
   *     console.log(pos)
   *   }
   * })
   */
  getPositions (payload) {
    return this._getAccountInfoByPaths(payload, ['positions'])
  }

  /**
   * 获取账户某个合约的委托单信息
   * @param {object} payload
   * @param {string} [payload.bid]
   * @param {string} payload.user_id
   * @param {string} payload.order_id 委托单 id
   * @returns {object|null}
   */
  getOrder (payload) {
    return this._getAccountInfoByPaths(payload, ['orders', payload.order_id])
  }

  /**
   * 获取账户全部委托单信息
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @returns {object|null}
   */
  getOrders (payload) {
    return this._getAccountInfoByPaths(payload, ['orders'])
  }

  /**
   * 获取账户下某个合约对应的全部委托单信息
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.symbol 合约名称
   * @returns {object|null}
   */
  getOrdersBySymbol (payload) {
    const orders = this._getAccountInfoByPaths(payload, ['orders'])
    const [exchange_id, instrument_id] = payload.symbol.split('.')
    const result = {}
    for (const i in orders) {
      if (orders[i].exchange_id === exchange_id && orders[i].instrument_id === instrument_id) {
        result[i] = orders[i]
      }
    }
    return result
  }

  /**
   * 获取账户某个合约的成交记录
   * @param {object} payload
   * @param {string} [payload.bid]
   * @param {string} payload.user_id
   * @param {string} payload.trade_id 成交记录 id
   * @returns {object|null}
   */
  getTrade (payload) {
    return this._getAccountInfoByPaths(payload, ['trades', payload.trade_id])
  }

  /**
   * 获取账户全部成交记录
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @returns {object|null}
   */
  getTrades (payload) {
    return this._getAccountInfoByPaths(payload, ['trades'])
  }

  /**
   * 获取账户下某个委托单对应的全部成交记录
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.order_id 委托单 id
   * @returns {object|null}
   */
  getTradesByOrder (payload) {
    const trades = this._getAccountInfoByPaths(payload, ['trades'])
    const result = {}
    for (const i in trades) {
      if (trades[i].order_id === payload.order_id) {
        result[i] = trades[i]
      }
    }
    return result
  }

  /**
   * 获取账户下某个合约对应的全部成交记录
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.symbol 合约名称
   * @returns {object|null}
   */
  getTradesBySymbol (payload) {
    const trades = this._getAccountInfoByPaths(payload, ['trades'])
    const [exchange_id, instrument_id] = payload.symbol.split('.')
    const result = {}
    for (const i in trades) {
      if (trades[i].exchange_id === exchange_id && trades[i].instrument_id === instrument_id) {
        result[i] = trades[i]
      }
    }
    return result
  }

  /**
   * 获取账户的历史结算单
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @returns {object|null}
   */
  getHisSettlements (payload) {
    return this._getAccountInfoByPaths(payload, ['his_settlements'])
  }

  /**
   * 获取账户某一日历史结算单
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.trading_day 查询日期
   * @returns {object|null}
   */
  getHisSettlement (payload) {
    return this._getAccountInfoByPaths(payload, ['his_settlements', payload.trading_day])
  }

  /**
   * 获取账户 指定路径下的对象
   * @private
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {list} [pathArray]
   */
  _getAccountInfoByPaths (payload, pathArray = []) {
    const account = this._getAccountRef(payload)
    if (account && account.dm) {
      return account.dm.getByPath(['trade', account.user_id].concat(pathArray))
    }
    return null
  }

  /**
   * 确认结算单， 每个交易日需要确认一次
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   *
   * @example
   * const tqsdk = new TQSDK()
   * const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
   * tqsdk.on('rtn_brokers', function(brokers){
   *   tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
   *   tqsdk.login(account) // 发送登录期货账户的请求
   * })
   * tqsdk.on('rtn_data', function(){
   *   if (tqsdk.isLogined(account)) {
   *     tqsdk.confirmSettlement(account) // 每个交易日都需要在确认结算单后才可以下单
   *     // tqsdk.insertOrder({....})
   *   }
   * })
   *
   */
  confirmSettlement (payload) {
    const account = this._getAccountRef(payload)
    if (account && account.ws && !account._hasConfirmed) {
      account._hasConfirmed = true // 确保只发送一次确认结算单
      account.ws.send({ aid: 'confirm_settlement' })
    }
  }

  /**
   * 银期转账
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.bank_id 银行ID
   * @param {string} payload.bank_password 银行账户密码
   * @param {string} payload.future_account 期货账户
   * @param {string} payload.future_password 期货账户密码
   * @param {string} payload.currency=CNY 币种代码
   * @param {string} payload.amount 转账金额 >0 表示转入期货账户, <0 表示转出期货账户
   */
  transfer (payload) {
    const account = this._getAccountRef(payload)
    if (account && account.ws) {
      account.ws.send({
        aid: 'req_transfer',
        bank_id: payload.bank_id,
        bank_password: payload.bank_password,
        future_account: payload.future_account,
        future_password: payload.future_password,
        currency: payload.currency || 'CNY',
        amount: payload.amount
      })
    }
  }

  /**
   * 查询历史结算单
   * @param {object} payload
   * @param {string} [payload.bid] 期货公司
   * @param {string} payload.user_id 账户名
   * @param {string} payload.trading_day 交易日
   */
  hisSettlement (payload) {
    if (!Tqsdk.store) return null
    // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
    // 缓存策略 1 dm有历史结算单
    const account = this._getAccountRef(payload)
    if (account && account.dm) {
      const content = account.dm.getByPath(['trade', payload.user_id, 'his_settlements', payload.trading_day])
      if (content) return
      // 缓存策略 2 缓存中读取历史结算单
      Tqsdk.store.getContent(payload.user_id, payload.trading_day).then(function (value) {
        if (value === null) {
        // 缓存策略 2.1 未读取到发送请求
          account.ws.send({
            aid: 'qry_settlement_info',
            trading_day: Number(payload.trading_day)
          })
        } else {
          const content = ParseSettlementContent(value)
          // 缓存策略 2.2 读取到存到dm
          account.dm.mergeData({
            trade: {
              [payload.user_id]: {
                his_settlements: {
                  [payload.trading_day]: content
                }
              }
            }
          }, true, false)
        }
      }).catch(function (err) {
        // 当出错时，此处代码运行
        console.error(err)
      })
    }
  }
}
/**
 * @event TQSDK#ready
 * @type {null}
 */
// 保留原先小寫加下划綫接口,新增接口都是駝峰標誌
Tqsdk.prototype.subscribe_quote = Tqsdk.prototype.subscribeQuote
Tqsdk.prototype.his_settlement = Tqsdk.prototype.hisSettlement
Tqsdk.prototype.confirm_settlement = Tqsdk.prototype.confirmSettlement
Tqsdk.prototype.add_account = Tqsdk.prototype.addAccount
Tqsdk.prototype.remove_account = Tqsdk.prototype.removeAccount
Tqsdk.prototype.get_by_path = Tqsdk.prototype.getByPath
Tqsdk.prototype.get_quotes_by_input = Tqsdk.prototype.getQuotesByInput
Tqsdk.prototype.get_quote = Tqsdk.prototype.getQuote
Tqsdk.prototype.set_chart = Tqsdk.prototype.setChart
Tqsdk.prototype.get_user = Tqsdk.prototype.getAccount
Tqsdk.prototype.is_logined = Tqsdk.prototype.isLogined
Tqsdk.prototype.is_changed = Tqsdk.prototype.isChanging
Tqsdk.prototype.insert_order = Tqsdk.prototype.insertOrder
Tqsdk.prototype.auto_insert_order = Tqsdk.prototype.autoInsertOrder
Tqsdk.prototype.cancel_order = Tqsdk.prototype.cancelOrder

export default Tqsdk
