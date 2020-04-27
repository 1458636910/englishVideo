
//index.html  405
 //  <feature name="bMap">
 //   <param name="android_api_key" value="QoDo4S0DmYnHw0basctDnfY9rdkIwUwa" />
 //   <param name="ios_api_key" value="VGZ25tW5cuztAxyel9bjpjGwzMnFUrYF" />
 // </feature>
var map = api.require('bMap');
if (api.systemType == 'ios') {
    map.initMapSDK(function(ret) {
        if (ret.status) {
            // alert('地图初始化成功，可以从百度地图服务器检索信息了！');
            map.getLocation({
                accuracy: '100m',
                autoStop: true,
                filter: 1
            }, function(ret, err) {
                if (ret.status) {
                    // alert(JSON.stringify(ret));
                    map.getNameFromCoords({
                        lon: ret.lon,
                        lat: ret.lat
                            // lon: -6.2319940000,
                            // lat: 53.2936580000
                    }, function(ret, err) {
                        if (ret.status) {
                          setDress(ret.city)
                            // alert(JSON.stringify(ret));
                        }
                    });
                } else {
                    alert(err.code);
                }
            });

        }
    });
} else {
  map.getLocation({
      accuracy: '100m',
      autoStop: true,
      filter: 1
  }, function(ret, err) {
      if (ret.status) {
          // alert(JSON.stringify(ret));
          map.getNameFromCoords({
              lon: ret.lon,
              lat: ret.lat
              // lon: -6.2319940000,
              // lat: 53.2936580000
          }, function(ret, err) {
                  // alert(JSON.stringify(ret));
                  // alert(JSON.stringify(err));
              if (ret.status) {
                  // alert(JSON.stringify(ret));
                    setDress(ret.city)
              }
          });
      } else {
          alert(err.code);
      }
  });
}
