var ONLYCHARTSET = null;
var CHARTSET_K = null;
var CHARTSET_DAY = null;

var CHARTSET_CONF = {
    timeline_height: 20,
    marginLeft: 5,
    marginRight: 40
}

/**
 * chartset config 说明
 * create {
 *      id: 'chartset_k', // 'chartset_day'
 *      ins_id: '',
 *      draggable: false,
 *      interval: 300000000000,
 *
 *      start_id: 0,
 *      end_id: 0,
 *      left_id: 0,
 *      right_id: 0,
 *
 *      charts: [
 *          {
 *              height_proportion: 0.6,
 *              showMostValue: true,
 *              showPanels: flase,
 *              panels: [],
 *              margin: {
 *                  top: 5,
 *                  bottom: 0
 *              },
 *              right: {
 *                  priceTick: 0.05,
 *                  fixed: 2,
 *              },
 *              list: [{
 *                  name: 'kline',
 *                  type: CHART_TYPE.kChart,
 *                  depends: 'right'
 *              },{
 *                  name: 'line_weighting_average',
 *                  type: CHART_TYPE.lineChart,
 *                  field: 'weighting_average',
 *                  color: 'yellow',
 *                  depends: 'right',
 *              },{
 *                  name: 'bar_volume',
 *                  type: CHART_TYPE.barChart,
 *                  field: 'volume',
 *                  depends: 'left',
 *              },]
 *          },
 *
 *          {
 *              height_proportion: 0.4,
 *              margin: {
 *                  top: 5,
 *                  bottom: 0
 *              },
 *              right: {
 *                  priceTick: 10,
 *                  fixed: 0,
 *              },
 *              list: [{
 *                  name: 'line_close_oi',
 *                  type: CHART_TYPE.lineChart,
 *                  field: 'close_oi',
 *                  color: 'yellow',
 *                  depends: 'right',
 *              },{
 *                  name: 'bar_volume',
 *                  type: CHART_TYPE.barChart,
 *                  field: 'volume',
 *                  depends: 'right',
 *              }]
 *          },
 *      ]
 *
 * }
 */

var ChartSet = function(containerParent, width, height, config) {
    this.id = config.id;
    this.ins_id = config.ins_id;
    this.draggable = config.draggable; // 是否能够左右拖拽
    this.interval = config.interval;

    this.start_id = config.start_id; // 全部数据第一个 id
    this.end_id = config.end_id; // 全部数据最后一个 id;

    this.left_id = config.left_id; // 显示部分的最左 id
    this.right_id = config.right_id; // 显示部分的最右 id

    this.show_left_id = 0;
    this.show_right_id = 0;

    // chartset container
    this.containerParent = containerParent;
    this.container = null;

    // width height 单位 px
    this.width = width;
    this.height = height - CHARTSET_CONF['timeline_height']; // 全部高度 - X轴(时间轴)高度

    this.numberOfSpace = 0;
    this.lengthOfSpace_px = 0;

    // 参数
    this.charts_params = config.charts;

    // 数据集合
    this.datas = null;

    this.containers = []; // 各个 chart containers
    this.charts = []; // 各个 chart

    this.timeLine = {};

    this.init();

    if(this.draggable){
        this.container.addEventListener('touchstart', onDocumentTouchStart, false);
        this.container.addEventListener('touchmove', onDocumentTouchMove, false);
    }

}

var onPointerDownPointerX = 0,
    onPointerDownPointerY = 0;

var pointerA = 0, pointerB = 0, distanceAB = 0;

function onDocumentTouchStart(event) {
    if (CHARTSET_K.draggable) {
        if(event.touches.length == 1){
            event.preventDefault();
            onPointerDownPointerX = event.touches[0].pageX;
        }else if(event.touches.length == 2){
            pointerA = event.touches[0].pageX;
            pointerB = event.touches[1].pageX;
            distanceAB = Math.abs(pointerA - pointerB);
        }
    }
}

