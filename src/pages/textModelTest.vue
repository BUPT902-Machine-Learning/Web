<template>
  <div class="fillcontain">
    <div class="app-head">
      <div class="machine-learning">
        <img class="machine-learning-img" src="../assets/images/machine_learning.svg">
        <span class="machine-learning-text">Machine Learning</span>
      </div>
      <div class="app-head-inner">
        <div class="head-nav">
          <ul class="nav-list">
            <img src = "../assets/client.jpg" align = "left">
            <li class="nav-pile">欢迎，{{this.account}}</li>
            <el-button type="danger" size="small" @click="logout()">
              注销
            </el-button>
            <el-button type="warning" size="small" @click="myModelBase()">
              我的模型库
            </el-button>
          </ul>
        </div>
      </div>
    </div>
    <div class="main_container">
      <div class="model_part">
        <img class="model_type" src = '../assets/images/name.png'  style="width:40px;height:40px;margin-right: 30px;">
        <span class="model_type">{{modelName}}</span>
        <img class="model_type" src = '../assets/images/type.png'  style="width:40px;height:40px;margin-left: 150px;margin-right: 30px">
        <span class="model_type">文本</span>
      </div>

      <div class="test_block">
        <el-form :model="inputTestData" :rules="testDataRules" ref="inputTestData"  label-width="120px">
          <el-form-item label="测试数据" prop="testData">
            <el-col :span=8>
              <el-input  v-model="inputTestData.testData" placeholder="请输入测试数据"></el-input>
            </el-col>
            <el-button type="success" @click="confirmTestSubmit()">提交测试</el-button>
          </el-form-item>
        </el-form>

        <el-form label-width="120px">
          <el-form-item label="测试结果">
            <el-col :span=8>
              <span>{{testOutput}}</span>
            </el-col>
          </el-form-item>
        </el-form>

        <el-form label-width="120px">
            <el-form-item label="测试用时">
                <el-col :span=8>
                  <span>{{testTime}}</span>
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
  export default {
    data() {
      return {
        /** modeltest 数据*/
        account: '',                //用户名
        role: '',                   //用户身份
        testModelBuilder: '',       //测试模型创建者（还没拿到）
        modelbasePath: '',          //我的模型路路径
        token: '',                  //登录标识
        sessionId: '',              //会话ID
        isKNN: false,               //是否为KNN模型
        isCNN: false,               //是否为CNN模型
        isRNN: false,               //是否为RNN模型
        modelName: '',              //模型名
        inputTestData:{
          testData: ''              //测试数据
        },
        testOutput:'',              //测试结果
        testTime:'',                //测试用时
        csrfToken: '',              //CSRF标识
        classId: '',                 //用户所在班级号
        testDataRules:{
          testData:[
            {required: true, message: '请输入测试数据', trigger: 'blur'}
          ]
        }
      }
    },
    mounted(){
      const self = this;
      self.modelName = self.$route.params.modelName;
      self.testModelBuilder = self.$route.params.userName;
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
        if(this.role == "teacher"){
          //说明该用户为教师
          this.modelbasePath = "/modelbaseTeacher";
        }
        else{
          this.modelbasePath = "/modelbaseStudent";
        }
        axios.post(apiUrl.loginCheck,uData,{    
            headers:{"Content-Type": "application/json;charset=utf-8"}
        }).then(function (response) {
            /**When logincheck is failed, turn to tuopinpin.com */
            if(response.data.code != 1){
              this.$message({
                type: 'info',
                message: response.data.message
              });
                window.location.href = "https://homepagetest.tuopinpin.com/";
            }
        }).catch(function (error) {
            console.log(error);
        });

    },
    methods: {
      myModelBase(){
        const self = this;
        var username = self.account;
        if(username == ""){
          this.$message({
            type: 'info',
            message: "您尚未登录"
          });
          window.location.href = "https://homepagetest.tuopinpin.com/";
        }
        else{
          self.$router.push(this.modelbasePath);
        }
      },

      logout(){
        /** 注销函数 */
        window.location.href = "https://homepagetest.tuopinpin.com/";
      },

      confirmTestSubmit(){
        /** 模型测试提交函数 */
        const self = this;
        this.$refs["inputTestData"].validate((valid) => {
          if (valid) {
            const loading = this.$loading({
              lock: true,
              text: '正在预测，请稍候...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            });
            var tData = JSON.stringify({
              username:self.testModelBuilder,
              modelName:self.modelName,
              testData:self.inputTestData.testData
            })
            axios.post(apiUrl.textTestModel,tData,{
              headers:{"Content-Type": "application/json;charset=utf-8"}
            }).then(function (response) {
              loading.close();
              self.testOutput = response.data.prediction;
              self.testTime = response.data.time;
            }).catch(function (error) {
              console.log(error);
            });
          }
        })
      }
    }
  }

</script>

<style>
  .machine-learning-img {
    margin: 10px 20px 0 60px;
    float:left;
    height: 70px;
  }
  .machine-learning-text{
    float:left;
    font-size: 2.5em;
    font-family:Tiger;
    margin-top: 10px;
    background: #EEE url(data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAHklEQVQImWNkYGBgYGD4//8/A5wF5SBYyAr+//8PAPOCFO0Q2zq7AAAAAElFTkSuQmCC) repeat;
    text-shadow: -5px -5px white, -4px -4px rgba(197, 223, 248,0.8);
    font-weight: bold;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
  }
  .model_part{
    margin: 0 100px 0 100px;
    height: 50px;
    border-bottom:3px solid #0086b3;
  }
  .main_container{
    margin-top: 30px;
    margin-left: 150px;
    margin-right: 150px;
  }
  .model_type{
    color: #00008b;
    font-size:2.0em;
    font-weight: 600;
    line-height:50px;
    float:left;
  }
  .notes{
    margin-left: 10px;
    color:#999999;
  }
  .top_train_block{
    margin-top: 30px;
    margin-right: 150px;
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
