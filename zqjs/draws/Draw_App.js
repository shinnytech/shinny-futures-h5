function draw_app() {
    DM.run(draw_page_quote);
    DM.run(draw_page_position);
    DM.run(draw_page_posdetail);
    DM.run(draw_page_makeorder);
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
        if(rules[i].indexOf(newValue) > -1){
            arr_index = i;
        }
    }
    if(arr_index > -1){
        for (var i = 0; i < rules[arr_index].length; i++) {
            if(arr.indexOf(rules[arr_index][i]) > -1){
                var item_index = arr.indexOf(rules[arr_index][i]);
                arr.splice(item_index, 1);
            }
        }
    }
    arr.push(newValue);
    return arr.join(' ');
}