function onDocumentTouchMove(event) {
    if (CHARTSET_K.draggable) {
        if(event.touches.length == 1){
            event.preventDefault();
            if (CHARTSET_K.move(onPointerDownPointerX - event.touches[0].pageX)) {
                onPointerDownPointerX = event.touches[0].pageX;
            }
        }else if(event.touches.length == 2){
            event.preventDefault();
            var x = Math.abs(event.touches[0].pageX - event.touches[1].pageX) - distanceAB;
            if (CHARTSET_K.scale(x, (pointerA + pointerB)/2)) {
                pointerA = event.touches[0].pageX;
                pointerB = event.touches[1].pageX;
                distanceAB = Math.abs(pointerA - pointerB);
            }
        }
    }
}
ChartSet.create = function(container, width, height, config) {
    if(config.id == 'chart_kline'){
        if(CHARTSET_K == null){
            CHARTSET_K = new ChartSet(container, width, height, config);
        }
        CHARTSET_K.show();
        if(CHARTSET_DAY) {
            CHARTSET_DAY.hide();
        }
        return CHARTSET_K;
    }else if(config.id == 'chart_day'){
        if(CHARTSET_DAY == null){
            CHARTSET_DAY = new ChartSet(container, width, height, config);
        }
        CHARTSET_DAY.show();
        if(CHARTSET_K) {
            CHARTSET_K.hide();
        }
        return CHARTSET_DAY;
    }
}
ChartSet.prototype.show = function() {
    this.container.style.visibility = 'visible';
}
ChartSet.prototype.hide = function() {
    this.container.style.visibility = 'hidden';
}
ChartSet.Utils = {
    getContainer: function(args) {
        // args = { top: , left: , width: , height: }
        var container = document.createElement('div');
        container.className = 'chart-container';
        container.style.position = 'absolute';
        container.style.left = args.left + 'px';
        container.style.top = args.top + 'px';
        container.style.width = args.width + 'px';
        container.style.height = args.height + 'px';
        return container;
    },
    getChart: function(args) {
        // args = { container: , width: , height: , config: }
        // new Chart( container, width, height, config )
        var chart = new Chart(args.container, args.width, args.height, args.config);
        chart.init();
        return chart;
    }
}

ChartSet.prototype.init = function() {
    this.initConfig();
    this.initContainers();
    this.initCharts();
    this.initTimeline();
}

ChartSet.prototype.initConfig = function() {
    // width = width - leftwidth - rightwidth (60)
    if (!this.draggable) {
        // X轴 柱子个数
        this.numberOfSpace = this.end_id - this.start_id + 1;
        // 每个柱子宽度
        this.lengthOfSpace_px = (this.width - CHARTSET_CONF.marginLeft - CHARTSET_CONF.marginRight) / this.numberOfSpace;
        this.show_left_id = this.start_id;
        this.show_right_id = this.end_id;
    } else {
        // 每个柱子宽度
        this.lengthOfSpace_px = 8; // 可拖拽的屏幕，一个柱子宽度默认 10 px
        // X轴 柱子个数
        this.numberOfSpace = Math.floor((this.width - CHARTSET_CONF.marginLeft - CHARTSET_CONF.marginRight) / this.lengthOfSpace_px);
        this.show_left_id = this.right_id - this.numberOfSpace + 1;
        this.show_right_id = this.right_id;
    }
}
ChartSet.prototype.initContainers = function() {
    // 设置背景色
    this.container = ChartSet.Utils.getContainer({
        'top': 0,
        'left': 0,
        'width': this.width,
        'height': this.height,
    });
    this.container.style.backgroundColor = "#" + CHART_COLOR['BACKGROUND'].getHexString();
    this.containerParent.appendChild(this.container);

    var container_p = {
        'top': 0,
        'left': 0,
        'width': this.width,
        'height': 0,
        'dom': null
    };
    // 添加 containers
    for (var i = 0; i < this.charts_params.length; i++) {
        var charts_conf = this.charts_params[i];
        container_p.top += container_p.height;
        container_p.height = this.height * charts_conf.height_proportion - 1;
        var container = JSON.parse( JSON.stringify( container_p ) );
        container.dom = ChartSet.Utils.getContainer(container);
        container.dom.style.borderBottom = "solid 1px #666";
        // init containers
        this.containers[i] = container;
        this.container.appendChild(this.containers[i].dom);
    }
    // 添加 X 轴
    container_p.top += container_p.height;
    container_p.height = CHARTSET_CONF['timeline_height'];
    container_p.left = 10;
    container_p.width = this.width -10;
    this.timeLine['dom'] = ChartSet.Utils.getContainer(container_p);
    this.timeLine['dom'].style.fontSize = 'smaller';
    this.container.appendChild(this.timeLine['dom']);
}
ChartSet.prototype.initCharts = function() {
    // init charts
    var chart_p = {
        'container': null,
        'width': 0,
        'height': 0,
        'config': null
    };
    for (var i = 0; i < this.charts_params.length; i++) {
        chart_p.container = this.containers[i].dom;
        chart_p.width = this.containers[i].width;
        chart_p.height = this.containers[i].height;
        var list = [];
        if (this.charts_params[i].list) {
            for (var j = 0; j < this.charts_params[i].list.length; j++) {
                list.push({
                    name: this.charts_params[i].list[j].name,
                    type: this.charts_params[i].list[j].type,
                    field: this.charts_params[i].list[j].field,
                    color: this.charts_params[i].list[j].color
                });
            }
        }
        chart_p.config = {
            numberOfSpace: this.numberOfSpace,
            margin: this.charts_params[i].margin,
            priceTick: this.charts_params[i].priceTick,
            fixed: this.charts_params[i].fixed,
            showMostValue: this.charts_params[i].showMostValue,
            showPanels: this.charts_params[i].showPanels,
            list: list
        };
        chart_p.config.margin.left = CHARTSET_CONF.marginLeft;
        chart_p.config.margin.right = CHARTSET_CONF.marginRight;
        this.charts[i] = ChartSet.Utils.getChart(chart_p);
    }
}
ChartSet.prototype.initTimeline = function() {
    this.timeLine['datas'] = [];
    this.timeLine['axisX'] = [];
    this.timeLine['domChildren'] = [];

    this.timeLine['update'] = function(obj) {
        // delete old datetime
        for (var i = 0; i < obj.timeLine['domChildren'].length; i++) {
            if(obj.timeLine['domChildren'][i]){
                obj.timeLine['dom'].removeChild(obj.timeLine['domChildren'][i]);
            }
        }
        delete obj.timeLine['domChildren'];
        // init datetime container
        obj.timeLine['domChildren'] = [];

        // add new datetime
        for (var i = 0; i < obj.timeLine['datas'].length; i++) {
            if(obj.timeLine['datas'][i].show){
                obj.timeLine['domChildren'][i] = document.createElement('div');
                obj.timeLine['domChildren'][i].style.position = 'absolute';
                obj.timeLine['domChildren'][i].style.left = obj.timeLine['datas'][i].left + 'px';
                obj.timeLine['domChildren'][i].style.top = '0px';
                obj.timeLine['domChildren'][i].innerText = obj.timeLine['datas'][i].datetimeStr;
                obj.timeLine['dom'].appendChild(obj.timeLine['domChildren'][i]);
            }
        }
    }
}

