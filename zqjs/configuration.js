var SEPERATOR = '*';

var SETTING = {
    sim_server_url: 'ws://openmd.shinnytech.com/t/md/front/mobile', // 行情接口
    tr_server_url: 'ws://opentd.shinnytech.com/', // 交易接口
};

var CONST = {
    inslist_cols_odd_name: ["最新价", "买价", "卖价", "最高价", "成交量", "昨收盘"],
    inslist_cols_even_name: ["涨跌幅", "买量", "卖量", "最低价", "持仓量", "今开盘"],
    inslist_cols_odd: ['last_price', 'bid_price1', 'ask_price1', 'highest', 'volume', 'pre_close'],
    inslist_cols_even: ['change_percent', 'bid_volume1', 'ask_volume1', 'lowest', 'open_interest', 'open'],

    // 账户持仓
    userinfo_account: ['pre_balance', 'deposit', 'withdraw', 'close_profit', 'commission', 'premium', 'static_balance', 'position_profit', 'balance', 'margin', 'frozen_margin', 'frozen_commission', 'frozen_premium', 'available', 'risk_ratio'],

    // K线颜色 colorname or #FF0000
    chart_color: {
        'background': "#111",
        'down': '#00FFFF',
        'up': 'red',
    },

    // 合约详情
    pos_detail_quote: [
        'margin_per_volume',
        'commission_per_volume',
        'ask_price1',
        'bid_price1',
        'last_price',
        'highest',
        'lowest',
        'lower_limit',
        'upper_limit'
    ],
    pos_detail_quote_tools: [
        'ask_price1',
        'bid_price1',
        'last_price',
        'ask_volume1',
        'bid_volume1',
        'volume',
    ],
};
