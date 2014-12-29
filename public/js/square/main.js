
(function(){
  var cur_page = 1;
  var cur_tag = window.square_tag || '';
  var cur_subTag = window.sub_tag || '';
  var loading_page = false;
  var no_page = false;
  var is_accordant_layout = false;
  function loadItems(page, tag, subTag) {
    if (no_page) return;
    loading_page = true;
    $square = $('.square');
    $loading = $('#loading');
    $loading.css({'visibility': 'visible'});
    $.getJSON("/topics?page=" + page + "&tag=" + tag + "&subTag=" + subTag).done(function (items) {
      // 过滤掉没有imgs的数据
      items = $.grep(items, function (item) {
        return item.imgs.length > 0;
      });
      // 开始布局
      if (is_accordant_layout) {
        // 等高布局
        $square.addClass('accordant');
        if(!items || items.length == 0) {
          no_page = true;
          loading_page = false;
          $loading.css({'visibility': 'hidden', 'display':'none'});
          $('#no_content').css('display', 'inline-block');
        } else {
          // 处理数据
          var copyitems = $.extend(true, [], items);
          for (var i = 0; i < items.length; i++) {
            if (items[i].imgs > 1) {
              for (var m = 0; m < items[i].imgs.length; m++) {
                var newobj = $.extend(true, {}, items[i]);
                newobj.imgs = new Array(items[i].imgs[m]);
                copyitems.splice(i + m + 1, 0, newobj);
              }
              copyitems.splice(i, 1);
            }
          }

          for (var x = 0; x < copyitems.length; x++) {
            var ww = copyitems[x].imgs[0].width;
            var hh = copyitems[x].imgs[0].height;
            var url = copyitems[x].imgs[0].url;
            var $item = $('<div class="item"></div>');
            $item.append('<div class="item-cover"><div class="item-description"><p class="item-title">' + copyitems[x].title + '</p></div></div>')
            if (page === 1) {
              $item.append('<img class="img" src="'+ url + '" style="width:' + ww + 'px;height:' + hh + 'px;display:none;"/>')
            } else {
              $item.append('<img class="img lazy" src="/img/sprite.gif" data-src="'+ url + '" style="width:' + ww + 'px;height:' + hh + 'px;display:none;"/>')
            }
            $square.append($item);
          }
        }
      } else {
        // 等宽布局
        $square.addClass('aequilate');
        $square.css('position', 'relative');
        if(!items || items.length == 0) {
          no_page = true;
          loading_page = false;
          $loading.css({'visibility': 'hidden', 'display':'none'});
          $('#no_content').css('display', 'inline-block');
        } else {
          // 处理数据
          var copyitems = $.extend(true, [], items);
          for (var i = 0; i < items.length; i++) {
            if (items[i].imgs > 1) {
              for (var m = 0; m < items[i].imgs.length; m++) {
                var newobj = $.extend(true, {}, items[i]);
                newobj.imgs = new Array(items[i].imgs[m]);
                copyitems.splice(i + m + 1, 0, newobj);
              }
              copyitems.splice(i, 1);
            }
          }

          for (var x = 0; x < copyitems.length; x++) {
            var ww = copyitems[x].imgs[0].width;
            var hh = copyitems[x].imgs[0].height;
            var url = copyitems[x].imgs[0].url;
            var $item = $('<div class="item"></div>');
            if (page === 1) {
              $item.append('<div class="item-wrap"><img class="img" src="' + url + '" style="width: 283px; height: ' + 283*hh/ww + 'px; display: inline;" data-width="' + ww + '" + data-height="' + hh + '"></div>');
            } else {
              $item.append('<div class="item-wrap"><img class="img lazy" src="/img/sprite.gif" data-src="' + url + '" style="width: 283px; height: ' + 283*hh/ww + 'px; display: inline;" data-width="' + ww + '" + data-height="' + hh + '"></div>');
            }
            $square.append($item);
          }
        }
      }
      
      $("img.lazy").lazyload({
        data_attribute : "src",
        placeholder : "/img/sprite.gif",
        threshold : 200,
        effect : "fadeIn",
        load : function () { $(this).removeClass('lazy') }
      });
      
      if (is_accordant_layout) {
        executeAccordantLayout();
        if (cur_page === 1) {
          $(window).resize(function () {
            executeAccordantLayout();
          });
          $(window).scroll(scrollHandler);
        }
      } else {
        executeAequilateLayout();
        if (cur_page === 1) {
          $(window).resize(function () {
            executeAequilateLayout();
          });
          $(window).scroll(scrollHandler);
        }
      }

      loading_page = false;
      $loading.css({'visibility': 'hidden'});
    });
  }

  function get_scroll_top () {
    var scrollTop = 0;
    if(document.documentElement && document.documentElement.scrollTop) {
      scrollTop = document.documentElement.scrollTop;
    } else if(document.body) {
      scrollTop = document.body.scrollTop;
    }
    return scrollTop;
  }
  function get_client_height () {
    var clientHeight = 0;
    if(document.body.clientHeight && document.documentElement.clientHeight) {
      var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;        
    } else {
      var clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;    
    }
    return clientHeight;
  }
  function get_scroll_height () {
    return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  }
  function get_client_width () {
    return document.documentElement.clientWidth;
  }
  function scrollHandler () {
    if(get_scroll_height() - get_client_height() - 10 <= get_scroll_top()) {
      if (loading_page) return false;
      cur_page ++;
      loadItems(cur_page, cur_tag, cur_subTag);
    }
  }

  $(function () {
    loadItems(cur_page, cur_tag, cur_subTag);
  });

  // 等宽布局
  function executeAequilateLayout () {
    var STANDARD_WIDTH = 283;
    var STANDARD_GAP = 20;
    function getContainer () {
      return $('.square');
    };
    var $container = getContainer();
    function getContainerWidth () {
      return $container.width()||"";
    };
    // 获取标准列数
    var columns = Math.floor((getContainerWidth() + STANDARD_GAP) / (STANDARD_WIDTH + STANDARD_GAP));
    if (columns < 1) columns = 1;
    var colume_item_arr = [];
    var colume_height_arr = [];
    for (var i = 0; i < columns; i++) {
      colume_item_arr.push(new Array());
      colume_height_arr.push(0);
    };
    // 根据列数自适应宽度
    var www = (getContainerWidth() - (columns - 1) * STANDARD_GAP) / columns;
    if (www < STANDARD_WIDTH) www = STANDARD_WIDTH;

    var $ol_items;
    function getItems () {
      if(typeof($ol_items)=="undefined"){
        $ol_items = $container.find(".item");
      }
      return $ol_items;
    }

    function getShorterIndexInColumes () {
      return colume_height_arr.indexOf(Math.min.apply(Math, colume_height_arr));
    }

    function getTallInColumes () {
      return Math.max.apply(Math, colume_height_arr);
    }

    var $items = getItems();
    $.each($items, function (key, value) {
      var index  = getShorterIndexInColumes();
      var lastTopInIndexColume = colume_item_arr[index].length > 0 ? colume_height_arr[index] : 0;
      // 若宽度大于标准的宽度，则需要调整图片的宽高
      if (www > STANDARD_WIDTH) {
        var $img = $(this).find('img');
        var $img_w = $img.width();
        var $img_h = $img.height();
        $img.css({'width': www, 'height': $img_h * www / $img_w});
      }

      $(this).css({'position': 'absolute', 'top': lastTopInIndexColume, 'left': index * (www + STANDARD_GAP)});
      colume_item_arr[index].push($(this));
      colume_height_arr[index] += $(this).height() + STANDARD_GAP;
    });

    getContainer().css('height', getTallInColumes());
  }

  // 等高布局
  function executeAccordantLayout(){
    function getContainer(){
      return $('.square');
    }
    var $container = getContainer();
    function getContainerWidth(){
      return $container.width()||"";
    }
    //判断浏览器宽度范围，相当于media-query
    function getStandardHeight(){
      var sHeight = 0;
      var bWidth = getContainerWidth();
      if(bWidth <= 360){
        sHeight = 100;
      }else if(bWidth <= 400){
        sHeight = 140;
      }else if(bWidth <= 480){
        sHeight = 150;
      }else if(bWidth <= 550){
        sHeight = 160;
      }else if(bWidth <= 640){
        sHeight = 170;
      }else if(bWidth <= 740){
        sHeight = 180;
      }else if(bWidth <= 800){
        sHeight = 190;
      }else if(bWidth <= 960){
        sHeight = 210;
      }else if(bWidth <= 1500){
        sHeight = 230;
      }else if(bWidth <= 1920){
        sHeight = 250;
      }else if(bWidth <= 2200){
        sHeight = 270;
      }else if(bWidth <= 2400){
        sHeight = 280;
      }else if(bWidth <= 2880){
        sHeight = 300;    
      }else if(bWidth <= 3280){
        sHeight = 320;
      }else{
        sHeight = 340;
      }
      return sHeight;
    }
    var $ol_items;
    function getItems(){
      if(typeof($ol_items)=="undefined"){
        $ol_items = $container.find(".item");
      }
      return $ol_items;
    }

    var ol_width_list;
    var ol_height_list;
    function get_ol_width_list(){
      if(typeof(ol_width_list)=="undefined"){
        var $items = getItems();
        ol_width_list = new Array();
        $.each($items,function(key,val){
          var $imgs = $(this).find("img");
          ol_width_list[key] = $imgs.width();
        });
      }
      var tmp_list = ol_width_list.slice();//不污染原数组
      return tmp_list;
    }
    function get_ol_height_list(){
      if(typeof(ol_height_list)=="undefined"){
        var $items = getItems();
        ol_height_list = new Array();
        $.each($items,function(key,val){
          var $imgs = $(this).find("img");
          ol_height_list[key] = $imgs.height();
        });
      }
      var tmp_list = ol_height_list.slice();//不污染原数组
      return tmp_list;
    }


    var border = 10;//边框值
    var sHeight = getStandardHeight();
    var rWidth = getContainerWidth() + 2*border;
    var $container = getContainer();
    var $items = getItems();
    var widthAry = get_ol_width_list()
    var heightAry = get_ol_height_list();
    var itemsLen = $items.length||0;

    if(itemsLen==0){
      var $para = $("<p>不好意思，你还没有上传图片哦，赶快上传试试吧！</p>");
      $para.css({"font-size":"18px","text-align":"center"});
      $container.append($para);
    }
    else{
      //记录每个图片转化后的高度
      for(var i = 0; i < itemsLen ; i++){
        if(heightAry[i] != sHeight){
          widthAry[i] = Math.round(widthAry[i]*(sHeight/heightAry[i]));
          heightAry[i] = sHeight;
        }
      }

      //创建每行父容器，并寻找各自子节点
      $(".accordant-row").remove();//清楚旧容器
      var rowWidth = 2*border;//记录每行宽度，初始为容器左右padding宽
      var i = 0,j = 0;
      var rowDivs = new Array();
      var rowSonsLen = new Array();
      while(i < itemsLen){
        var rowDiv = $("<div></div>");
        rowDiv.attr("class","accordant-row");
        rowDiv.css({ 'position': 'relative', 'width': rWidth, 'left': "-10px"})
        rowSonsLen[j] = 0;
        for(i ; i < itemsLen ;i ++){
          rowWidth += widthAry[i]+2*border;
          rowDiv.append($items[i]);
          rowSonsLen[j] += 1;
          //装不下下一个图片则保存该行，然后继续下一行
          if(i+1<itemsLen&&(rowWidth+widthAry[i+1]+2*border)>rWidth){
            rowDivs[j++] = rowDiv;
            rowWidth = 2*border;
            i++;
            break;
          }
          else if(i+1==itemsLen){
            rowDivs[j] = rowDiv;
          }
        }
      }

      var rowDivsLen = rowDivs.length;
      //只有1行不做调整
      if(rowDivsLen>1){
        //计算调整后差距
        var rowTotalWidth = 0;
        var restAry = new Array();
        var j = 0;//记录宽度数组下标
        var maxLen = 0;
        var containerWidth = 0;
        for(var i = 0 ; i < rowDivsLen ; i++){
          var k = j;
          containerWidth = rWidth;
          rowTotalWidth = 0;
          maxLen += rowSonsLen[i];
          for(j ; j < maxLen ; j++){
            rowTotalWidth += widthAry[j];
            containerWidth -= 2 * border;
          }
          //比例=目标宽度/实际宽度=目标高度/实际高度
          //var rate = parseFloat(containerWidth/rowTotalWidth);
          var afterHeight = Math.round(parseFloat(sHeight*containerWidth/rowTotalWidth));
          heightAry[i] = afterHeight;
          restAry[i] = 0;
          //算出高度列表后再更新宽度列表
          for(k ; k < maxLen ; k++){
            widthAry[k] = Math.round(parseFloat(widthAry[k]*afterHeight/sHeight));
            restAry[i] += widthAry[k]+2*border;//调整后宽度
          }
        }
        //调整最后间距
        var gap = 0;//间距值
        var acIndex = 0;
        for (var i = 0; i < rowDivsLen; i++) {
          gap = rWidth - restAry[i];
          //小于容器宽度
          if(gap > 0){
            while(gap!=0){
              var j = 0;
              widthAry[acIndex+j] = widthAry[acIndex+j] + 1;
              gap--;
              j = (j + 1 + rowSonsLen[i]) % rowSonsLen[i];
            }
          }
          //大于容器宽度
          else if(gap < 0){
            while(gap!=0){
              var j = 0;
              widthAry[acIndex+j] = widthAry[acIndex+j] - 1;
              gap++;
              j = (j + 1 + rowSonsLen[i]) % rowSonsLen[i];
            }
          }
          acIndex += rowSonsLen[i];
        };      
      }

      //把宽度和高度列表赋予图片
      var i = 0 , j = 0;
      $.each($items,function(key,val){
        $(this).css({"width":widthAry[key],"height":heightAry[i],"margin":border});
        var $img = $(this).find("img");
        $img.css({"width":widthAry[key],"height":heightAry[i],"display":"inline-block"});
        if(j<rowSonsLen[i]-1){
          j++;
        }
        else{
          i++;
          j=0;
        }
      });

      //$container.css("padding","0 "+border+"px");
      $container.prepend(rowDivs);

      //有如下情况则舍弃一行
      //1）原始宽高比与转换后宽高比大于rate;
      //2）转换后宽度大于原始宽度1.5倍
      //3）转换后高度大于原始高度1.5倍
      var $lastImgs = $container.find("img");
      var rate=1;
      var heightRaw=0,heightNow=0,widthRaw=0,widthNow=0;
      $.each($lastImgs,function(key,val){
        heightRaw = parseFloat(ol_height_list[key]/ol_width_list[key]);
        heightNow = parseFloat($(this).height()/$(this).width());
        widthRaw = parseFloat(ol_width_list[key]/ol_height_list[key]);
        widthNow = parseFloat($(this).width()/$(this).height());
        if(Math.abs(heightRaw - heightNow)>rate||Math.abs(widthRaw - widthNow)>rate||ol_height_list[key]*1.5<$(this).height()||ol_width_list[key]*1.5<$(this).width()){
          $(this).parents(".row").css("display","none");
        }
      });

      //判断相片描述和相片时间是否拦截和隐藏，规则：相片宽度-两边padding-操作占宽=剩余宽度>80则拦截,小于则隐藏
      var $lastItems = $container.find(".item");
      var padding = 15;
      $.each($lastItems,function(key,val){
        tmpItemWidth = $(this).width();
        $(this).find(".item-description").css("width",tmpItemWidth-padding*2);
      });
    }
  }
})()