ChartSet.prototype.change_ins_id = function(config){
    this.ins_id = config.ins_id;
    this.interval = config.interval;
    this.start_id = config.start_id;
    this.end_id = config.end_id;
    this.left_id = config.left_id;
    this.right_id = config.right_id;

    for (var i = 0; i < this.charts_params.length; i++) {
        this.charts_params[i].priceTick = config.charts[i].priceTick;
        this.charts_params[i].fixed = config.charts[i].fixed;
    }

    if(!this.draggable){
        // X轴 柱子个数
        this.numberOfSpace = config.end_id - config.start_id + 1;
        // 每个柱子宽度
        this.lengthOfSpace_px = (this.width - CHARTSET_CONF.marginLeft - CHARTSET_CONF.marginRight) / this.numberOfSpace;
        this.show_left_id = config.start_id;
        this.show_right_id = config.end_id;
    }else{
        this.show_right_id = config.right_id;
        this.show_left_id = config.show_right_id - this.numberOfSpace + 1;
        if(this.show_left_id < 0){
            this.show_left_id = 0;
            this.show_right_id = this.show_left_id + this.numberOfSpace - 1;
        }
    }

    for (var i = 0; i < this.charts_params.length; i++) {
        this.charts[i].scale({
            priceTick: this.charts_params[i].priceTick,
            fixed: this.charts_params[i].fixed,
            numberOfSpace: this.numberOfSpace
        });
    }
}
ChartSet.prototype.change_interval = function(config){
    this.interval = config.interval;
    this.start_id = config.start_id;
    this.end_id = config.end_id;
    this.left_id = config.left_id;
    this.right_id = config.right_id;
    if (!this.draggable) {
        this.show_left_id = config.start_id;
        this.show_right_id = config.end_id;
    } else {
        this.show_right_id = config.right_id;
        this.show_left_id = config.show_right_id - this.numberOfSpace + 1;
        if(this.show_left_id < 0){
            this.show_left_id = 0;
            this.show_right_id = this.show_left_id + this.numberOfSpace - 1;
        }
    }
}
ChartSet.prototype.scale = function(x, pageX){
    // x 缩放大小， pageX 是左右两个点的中间位置
    x = x / 5;
    if(this.draggable && x != 0 && Math.abs(x) > 1){
        if( this.lengthOfSpace_px + x > 2 && this.lengthOfSpace_px + x < 30){
            // 以 old_id 为基准 scale
            var old_id = this.show_left_id + Math.round(pageX / this.lengthOfSpace_px);

            // 每个柱子宽度
            this.lengthOfSpace_px += x; // 可拖拽的屏幕，一个柱子宽度默认 10 px
            // X轴 柱子个数
            this.numberOfSpace = Math.floor((this.width - CHARTSET_CONF.marginLeft - CHARTSET_CONF.marginRight) / this.lengthOfSpace_px);

            var bias = Math.round(pageX / this.lengthOfSpace_px);
            var show_left_id = old_id - bias;

            if(this.show_left_id == 0){
                this.show_left_id = 0;
            }else if(show_left_id > this.left_id){
                this.show_left_id = show_left_id;
            }else{
                this.show_left_id = this.left_id;
            }

            this.show_right_id = this.show_left_id + this.numberOfSpace - 1;

            this.updateTimeline();

            for (var i = 0; i < this.charts_params.length; i++) {
                this.charts[i].scale({
                    priceTick: this.charts_params[i].priceTick,
                    fixed: this.charts_params[i].fixed,
                    numberOfSpace: this.numberOfSpace
                });
                this.charts[i].update(this.datas, this.show_left_id, this.show_right_id,  this.timeLine.axisX, null);
            }
        }
        return true;
    }else{
        return false
    }
}

