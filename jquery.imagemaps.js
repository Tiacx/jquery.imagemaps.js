/*!
 * jQuery 创建图片热点链接 插件
 * version: 1.0.0-2018.09.19
 * Requires jQuery v1.5 or later、ES6
 * Copyright (c) 2018 Tiac
 * https://github.com/Tiacx/jquery.imagemaps.js
 */

// AMD support
(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // using AMD; register as anon module
        define(['jquery'], factory);
    } else {
        // no AMD; invoke directly
        factory( (typeof(jQuery) != 'undefined') ? jQuery : window.Zepto );
    }
}

(function($) {
    "use strict";

    /*
        Basic Usage:
        -----------

        $('.imagemaps-wrapper').imageMaps({
            addBtn: '.btn-add-map',
            output: '.imagemaps-output',
            stopCallBack: function(active, coords){
                // console.log(active);
                console.log(coords);
            }
        });
    */

    $.fn.imageMaps = function(options) {
        if(options===undefined) options = {};

        options = $.extend({
            rectWidth: 100,
            rectHeight: 60,
            areaHref: '.area-href',
            areaTarget: '.area-target',
            btnDelete: '.btn-delete',
        }, options);

        let defaults = {};
        defaults.draggableOptions = {
            containment: "parent",
            stop: function(){
                setCoords($(this));
            }
        };

        defaults.resizableOptions = {
            containment: "parent",
            stop: function(){
                setCoords($(this));
            }
        };

        options.draggableOptions = $.extend(defaults.draggableOptions, options.draggableOptions);
        options.resizableOptions = $.extend(defaults.resizableOptions, options.resizableOptions);

        // 当前热区
        let active = null;
        // 当前热区的坐标值
        let coords = {
            x1: 0,
            y1: 0,
            x2: options.rectWidth,
            y2: options.rectHeight,
        };

        // 模板
        let itemTemplate = localStorage.getItem('imageMapsItemTemplate') || $(options.output+':eq(0)').html();
        localStorage.setItem('imageMapsItemTemplate', itemTemplate);
        $(options.output).html('');

        // 设置当前热区的坐标
        let setCoords = function(_this, doingRecover=false){
            if(_this){
                coords.x1 = parseInt(_this.css('left'));
                coords.y1  = parseInt(_this.css('top'));
                coords.x2  = coords.x1 + parseInt(_this.width());
                coords.y2  = coords.y1 + parseInt(_this.height());

                active = _this;
            }

            let index  = parseInt( active.attr('data-index') );
            let oArea  = active.parent().find('.imagemaps .imagemaps-area'+index);
            let output = $(options.output+':eq('+ active.parent().attr('data-index') +')');
            // 缩放比例
            let oImg   = active.parent().children('img');
            let ratio  = oImg.width()/oImg.get(0).naturalWidth;

            if(doingRecover==false) oArea.attr('coords', `${parseInt(coords.x1/ratio)},${parseInt(coords.y1/ratio)},${parseInt(coords.x2/ratio)},${parseInt(coords.y2/ratio)}`);

            output.find(`.item-${index+1} `+options.areaHref).val( oArea.attr('href') );
            output.find(`.item-${index+1} `+options.areaTarget).val( oArea.attr('target') );

            if(options.stopCallBack) options.stopCallBack(active, coords);
        };

        // 支持多图片同时操作
        this.each(function(i, item){
            let _this  = $(this);
            _this.attr('data-index', i);
            _this.attr('data-count', 0);

            let doingRecover = false;
            if(_this.find('.imagemaps').length==0)
            {
                let timeStamp = (new Date()).getTime();
                var oMap      = $(`<map class="imagemaps" name="imagemaps${timeStamp}"></map>`);
                _this.append(oMap);
                _this.children('img').attr('usemap', `#imagemaps${timeStamp}`);
            }
            else
            {
                var oMap = _this.find('.imagemaps');
                doingRecover = true;
            }

            // 缩放比例
            let oImg   = _this.children('img');
            let ratio  = oImg.width()/oImg.get(0).naturalWidth;

            $(options.addBtn+':eq('+ i +')').unbind('click').on('click', function(){
                let count = _this.attr('data-count');
                count++;
                _this.attr('data-count', count);

                let output = $(options.output+':eq('+ i +')');
                let oTr    = $(itemTemplate.replace(/###/g, count));
                output.append(oTr);

                let index  = count-1;
                let coords = doingRecover? _this.find('.imagemaps area').eq(index).attr('coords').split(',') : [];
                coords = coords.map(function (v) {
                    return parseInt( parseInt(v)*ratio );
                });

                let oDiv   = $(`<div id="imagemaps-rect-${i}-${index}" style="width:${(coords[2]-coords[0]) || options.rectWidth}px;height:${(coords[3]-coords[1]) || options.rectHeight}px;position:absolute;left:${coords[0] || 0}px;top:${coords[1] || 0}px;background-color:rgba(255,255,255,0.5)" data-index="${index}">${count}</div>`);
                _this.append(oDiv);
                oDiv.draggable(options.draggableOptions);
                oDiv.resizable(options.resizableOptions);

                if(doingRecover==false){
                    oMap.append(`<area shape="rect" name="imagemaps-area" class="imagemaps-area${index}" coords="0,0,${options.rectWidth},${options.rectHeight}" href="" target="_self"/>`);
                }

                oDiv.on('click', function(){
                    active = $(this);
                    setCoords();
                });

                active = oDiv;
                setCoords(null, doingRecover);

                // 更新热区链接和打开方式
                oTr.find(options.areaHref+','+options.areaTarget).on('change', function(){
                    active       = $(`#imagemaps-rect-${i}-${index}`);
                    let oWrapper = active.parent();
                    let oArea    = oWrapper.find('.imagemaps .imagemaps-area'+index);
                    let output   = $(options.output).eq(i);

                    oArea.attr('href', output.find(`.item-${index+1} `+options.areaHref).val());
                    oArea.attr('target', output.find(`.item-${index+1} `+options.areaTarget).val());
                });

                // 删除热区
                oTr.find(options.btnDelete).unbind('click').on('click', function(){
                    active       = $(`#imagemaps-rect-${i}-${index}`);
                    let oWrapper = active.parent();
                    let oArea    = oWrapper.find('.imagemaps .imagemaps-area'+index);
                    let output   = $(options.output).eq(i);

                    oArea.attr('href', '');
                    oArea.attr('target', '_self');

                    $(active).draggable( "destroy" );
                    $(active).resizable( "destroy" );
                    active.remove();
                    oArea.remove();
                    output.find(`.item-${index+1}`).remove();

                    oWrapper.attr('data-count', oWrapper.attr('data-count')-1);
                });
            });

            // 恢复数据
            if(doingRecover==true)
            {
                let itemLen = _this.find('.imagemaps area').length;

                for(let ii=0; ii<itemLen; ii++){
                    $(options.addBtn+':eq('+ i +')').trigger('click');
                } 
            }

            doingRecover = false;
        });
    };
}));
