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
        <span style="font-size:25px">{{modelName}}</span><span style="font-size:18px">({{modelStatus}})</span>
      </div>
    </div>
    
    <div class="top_train_block">
        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="primary" @click="addLabel()"">添加标签</el-button>
          <el-button type="success" @click="submitData()">提交并训练</el-button>
        </el-row>
        
        <el-dialog title="添加标签" :visible.sync="addLabelVisible" :modal-append-to-body="false" ref="addType">
          <el-form :model="addDev" ref="addType">
            <el-row>
              <el-form-item label="标签名称：">
                <el-input v-model="addDev.label"></el-input>
              </el-form-item>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addLabelCancel()">取 消</el-button>
            <el-button type="primary" @click="addLabelConfirm()">确 定</el-button>
          </div>
        </el-dialog>

        <!-- 动态生成多个标签项 -->
        <div class="trainData" v-for="(item, index) in tableData" :key='index'>
          <el-form>

            <el-form-item label="标签名：" class="labelData">
              <span style="font-size:25px">{{item.label}}</span>
              <el-button size="mini" type="success" @click="deleteLabel(item)">删除标签</el-button>
            </el-form-item>
            
            <el-form-item
              label="训练样本："
              class="trainSample">
                <el-upload
                  name="img"
                  class="upload-demo"
                  action="http://127.0.0.1:8001/api/ImageClassifier/uploadImg/"
                  :show-file-list=true
                  :on-success="handleSuccess"
                  :on-preview="handlePreview"
                  :on-error="handleErr"
                  :on-remove="handleRemove"
                  :before-remove="beforeRemove"
                  :before-upload="beforeUpload"
                  :limit="10"
                  :on-exceed="handleExceed"
                  :file-list="fileList"
                  :data="uploadData"
                  list-type="picture"
                  multiple
                  align="left">
                    <div class="selectImg" align="left"><el-button type="primary" @click="selectImg(item)">上传训练图片</el-button></div>
                </el-upload>
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
import coTrainStuTextVue from './coTrainStuText.vue';
  export default {
    data() {
      return {
        account: '',              //用户名
        token: '',                //登录标记
        sessionId: '',            //会话标记
        classId: '',              //用户所在班级号
        role: '',                 //用户身份
        csrfToken: '',            //CSRF标记
        modelbasePath: '',        //我的模型库跳转路径
        tableData: [],            //存储该模型所有标签、样本信息
        addDev: {                 //存储某一标签的训练数据
          label: '',                //标签名
          contents:[]               //标签所属的样本名
        },
        addLabelVisible: false,   //标签名输入框显示标记
        uploadData:{              //图片文件附属信息
          account: '',
          modelName: '',
          delete: '',
          label: '',
          imgName: ''
        },
        modelName: '',            //模型名
        outputData: [],           //存放训练模型的输出结果
        modelStatus: '',          //模型训练状态
        //isChange: 0,            //全局变量，用于判断数据表格是否发生变动
      }
    },

    mounted(){
      const self = this;
      self.modelName = self.$route.params.modelName;
      self.modelStatus = self.$route.params.modelStatus;
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

      if(self.role == "teacher"){
        this.modelbasePath = "/modelbaseTeacher";
      }
      else{
        self.modelbasePath = "/modelbaseStudent";
      }

      var uData = JSON.stringify({
        username:self.account,
        role:self.role,
        token:self.token,
        sessionid:self.sessionId,
        class_no:self.classId
      })
      axios.post(apiUrl.loginCheck,uData,{    
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        if(response.data.code != 1){
          alert(response.data.message);
          window.location.href = "https://homepagetest.tuopinpin.com/";
        }
      }).catch(function (error) {
        console.log(error);
      }); 
      
      //返回模型的所有信息：标签、样本
    },

    methods: {
      myModelBase(){
        /** 我的模型库跳转函数 */
        const self = this;
        var username = self.account;
        if(username == ""){
          alert("您尚未登录");
          window.location.href = "https://homepagetest.tuopinpin.com/";
        }
        else{
          self.$router.push("/modelbaseTeacher");
        }
      },

      addLabel(){
        this.addDev.label = "";
        this.addDev.contents = [];
        this.addLabelVisible = true;
        this.isChange = 1;
      },

      addLabelConfirm(){
        var checkFlag = false;
        var tmp = {};
        tmp.label = this.addDev.label;
        tmp.contents = [];
        for(var item of this.tableData){
          if(item.label == tmp.label){
            alert("该标签名已存在");
            checkFlag = true;
          }
        }
        if(this.tableData.length == 0 || checkFlag == false){
          this.tableData.push(tmp);
          this.isChange = 1;
          this.addLabelVisible = false;
        }
      },

      addLabelCancel(){
        this.addLabelVisible = false;
        this.addDev.label = '';
        this.addDev.contents = [];
      },
      deleteLabel(item){
        this.$confirm(`确定移除 标签： ${ item.label }？`, '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => { 
          // 向Django后端发送物理删除请求，将该标签的文件夹删除，并删除数据库中该文件夹所有的内容
          var uData = JSON.stringify({
            modelName: this.modelName,
            label: item.label
          })
          axios.post(apiUrl.deleteLabel,uData,{    
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            if(response.data == "Delete Label Success"){
              alert("标签删除成功");
            }
          }).catch(function (error) {
            console.log(error);
          });
          this.tableData.splice(this.tableData.indexOf(item),1);
        }).catch(() => {});
      },

      selectImg(item){
        // 将模型名、标签名跟随图片文件传送到Django后端
        const self = this;
        self.uploadData.account = self.account;
        self.uploadData.modelName = self.modelName;
        self.uploadData.label = item.label;
      },

      beforeUpload(file){
        // 将逻辑删除标记、文件名跟随图片文件传送到Django后端
        this.uploadData.delete = '0';
        this.uploadData.imgName = file.name;
        // 将上传的图片信息（文件名）存储在tableData中
        for(var item of this.tableData){
          if(item.label == this.uploadData.label){
            item.contents.push(this.uploadData.imgName);
            break;
          }
        }
      },

      handleSuccess(response, file, fileList){
        if(response == "Name Check Failed!") {
          alert("文件名重复，上传失败");
          fileList.splice(fileList.indexOf(file),1);
        }
        else {
          alert("上传成功");
        }
        self.uploadData = {};
      },

      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },

      handleRemove(file, fileList) {
        const self = this;
        var deleteLabel = '';
        for(var item of self.tableData){
          for(var content of item.contents){
            if(content == file.name){
              item.contents.splice(item.contents.indexOf(content),1);
              deleteLabel = item.label;
            }
          }
        }
        //向后台发送请求，删除该图片文件（逻辑删除）
        let formData = new FormData();
        formData.append('modelName', self.modelName);
        formData.append('delete', '1');
        formData.append('label', deleteLabel);
        formData.append('imgName', file.name);
        axios.post(apiUrl.deleteImg,formData,{    
          headers:{"Content-Type": "application/json;charset=utf-8"}
        }).then(function (response) {
          if(response.data == "logic delete Success"){
            alert("图片删除成功");
          }
        }).catch(function (error) {
          console.log(error);
        });
      },

      submitData(){
        /** 提交并训练函数 */
        console.log(this.tableData);
        var labels = [];
        for(var item of this.tableData){
          labels.push(item.label);
        }
        //提交训练数据确认函数
        this.$confirm('是否提交?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          alert("训练提交成功，正在训练！");
          var uData = JSON.stringify({
            userName:this.account,
            modelName:this.modelName,
            label:labels
          })
          axios.post(apiUrl.trainImgModel,uData,{    
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            console.log(response.data)
          }).catch(function (error) {
            console.log(error);
          });
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消提交'
            });
          }); 
        }
    }
  }

</script>

<style>
  .trainData{
    margin-top: 0px;
  }
  .input-file{
    margin-top: 0px
  }
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
  .foot_block{
    margin-top: 30px;
    margin-left: 130px;
  }
  .test_block{
    margin-top: 30px;
    margin-left: 130px;
  }
</style>