ChartSet.prototype.move = function(movePx) {
    var step = Math.round(movePx / this.lengthOfSpace_px);
    if(this.show_left_id == 0 && this.right_id < this.numberOfSpace){
        return false;
    }
    if (step != 0 && ((this.show_right_id + step - this.numberOfSpace) >= this.left_id) && ((this.show_right_id + step) <= this.right_id) && (this.show_left_id > this.left_id) && (this.show_left_id + step) >= 0 ) {
        this.show_right_id += step;
        this.show_left_id = this.show_right_id - this.numberOfSpace + 1;
        if(this.show_left_id < 0){
            this.show_left_id = 0;
            this.show_right_id = this.show_left_id + this.numberOfSpace - 1;
        }
        this.updateTimeline();
        this.updateCharts(null);
        return true;
    } else {
        return false;
    }
}

ChartSet.prototype.update = function(datas, config) {
    this.datas = datas;
    if (!this.draggable) {
        this.show_left_id = this.start_id;
        this.show_right_id = this.end_id;
    } else {
        this.right_id = config.right_id;
        this.left_id = config.left_id;
        if(this.right_id == this.show_right_id || this.show_right_id + 1 == this.right_id){
            this.show_right_id = this.right_id;
            this.show_left_id = this.show_right_id - this.numberOfSpace + 1;
            if(this.show_left_id < 0){
                this.show_left_id = 0;
                this.show_right_id = this.show_left_id + this.numberOfSpace - 1;
            }
        }
    }
    this.updateTimeline();
    this.updateCharts(config);
}



