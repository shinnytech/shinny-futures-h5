function draw_app() {
    DM.run(draw_page_quote);
    DM.run(draw_page_userinfo);
    DM.run(draw_page_posdetail);
}

function addClassName(className, newValue) {
    // 仅限于 R G
    var rules = [
        ['R', 'G'],
        ['BUY', 'SELL', 'NEW']
    ];
    var arr = className.split(' ');
    var arr_index = -1; // 要修改的数组 index

    for (var i = 0; i < rules.length; i++) {
        if (rules[i].indexOf(newValue) > -1) {
            arr_index = i;
        }
    }
    if (arr_index > -1) {
        for (var i = 0; i < rules[arr_index].length; i++) {
            if (arr.indexOf(rules[arr_index][i]) > -1) {
                var item_index = arr.indexOf(rules[arr_index][i]);
                arr.splice(item_index, 1);
            }
        }
    }
    arr.push(newValue);
    return arr.join(' ');
}

function draw_page_userinfo() {
    if (DM.get_data("state"+SEPERATOR+"page") == "userinfo" && DM.get_data("account_id")) {
        var accounts = DM.get_data("trade" + SEPERATOR + DM.datas.account_id + SEPERATOR + "accounts");
        var container = document.querySelector('.userinfo .account_info');
        if(container && accounts && accounts.CNY) {
            var account = accounts.CNY;
            for (var i = 0; i < CONST.userinfo_account.length; i++) {
                var dom = container.querySelector('.' + CONST.userinfo_account[i]);
                var val = account[CONST.userinfo_account[i]];
                if(typeof val === 'number' && !Number.isInteger(val) && !Number.isNaN(val)){
                    val = val.toFixed(2);
                }
                dom.innerText = val;
            }
            // trading_day
            var dom = container.querySelector('.trading_day');
            var trading_day = DM.get_data("trade" + SEPERATOR + DM.datas.account_id + SEPERATOR + "session"+ SEPERATOR + "trading_day");
            dom.innerText = trading_day;
        }
    }
}
