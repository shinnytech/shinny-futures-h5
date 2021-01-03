/* eslint-disable camelcase */
class Quote {
  constructor () {
    this.instrument_id = '' // 'SHFE.au1906'
    this.datetime = '' // "2017-07-26 23:04:21.000001" (行情从交易所发出的时间(北京时间))
    this._last_price = '-' // 最新价 NaN
    this.ask_price1 = '-' // 卖一价 NaN
    this.ask_volume1 = '-' // 卖一量 0
    this.bid_price1 = '-' // 买一价 NaN
    this.bid_volume1 = '-' // 买一量 0
    this.highest = '-' // 当日最高价 NaN
    this.lowest = '-' // 当日最低价 NaN
    this.open = '-' // 开盘价 NaN
    this.close = '-' // 收盘价 NaN
    this.average = '-' // 当日均价 NaN
    this.volume = '-' // 成交量 0
    this.amount = '-' // 成交额 NaN
    this.open_interest = '-' // 持仓量 0
    this.lower_limit = '-' // 跌停 NaN
    this.upper_limit = '-' // 涨停 NaN
    this.settlement = '-' // 结算价 NaN
    this.change = '-' // 涨跌
    this.change_percent = '-' // 涨跌幅
    this.strike_price = NaN // 行权价
    this.pre_open_interest = '-' // 昨持仓量
    this.pre_close = '-' // 昨收盘价
    this.pre_volume = '-' // 昨成交量
    this._pre_settlement = '-' // 昨结算价
    this.margin = '-' // 每手保证金
    this.commission = '-' // 每手手续费
    // 合约服务附带参数
    // class: '', // ['FUTURE' 'FUTURE_INDEX' 'FUTURE_CONT']
    // ins_id: '',
    // ins_name: '',
    // exchange_id: '',
    // sort_key: '',
    // expired: false,
    // py: '',
    // product_id: '',
    // product_short_name: '',
    // underlying_product: '',
    // underlying_symbol: '', // 标的合约
    // delivery_year: 0,
    // delivery_month: 0,
    // expire_datetime: 0,
    // trading_time: {},
    // volume_multiple: 0, // 合约乘数
    // price_tick: 0, // 合约价格单位
    // price_decs: 0, // 合约价格小数位数
    // max_market_order_volume: 1000, // 市价单最大下单手数
    // min_market_order_volume: 1, // 市价单最小下单手数
    // max_limit_order_volume: 1000, // 限价单最大下单手数
    // min_limit_order_volume: 1, // 限价单最小下单手数
  }

  set last_price (p) {
    this._last_price = p
    this.setChange()
  }

  get last_price () {
    return this._last_price
  }

  set pre_settlement (p) {
    this._pre_settlement = p
    this.setChange()
  }

  get pre_settlement () {
    return this._pre_settlement
  }

  setChange () {
    if (Number.isFinite(this._last_price) && Number.isFinite(this._pre_settlement) && this._pre_settlement !== 0) {
      this.change = this._last_price - this._pre_settlement
      this.change_percent = this.change / this._pre_settlement * 100
    }
  }
}

class Kline {
  constructor () {
    this.datetime = 0 // 1501080715000000000 (K线起点时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数)
    this.open = NaN // K线起始时刻的最新价
    this.close = NaN // K线结束时刻的最新价
    this.high = NaN // K线时间范围内的最高价
    this.low = NaN // K线时间范围内的最低价
    this.open_oi = 0 // K线起始时刻的持仓量
    this.close_oi = 0 // K线结束时刻的持仓量
    this.volume = 0 // K线时间范围内的成交量
  }
}

class Tick {
  constructor () {
    this.datetime = 0 // 1501074872000000000 (tick从交易所发出的时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数)
    this.last_price = NaN // 最新价
    this.average = NaN // 当日均价
    this.highest = NaN // 当日最高价
    this.lowest = NaN // 当日最低价
    this.ask_price1 = NaN // 卖一价
    this.ask_volume1 = 0 // 卖一量
    this.bid_price1 = NaN // 买一价
    this.bid_volume1 = 0 // 买一量
    this.volume = 0 // 当日成交量
    this.amount = NaN // 成交额
    this.open_interest = NaN // 持仓量
  }
}

class Chart {
  constructor (state = {}) {
    this.left_id = -1
    this.right_id = -1
    this.more_data = true
    this.state = state
  }
}

export { Quote, Kline, Tick, Chart }