ChartSet.prototype.updateTimeline = function() {
    this.timeLine['datas'] = [];
    this.timeLine['axisX'] = [];

    var interval = this.interval / Math.pow(10, 9);
    var datetime = this.datas[this.show_left_id] ? moment(this.datas[this.show_left_id].datetime / 1000000) : null;
    var left = -5;
    var indexOfAxisX = 0; // X轴竖线显示的位置

    var first_formatString = 'MM/DD-HH:mm:ss';
    if(interval < 60){ // 秒线
        first_formatString = 'MM/DD-HH:mm:SS';
    }else if(interval < 3600){ // 分钟线
        first_formatString = 'MM/DD-HH:mm';
    }else if(interval < 86400){ // 小时线
        first_formatString = 'MM/DD-HH:mm';
    }else{ // 日线
        first_formatString = 'YYYY/MM/DD';
    }

    var formatString = 'MM/DD-HH:mm:ss';
    if(interval < 60){ // 秒线
        formatString = 'HH:mm:ss';
    }else if(interval < 3600){ // 分钟线
        formatString = 'HH:mm';
    }else if(interval < 86400){ // 小时线
        formatString = 'MM/DD-HH:mm';
    }else{ // 日线
        formatString = 'MM/DD';
    }

    var interval_px  = 60;
    var number_of_interval = Math.round(interval_px / this.lengthOfSpace_px);

    var show_left_id = this.show_left_id;
    while(this.datas[show_left_id] == undefined){
        show_left_id ++;
        // indexOfAxisX ++;
    }
    var datetime = moment(this.datas[show_left_id].datetime / 1000000);
    this.timeLine['datas'].push({
        datetimeStr: datetime.format(first_formatString),
        left: left,
        must: true,
        show: true
    });
    this.timeLine['axisX'].push(indexOfAxisX);

    if(this.draggable){
        for(var i=show_left_id+number_of_interval; i<=this.show_right_id; i+=number_of_interval ){
            left += number_of_interval * this.lengthOfSpace_px;
            indexOfAxisX += number_of_interval;
            if(this.datas[i]){
                datetime = moment(this.datas[i].datetime / 1000000);
                this.timeLine['datas'].push({
                    datetimeStr: datetime.format(formatString),
                    left: left,
                    must: true,
                    show: true
                });
                this.timeLine['axisX'].push(indexOfAxisX);
            }else{
                this.timeLine['datas'].push({
                    datetimeStr: '',
                    left: left,
                    must: true,
                    show: true
                });
            }
        }
    }else{
        var last_datetime = datetime;
        while(left < this.width - 60 && show_left_id < this.show_right_id){
            show_left_id ++;
            indexOfAxisX ++;
            if(this.datas[show_left_id]){
                left += this.lengthOfSpace_px;
                datetime = moment(this.datas[show_left_id].datetime / 1000000);
                if(datetime.date() != last_datetime.date() || datetime.hours() != last_datetime.hours() || datetime.minutes() == 30 ){
                    var id = show_left_id - 1;
                    if(datetime.valueOf() -this.datas[id].datetime / 1000000 > 10 * 60 * 1000){
                        last_datetime = datetime;
                        this.timeLine['datas'].push({
                            datetimeStr: datetime.format(formatString),
                            left: left,
                            must: true,
                            show: true
                        });
                        this.timeLine['axisX'].push(indexOfAxisX);
                    }else{
                        last_datetime = datetime;
                        this.timeLine['datas'].push({
                            datetimeStr: datetime.format(formatString),
                            left: left,
                            must: false,
                            show: true
                        });
                        this.timeLine['axisX'].push(indexOfAxisX);
                    }
                }
            }
        }
        // 去掉不想显示的
        if(this.timeLine['datas'].length > 1){
            this.timeLine['datas'][1].show = false;
            // this.timeLine['datas'][2].show = false;
            var last_left = this.timeLine['datas'][1].left;
            for(var i=2; i<this.timeLine['datas'].length; i++){
                if(this.timeLine['datas'][i].left - last_left > 40){
                    last_left = this.timeLine['datas'][i].left;
                    this.timeLine['datas'][i].show = true;
                }else{
                    if(this.timeLine['datas'][i].must){
                        this.timeLine['datas'][i-1].show = false;
                        last_left = this.timeLine['datas'][i].left;
                        this.timeLine['datas'][i].show = true;
                    }else{
                        this.timeLine['datas'][i].show = false;
                    }
                }

            }
        }
        var index = 0;
        for(var k=0; k<this.timeLine['datas'].length; k++, index++){
            if(this.timeLine['datas'][k].show == false){
                this.timeLine['axisX'].splice(index, 1);
                index --;
            }
        }
    }
    this.timeLine.update(this);
}

ChartSet.prototype.updateCharts = function(config) {
    for (var i = 0; i < this.charts_params.length; i++) {
        if(config){
            this.charts[i].update(this.datas, this.show_left_id, this.show_right_id, this.timeLine.axisX, config.charts[i].panels);
        }else{
            this.charts[i].update(this.datas, this.show_left_id, this.show_right_id, this.timeLine.axisX, null);
        }
    }
}

ChartSet.prototype.showPanel = function(panel_id) {
    for (var i = 0; i < this.charts_params.length; i++) {
        this.charts[i].displayPanel('show', panel_id);
    }
}

ChartSet.prototype.hidePanel = function(panel_id) {
    for (var i = 0; i < this.charts_params.length; i++) {
        this.charts[i].displayPanel('hide', panel_id);
    }
}
