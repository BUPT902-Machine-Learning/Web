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



      <div class="top_train_block">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%" border>
          <el-table-column property="label" label="标签" align='center'></el-table-column>
          <el-table-column label="样本" property="contents" align='center'>
            <template slot-scope="scope">
              <el-tag v-for="content in scope.row.contents" :key="content" :disable-transitions="false" @close="handleClose(content,scope.row.contents)">
                {{content}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align='center'>
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleEdit(scope.row)">样本操作</el-button>
              <el-dialog title="添加样本" :visible.sync="addTagVisible" :modal-append-to-body="false">
                <el-form :model="editDev" ref="editType">
                  <el-form-item label="请上传样本图片：">

                      <el-upload
                        name="img"
                        class="upload-demo"
                        action="http://127.0.0.1:8001/api/uploadImg/"
                        :show-file-list=true
                        :on-success="handleSuccess"
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
                          <div class="clickAdd" align="left" @click="tempTest(file,fileList)"><el-button type="primary">点击上传</el-button></div>
                      </el-upload>
                  </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button @click="addPicturesCancel()">取 消</el-button>
                  <el-button type="primary" @click='confirmAddTag()'>确 定</el-button>
                </div>
              </el-dialog>
              <el-button size="mini" type="text" @click="confirmDelete(scope.row)">删除标签</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="primary" @click="handleAdd()">添加标签</el-button>
          <el-button type="success" @click="submitData()">提交并训练</el-button>
        </el-row>

        <el-dialog title="添加标签" :visible.sync="addVisible" :modal-append-to-body="false" ref="addType">
          <el-form :model="addDev" ref="addType">
            <el-row>
              <el-form-item label="标签名称：">
                <el-input v-model="addDev.label"></el-input>
              </el-form-item>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="addLabelCancel()">取 消</el-button>
            <el-button type="primary" @click="confirmAddLabel()">确 定</el-button>
          </div>
        </el-dialog>

        <el-dialog>
          <div slot="footer" class="dialog-footer">
            <el-button @click="cancel()">取 消</el-button>
            <el-button type="primary" @click="confirmSubmit()">确 定</el-button>
          </div>
        </el-dialog>
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
        uploadData:{
          modelName: '',
          delete: '',
          label: '',
          imgName: ''
        },
        fileList: [],
        account: '',
        modelbasePath: '',
        token: '',
        sessionId: '',
        classId: '',
        role: '',
        isSuccess: false,
        addVisible: false,
        addTagVisible: false,
        isChange: 0,    //全局变量，用于判断数据表格是否发生变动
        modelName: 'test',  //模型名
        trainType: '',  //训练数据类型
        tableData: [],
        outputData: [],//存放训练模型的输出结果
        test_data: '',
        test_output:'',
        test_time:'',
        trainUrl: '',
        testUrl: '',
        editDev: {
          label: '',
          content: '',
          number: ''
        },
        addDev: {             //存储某一标签的训练数据
          label: '',
          contents:[]
        },
        csrfToken: '',
      }
    },

    mounted(){
      const self = this;
      // self.modelName = self.$route.params.modelName;
      // self.modelName = '1';
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
      // axios.post(apiUrl.loginCheck,uData,{    
      //   headers:{"Content-Type": "application/json;charset=utf-8"}
      // }).then(function (response) {
      //   /**When logincheck is failed, turn to tuopinpin.com */
      //   if(response.data.code != 1){
      //     alert(response.data.message);
      //     window.location.href = "https://homepagetest.tuopinpin.com/";
      //   }
      // }).catch(function (error) {
      //   console.log(error);
      // });
    },

    methods: {
      getCookie (name) {
        var value = '; ' + document.cookie
        var parts = value.split('; ' + name + '=')
        if (parts.length === 2) return parts.pop().split(';').shift()
      },
      handleErr(err,file,fileList){
        this.addTagVisible = false;
        alert("上传失败");
      },
      beforeUpload(file){
        const self = this;
        self.uploadData.modelName = self.modelName;
        self.uploadData.delete = '0';
        self.uploadData.label = self.editDev.label;
        self.uploadData.imgName =file.name;
      },
      handleSuccess(response, file, fileList){
        const self = this;
        for(var item of self.tableData){
          if(item.label == self.editDev.label){
            item.contents.push(file.name);
            self.addTagVisible = false;
            break;
          }
        }
        alert("上传成功");
        self.uploadData = {};
      },

      handleRemove(file, fileList) {
        const self = this;
        var deleteFileLabel = '';
        for(var item of self.tableData){
          for(var content of item.contents){
            if(content == file.name){
              item.contents.splice(item.contents.indexOf(content),1);
              console.log("RemoveSuccess");
            }
          }
        }
        //向后台发送请求，删除该图片文件（逻辑删除）
        let formData = new FormData();
        formData.append('modelName', self.modelName);
        formData.append('delete', '1');
        formData.append('label', self.editDev.label);
        formData.append('imgName', file.name);
        axios.post("http://127.0.0.1:8001/api/deleteImg/",formData,{    
          headers:{"Content-Type": "application/json;charset=utf-8"}
        }).then(function (response) {
          /**When logincheck is failed, turn to tuopinpin.com */
          if(response.data.code != 1){
            alert(response.data.message);
          }
        }).catch(function (error) {
          console.log(error);
        });
      },

      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },

      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${ file.name }？`);
      },

      confirmAddTag(){
        this.addTagVisible = false;
        this.editDev.label="";
        this.editDev.content = "";
        this.isChange = 1;
      },

      handleClose(tag,dynamicTags) {
        const self = this;
        for(var item of self.tableData){
          for(var content of item.contents){
            if(content == tag){
              dynamicTags.splice(dynamicTags.indexOf(tag), 1);
              this.isChange = 1;
            }
          }
        }
        console.log("handleclose");
      },

      handleEdit(row) {
        this.addTagVisible = true;
        this.editDev.label = row.label;
        this.isChange = 1;
        //将可能更新后的tableData覆盖fileList
      },

      tempTest(file,fileList){
        console.log(file);
        console.log(fileList);
      },

      handleAdd() {
        this.addDev.label = "";
        this.addDev.contents = [];
        this.addVisible = true;
        this.isChange = 1;
      },

      confirmAddLabel(){
          var tmp = {};
          tmp.label = this.addDev.label;
          tmp.contents = [];
          this.tableData.push(tmp);
          this.addVisible = false;
          this.isChange = 1;
      },

      addLabelCancel() {
        this.addVisible = false;
        this.addDev.label = '';
        this.addDev.contents = [];
      },

      addPicturesCancel() {
        this.addTagVisible = false;
        this.editDev.label = '';
        this.editDev.content = '';
      },

      confirmDelete(row) {
        this.$confirm('是否删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.handleDelete(row);
          this.isChange = 1;
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },

      handleDelete(row) {
        this.tableData.splice(this.tableData.indexOf(row),1);
        this.isChange = 1;
      },

      myModelBase(){
        const self = this;
        var username = self.account;
        if(username == ""){
          alert("您尚未登录");
        }
        else{
          window.location.href=this.modelbasePath;
        }
      },

      logout(){
        const self = this;
        self.isLog = false;
        this.ifShow = false;
        window.location.href = "https://homepagetest.tuopinpin.com/";
        this.ifShow = true;
      },

      trueAlgorithm(value){
        this.param = {};
        if(value == 1){
          console.log("1");
          this.isKNN = true;
          this.isCNN = false;
          this.isRNN = false;
          this.trainUrl = apiUrl.knnTrain;
          this.testUrl = apiUrl.knnTest;
        }
        else if(value == 2){
          console.log("2");
          this.isKNN = false;
          this.isCNN = true;
          this.isRNN = false;
          this.trainUrl = apiUrl.cnnTrain;
          this.testUrl = apiUrl.cnnTest;
        }
        else{
          console.log("3");
          this.isKNN = false;
          this.isCNN = false;
          this.isRNN = true;
          this.trainUrl = apiUrl.rnnTrain;
          this.testUrl = apiUrl.rnnTest;
        }
      },

      confirmTestSubmit(){
        if(this.isSuccess == false){
          alert("请先进行模型训练");
        }
        else if(this.test_data.length == 0){
          alert("测试数据不能为空");
        }
        else{
          const self = this;
          var username = self.account;
          username = username.substring(1,username.length-1);
          var tData = JSON.stringify({
            username:username,
            modelName:self.modelName,
            testData:self.test_data
          })
          console.log(tData);
          axios.post(self.testUrl,tData,{    
          headers:{"Content-Type": "application/json;charset=utf-8"}
          })
          .then(function (response) {
            console.log(response);
            self.test_output = response.data.prediction;
            self.test_time = response.data.time;
          })
          .catch(function (error) {
            console.log(error);
          });
        }
      },

      submitData(){
        var tmp = false;
        if(this.tableData.length == 0){
          alert("训练数据不能为空");
          tmp = true;
        }
        else{
          this.tableData.forEach(element => {
            if(element.contents.length == 0){
              alert("训练样本不能为空");
              tmp = true;
              return;
            }
          });
        }
        if(tmp == false){
          this.$refs["ruleForm"].validate((valid) => {
            if (valid) {
              this.$refs["param"].validate((valid) => {
                if (valid) {
                  //提交训练数据确认函数
                  this.$confirm('是否提交?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                  }).then(() => {
                    this.confirmSubmit();
                  }).catch(() => {
                    this.$message({
                      type: 'info',
                      message: '已取消提交'
                    });
                  });
                }
              });
            }
          });
        }
      },

      confirmSubmit(){
      },

      toPercent(point){
          if (point==0) {
            return 0;
          }
          var str=Number(point*100).toFixed();
          str+="%";
          return str;
      }
    }
  }

</script>

<style>
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
