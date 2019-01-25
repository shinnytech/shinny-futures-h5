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

function get_trading_time_str (trading_time) {
    var trading_time_str = '';
    if (trading_time && trading_time.night) {
        var night = trading_time.night[0];
        trading_time_str += night[0].slice(0, 5) + '-';
        var endtime = night[1].slice(0, 5);
        var hm = endtime.split(':');
        var h = hm[0];
        var m = hm[1];
        if (h > 24) {
            endtime = ('' + (h - 24)).padStart(2, '0') + ':' + m;
        }
        trading_time_str += endtime;
        trading_time_str += ',';
    }
    if (trading_time && trading_time.day) {
        var day = trading_time.day;
        for (var i = 0; i < day.length; i++) {
            trading_time_str += day[i][0].slice(0, 5) + '-' + day[i][1].slice(0, 5);
            trading_time_str += i < day.length - 1 ? ',' : '';
        }
    }
    return trading_time_str;
}

/**
 * 格式化日期
 */
function formatDate(int) {
    var d = new Date(int);
    var str = '' + d.getFullYear();
    str += (1 + d.getMonth() + '').padStart(2, '0');
    str += (d.getDate() + '').padStart(2, '0');
    return str;
}
