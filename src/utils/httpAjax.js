/**
 * Created by zeke on 2018-06-22.
 */
import Vue from 'vue'
import axios from 'axios';
import qs from 'qs';
import Promise from 'es6-promise';

Promise.polyfill();
var md5 = require('md5');

// axios 配置
axios.defaults.timeout = 300000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// POST传参序列化
axios.interceptors.request.use((config) => {
  let oldParams = config.data;
  let device = {type: 'PC', channelVersion: "1.0.0", deviceModel: 'Web', deviceName: 'Browser'};
  if(config.data==undefined||config.data==null) {
    return config;
  }
  if(config.data&&config.data["formFile"]) {
    let param = new FormData();
    param.append('file', config.data["formFile"]);
    config.data = param;
    return config;
  }
   if (config.method === 'post') {
    config.data = config.data;
  }
  return config;
}, (error) => {
  new Vue().$message('请求参数错误');
  return Promise.reject(error);
});

// 返回状态判断
axios.interceptors.response.use((res) => {
  if(res.data&&res.data.status) {
    if (res.data.status.code === 0 ||(res.data.status.code > 0&&res.data.status.code !== 10003)) {
      return res;
    }
    if (res.data.status.code < 0) {
      new Vue().$message(res.data.status.message);
    }
  }else{
    return res;
  }
  return Promise.reject(res);
}, (error) => {
  // 提示
  new Vue().$message("返回错误："+error.message);
  return Promise.reject(error);
});

function parseParam(param, key) {
  let paramStr="";
  if(typeof (param) == "string" || typeof (param) == "number" || typeof (param) == "boolean") {
    paramStr+="&" + key + "=" + param;
  } else {
    for(let i in param) {
      var k=key==null?i:key+(param instanceof Array ? "["+i+"]" : "."+i);
      paramStr += '&'+parseParam(param[i], k);
    }
  }
  return paramStr.substr(1);
};

function getSign(param, key) {
  let url = parseParam(param);
  let urlStr = url.split("&").sort().join("&");
  let urlParam = urlStr.split("&");
  let theRequest = [];
  let newStr = "";
  for(let i = 0; i < urlParam.length; i++) {
    newStr += urlParam[i].split("=")[1];
  }
  return md5(newStr);
}

export default {
  get(url, params, options) {
    let loadObj = null;
    var option = {
      isLoading: true
    };
    var token = window.localStorage;
    url = url + '&token=' + token.getItem("token");
    options = Object.assign(option, options);
    return new Promise((resolve, reject) => {
      if(options.isLoading) loadObj = loading();
      axios.get(url, {params:params}, options)
        .then(response => {
          if(options.isLoading) loadObj.close();
          resolve(response.data);
        }, (err) => {
          if(options.isLoading) loadObj.close();
          reject(err);
        })
        .catch((error) => {
          if(options.isLoading) loadObj.close();
          reject(error);
        });
    });
  },
  post(url, params, options) {
    let loadObj = null;
    var option = {
      isLoading: true
    };
    var token = window.localStorage;
    url = url + '&token=' + token.getItem("token");
    options = Object.assign(option, options);
    return new Promise((resolve, reject) => {
      if(options.isLoading) loadObj = loading();
      axios.post(url, params, options)
        .then(response => {
          if(options.isLoading) loadObj.close();
          resolve(response.data);
        }, (err) => {
          if(options.isLoading) loadObj.close();
          reject(err);
        })
        .catch((error) => {
          if(options.isLoading) loadObj.close();
          reject(error);
        });
    });
  },
  install: function (Vue) {
    Object.defineProperty(Vue.prototype, '$httpGet', {
      value: this.get
    });
    Object.defineProperty(Vue.prototype, '$httpPost', {
      value: this.post
    });
    Object.defineProperty(Vue.prototype, '$axios', {
      value: axios
    });
  }
};