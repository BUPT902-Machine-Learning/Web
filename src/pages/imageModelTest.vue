<template>
  <div class="fillcontain">
    <div class="app-head">
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
        <img class = "model_pic" src = '../assets/steam.png'  style="width:80px;height:80px;">
        <span style="font-size:25px">{{modelName}}</span>
      </div>

      <div class="test_block">
        <el-form ref="testData" label-width="120px">
          <el-form-item label="测试图片">
              <el-upload
                  name="img"
                  class="upload-demo"
                  action="http://127.0.0.1:8082/api/image/testImageModel/"
                  :show-file-list=true
                  :on-success="handleSuccess"
                  :on-change="handleChange"
                  :file-list="fileList"
                  :data="uploadData"
                  list-type="picture"

                  align="left">
                    <div class="selectImg" align="left"><el-button type="primary" @click="selectImg(item)">提交测试</el-button></div>
                </el-upload>
          </el-form-item>
        </el-form>

        <el-form label-width="120px">
          <el-form-item label="测试结果">
            <el-col :span=8>
              <span>{{testOutput}}</span>
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
        testData: '',               //测试数据
        testOutput:'',              //测试结果
        testTime:'',                //测试用时
        csrfToken: '',              //CSRF标识
        classId: '',                //用户所在班级号
        uploadData:{                //图片文件附属信息
          account: '',
          modelName: ''
        },
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
                alert(response.data.message);
                window.location.href = "https://homepagetest.tuopinpin.com/";
            }
        }).catch(function (error) {
            console.log(error);
        });
    },
    methods: {
        handleChange(file, fileList){
            if (fileList.length > 1){
                fileList.splice(0, 1);
            }
        },
        handleSuccess(response, file, fileList){
            const self = this;
            self.testOutput = response;
            self.uploadData = {};
        },
        selectImg(item){
            // 将模型名、标签名跟随图片文件传送到Django后端
            const self = this;
            self.uploadData.account = self.account;
            self.uploadData.modelName = self.modelName;
        },
        myModelBase(){
            const self = this;
            var username = self.account;
            if(username == ""){
                alert("您尚未登录");
                window.location.href = "https://homepagetest.tuopinpin.com/";
            }
            else{
            self.$router.push(this.modelbasePath);
            }
        },

        logout(){
            /** 注销函数 */
            window.location.href = "https://homepagetest.tuopinpin.com/";
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
  .test_block{
    margin-top: 30px;
    margin-left: 130px;
  }
</style>
