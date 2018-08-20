(function () {
    var root_node, current_node;

    function merge_object(target, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                var sourceProperty = source[property];
                if (typeof sourceProperty === 'object' && target.hasOwnProperty(property)) {
                    if (sourceProperty === null) {
                        // typeof null === 'object' 表示不存在
                        target[property] = null;
                        continue;
                    } else if(target[property] == null || target[property] == undefined ){
                        target[property] = sourceProperty;
                    } else {
                        target[property] = merge_object(target[property], sourceProperty);
                    }
                } else {
                    target[property] = sourceProperty;
                }
            }
        }
        return target;
    };

    function iterator_object(key, obj, func) {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                var t = key + SEPERATOR + name;
                func(t, obj);
                var value = obj[name];
                if (typeof value === 'object') {
                    iterator_object(t, value, func)
                }
            }
        }
    }

    function dm_init(entry_func) {
        root_node = {
            invalid: false,
            func: null,
            childs: [],
            relations: [],
        }
        current_node = root_node;
        dm_run(entry_func);
    }

    function check_invalid(path, node) {
        if (node.invalid) {
            return;
        }
        if (node.relations.indexOf(path) != -1) {
            node.invalid = true;
            return;
        }
        for (var i = 0; i < node.childs.length; i++) {
            check_invalid(path, node.childs[i]);
        }
        return;
    }

    function dm_update_data(diff, fn) {
        //将diff中所有数据更新到datas中
        merge_object(DM.datas, diff);
        //将diff中所有数据涉及的node设置invalid标志
        iterator_object("", diff, function (path, obj) {
            check_invalid(path, root_node);
        });
        //重绘app
        dm_try_repaint(root_node);

        if (fn == 'peekMessage') {
            WS.peekMessage();
        }
    }

    function dm_try_repaint(node) {
        if (node.invalid == true) {
            node.invalid = false;
            node.childs = [];
            node.relations = [];
            current_node = node;
            node.func();
            return;
        }
        for (var i = 0; i < node.childs.length; i++) {
            dm_try_repaint(node.childs[i]);
        }
    }

    function dm_run(f) {
        //创建一个node
        var node = {
            name: f.name,
            invalid: false,
            func: f,
            childs: [],
            relations: [],
        }
        var prev_node = current_node;
        //将node加入到current_node的child中
        current_node.childs.push(node);
        //current_node 指向node
        current_node = node;
        //运行此node的func
        node.func();
        //current_node 指向node
        current_node = prev_node;
    }

    function dm_get(path) {
        //将current_node和对应数据 加到 node.relations 中
        current_node.relations.push(SEPERATOR + path);
        //取数据
        var keys = path.split(SEPERATOR);
        var d = DM.datas;
        for (var i = 0; i < keys.length; i++) {
            d = d[keys[i]]
            if (d == undefined)
                return undefined;
        }
        return d;
    }

    function dm_clear_data(key) {
        // 清空数据
        if(key==='trade'){
            delete DM.datas.trade;
        } else {
            var state = DM.datas.state;
            var trade = DM.datas.trade;
            DM.datas = { state: state, trade: trade };
        }
    }

    this.DM = {
        datas: { 'state': {} },
        init: dm_init,
        run: dm_run,
        get_data: dm_get,
        update_data: dm_update_data,
        clear_data: dm_clear_data
    }
}());
