import EventEmitter from 'eventemitter3'
import TQSDK from './index'
import { ParseSettlementContent } from './utils'

/**
 * let ws = new TqWebsocket(url, options)
 * PARAMS:
 *   url [string | array]
 *   options [object]
 *       { reconnectInterval, -- 重连时间间隔
 *        reconnectMaxTimes  -- 重连最大次数
 *       }
 *
 * METHODS:
 *   ws.init()
 *   ws.on(eventName, (data) => {......})
 *      eventName =
 *      ['message', -- 收到信息
 *       'open', -- 连接建立
 *       'reconnect', -- 重新开始建立连接
 *       'close', -- 某个连接关闭
 *       'error', -- 某个连接报错
 *       'death' -- 不再重连
 *      ]
 *   ws.send( [obj | string] )
 *   ws.close()
 */
class TqWebsocket extends EventEmitter {
  constructor (url, options = {}) {
    super()
    this.urlList = (url instanceof Array) ? url : [url]

    this.ws = null
    this.queue = []

    // 自动重连开关
    this.reconnect = true
    this.reconnectTask = null
    this.reconnectInterval = options.reconnectInterval ? options.reconnectInterval : 3000
    this.reconnectMaxTimes = options.reconnectMaxTimes ? options.reconnectMaxTimes : 2
    this.WebSocket = options.WebSocket ? options.WebSocket : WebSocket
    this.reconnectTimes = 0
    this.reconnectUrlIndex = 0

    this.STATUS = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    }

    this.__init(false)
  }

  // string or object
  send (obj) {
    const objToJson = JSON.stringify(obj)
    if (this.isReady()) {
      this.ws.send(objToJson)
    } else {
      this.queue.push(objToJson)
    }
  }

  isReady () {
    return this.ws.readyState === this.WebSocket.OPEN
  }

  __init (isReconnection = true) {
    this.ws = new this.WebSocket(this.urlList[this.reconnectUrlIndex])

    if (isReconnection && this.reconnectUrlIndex === this.urlList.length - 1) {
      // urlList 循环尝试重连一轮, times += 1
      this.reconnectTimes += 1
    }

    const _this = this

    this.ws.onmessage = function (message) {
      // eslint-disable-next-line no-eval
      const data = eval('(' + message.data + ')')
      _this.emit('message', data)
      setImmediate(function () {
        _this.ws.send('{"aid":"peek_message"}')
      })
    }

    this.ws.onclose = function (event) {
      console.log('close', event)
      _this.emit('close')
      // 清空 queue
      _this.queue = []
      // 自动重连
      if (_this.reconnect) {
        if (_this.reconnectMaxTimes <= _this.reconnectTimes) {
          clearTimeout(_this.reconnectTask)
          _this.emit('death', {
            msg: '超过重连次数' + _this.reconnectMaxTimes
          })
        } else {
          _this.reconnectTask = setTimeout(function () {
            if (_this.ws.readyState === 3) {
              // 每次重连的时候设置 _this.reconnectUrlIndex
              _this.reconnectUrlIndex = (_this.reconnectUrlIndex + 1) < _this.urlList.length ? _this.reconnectUrlIndex + 1 : 0
              _this.__init(true)
              _this.emit('reconnect', {
                msg: '发起重连第 ' + _this.reconnectTimes + ' 次'
              })
            }
          }, _this.reconnectInterval)
        }
      }
    }

    this.ws.onerror = error => {
      _this.emit('error', error)
      _this.ws.close()
    }

    this.ws.onopen = function () {
      _this.emit('open', {
        msg: '发起重连第 ' + _this.reconnectTimes + ' 次, 成功'
      })
      if (this.reconnectTask) {
        clearTimeout(_this.reconnectTask)
      }
      while (_this.queue.length > 0) {
        if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift())
        else break
      }
    }
  }

  close () {
    this.ws.onclose = () => {}
    this.ws.close()
  }
}

class TqTradeWebsocket extends TqWebsocket {
  constructor (url, dm, options = {}) {
    super(url, options)
    this.dm = dm
    // 记录重连时需要重发的数据
    this.req_login = null
    this.init()
  }

  init () {
    const self = this

    this.on('message', function (payload) {
      if (payload.aid === 'rtn_data') {
        const notifies = self._separateNotifies(payload.data)
        for (let i = 0; i < notifies.length; i++) {
          self.emit('notify', notifies[i])
        }
        self.dm.mergeData(payload.data)
      } else if (payload.aid === 'rtn_brokers') {
        self.emit('rtn_brokers', payload.brokers)
      } else if (payload.aid === 'qry_settlement_info') {
        // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
        const content = ParseSettlementContent(payload.settlement_info)
        // 1 写入 dm
        self.dm.mergeData({
          trade: {
            [payload.user_name]: {
              his_settlements: {
                [payload.trading_day]: content
              }
            }
          }
        })
        // 2 存入缓存
        if (TQSDK.store) TQSDK.store.setContent(payload.user_name, payload.trading_day, payload.settlement_info)
      }
    })

    this.on('reconnect', function () {
      if (self.req_login) self.send(self.req_login)
    })
  }

  _separateNotifies (data) {
    const notifies = []
    for (let i = 0; i < data.length; i++) {
      if (data[i].notify) {
        const notify = data.splice(i--, 1)[0].notify
        for (const k in notify) {
          notifies.push(notify[k])
        }
      }
    }
    return notifies
  }

  send (obj) {
    if (obj.aid === 'req_login') {
      this.req_login = obj
    }
    super.send(obj)
  }
}

class TqQuoteWebsocket extends TqWebsocket {
  constructor (url, dm, options = {}) {
    super(url, options)
    this.dm = dm
    // 记录重连时需要重发的数据
    this.subscribe_quote = null
    this.charts = {}
    this.init()
  }

  init () {
    const self = this

    this.on('message', function (payload) {
      if (payload.aid === 'rtn_data') {
        self.dm.mergeData(payload.data)
      }
    })

    this.on('reconnect', function (e) {
      console.log(e)
      if (self.subscribe_quote) {
        self.send(self.subscribe_quote)
      }
      for (const chartId in self.charts) {
        if (self.charts[chartId].view_width > 0) {
          self.send(self.charts[chartId])
        }
      }
    })
  }

  send (obj) {
    if (obj.aid === 'subscribe_quote') {
      if (this.subscribe_quote === null || JSON.stringify(obj.ins_list) !== JSON.stringify(this.subscribe_quote.ins_list)) {
        this.subscribe_quote = obj
        super.send(obj)
      }
    } else if (obj.aid === 'set_chart') {
      if (obj.view_width === 0) {
        if (this.charts[obj.chart_id]) delete this.charts[obj.chart_id]
      } else {
        this.charts[obj.chart_id] = obj
      }
      super.send(obj)
    }
  }
}

class TqRecvOnlyWebsocket extends TqWebsocket {
  constructor (url, dm, options = {}) {
    super(url, options)
    this.dm = dm
    this.init()
  }

  init () {
    const self = this
    this.on('message', function (payload) {
      if (payload.aid === 'rtn_data') {
        self.dm.mergeData(payload.data)
      }
    })
    this.on('reconnect', function (e) {
      console.log(e)
    })
  }
}

export {
  TqWebsocket,
  TqTradeWebsocket,
  TqQuoteWebsocket,
  TqRecvOnlyWebsocket
}
