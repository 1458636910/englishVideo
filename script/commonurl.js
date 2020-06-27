var url = 'http://nv.s3.li4.cn/api/'    //测试地址
var img_url = 'http://nv.s3.li4.cn/'    //个别图片后台没有自动匹配AP,需要自行添加

var socketUrl = 'ws://ym.s.li4.cn:1936'   //聊天的地址，全局设置
var shareurl = 'http://nv.s3.li4.cn/register/'   //前台分享的链接地址


//提醒用户设置权限 ，不然个别会提醒：请插入SD卡
function reqPermission(one_per, callback) {
    var perms = new Array();
    if (one_per) {
        perms.push(one_per);
    } else {
        var prs = document.getElementsByName("p_list_r");
        for (var i = 0; i < prs.length; i++) {
            if (prs[i].checked) {
                perms.push(prs[i].value);
            }
        }
    }
    api.requestPermission({
        list: perms,
        code: 100001
    }, function(ret, err) {
        if (callback) {
            callback(ret);
            return;
        }
        var str = 'Request result：\n';
        str += 'Request code: ' + ret.code + '\n';
        str += "Whether to check\"No more asking\"Button: " + (ret.never ? 'YES' : 'No') + '\n';
        str += 'Request result: \n';
        var list = ret.list;
        for (var i in list) {
            str += list[i].name + '=' + list[i].granted + '\n';
        }
        apialert(str);
        console.log(JSON.stringify(ret));
    });
}
function hasPermission(one_per) {
    var perms = new Array();
    if (one_per) {
        perms.push(one_per);
    } else {
        var prs = document.getElementsByName("p_list");
        for (var i = 0; i < prs.length; i++) {
            if (prs[i].checked) {
                perms.push(prs[i].value);
            }
        }
    }
    var rets = api.hasPermission({
        list: perms
    });
    if (!one_per) {
        apialert('critical result：' + JSON.stringify(rets));
        return;
    }
    return rets;
}
//提醒用户去打开权限的弹框
function confirmPer(perm) {
    var has = hasPermission(perm);
    if (!has || !has[0] || !has[0].granted) {
        api.confirm({
            title: '',
            msg: "Place allow use of this device’"+perm,
            buttons: ['Setting', 'Cancel']
        }, function(ret, err) {
            if (1 == ret.buttonIndex) {
                reqPermission(perm);
            }
        });
        return false;
    }
    return true;
}


function loadImg(obj){
  // javascript:this.src=item.img
  if (obj.alt) {
    obj.src = obj.alt
  }else {
    obj.src = '../image/errorimg.png'
  }

  // alert(obj.src)
}
function formatDate(now) {
  var month=now.getMonth()+1;  //取得日期中的月份，其中0表示1月，11表示12月
  var date=now.getDate();      //返回日期月份中的天数（1到31）
  var hour=now.getHours();     //返回日期中的小时数（0到23）
  var minute=now.getMinutes(); //返回日期中的分钟数（0到59）
  var second=now.getSeconds(); //返回日期中的秒数（0到59）
  return month+"/"+date+" "+hour+":"+minute+":"+second;
}

//--------------移动端点击延迟事件-------------//
if ('addEventListener' in document) {
    document.addEventListener('DOMContentLoaded', function() {
        FastClick.attach(document.body);
    }, false);
}

//--------------ios input失效处理-------------//
FastClick.prototype.focus = function(targetElement) {
 var length;
 if (api.systemType == 'ios') {
   var deviceIsIOS = true;
 }else {
   var deviceIsIOS = false;
 }
// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
 if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
  length = targetElement.value.length;
     targetElement.focus();
  targetElement.setSelectionRange(length, length);
 } else {
  targetElement.focus();
 }
}
//--------------ios input失效处理-------------//
//--------------移动端点击延迟事件-------------//

function goPaypalUrl(e){
  var systemType = api.systemType;
  if (systemType == 'ios') {
    api.openApp({
      iosUrl: e, //打开微信的，其中weixin为微信的URL Scheme
    });
  }else {
    console.log("paypal支付地址",e)
    api.openWin({
        name: 'paypal_win',
        url: 'widget://html/common/paypal_win.html',
        pageParam: {
            url:e
        }
    });

    // api.openApp({
    //     androidPkg: 'android.intent.action.VIEW',
    //     mimeType: 'text/html',
    //     uri: e
    // },function(ret,err){
    //   console.log(JSON.stringify(ret));
    // });
  }
}

