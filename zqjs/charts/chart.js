
/** Chart 参数说明
    Chart_config_init = {
        numbersOfSpeace: 100,
        margin: {
            top: 2, bottom 2,
            left: 5, right: 50;
        },
        priceTick: 0.5,
        fixed: 1,
        showMostValue: true,
        showPanels: true,
        list: [{
            name: 'k',
            type: 'kChart',
            depends: 'right',
        },{
            name: 'bar',
            type: 'barChart',
            depends: 'right',
            field: ''
        },{
            name: 'line',
            type: 'lineChart',
            depends: 'right',
            color: 'red'
            field: ''
        }]
    }

    Chart_config_scale = {
        numberOfSpace
    }

    Chart_config_update = {
        axisX: [0, 10, 20, 30],  // 值 为显示的时间的 柱子位置
        datas
        left_id
        right_id
        panels_content
    }
*/

var chart_color = Object.assign({
    'background': "#" + CHART_COLOR.BACKGROUND.getHexString(),
    'down': 'aqua',
    'up': 'orangered',
}, CONST.chart_color);

var Chart = function (container, width, height, config){
    this.container = container;
    this.width = width;
    this.height = height;

    this.config = config;

    this.chart3DContainer = null;
    this.axisYContainer = null;
    this.maxMinContainer = null;
    this.panelsContainer = null;

    this.axisY = {
        min: Infinity,
        max: -Infinity,
        minIndex: 0,
        maxIndex: 0,
        datas: []
    };
    this.panelsContent = {}; //存储 Chartset 传来的数据
    this.panels = {}; //存储 dom

    this.chart3D_config = {};
    this.chart3D = null;
}

var ChartComponent = function(args){
    // args = { top: , left: , width: , height: }
    this.top = args.top;
    this.left = args.left;
    this.width = args.width;
    this.height = args.height;
    this.dom = ChartUtils.getContainer(args);
}

