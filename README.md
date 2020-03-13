# jquery.imagemaps.js
jquery 图片热区链接设置插件 

#### 基础使用
``` javascript
$('.imagemaps-wrapper').imageMaps({
    addBtn: '.btn-add-map', // 添加按钮
    // rectWidth: 100, // 热点初始宽度
    // rectHeight: 60, // 热点初始高度
    // areaHref: '.area-href', // 设置链接的元素
    // areaTarget: '.area-target', // 设置链接打开方式的元素
    // btnDelete: '.btn-delete', // 删除热区的元素
    output: '.imagemaps-output', // 输出位置
    stopCallBack: function(active, coords){
        // 当前激活的热区
        // console.log(active);
        // 热区的coords信息
        // console.log(coords);
    }
});
```

#### 演示
具体用法，请看：[demo.html](https://github.com/Tiacx/jquery.imagemaps.js/blob/master/demo.html "使用示例")