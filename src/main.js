import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import resource from './resource';
import axios from 'axios'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import store from './store';
import http from './utils/httpAjax';
import router from './router';
import App from './App';
import './assets/icon/iconfont.css';

Vue.prototype.$ajax = axios;
Vue.config.productionTip = false;

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.use(http)
Vue.use(ElementUI);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  resource,
  template: '<App/>',
  components: { App },
  render: h => h(App)
})