ChartUtils = {
    getContainer: function(args) {
        // args = { top: , left: , width: , height: }
        var container = document.createElement('div');
        container.className = 'chart-container';
        container.style.position = 'absolute';
        container.style.left = args.left + 'px';
        container.style.top = args.top + 'px';
        container.style.width = args.width + 'px';
        container.style.height = args.height + 'px';
        container.style.color = '#ffffff';
        container.style.fontSize = 'smaller';
        return container;
    },
    getGridValue: function(grid_value_min, grid_value_max) {
        // 每格对应 价格
        var grid_value = grid_value_max;

        for (var i = 0, j = 1; i < 9; i++, j *= 10) {
            var n = Math.round(grid_value / (j * 10)) * (j * 10);
            if (n >= grid_value_min) {
                grid_value_min = n;
                continue;
            }
            n = Math.round(grid_value / (j * 5)) * (j * 5);
            if (n >= grid_value_min) {
                grid_value_min = n;
                break;
            }
            n = Math.round(grid_value / (j * 2)) * (j * 2);
            if (n >= grid_value_min) {
                grid_height = n;
                break;
            }
        }
        if (grid_value < 1) {
            grid_value = 1;
        }
        return grid_value;
    }
}
Chart.prototype.init = function() {
    this.initContainers();
    this.initChart3D();
    this.initAxisYUpdate();
}
Chart.prototype.scale = function(config){
    this.config.priceTick = config.priceTick;
    this.config.fixed = config.fixed;
    if( this.config.numberOfSpace != config.numberOfSpace){
        this.config.numberOfSpace = config.numberOfSpace;
        this.chart3D.scale(this.config.numberOfSpace);
    }
}
Chart.prototype.initContainers = function(){
    this.axisYContainer = new ChartComponent({
        top: this.config.margin.top,
        left: this.width - this.config.margin.right,
        width: this.config.margin.right,
        height: this.height - this.config.margin.top - this.config.margin.bottom
    });
    var args = {
        top: this.config.margin.top - 1,
        left: this.config.margin.left,
        width: this.width - this.config.margin.left - this.config.margin.right,
        height: this.height - this.config.margin.top - this.config.margin.bottom
    };
    this.chart3DContainer = new ChartComponent(args);
    this.container.appendChild(this.axisYContainer.dom);
    this.container.appendChild(this.chart3DContainer.dom);
    args.width = 0;
    args.height = 0;
    if(this.config.showMostValue){
        this.maxMinContainer = new ChartComponent(args);
        this.container.appendChild(this.maxMinContainer.dom);
    }
    if(this.config.showPanels){
        this.panelsContainer = new ChartComponent(args);
        this.container.appendChild(this.panelsContainer.dom);
    }
}
Chart.prototype.initChart3D = function(){
    var list = [];
    var layerIndex = 1;
    for(var i=0; i<this.config.list.length; i++, layerIndex++){
        list.push({
            name: this.config.list[i].name,
            type: this.config.list[i].type,
            layer: layerIndex,
            color: this.config.list[i].color
        });
    }
    this.chart3D_config = {
        numberOfSpace: this.config.numberOfSpace,
        list: list
    }
    this.chart3D = new Chart3D(this.chart3DContainer.dom, this.chart3DContainer.width, this.chart3DContainer.height);
    this.chart3D.init(this.chart3D_config);
}
Chart.prototype.initAxisYUpdate = function(){
    this.axisYContainer.update = function(obj){
        // 算好 this.axisY.datas
        // this.axisY.min this.axisY.max
        if(obj.axisYContainer.childrenDom){
            for (var i = 0; i < obj.axisYContainer.childrenDom.length; i++) {
                obj.axisYContainer.dom.removeChild(obj.axisYContainer.childrenDom[i]);
            }
            delete obj.axisYContainer.childrenDom;
        }
        obj.axisYContainer.childrenDom = [];

        for (var i = 0; i < obj.axisY.datas.length; i++) {
            obj.axisYContainer.childrenDom[i] = document.createElement('div');
            obj.axisYContainer.childrenDom[i].style.position = 'absolute';
            obj.axisYContainer.childrenDom[i].style.right = '0px';
            obj.axisYContainer.childrenDom[i].style.top = obj.axisYContainer.height / (obj.axisY.max - obj.axisY.min) * (obj.axisY.max - obj.axisY.datas[i]) - 15 +'px';
            obj.axisYContainer.childrenDom[i].innerText = obj.axisY.datas[i].toFixed(obj.config.fixed);
            obj.axisYContainer.dom.appendChild(obj.axisYContainer.childrenDom[i]);
        }
    }
}
Chart.prototype.update = function(datas, left_id, right_id, axisX, panels_content){
    this.datas = datas;
    this.left_id = left_id;
    this.right_id = right_id;
    this.chart3D_config.axisX = axisX;
    if(panels_content){
        this.panelsContent = panels_content;
    }
    this.updateChart3DConfig();
    this.updateAxisY();
    this.updateChart3D();

    if(this.config.showMostValue){
        this.updateMaxMin();
    }
    if(this.config.showPanels){
        this.updatePanels();
    }
}
Chart.prototype.updateChart3DConfig = function(){
    // datas & colors
    for(var index = 0; index < this.chart3D_config.list.length; index++){
        delete this.chart3D_config.list[index].datas;
        delete this.chart3D_config.list[index].colors;
        this.chart3D_config.list[index].datas = [];
        this.chart3D_config.list[index].colors = [];

        if(this.chart3D_config.list[index].type == 'KCHART'){
            // get datas & colors
            var null_num = 0;
            for(var i=this.left_id; i<=this.right_id; i++ ){
                if(this.datas[i]){
                    this.chart3D_config.list[index].datas.push({
                        open: this.datas[i].open,
                        close: this.datas[i].close,
                        high: this.datas[i].high,
                        low: this.datas[i].low
                    });
                    var color = 'white';
                    if(this.datas[i].open > this.datas[i].close){
                        color = chart_color.down;
                    }else if(this.datas[i].open < this.datas[i].close){
                        color = chart_color.up;
                    }
                    this.chart3D_config.list[index].colors.push(color);
                }else{
                    null_num ++;
                }
            }
            for(var j=0; j<null_num; j++){
                this.chart3D_config.list[index].datas.push(null);
                this.chart3D_config.list[index].colors.push(null);
            }

        }else if(this.chart3D_config.list[index].type == 'BARCHART'){
            var field = this.config.list[index].field;
            // get datas & colors
            var null_num = 0;
            for(var i=this.left_id; i<=this.right_id; i++ ){
                if(this.datas[i]){
                    this.chart3D_config.list[index].datas.push(this.datas[i][field]);
                    var color = 'white';
                    if(this.datas[i].open > this.datas[i].close){
                        color = chart_color.down;
                    }else if(this.datas[i].open <= this.datas[i].close){
                        color = chart_color.up;
                    }
                    this.chart3D_config.list[index].colors.push(color);
                }else{
                    null_num ++;
                }
            }
            for(var j=0; j<null_num; j++){
                this.chart3D_config.list[index].datas.push(null);
                this.chart3D_config.list[index].colors.push(null);
            }
        }else if(this.chart3D_config.list[index].type == 'LINECHART'){
            var field = this.config.list[index].field;
            // get datas & colors
            var null_num = 0;
            for(var i=this.left_id; i<=this.right_id; i++ ){
                if(this.datas[i]){
                    this.chart3D_config.list[index].datas.push(this.datas[i][field]);
                }else{
                    null_num ++;
                }
            }
            for(var j=0; j<null_num; j++){
                this.chart3D_config.list[index].datas.push(null);
            }
        }
    }
}
Chart.prototype.updateChart3D = function(){
    this.chart3D.update(this.chart3D_config);
}
Chart.prototype.updateAxisY = function(){
    this.getMaxMinValue();

    if(this.axisY.min > 0 && this.axisY.min == this.axisY.max){
        this.axisY.min -= Number(this.config.priceTick) * 8;
        this.axisY.max += Number(this.config.priceTick) * 8;
        this.axisY.minIndex = -1;
        this.axisY.maxIndex = -1;
    }else if(this.axisY.min == 0){
        this.axisY.max += Number(this.config.priceTick) * 2;
    }

    var range = this.axisY.max - this.axisY.min;
    var rangePriceTick = Math.round( range / this.config.priceTick );
    // 每格对应 价格
    var grid_value_min = Math.round(50 * rangePriceTick / this.chart3DContainer.height);
    var grid_value_max = Math.round(40 * rangePriceTick / this.chart3DContainer.height);
    var grid_value_priceTick = ChartUtils.getGridValue(grid_value_min, grid_value_max);
    // 每格对应 价格
    var grid_value = grid_value_priceTick * this.config.priceTick;

    var v = this.axisY.min;
    while(v < this.axisY.max){
        this.axisY.datas.push(v);
        v += grid_value;
    }

    this.axisYContainer.update(this);

    this.chart3D_config.min = this.axisY.min;
    this.chart3D_config.max = this.axisY.max;
    this.chart3D_config.axisY = this.axisY.datas;
}
Chart.prototype.updatePanels = function(){
    if(this.panelsContent){
        for(var i = 0; i<this.panelsContent.length; i++){
            var panel_id = this.panelsContent[i].id;

            if(this.panels[panel_id] == undefined){
                this.panels[panel_id] = {
                    dom:  ChartUtils.getContainer({
                        top: 0,
                        left: 0,
                        width: 0,
                        height: 0
                    })
                };
                this.panelsContainer.dom.appendChild(this.panels[panel_id].dom);
            }
            if(this.panels[panel_id].dom.visibility == 'visible' || this.panels[panel_id].dom.visibility == undefined){
                this.updateSinglePanel(panel_id, this.panelsContent[i].datas);
            }

        }
    }
}
Chart.prototype.updateSinglePanel = function(panel_id, panel_datas){
    while (this.panels[panel_id].dom && this.panels[panel_id].dom.hasChildNodes()) {
        this.panels[panel_id].dom.removeChild(this.panels[panel_id].dom.firstChild);
    }

    var div;
    for(var k in panel_datas){
        div = document.createElement('div');
        var top = (this.axisY.max - k) / (this.axisY.max - this.axisY.min ) * this.height;
        div.style.position = 'absolute';
        if(top > this.height - 20) {
             div.style.top = this.height - 5 - 20 + 'px';
            div.style.borderBottom = '1px solid ' + panel_datas[k][0].backgroundColor;
        }else if(top < 0){
            div.style.top = 2 + 'px';
            div.style.borderTop = '1px solid ' + panel_datas[k][0].backgroundColor;
        }else{
            div.style.top = top + 'px';
            div.style.borderTop = '1px solid ' + panel_datas[k][0].backgroundColor;
        }
        div.style.left = '0px';
        div.style.width = this.width + 'px';
        var text = '';
        for(var j=0; j<panel_datas[k].length; j++){
            var text_div = document.createElement('div');
            text_div.style.top = '0px';
            text_div.style.left = '0px';
            text_div.style.display = 'inline-block';
            text_div.style.backgroundColor = panel_datas[k][j].backgroundColor;
            text_div.style.color = panel_datas[k][j].color;
            text_div.innerText = panel_datas[k][j].text;
            div.appendChild(text_div)
        }
         this.panels[panel_id].dom.appendChild(div)
    }
}
Chart.prototype.displayPanel = function(action, panel_id){
    if(this.panels && this.panels[panel_id]){
        if(action == 'show'){
            this.panels[panel_id].dom.style.visibility = 'visible';
        }else if(action == 'hide'){
            this.panels[panel_id].dom.style.visibility = 'hidden';
        }
    }

}
Chart.prototype.getMaxMinValue = function(){
    this.axisY = {
        min: Infinity,
        max: -Infinity,
        minIndex: 0,
        maxIndex: 0,
        datas: []
    };
    for(var index = 0; index < this.chart3D_config.list.length; index++){
        this.chart3D_config.list[index].min = Infinity;
        this.chart3D_config.list[index].minIndex = 0;
        this.chart3D_config.list[index].max = -Infinity;
        this.chart3D_config.list[index].maxIndex = 0;
        if(this.chart3D_config.list[index].type == 'KCHART'){
            // get min & minIndex
            // get max & maxIndex
            for(var i=0; i<this.chart3D_config.list[index].datas.length; i++ ){
                if(this.chart3D_config.list[index].datas[i]){
                    var low = this.chart3D_config.list[index].datas[i].low;
                    if(low < this.chart3D_config.list[index].min){
                        this.chart3D_config.list[index].min = low;
                        this.chart3D_config.list[index].minIndex = i;
                    }
                }
                if(this.chart3D_config.list[index].datas[i]){
                    var high = this.chart3D_config.list[index].datas[i].high;
                    if(high > this.chart3D_config.list[index].max){
                        this.chart3D_config.list[index].max = high;
                        this.chart3D_config.list[index].maxIndex = i;
                    }
                }
            }
        }else if(this.chart3D_config.list[index].type == 'BARCHART'){
             // get min & minIndex
             // get max & maxIndex
            this.chart3D_config.list[index].min = 0;
            this.chart3D_config.list[index].minIndex = 0;
            for(var i=0; i<this.chart3D_config.list[index].datas.length; i++ ){
                if(this.chart3D_config.list[index].datas[i]){
                    var d = this.chart3D_config.list[index].datas[i];
                    if(d > this.chart3D_config.list[index].max) {
                        this.chart3D_config.list[index].max = d;
                        this.chart3D_config.list[index].maxIndex = i;
                    }
                }
            }
        }else if(this.chart3D_config.list[index].type == 'LINECHART'){
             // get min & minIndex
             // get max & maxIndex
            for(var i=0; i<this.chart3D_config.list[index].datas.length; i++ ){
                if(this.chart3D_config.list[index].datas[i]){
                    var d = this.chart3D_config.list[index].datas[i];
                    if(d > this.chart3D_config.list[index].max) {
                        this.chart3D_config.list[index].max = d;
                        this.chart3D_config.list[index].maxIndex = i;
                    }
                    if(d < this.chart3D_config.list[index].min) {
                        this.chart3D_config.list[index].min = d;
                        this.chart3D_config.list[index].minIndex = i;
                    }
                }
            }
            this.chart3D_config.list[index].min -= Number(this.config.priceTick) * 2;
            this.chart3D_config.list[index].max += Number(this.config.priceTick) * 2;
        }
        if(this.axisY.min > this.chart3D_config.list[index].min){
            this.axisY.min = this.chart3D_config.list[index].min;
            this.axisY.minIndex = this.chart3D_config.list[index].minIndex;
        }
        if(this.axisY.max < this.chart3D_config.list[index].max){
            this.axisY.max = this.chart3D_config.list[index].max;
            this.axisY.maxIndex = this.chart3D_config.list[index].maxIndex;
        }
    }
}
