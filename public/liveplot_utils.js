(function(window){
  window.utils = {
    parseQueryString: function(str) {
      var ret = Object.create(null);

      if (typeof str !== 'string') {
        return ret;
      }

      str = str.trim().replace(/^(\?|#|&)/, '');

      if (!str) {
        return ret;
      }

      str.split('&').forEach(function (param) {
        var parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        var key = parts.shift();
        var val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
          ret[key] = val;
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val);
        } else {
          ret[key] = [ret[key], val];
        }
      });

      return ret;
    }
  };
})(window);


function getTimeElapsedString(unix_start_timestamp){
  var min_elapsed = Math.round((Date.now() / 1000  - unix_start_timestamp/1000 )/ 60 )
  if (min_elapsed >= 60){
        var min_elapsed_string = Math.floor(min_elapsed/60)+':' + min_elapsed % 60 +' h'
    }
    else{
        var min_elapsed_string = min_elapsed+' min'
    }
  return min_elapsed_string
}

function unix_timestamp_in_seconds_to_string(sec){
  var t = new Date(sec * 1000);
  var hours = t.getHours()
  var minutes = t.getMinutes()
  var seconds = t.getSeconds()
  console.log(hours, minutes, seconds) 
  return 
}

function smooth(data,n){
  var smoothed_data=[];
  for (var i=0; i<=data.length-1; i++){
    if (i<n-1){
      smoothed_data[i]=data[i];
    }
    else{
      var sub = data.slice(i-n+1,i+1);
      smoothed_data[i] = sub.reduce(function(a,b){return a + b;}) / n;
    }
  }
  return smoothed_data;
}

function mean(data){
  var sum = data.reduce(function(a, b) { return a + b; });
  var avg = sum / data.length;
  return avg 

}

function sum(data){
  var sum = data.reduce(function(a, b) { return a + b; });
  
  return sum 
}

//polyfill for array.prototype.fill
if (!Array.prototype.fill) {
  Array.prototype.fill = function(value) {
    if (this == null) {
      throw new TypeError('this is null or not defined');
    }
    var O = Object(this);
    var len = O.length >>> 0;
    var start = arguments[1];
    var relativeStart = start >> 0;
    var k = relativeStart < 0 ?
      Math.max(len + relativeStart, 0) :
      Math.min(relativeStart, len);
    var end = arguments[2];
    var relativeEnd = end === undefined ?
      len : end >> 0;
    var final = relativeEnd < 0 ?
      Math.max(len + relativeEnd, 0) :
      Math.min(relativeEnd, len);
    while (k < final) {
      O[k] = value;
      k++;
    }
    return O;
  };
}
//================== UTILS (end) ==================//