//显示loading
function pubshowloading(title,etxt){
  var tit;
  var txt;
  if (tit) {
    tit = title
  }else {
    tit = '';
  }
  if (etxt) {
    txt = etxt
  }else {
    txt = '';
  }
  api.showProgress({
      style: 'default',
      animationType: 'fade',
      title: tit,
      text: txt,
      modal: true
  });
}
//关闭loading
function pubhideloading(){
  api.hideProgress();
}

//打印调试数据
function datadebug(e){
  // api.alert({
  //     title: '调试数据',
  //     msg: e,
  // }, function(ret, err){
  //     if( ret ){
  //         //  alert( JSON.stringify( ret ) );
  //     }else{
  //         //  alert( JSON.stringify( err ) );
  //     }
  // });

}
function requstPost(apiUrl,data,success,fail){
  var token;
    if ($api.getStorage('token')) {
        token = $api.getStorage('token');
    } else {
        token = "";
    }
    // data.token = token;
    console.log(token);
    api.ajax({
        url: url+apiUrl,
        method: 'post',
        headers:{
          token:token
        },
        data: {
            values:data
        }
    },function(ret, err){

      api.refreshHeaderLoadDone();
      api.hideProgress();
      if (ret) {
        //ret
        if (ret.code == -1) {
          //登陆失效
          api.toast({
              msg: 'Login is invalid',
              duration: 3000,
              location: 'middle'
          });
          $api.clearStorage();
          setTimeout(()=>{
            api.openWin({
                name: 'login_win',
                url: 'widget://html/login_win.html',
                pageParam: {
                    name: 'test'
                }
            });
          },2000)
          console.log('ret接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }else if(ret.code == 0){
          success(ret)
          console.log('ret接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }else {
          if(apiUrl == 'store' || apiUrl == 'cart'||apiUrl=='live'||apiUrl=='anchor/all'||apiUrl=='video'||apiUrl=='video/category'||apiUrl=='product/recommend'||apiUrl=='news/category'||apiUrl=='news'){

          }else {
            api.toast({
                msg: ret.message,
                duration: 3000,
                location: 'middle'
            });
          }

          success(ret)
          console.log('ret接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }
      }else {
        //err
          api.toast({
              msg: err.message,
              duration: 3000,
              location: 'middle'
          });
        console.log('err接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'::::返回结果'+JSON.stringify(err));
        fail(err);
      }

    });
}
function requstGet(apiUrl,data,success,fail){
  var token;
    if ($api.getStorage('token')) {
        token = $api.getStorage('token');
    } else {
        token = "";
    }
    api.ajax({
        url: url+apiUrl,
        method: 'get',
        cache:true,
        headers:{
          token:token
        },
        data: {
            values: data
        }
    },function(ret, err){
      api.hideProgress();
      api.refreshHeaderLoadDone();

      if (ret) {
        //ret
        if (ret.code == -1) {
          //登陆失效
          api.toast({
              msg: 'Login is invalid',
              duration: 3000,
              location: 'middle'
          });
          $api.clearStorage();
          // $api.clearStorage();
          setTimeout(()=>{
            api.openWin({
                name: 'login_win',
                url: 'widget://html/login_win.html',
                pageParam: {
                    name: 'test'
                }
            });
          },2000)
          console.log('ret接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }else if(ret.code == 0){
          success(ret)
          console.log('ret接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }else {
          api.toast({
              msg: ret.message,
              duration: 3000,
              location: 'middle'
          });
          console.log('ret接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }
      }else {
        //err
        api.toast({
            msg: err.msg,
            duration: 3000,
            location: 'middle'
        });
        console.log('err接口地址:'+apiUrl+'请求数据:'+JSON.stringify(data)+'::::返回结果'+JSON.stringify(err));
        fail(err);
      }
    });
}



function requstUpload(data,success,fail){
  var token;
    if ($api.getStorage('token')) {
        token = $api.getStorage('token');
    } else {
        token = "";
    }
    data.token = token;
    console.log(token+'==========='+data)
    api.ajax({
        url: url+'upload',
        method: 'post',
        cache:true,
        headers:{
          token:token
        },
        data: {
            files: {
              file:data
              // 'file[]': '/var/mobile/Containers/Data/Application/9E5DDCA3-9D17-413E-B643-8772A2934F56/Library/Caches/APICloud/Cache/getPicture/19DA1C4A-AF21-46CD-849C-E1C856BB3952-20109-00000AFE3471B3DF.jpg',
              // 'file[]': '/var/mobile/Containers/Data/Application/9E5DDCA3-9D17-413E-B643-8772A2934F56/Library/Caches/APICloud/Cache/getPicture/19DA1C4A-AF21-46CD-849C-E1C856BB3952-20109-00000AFE3471B3DF.jpg',
            }
        }
    },function(ret, err){
      api.hideProgress();
      if (ret) {
        //ret
        if (ret.code == -1) {
          //登陆失效
          api.toast({
              msg: 'Login is invalid',
              duration: 3000,
              location: 'middle'
          });
          // $api.clearStorage();
          setTimeout(()=>{
            api.openWin({
                name: 'login_win',
                url: 'widget://html/login_win.html',
                pageParam: {
                    name: 'test'
                }
            });
          },2000)
          console.log('ret接口地址:'+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }else if(ret.code == 0){
          success(ret)
          console.log('ret接口地址:'+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }else {
          api.toast({
              msg: ret.message,
              duration: 3000,
              location: 'middle'
          });
          console.log('ret接口地址:'+'请求数据:'+JSON.stringify(data)+'---返回结果:'+JSON.stringify(ret));
        }
      }else {
        //err
        api.toast({
            msg: err.msg,
            duration: 3000,
            location: 'middle'
        });
        console.log('err接口地址:'+'请求数据:'+JSON.stringify(data)+'::::返回结果'+JSON.stringify(err));
        fail(err);
      }
    });
}

///判断是否登录
function userIslogin(){
  var userlogin = $api.getStorage('islogin');
  console.log('登录状态'+userlogin);

    api.confirm({
        title: 'Please log in first',
        msg: '',
        buttons: ['Sure', 'Cancel']
    }, function(ret, err){
        if( ret ){
          if (ret.buttonIndex == 1) {
            api.openWin({
                name: 'login_win',
                url: 'widget://html/login_win.html',
                pageParam: {
                    name: 'test'
                }
            });
          }else {
            api.execScript({
                name: 'douyin_win',
                // frameName: 'frmName',
                script: 'startPlay();'
            });
            api.execScript({
                name: 'live_win',
                // frameName: 'frmName',
                script: 'playLive();'
            });
          }
            //  alert( JSON.stringify( ret ) );
        }else{
            //  alert( JSON.stringify( err ) );
        }
    });

}

//图片缓存
function catchImg(e){
  var listData = e;
  var _this = this;
  for (i in listData) {
      api.imageCache({
          url: listData[i].image_url,
          tag: i
      }, function(ret, err) {
        // console.log(JSON.stringify(ret));
          listData[ret.tag].image_url = ret.url;
      });
  }
}











var emotions = [{
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_1.png'>",
    "text": "[微笑]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_2.png'>",
    "text": "[撇嘴]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_3.png'>",
    "text": "[色]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_4.png'>",
    "text": "[发呆]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_5.png'>",
    "text": "[得意]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_6.png'>",
    "text": "[流泪]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_7.png'>",
    "text": "[害羞]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_8.png'>",
    "text": "[闭嘴]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_9.png'>",
    "text": "[睡]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_10.png'>",
    "text": "[大哭]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_11.png'>",
    "text": "[尴尬]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_12.png'>",
    "text": "[发怒]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_13.png'>",
    "text": "[调皮]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_14.png'>",
    "text": "[呲牙]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_15.png'>",
    "text": "[惊讶]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_16.png'>",
    "text": "[难过]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_17.png'>",
    "text": "[酷]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_18.png'>",
    "text": "[冷汗]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_19.png'>",
    "text": "[抓狂]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_20.png'>",
    "text": "[吐]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_21.png'>",
    "text": "[偷笑]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_22.png'>",
    "text": "[愉快]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_23.png'>",
    "text": "[白眼]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_24.png'>",
    "text": "[傲慢]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_25.png'>",
    "text": "[饥饿]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_26.png'>",
    "text": "[困]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_27.png'>",
    "text": "[恐惧]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_28.png'>",
    "text": "[流汗]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_29.png'>",
    "text": "[憨笑]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_30.png'>",
    "text": "[悠闲]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_31.png'>",
    "text": "[奋斗]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_32.png'>",
    "text": "[咒骂]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_33.png'>",
    "text": "[疑问]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_34.png'>",
    "text": "[嘘]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_35.png'>",
    "text": "[晕]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_36.png'>",
    "text": "[疯了]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_37.png'>",
    "text": "[衰]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_38.png'>",
    "text": "[骷髅]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_39.png'>",
    "text": "[敲打]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_40.png'>",
    "text": "[再见]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_41.png'>",
    "text": "[擦汗]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_42.png'>",
    "text": "[抠鼻]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_43.png'>",
    "text": "[鼓掌]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_44.png'>",
    "text": "[糗大了]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_45.png'>",
    "text": "[坏笑]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_46.png'>",
    "text": "[左哼哼]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_47.png'>",
    "text": "[右哼哼]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_48.png'>",
    "text": "[哈欠]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_49.png'>",
    "text": "[鄙视]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_50.png'>",
    "text": "[委屈]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_51.png'>",
    "text": "[快哭了]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_52.png'>",
    "text": "[阴险]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_53.png'>",
    "text": "[亲亲]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_54.png'>",
    "text": "[吓]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_55.png'>",
    "text": "[可怜]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_56.png'>",
    "text": "[菜刀]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_57.png'>",
    "text": "[西瓜]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_58.png'>",
    "text": "[啤酒]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_59.png'>",
    "text": "[篮球]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_60.png'>",
    "text": "[乒乓]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_61.png'>",
    "text": "[咖啡]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_62.png'>",
    "text": "[饭]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_63.png'>",
    "text": "[猪头]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_64.png'>",
    "text": "[玫瑰]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_65.png'>",
    "text": "[凋谢]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_66.png'>",
    "text": "[嘴唇]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_67.png'>",
    "text": "[爱心]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_68.png'>",
    "text": "[心碎]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_69.png'>",
    "text": "[蛋糕]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_70.png'>",
    "text": "[闪电]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_71.png'>",
    "text": "[炸弹]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_72.png'>",
    "text": "[刀]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_73.png'>",
    "text": "[足球]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_74.png'>",
    "text": "[瓢虫]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_75.png'>",
    "text": "[便便]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_76.png'>",
    "text": "[月亮]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_77.png'>",
    "text": "[太阳]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_78.png'>",
    "text": "[礼物]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_79.png'>",
    "text": "[拥抱]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_80.png'>",
    "text": "[强]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_81.png'>",
    "text": "[弱]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_82.png'>",
    "text": "[握手]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_83.png'>",
    "text": "[胜利]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_84.png'>",
    "text": "[抱拳]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_85.png'>",
    "text": "[勾引]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_86.png'>",
    "text": "[拳头]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_87.png'>",
    "text": "[差劲]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_88.png'>",
    "text": "[爱你]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_89.png'>",
    "text": "[不]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_90.png'>",
    "text": "[好的]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_91.png'>",
    "text": "[爱情]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_92.png'>",
    "text": "[飞吻]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_93.png'>",
    "text": "[跳跳]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_94.png'>",
    "text": "[发抖]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_95.png'>",
    "text": "[怄火]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_96.png'>",
    "text": "[转圈]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_97.png'>",
    "text": "[磕头]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_98.png'>",
    "text": "[回头]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_99.png'>",
    "text": "[跳绳]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_100.png'>",
    "text": "[投降]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_101.png'>",
    "text": "[激动]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_102.png'>",
    "text": "[街舞]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_103.png'>",
    "text": "[献吻]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_104.png'>",
    "text": "[左太极]"
},              {
    "src": "<img width='20' class='aui-inline' src='../image/emotion/Expression_105.png'>",
    "text": "[右太极]"
}    ];
