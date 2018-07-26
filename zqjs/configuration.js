var DOMAIN = "mdapi.shinnytech.com";

var SETTING = {
    server_base_url: 'http://' + DOMAIN,
    sim_server_url: 'ws://mdapi.shinnytech.com/t/md/front/mobile',
    // sim_server_url: 'ws://u.shinnytech.com/t/md/front/mobile',
    act_server_url: 'ws://mdapi.shinnytech.com/t/md/front/mobile',
};

var CONST = {

    inslist_cols_odd_name: ["最新价", "买价", "卖价", "最高价", "成交量", "昨收盘"],
    inslist_cols_even_name: ["涨跌幅", "买量", "卖量", "最低价", "持仓量", "今开盘"],
    inslist_cols_odd: ['last_price', 'bid_price1', 'ask_price1', 'highest', 'volume', 'pre_close'],
    inslist_cols_even: ['change_percent', 'bid_volume1', 'ask_volume1', 'lowest', 'open_interest', 'open'],


    // 账户持仓d
    positions_account: ['static_balance', 'balance', 'using', 'available', 'risk_ratio', 'position_volume', 'float_profit', 'status'],
    positions_attrs: ['direction', 'volume', 'float_profit', 'float_profit_percent', 'open_price', 'margin'],
    positions_order_attrs: ['direction', 'volume_left', 'price', 'order_datetime', 'frozen_margin'],

    // 持仓详情
    pos_detail: ['float_profit', 'volume', 'direction'],
    pos_detail_quote: [
        'status',
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
    pos_orders_attrs: [
        { id: 'order_code', name: '挂单代码' }, // session_id + '!' + order_id
        { id: 'order_id', name: '挂单代码' },
        { id: 'session_id', name: '挂单代码' },
        { id: 'direction', name: '方向', enum: ['SELL', 'BUY'] },
        { id: 'offset', name: '操作', enum: ['OPEN', 'CLOSE', 'CLOSETODAY'] }, // 开仓 平仓
        { id: 'price_type', name: '价格类型', enum: ['MARKET', 'LIMIT'] },
        { id: 'price', name: '价格' },
        { id: 'volume_left', name: '未成交手数' }
    ],
    pos_others: [
        { id: 'position_id', name: '持仓代码' },
        { id: 'direction', name: '方向', enum: ['SELL', 'BUY'] },
        { id: 'float_profit', name: '盈亏' },
        { id: 'volume', name: '手数' }
    ]
};
