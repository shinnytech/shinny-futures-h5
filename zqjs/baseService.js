(function () {
    var config = {
        evn: 'test',
        url: 'http://u.shinnytech.com/t/md/symbols/latest.json'
    }

    // regex to instrument_id
    // 有且只有一组 /(1-n个字母)+(1-n个数字)/
    var reg_future = /^(\D+)(\d+)$/;

    var content = {};
    var content_data = null;

    // main_ins_list - 主力合约列表
    // future_list - 期货合约代码
    // map_py_future - 拼音到 inside 对应 map

    function send() {
        WS.send({
            aid: "subscribe_quote",
            ins_list: InstrumentManager.getMainInsList().concat(InstrumentManager.getCustomInsList()).join(',')
        });

    }

    /**
     * initSubContent
     *
     * 读取 content 属性:
     *  --> main_ins_list {Array} 主力合约列表
     *  --> future_list {Array} 期货合约代码
     *  --> map_py_future {Object} 拼音到 inside 对应 map
     *
     * 每个属性只在第一次使用时初始化一次，以后直接读取
     *
     * TODO: 检查错误属性名称
     *
     * @param  {String} sub [属性名称]
     * @return {Object} content[sub] [返回属性值]
     */
    function initSubContent(sub) {
        if (content[sub]) return content[sub];
        switch (sub) {
        case 'map_py_future':
            content.map_py_future = {};
            for (var ins in content.data.future) {
                var py = content.data.future[ins].n.py;
                if (py) {
                    content.map_py_future[py] = ins;
                }
            }
            break;
        default:
            break;
        }
        return content[sub];
    }

    /**
     * isFuture
     * 判断 合约品种 是否存在
     * @param  { String }  ins 合约品种代码
     * @return {Boolean}
     */
    function isFuture(ins) {
        return content.future_list.indexOf(ins) < 0 ? false : true;
    }

    // 非异步读取合约 JSON
    var getJsonDataAsync = function () {
        var result;
        $.ajax({
            type: 'GET',
            url: config.url,
            dataType: 'json',
            async: false,
            success: function (data) {
                result = data;
            }
        });
        content.main_ins_list = [];
        content.future_list = [];
        content.map_product_id_future = {};
        content.map_py_future = {};
        for(var symbol in result){
            var item = result[symbol];
            if (!result[symbol].expired && item.class === 'FUTURE'){
                content.future_list.push(item.instrument_id);
                var product_id = result[symbol].product_id;
                if(!content.map_product_id_future[product_id]) content.map_product_id_future[product_id] = [];
                content.map_product_id_future[product_id].push(symbol);
                var pylist = result[symbol].py.split(',');
                for(var i in pylist){
                    var py = pylist[i];
                    if(!content.map_py_future[py]) content.map_py_future[py] = [];
                    content.map_py_future[py].push(symbol);
                }
            } else if (!result[symbol].expired && item.class === 'FUTURE_CONT'){
                var s = result[symbol].underlying_symbol;
                if(s && result[s]) content.main_ins_list.push(result[s].instrument_id);
            }
        }
        return result;
    }

    /**
     * init
     * localStorage.CustomList = ''
     * 请求 JSON -> content
     */
    var init = function () {
        if (localStorage.getItem('CustomList') === null) {
            localStorage.setItem('CustomList', '');
        }
        content_data = getJsonDataAsync();
    }

    window.InstrumentManager = {
        init: init
    };

    window.InstrumentManager.init();
    window.InstrumentManager.getInstrumentById = getInstrumentById;
    window.InstrumentManager.getInsListByType = getInsListByType;
    window.InstrumentManager.getMainInsList = getMainInsList;
    window.InstrumentManager.getInsSNById = getInsSNById;
    window.InstrumentManager.getInsIdById = getInsIdById;
    window.InstrumentManager.getInsNameById = getInsNameById;
    window.InstrumentManager.getInsListByInput = getInsListByInput;
    window.InstrumentManager.getInsListByPY = getInsListByPY;

    window.InstrumentManager.getCustomInsList = getCustomInsList;
    window.InstrumentManager.addCustomInsList = addCustomInsList;
    window.InstrumentManager.addCustomIns = addCustomIns;
    window.InstrumentManager.delCustomIns = delCustomIns;
    window.InstrumentManager.isCustomIns = isCustomIns;


    /**
     * [getInstrumentById description]
     * @param  {[type]} insid [description]
     * @return {Object}
     * {   simple_name:
     *     volume_multiple: 合约乘数
     *     price_tick: 最小报价单位
     *     price_fixed: 保留小数位数
     *     expire_date: 到期日
     * }
     */
    function getInstrumentById(insid) {
        var insObj = {};
        insObj.exchange_id = content_data[insid].exchange_id;
        insObj.simple_name = content_data[insid].product_short_name;
        insObj.volume_multiple = content_data[insid].volume_multiple;
        insObj.price_tick = content_data[insid].price_tick;
        insObj.price_fixed = content_data[insid].price_decs;
        insObj.expire_date = formatDate(content_data[insid].expire_datetime * 1000);
        return insObj;
    }

    /**
     * 格式化日期
     */
    function formatDate(int){
        var d = new Date(int);
        var str = '' + d.getFullYear();
        str += (1 + d.getMonth() + '').padStart(2, '0');
        str += (d.getDate() + '').padStart(2, '0');
        return str;
    }

    /**
     * 获取小数位数
     * @param  {Number} num [description]
     * @return {Number} 小数位数
     */
    function getFixedNumber(num) {
        var index = 0;
        while (num < 1) {
            index++;
            num *= 10;
        }
        return index;
    }

    /**
     * [getInsListByType description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    function getInsListByType(type) {
        if (type == 'main') {
            return initSubContent('main_ins_list');
        }
    }

    function getMainInsList() {
        return getInsListByType('main');
    }

    /**
     * [getInsSNById description]
     * @param  {[type]} insid [description]
     * @return {[type]}       [description]
     */
    function getInsSNById(insid) {
        return content_data[insid] ? content_data[insid].product_short_name : '';
    }

    function getInsIdById(insid) {
        return content_data[insid] ? content_data[insid].ins_id : '';
    }



    function getInsNameById(insid) {
        return content_data[insid] ? content_data[insid].ins_name : '';
    }

    function getInsListByInput(input) {
        // 优先匹配 合约 Id
        if (input == undefined || input == '') {
            return [];
        } else if(content.map_product_id_future[input]) {
            return content.map_product_id_future[input];
        }
        // 再匹配 拼音
        return getInsListByPY(input);
    }

    function getInsListByPY(input_py) {
        // TODO 数字 字母分开匹配
        for(var py in content.map_py_future){
            if(py.indexOf(input_py) > -1){
                return content.map_py_future[py]
            }
        }
        return [];
    }

    function getCustomInsList() {
        var s = localStorage.getItem('CustomList');
        return s == '' ? [] : s.split(',');
    }

    function setCustomInsList(str) {
        localStorage.setItem('CustomList', str);
        DM.update_data({
            state: {
                custom_ins_list: str
            }
        });
        send();
    }

    function addCustomInsList(insList) {
        var list = getCustomInsList();
        for (var i = 0; i < insList.length; i++) {
            if (list.indexOf(insList[i]) < 0) {
                list.push(insList[i]);
            }
        }
        setCustomInsList(list.join(','));
        return list;
    }

    function addCustomIns(insid) {
        var list = getCustomInsList();
        if (list.indexOf(insid) < 0) {
            list.push(insid);
            setCustomInsList(list.join(','));
        }
        return list;
    }

    function delCustomIns(insid) {
        var list = getCustomInsList();
        var index = list.indexOf(insid);
        if (index > -1) {
            list.splice(index, 1);
            setCustomInsList(list.join(','));
        }
        return list;
    }

    function isCustomIns(insid) {
        return localStorage.getItem('CustomList').indexOf(insid) > -1;
    }
})();


