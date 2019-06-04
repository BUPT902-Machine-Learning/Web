<template>
  <div class="fillcontain">
    <div class="app-head">
      <div class="app-head-inner">
        <div class="head-nav">
          <ul class="nav-list">
            <li class="nav-pile" @click="logout()">
              注销
            </li>
            <img src = "../assets/client.jpg" align = "left">
            <li class="nav-pile">{{this.account}}</li>
            <li class="nav-pile" @click="myModelBase()">
              我的模型库
              </li>
          </ul>
        </div>  
      </div>
    </div>
    <div class="main_container">
      <div class="model_part">
        <img class = "model_pic" src = '../assets/steam.png'  style="width:80px;height:80px;">
        <span style="font-size:25px">{{modelName}}</span>
      </div>

      <div class="test_block">
        <el-form ref="test_data" label-width="120px">
          <el-form-item label="测试数据">
            <el-form label-width="80px" :model="valueForm" :rules="valueRule" ref="valueForm">
              <template v-for="(item, index) in valueForm.valueData">
                <el-form-item v-if="item.type == 1" :label="item.value" :prop="'valueData.' + index +'.inputValue'" :rules="valueRule.inputRule" style="width:300px;margin-bottom: 20px">
                  <el-input v-model.number="item.inputValue"></el-input>
                </el-form-item>
                <el-form-item v-if="item.type == 0" :label="item.value" :prop="'valueData.' + index +'.inputValue'" :rules="valueRule.selectRule" style="width:300px;margin-bottom: 20px">
                  <el-select v-model="item.inputValue" placeholder="数值选择" :disabled="isReadonly" style="width:100%">
                    <template v-for="(select,index2) in item.multiSelect">
                      <el-option :key="select" :value=index2 :label="select"></el-option>
                    </template>
                  </el-select>
                </el-form-item>
              </template>
            </el-form>
            <el-button type="success" @click="confirmTestSubmit()">提交测试</el-button>
          </el-form-item>
        </el-form>

        <el-form label-width="120px">
          <el-form-item label="测试结果">
            <el-col :span=8>
              <span>{{test_output}}</span>
            </el-col>
          </el-form-item>
        </el-form>

        <el-form label-width="120px">
            <el-form-item label="测试用时">
                <el-col :span=8>
                  <span>{{test_time}}</span>
                </el-col>
            </el-form-item>
        </el-form>       
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import { apiUrl } from '../utils/apiUrl';
import { mapActions, mapState, mapGetters } from "vuex";

  export default {
    data() {
      return {
        account: '',
        role: '',
        modelbasePath: '',
        token: '',
        sessionid: '',
        valueForm:{
          valueData:[]
        },
        isSuccess: false,
        isKNN: false, 
        isCNN: false,
        isRNN: false,
        ruleForm:{
          isPublic:''
        },
        param:{},
        dynamicTags:[],
        isChange: 0,    //全局变量，用于判断数据表格是否发生变动
        modelName: '',  //模型名
        trainType: '',  //训练数据类型(文本)
        addTagVisible:false,
        editVisible: false,
        addVisible: false,
        addTestData: false,
        editDev: {
          label: '',
          content: [],
        },
        addDev: {
          label: '',
          contents:[]
        },
        tableData: [],
        paginations: {
          page_index: 1, // 当前位于哪页
          total: 0, // 总数
          page_size: 5, // 1页显示多少条
          page_sizes: [1, 5, 10, 15, 20], //每页显示多少条
          layout: "total, sizes, prev, pager, next, jumper" // 翻页属性
        },
        postData:{
        },
        outputData: [
        ],//存放训练模型的输出结果
        test_data: [],
        test_output:'',
        test_time:'',
        trainUrl: '',
        testUrl: '',
        valueRule:{
          inputRule:[
            { required: true, message: '请输入数值', trigger: 'blur' },
            { type: 'number', message: '输入必须为数值', trigger: 'blur' }
          ],
          selectRule:[
            {
              required: true,
              trigger: 'change',
              message: '请选择值'
            }
          ]
        },
        rules1:{
          isPublic:[
            {
              required: true,
              trigger: 'change',
              message: '请选择模型权限'
            }
          ],
          algoSelect:[
            {
              required: true,
              trigger: 'change',
              message: '请选择算法'
            }
          ]
        },
        rules2: {
          embedding_dim: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          num_filters: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          kernel_size: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1||value>5) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          fully_connected_dim: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          dropout_keep_prob: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>1||value<0) {
                    callback('数值超出范围');
                  } 
                  else if((/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/).test(value) == false) {
                    callback('请输入数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          batch_size: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          num_epochs: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          num_layers: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>2||value<1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          hidden_dim: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>128||value<1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          rnn_type: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value != 0 && value != 1) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          k: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>7||value<2) {
                    callback('数值超出范围');
                  } 
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ]
        }
      }
    },
    computed: {
      ...mapGetters([
        'getValueData'
      ]),
    },
    mounted(){
      const self = this;
      self.modelName = self.$route.params.modelName;
       //从cookie中获取token、username、sessionid三个参数
      var csrfTokenName = "csrftoken=";
      var tokenName = "token=";
      var userName = "username=";
      var sessionId = "sessionid=";
      var classId = "class_id=";
      var role = "role=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(tokenName) != -1){
          if(c.indexOf(csrfTokenName) != -1){
            self.csrfToken = c.substring(csrfTokenName.length, c.length);
          }
          else{
            self.token = c.substring(tokenName.length, c.length);
          }
        }
        if(c.indexOf(userName) != -1){
          self.account = decodeURIComponent(c.substring(userName.length, c.length));
        }
        if(c.indexOf(sessionId) != -1){
          self.sessionId = c.substring(sessionId.length, c.length);
        }
        if(c.indexOf(classId) != -1){
          self.classId = c.substring(classId.length, c.length);
        }
        if(c.indexOf(role) != -1){
          self.role = c.substring(role.length, c.length);
        }
      }

      var uData = JSON.stringify({
        username:self.account,
        role:self.role,
        token:self.token,
        sessionid:self.sessionId,
        class_no:self.classId
      })
      if(self.role == "teacher"){
        this.modelbasePath = "/modelbaseTeacher";
      }
      else{
        self.modelbasePath = "/modelbaseStudent";
      }
      axios.post(apiUrl.loginCheck,uData,{
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        /**When logincheck is failed, turn to tuopinpin.com */
        if(response.data.code != 1){
          alert(response.data.message);
          window.location.href = "https://homepagetest.tuopinpin.com/";
        }
      }).catch(function (error) {
        console.log(error);
      });
      var uData = JSON.stringify({
        username:self.account,
        modelName:self.modelName
      })
      axios.post(apiUrl.testModelGetValue,uData,{
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        self.valueForm.valueData = JSON.parse(JSON.stringify(response.data.valueData));
      }).catch(function (error) {
        console.log(error);
      });
    },
    methods: {
      myModelBase(){
        /** 我的模型库跳转函数 */
        const self = this;
        var username = self.account;
        if(username == ""){
          alert("您尚未登录");
        }
        else{
          self.$router.push(this.modelbasePath);
        }
      },
      logout(){
        /** 注销函数 */
        const self = this;
        self.isLog = false;
        this.ifShow = false;
        window.location.href = "https://homepagetest.tuopinpin.com/";
        this.ifShow = true;
      },

      confirmTestSubmit(){
        /** 模型测试提交函数 */
        this.$refs["valueForm"].validate((valid) => {
          if (valid) {
            this.test_data = [];
            var username = this.account;
            for (var item of this.valueForm.valueData){
              this.test_data.push(item.inputValue);
            }
            var tData = JSON.stringify({
              username:username,
              modelName:this.modelName,
              testData:this.test_data
            })
            axios.post(apiUrl.numbersTestModel,tData,{
              headers:{"Content-Type": "application/json;charset=utf-8"}
            })
              .then(function (response) {
                this.test_output = response.data.prediction;
                this.test_time = response.data.time;
              }.bind(this))
              .catch(function (error) {
                console.log(error);
              });
          }
        });
      }
    }
  }

</script>

<style>
  .model_part{
    margin-top: -120px;
  }
  .main_container{
    margin-top: 30px;
    margin-left: 150px;
    margin-right: 150px;
  }
  .model_pic{
    margin-top: 130px;
  }
  .notes{
    margin-left: 10px;
    color:#999999;
  }
  .top_train_block{
    margin-top: 30px;
    margin-left: 130px;
  }
  .mid_block{
    margin-top: -20px;
    margin-left: 130px;
  }
  .foot_block{
    margin-top: 30px;
    margin-left: 130px;
  }
  .test_block{
    margin-top: 30px;
    margin-left: 130px;
  }
</style>