window.siiimpleToast=function(t){function n(e){if(r[e])return r[e].exports;var o=r[e]={i:e,l:!1,exports:{}};return t[e].call(o.exports,o,o.exports,n),o.l=!0,o.exports}var r={};return n.m=t,n.c=r,n.d=function(t,r,e){n.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:e})},n.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(r,"a",r),r},n.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},n.p="./dist",n(n.s=39)}([function(t,n){var r=t.exports={version:"2.5.3"};"number"==typeof __e&&(__e=r)},function(t,n,r){var e=r(24)("wks"),o=r(14),i=r(3).Symbol,u="function"==typeof i;(t.exports=function(t){return e[t]||(e[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=e},function(t,n,r){var e=r(9),o=r(30),i=r(20),u=Object.defineProperty;n.f=r(4)?Object.defineProperty:function(t,n,r){if(e(t),n=i(n,!0),e(r),o)try{return u(t,n,r)}catch(t){}if("get"in r||"set"in r)throw TypeError("Accessors not supported!");return"value"in r&&(t[n]=r.value),t}},function(t,n){var r=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=r)},function(t,n,r){t.exports=!r(7)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a})},function(t,n){var r={}.hasOwnProperty;t.exports=function(t,n){return r.call(t,n)}},function(t,n,r){var e=r(3),o=r(0),i=r(29),u=r(8),c=function(t,n,r){var f,a,s,l=t&c.F,p=t&c.G,v=t&c.S,y=t&c.P,d=t&c.B,h=t&c.W,b=p?o:o[n]||(o[n]={}),m=b.prototype,g=p?e:v?e[n]:(e[n]||{}).prototype;p&&(r=n);for(f in r)(a=!l&&g&&void 0!==g[f])&&f in b||(s=a?g[f]:r[f],b[f]=p&&"function"!=typeof g[f]?r[f]:d&&a?i(s,e):h&&g[f]==s?function(t){var n=function(n,r,e){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(n);case 2:return new t(n,r)}return new t(n,r,e)}return t.apply(this,arguments)};return n.prototype=t.prototype,n}(s):y&&"function"==typeof s?i(Function.call,s):s,y&&((b.virtual||(b.virtual={}))[f]=s,t&c.R&&m&&!m[f]&&u(m,f,s)))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,n){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,n,r){var e=r(2),o=r(11);t.exports=r(4)?function(t,n,r){return e.f(t,n,o(1,r))}:function(t,n,r){return t[n]=r,t}},function(t,n,r){var e=r(10);t.exports=function(t){if(!e(t))throw TypeError(t+" is not an object!");return t}},function(t,n){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,n){t.exports=function(t,n){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:n}}},function(t,n,r){var e=r(34),o=r(25);t.exports=Object.keys||function(t){return e(t,o)}},function(t,n,r){var e=r(35),o=r(18);t.exports=function(t){return e(o(t))}},function(t,n){var r=0,e=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++r+e).toString(36))}},function(t,n,r){var e=r(18);t.exports=function(t){return Object(e(t))}},function(t,n){n.f={}.propertyIsEnumerable},function(t,n){var r=Math.ceil,e=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?e:r)(t)}},function(t,n){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t}},function(t,n){t.exports=!0},function(t,n,r){var e=r(10);t.exports=function(t,n){if(!e(t))return t;var r,o;if(n&&"function"==typeof(r=t.toString)&&!e(o=r.call(t)))return o;if("function"==typeof(r=t.valueOf)&&!e(o=r.call(t)))return o;if(!n&&"function"==typeof(r=t.toString)&&!e(o=r.call(t)))return o;throw TypeError("Can't convert object to primitive value")}},function(t,n){t.exports={}},function(t,n){var r={}.toString;t.exports=function(t){return r.call(t).slice(8,-1)}},function(t,n,r){var e=r(24)("keys"),o=r(14);t.exports=function(t){return e[t]||(e[t]=o(t))}},function(t,n,r){var e=r(3),o=e["__core-js_shared__"]||(e["__core-js_shared__"]={});t.exports=function(t){return o[t]||(o[t]={})}},function(t,n){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,n,r){var e=r(2).f,o=r(5),i=r(1)("toStringTag");t.exports=function(t,n,r){t&&!o(t=r?t:t.prototype,i)&&e(t,i,{configurable:!0,value:n})}},function(t,n){n.f=Object.getOwnPropertySymbols},function(t,n,r){var e=r(3),o=r(0),i=r(19),u=r(37),c=r(2).f;t.exports=function(t){var n=o.Symbol||(o.Symbol=i?{}:e.Symbol||{});"_"==t.charAt(0)||t in n||c(n,t,{value:u.f(t)})}},function(t,n,r){var e=r(46);t.exports=function(t,n,r){if(e(t),void 0===n)return t;switch(r){case 1:return function(r){return t.call(n,r)};case 2:return function(r,e){return t.call(n,r,e)};case 3:return function(r,e,o){return t.call(n,r,e,o)}}return function(){return t.apply(n,arguments)}}},function(t,n,r){t.exports=!r(4)&&!r(7)(function(){return 7!=Object.defineProperty(r(31)("div"),"a",{get:function(){return 7}}).a})},function(t,n,r){var e=r(10),o=r(3).document,i=e(o)&&e(o.createElement);t.exports=function(t){return i?o.createElement(t):{}}},function(t,n,r){t.exports=r(8)},function(t,n,r){var e=r(9),o=r(48),i=r(25),u=r(23)("IE_PROTO"),c=function(){},f=function(){var t,n=r(31)("iframe"),e=i.length;for(n.style.display="none",r(51).appendChild(n),n.src="javascript:",t=n.contentWindow.document,t.open(),t.write("<script>document.F=Object<\/script>"),t.close(),f=t.F;e--;)delete f.prototype[i[e]];return f()};t.exports=Object.create||function(t,n){var r;return null!==t?(c.prototype=e(t),r=new c,c.prototype=null,r[u]=t):r=f(),void 0===n?r:o(r,n)}},function(t,n,r){var e=r(5),o=r(13),i=r(49)(!1),u=r(23)("IE_PROTO");t.exports=function(t,n){var r,c=o(t),f=0,a=[];for(r in c)r!=u&&e(c,r)&&a.push(r);for(;n.length>f;)e(c,r=n[f++])&&(~i(a,r)||a.push(r));return a}},function(t,n,r){var e=r(22);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==e(t)?t.split(""):Object(t)}},function(t,n,r){var e=r(17),o=Math.min;t.exports=function(t){return t>0?o(e(t),9007199254740991):0}},function(t,n,r){n.f=r(1)},function(t,n,r){var e=r(34),o=r(25).concat("length","prototype");n.f=Object.getOwnPropertyNames||function(t){return e(t,o)}},function(t,n,r){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var e,o=r(41),i=r.n(o),u=r(60),c=r.n(u),f=r(64),a=r.n(f),s=r(69),l=r.n(s),p=r(40),v=r.n(p),y=function(t,n){v()(n).forEach(function(r){t.style[r]=n[r]})},d=function(t,n){v()(n).forEach(function(r){t.setAttribute(r,n[r])})},h=function(t,n){return t.getAttribute(n)},b={defaultOptions:l()("defaultOptions"),render:l()("render"),show:l()("show"),hide:l()("hide"),removeDOM:l()("removeDOM")},m=(e={},c()(e,b.defaultOptions,{container:"body",class:"siiimpleToast",position:"top|center",margin:15,delay:0,duration:3e3,style:{}}),c()(e,"setOptions",function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return a()({},m,c()({},b.defaultOptions,a()({},this[b.defaultOptions],t)))}),c()(e,b.render,function(t,n){var r=this,e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},o=a()({},this[b.defaultOptions],e),i=o.class,u=o.position,c=o.delay,f=o.duration,s=o.style,l=document.createElement("div");l.className=i,l.innerHTML=n,d(l,{"data-position":u,"data-state":t}),y(l,s);var p=0;return setTimeout(function(){r[b.show](l,o)},p+=c),setTimeout(function(){r[b.hide](l,o)},p+=f),this}),c()(e,b.show,function(t,n){var r,e=n.container,o=n.class,u=n.margin,f=function(t,n){return h(t,"data-position").indexOf(n)>-1},a=document.querySelector(e);a.insertBefore(t,a.firstChild),y(t,(r={position:"body"===e?"fixed":"absolute"},c()(r,f(t,"top")?"top":"bottom","-100px"),c()(r,f(t,"left")&&"left","15px"),c()(r,f(t,"center")&&"left",a.clientWidth/2-t.clientWidth/2+"px"),c()(r,f(t,"right")&&"right","15px"),r)),y(t,{transform:"scale(1)",opacity:1});var s=u;i()(document.querySelectorAll("."+o+'[data-position="'+h(t,"data-position")+'"]')).filter(function(n){return n.parentElement===t.parentElement}).forEach(function(t){y(t,c()({},f(t,"top")?"top":"bottom",s+"px")),s+=t.offsetHeight+u})}),c()(e,b.hide,function(t){var n,r=this,e=function(t,n){return h(t,"data-position").indexOf(n)>-1},o=t.getBoundingClientRect(),i=o.left,u=o.width;y(t,(n={},c()(n,e(t,"left")&&"left",u+"px"),c()(n,e(t,"center")&&"left",i+u+"px"),c()(n,e(t,"right")&&"right","-"+u+"px"),c()(n,"opacity",0),n));var f=function n(){r[b.removeDOM](t),t.removeEventListener("transitionend",n)};t.addEventListener("transitionend",f)}),c()(e,b.removeDOM,function(t){t.parentElement.removeChild(t)}),c()(e,"message",function(t,n){return this[b.render]("default",t,n)}),c()(e,"success",function(t,n){return this[b.render]("success",t,n)}),c()(e,"alert",function(t,n){return this[b.render]("alert",t,n)}),e);n.default=m},function(t,n,r){t.exports={default:r(80),__esModule:!0}},function(t,n,r){t.exports={default:r(42),__esModule:!0}},function(t,n,r){r(43),r(53),t.exports=r(0).Array.from},function(t,n,r){"use strict";var e=r(44)(!0);r(45)(String,"String",function(t){this._t=String(t),this._i=0},function(){var t,n=this._t,r=this._i;return r>=n.length?{value:void 0,done:!0}:(t=e(n,r),this._i+=t.length,{value:t,done:!1})})},function(t,n,r){var e=r(17),o=r(18);t.exports=function(t){return function(n,r){var i,u,c=String(o(n)),f=e(r),a=c.length;return f<0||f>=a?t?"":void 0:(i=c.charCodeAt(f),i<55296||i>56319||f+1===a||(u=c.charCodeAt(f+1))<56320||u>57343?t?c.charAt(f):i:t?c.slice(f,f+2):u-56320+(i-55296<<10)+65536)}}},function(t,n,r){"use strict";var e=r(19),o=r(6),i=r(32),u=r(8),c=r(5),f=r(21),a=r(47),s=r(26),l=r(52),p=r(1)("iterator"),v=!([].keys&&"next"in[].keys()),y=function(){return this};t.exports=function(t,n,r,d,h,b,m){a(r,n,d);var g,x,O,w=function(t){if(!v&&t in E)return E[t];switch(t){case"keys":case"values":return function(){return new r(this,t)}}return function(){return new r(this,t)}},j=n+" Iterator",_="values"==h,S=!1,E=t.prototype,P=E[p]||E["@@iterator"]||h&&E[h],M=!v&&P||w(h),A=h?_?w("entries"):M:void 0,F="Array"==n?E.entries||P:P;if(F&&(O=l(F.call(new t)))!==Object.prototype&&O.next&&(s(O,j,!0),e||c(O,p)||u(O,p,y)),_&&P&&"values"!==P.name&&(S=!0,M=function(){return P.call(this)}),e&&!m||!v&&!S&&E[p]||u(E,p,M),f[n]=M,f[j]=y,h)if(g={values:_?M:w("values"),keys:b?M:w("keys"),entries:A},m)for(x in g)x in E||i(E,x,g[x]);else o(o.P+o.F*(v||S),n,g);return g}},function(t,n){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,n,r){"use strict";var e=r(33),o=r(11),i=r(26),u={};r(8)(u,r(1)("iterator"),function(){return this}),t.exports=function(t,n,r){t.prototype=e(u,{next:o(1,r)}),i(t,n+" Iterator")}},function(t,n,r){var e=r(2),o=r(9),i=r(12);t.exports=r(4)?Object.defineProperties:function(t,n){o(t);for(var r,u=i(n),c=u.length,f=0;c>f;)e.f(t,r=u[f++],n[r]);return t}},function(t,n,r){var e=r(13),o=r(36),i=r(50);t.exports=function(t){return function(n,r,u){var c,f=e(n),a=o(f.length),s=i(u,a);if(t&&r!=r){for(;a>s;)if((c=f[s++])!=c)return!0}else for(;a>s;s++)if((t||s in f)&&f[s]===r)return t||s||0;return!t&&-1}}},function(t,n,r){var e=r(17),o=Math.max,i=Math.min;t.exports=function(t,n){return t=e(t),t<0?o(t+n,0):i(t,n)}},function(t,n,r){var e=r(3).document;t.exports=e&&e.documentElement},function(t,n,r){var e=r(5),o=r(15),i=r(23)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),e(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null}},function(t,n,r){"use strict";var e=r(29),o=r(6),i=r(15),u=r(54),c=r(55),f=r(36),a=r(56),s=r(57);o(o.S+o.F*!r(59)(function(t){Array.from(t)}),"Array",{from:function(t){var n,r,o,l,p=i(t),v="function"==typeof this?this:Array,y=arguments.length,d=y>1?arguments[1]:void 0,h=void 0!==d,b=0,m=s(p);if(h&&(d=e(d,y>2?arguments[2]:void 0,2)),void 0==m||v==Array&&c(m))for(n=f(p.length),r=new v(n);n>b;b++)a(r,b,h?d(p[b],b):p[b]);else for(l=m.call(p),r=new v;!(o=l.next()).done;b++)a(r,b,h?u(l,d,[o.value,b],!0):o.value);return r.length=b,r}})},function(t,n,r){var e=r(9);t.exports=function(t,n,r,o){try{return o?n(e(r)[0],r[1]):n(r)}catch(n){var i=t.return;throw void 0!==i&&e(i.call(t)),n}}},function(t,n,r){var e=r(21),o=r(1)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(e.Array===t||i[o]===t)}},function(t,n,r){"use strict";var e=r(2),o=r(11);t.exports=function(t,n,r){n in t?e.f(t,n,o(0,r)):t[n]=r}},function(t,n,r){var e=r(58),o=r(1)("iterator"),i=r(21);t.exports=r(0).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[e(t)]}},function(t,n,r){var e=r(22),o=r(1)("toStringTag"),i="Arguments"==e(function(){return arguments}()),u=function(t,n){try{return t[n]}catch(t){}};t.exports=function(t){var n,r,c;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(r=u(n=Object(t),o))?r:i?e(n):"Object"==(c=e(n))&&"function"==typeof n.callee?"Arguments":c}},function(t,n,r){var e=r(1)("iterator"),o=!1;try{var i=[7][e]();i.return=function(){o=!0},Array.from(i,function(){throw 2})}catch(t){}t.exports=function(t,n){if(!n&&!o)return!1;var r=!1;try{var i=[7],u=i[e]();u.next=function(){return{done:r=!0}},i[e]=function(){return u},t(i)}catch(t){}return r}},function(t,n,r){"use strict";n.__esModule=!0;var e=r(61),o=function(t){return t&&t.__esModule?t:{default:t}}(e);n.default=function(t,n,r){return n in t?(0,o.default)(t,n,{value:r,enumerable:!0,configurable:!0,writable:!0}):t[n]=r,t}},function(t,n,r){t.exports={default:r(62),__esModule:!0}},function(t,n,r){r(63);var e=r(0).Object;t.exports=function(t,n,r){return e.defineProperty(t,n,r)}},function(t,n,r){var e=r(6);e(e.S+e.F*!r(4),"Object",{defineProperty:r(2).f})},function(t,n,r){"use strict";n.__esModule=!0;var e=r(65),o=function(t){return t&&t.__esModule?t:{default:t}}(e);n.default=o.default||function(t){for(var n=1;n<arguments.length;n++){var r=arguments[n];for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(t[e]=r[e])}return t}},function(t,n,r){t.exports={default:r(66),__esModule:!0}},function(t,n,r){r(67),t.exports=r(0).Object.assign},function(t,n,r){var e=r(6);e(e.S+e.F,"Object",{assign:r(68)})},function(t,n,r){"use strict";var e=r(12),o=r(27),i=r(16),u=r(15),c=r(35),f=Object.assign;t.exports=!f||r(7)(function(){var t={},n={},r=Symbol(),e="abcdefghijklmnopqrst";return t[r]=7,e.split("").forEach(function(t){n[t]=t}),7!=f({},t)[r]||Object.keys(f({},n)).join("")!=e})?function(t,n){for(var r=u(t),f=arguments.length,a=1,s=o.f,l=i.f;f>a;)for(var p,v=c(arguments[a++]),y=s?e(v).concat(s(v)):e(v),d=y.length,h=0;d>h;)l.call(v,p=y[h++])&&(r[p]=v[p]);return r}:f},function(t,n,r){t.exports={default:r(70),__esModule:!0}},function(t,n,r){r(71),r(77),r(78),r(79),t.exports=r(0).Symbol},function(t,n,r){"use strict";var e=r(3),o=r(5),i=r(4),u=r(6),c=r(32),f=r(72).KEY,a=r(7),s=r(24),l=r(26),p=r(14),v=r(1),y=r(37),d=r(28),h=r(73),b=r(74),m=r(9),g=r(10),x=r(13),O=r(20),w=r(11),j=r(33),_=r(75),S=r(76),E=r(2),P=r(12),M=S.f,A=E.f,F=_.f,T=e.Symbol,k=e.JSON,N=k&&k.stringify,I=v("_hidden"),C=v("toPrimitive"),D={}.propertyIsEnumerable,W=s("symbol-registry"),R=s("symbols"),B=s("op-symbols"),J=Object.prototype,L="function"==typeof T,q=e.QObject,G=!q||!q.prototype||!q.prototype.findChild,K=i&&a(function(){return 7!=j(A({},"a",{get:function(){return A(this,"a",{value:7}).a}})).a})?function(t,n,r){var e=M(J,n);e&&delete J[n],A(t,n,r),e&&t!==J&&A(J,n,e)}:A,z=function(t){var n=R[t]=j(T.prototype);return n._k=t,n},H=L&&"symbol"==typeof T.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof T},U=function(t,n,r){return t===J&&U(B,n,r),m(t),n=O(n,!0),m(r),o(R,n)?(r.enumerable?(o(t,I)&&t[I][n]&&(t[I][n]=!1),r=j(r,{enumerable:w(0,!1)})):(o(t,I)||A(t,I,w(1,{})),t[I][n]=!0),K(t,n,r)):A(t,n,r)},Y=function(t,n){m(t);for(var r,e=h(n=x(n)),o=0,i=e.length;i>o;)U(t,r=e[o++],n[r]);return t},Q=function(t,n){return void 0===n?j(t):Y(j(t),n)},V=function(t){var n=D.call(this,t=O(t,!0));return!(this===J&&o(R,t)&&!o(B,t))&&(!(n||!o(this,t)||!o(R,t)||o(this,I)&&this[I][t])||n)},X=function(t,n){if(t=x(t),n=O(n,!0),t!==J||!o(R,n)||o(B,n)){var r=M(t,n);return!r||!o(R,n)||o(t,I)&&t[I][n]||(r.enumerable=!0),r}},Z=function(t){for(var n,r=F(x(t)),e=[],i=0;r.length>i;)o(R,n=r[i++])||n==I||n==f||e.push(n);return e},$=function(t){for(var n,r=t===J,e=F(r?B:x(t)),i=[],u=0;e.length>u;)!o(R,n=e[u++])||r&&!o(J,n)||i.push(R[n]);return i};L||(T=function(){if(this instanceof T)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),n=function(r){this===J&&n.call(B,r),o(this,I)&&o(this[I],t)&&(this[I][t]=!1),K(this,t,w(1,r))};return i&&G&&K(J,t,{configurable:!0,set:n}),z(t)},c(T.prototype,"toString",function(){return this._k}),S.f=X,E.f=U,r(38).f=_.f=Z,r(16).f=V,r(27).f=$,i&&!r(19)&&c(J,"propertyIsEnumerable",V,!0),y.f=function(t){return z(v(t))}),u(u.G+u.W+u.F*!L,{Symbol:T});for(var tt="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),nt=0;tt.length>nt;)v(tt[nt++]);for(var rt=P(v.store),et=0;rt.length>et;)d(rt[et++]);u(u.S+u.F*!L,"Symbol",{for:function(t){return o(W,t+="")?W[t]:W[t]=T(t)},keyFor:function(t){if(!H(t))throw TypeError(t+" is not a symbol!");for(var n in W)if(W[n]===t)return n},useSetter:function(){G=!0},useSimple:function(){G=!1}}),u(u.S+u.F*!L,"Object",{create:Q,defineProperty:U,defineProperties:Y,getOwnPropertyDescriptor:X,getOwnPropertyNames:Z,getOwnPropertySymbols:$}),k&&u(u.S+u.F*(!L||a(function(){var t=T();return"[null]"!=N([t])||"{}"!=N({a:t})||"{}"!=N(Object(t))})),"JSON",{stringify:function(t){for(var n,r,e=[t],o=1;arguments.length>o;)e.push(arguments[o++]);if(r=n=e[1],(g(n)||void 0!==t)&&!H(t))return b(n)||(n=function(t,n){if("function"==typeof r&&(n=r.call(this,t,n)),!H(n))return n}),e[1]=n,N.apply(k,e)}}),T.prototype[C]||r(8)(T.prototype,C,T.prototype.valueOf),l(T,"Symbol"),l(Math,"Math",!0),l(e.JSON,"JSON",!0)},function(t,n,r){var e=r(14)("meta"),o=r(10),i=r(5),u=r(2).f,c=0,f=Object.isExtensible||function(){return!0},a=!r(7)(function(){return f(Object.preventExtensions({}))}),s=function(t){u(t,e,{value:{i:"O"+ ++c,w:{}}})},l=function(t,n){if(!o(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,e)){if(!f(t))return"F";if(!n)return"E";s(t)}return t[e].i},p=function(t,n){if(!i(t,e)){if(!f(t))return!0;if(!n)return!1;s(t)}return t[e].w},v=function(t){return a&&y.NEED&&f(t)&&!i(t,e)&&s(t),t},y=t.exports={KEY:e,NEED:!1,fastKey:l,getWeak:p,onFreeze:v}},function(t,n,r){var e=r(12),o=r(27),i=r(16);t.exports=function(t){var n=e(t),r=o.f;if(r)for(var u,c=r(t),f=i.f,a=0;c.length>a;)f.call(t,u=c[a++])&&n.push(u);return n}},function(t,n,r){var e=r(22);t.exports=Array.isArray||function(t){return"Array"==e(t)}},function(t,n,r){var e=r(13),o=r(38).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[],c=function(t){try{return o(t)}catch(t){return u.slice()}};t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?c(t):o(e(t))}},function(t,n,r){var e=r(16),o=r(11),i=r(13),u=r(20),c=r(5),f=r(30),a=Object.getOwnPropertyDescriptor;n.f=r(4)?a:function(t,n){if(t=i(t),n=u(n,!0),f)try{return a(t,n)}catch(t){}if(c(t,n))return o(!e.f.call(t,n),t[n])}},function(t,n){},function(t,n,r){r(28)("asyncIterator")},function(t,n,r){r(28)("observable")},function(t,n,r){r(81),t.exports=r(0).Object.keys},function(t,n,r){var e=r(15),o=r(12);r(82)("keys",function(){return function(t){return o(e(t))}})},function(t,n,r){var e=r(6),o=r(0),i=r(7);t.exports=function(t,n){var r=(o.Object||{})[t]||Object[t],u={};u[t]=n(r),e(e.S+e.F*i(function(){r(1)}),"Object",u)}}]).default;
