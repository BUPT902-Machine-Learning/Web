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
        <img class="model_type" src = '../assets/images/name.png'  style="width:50px;height:50px;margin-right: 20px;">
        <span class="model_type">{{modelName}}</span>
        <img class="model_type" src = '../assets/images/type.png'  style="width:50px;height:50px;margin-left: 100px;margin-right: 20px">
        <span class="model_type">图像</span>
      </div>

      <div class="add_label_button">
        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="primary" @click="addLabel()">添加标签</el-button>
          <el-button type="primary" @click="publishModel()">发布模型</el-button>
          <el-button type="success" @click="submitReTraining()">提交并训练</el-button>
          <el-dialog title="添加标签" :visible.sync="addLabelVisible" :modal-append-to-body="false" align='center'>
            <el-form :model="addDev" :rules="labelRules" ref="addDev">
              <el-row>
                <el-form-item label="标签名称：" style="width:50%" prop="label">
                  <el-input v-model="addDev.label"></el-input>
                </el-form-item>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="addLabelCancel()">取 消</el-button>
              <el-button type="primary" @click="addLabelConfirm()">确 定</el-button>
            </div>
          </el-dialog>
        </el-row>
      </div>

      <div class="mid_block">
        <el-form :model="ruleForm" :rules="rules1" ref="ruleForm" label-width="140px">
          <el-form-item label="模型权限" prop="isPublic">
            <el-select v-model="ruleForm.isPublic" placeholder="请选择模型权限" id="isPublic"  style="width:200px">
              <el-option label="公开" value=1></el-option>
              <el-option label="隐藏" value=0></el-option>
            </el-select>
            <span class="notes">选择选择模型权限是否公开</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="image_train_container">
        <div class="image_label_container" v-for="(item, index) in tableData" :key='index'>

          <div class="image_label_header">
            <span class="image_label">{{item.label}}</span>
          </div>

          <div class="image_delete_label">
            <span class="iconfont icon-label_close" @click="deleteLabel(item)"/>
          </div>

          <div class="image_sample">
            <div class="images_item" v-for="(content, index2) in item.contents" :key="index2">
              <span class="delete_sample iconfont icon-sample_close" @click="deleteImage(index, index2)"/>
              <table  style="border-collapse:separate; border-spacing:0px 5px;font-family:STHeiti">
                <img class="image_size" :src="content" alt="图片"/>
              </table>
            </div>
          </div>

          <div class="image_foot">
            <el-upload
              name="image"
              class="upload-demo"
              action="http://127.0.0.1:8082/api/image/uploadImg/"
              :show-file-list=false
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
              align="center">
              <div class="selectImg"><el-button type="primary" @click="selectImg(item)">添加图片</el-button></div>
            </el-upload>
          </div>
        </div>
      </div>

      <div v-if="isSuccess == true" class = 'foot_block'>
        <el-table :data="outputData" style="width: 100%">
          <el-table-column prop="trainAccuracy" label="训练准确度" align="center"></el-table-column>
          <el-table-column prop="trainTime" label="训练用时(s)" align="center"></el-table-column>
        </el-table>
      </div>

      <div v-if="isSuccess == true" class="test_block">
        <el-form ref="testData" label-width="120px">
          <el-form-item label="测试图片">
            <el-upload
              name="img"
              class="upload-demo"
              action="http://127.0.0.1:8082/api/image/testImageModel/"
              :show-file-list=true
              :on-success="handleTestSuccess"
              :on-change="handleTestChange"
              :file-list="fileTestList"
              :data="uploadTestData"
              list-type="picture"
              align="left">
              <div class="selectImg" align="left"><el-button type="primary" @click="selectTestImg()">提交测试</el-button></div>
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
        tableData: [
        ],            //存储该模型所有标签、样本信息
        addDev: {                 //存储某一标签的训练数据
          label: '',                //标签名
          imageId:[],               //上传图片唯一ID
          imageName:[],             //存储样本名
          contents:[]               //标签所属的样本URL
        },
        addLabelVisible: false,   //标签名输入框显示标记
        uploadData:{              //图片文件附属信息
          account: '',
          model_name: '',
          delete: '',
          label: '',
          img_name: ''
        },
        modelName: '',             //模型名
        outputData: [],            //存放训练模型的输出结果
        trainStatus: '',           //模型训练状态
        ruleForm:{
          isPublic:''              //模型是否公开
        },
        isChange: 0,               //全局变量，用于判断数据表格是否发生变动
        labelRules:{
          label:[
            {required: true, message: '请输入标签名称', trigger: 'blur'},
            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
          ]
        },
        rules1:{
          isPublic:[
            {
              required: true,
              trigger: 'change',
              message: '请选择模型权限'
            }
          ]
        },
        isSuccess: false,     //模型是否已经训练
        testOutput:'',              //测试结果
        uploadTestData:{                //图片文件附属信息
          account: '',
          modelName: ''
        },
      }
    },

    mounted(){
      const self = this;
      self.modelName = self.$route.params.modelName;
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
        self.modelbasePath = "/modelbaseTeacher";
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
          this.$message({
            type: 'info',
            message: response.data.message
          });
          window.location.href = "https://homepagetest.tuopinpin.com/";
        }
      }).catch(function (error) {
        console.log(error);
      });

      var modelEditData = JSON.stringify({
        username:self.account,
        modelName:self.modelName
      })

      axios.post(apiUrl.imageIfTrain,modelEditData,{
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        if(response.data === "模型未训练"){
          self.trainStatus = "未训练";
        }else if(response.data === "模型训练中"){
          self.trainStatus = "训练中";
        }else {
          self.trainStatus = "已训练";
          self.isSuccess = true;
        }
      }).catch(function (error) {
        console.log(error);
      });

      axios.post(apiUrl.editImgModel,modelEditData,{
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        //训练数据恢复
        var tmpTable = response.data.tableData;
        if(response.data.publicStatus == '1'){
          self.ruleForm.isPublic = '1';
        }
        else{
          self.ruleForm.isPublic = '0';
        }
        tmpTable.forEach(element => {
          var tmpDev = {};
          tmpDev.label = element.label;
          tmpDev.imageName = element.image_name;
          tmpDev.contents = element.contents;
          tmpDev.imageId = element.image_id;
          self.tableData.push(tmpDev);
        })
        console.log(self.tableData);

      }).catch(function (error) {
        console.log(error);
      });
    },

    methods: {
      deleteImage(index,index2){
        const self = this;
        var deleteId = self.tableData[index].imageId[index2];
        self.tableData[index].imageName.splice(index2,1);
        self.tableData[index].contents.splice(index2,1);
        self.tableData[index].imageId.splice(index2,1);
        //向后台发送请求，删除该图片文件（逻辑删除）
        let formData = new FormData();
        formData.append('image_id', deleteId);
        axios.post(apiUrl.deleteImg,formData,{
          headers:{"Content-Type": "application/json;charset=utf-8"}
        }).then(function (response) {
          if(response.data == "logic delete Success"){
            self.$message({
              type: 'success',
              message: "删除图片成功"
            });
          }
        }).catch(function (error) {
          self.$message({
            type: 'error',
            message: "删除图片失败"
          });
        });
        self.isChange = 1;
      },

      myModelBase(){
        /** 我的模型库跳转函数 */
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
          self.$router.push("/modelbaseStudent");
        }
      },

      addLabel(){
        this.addDev.label = "";
        this.addDev.contents = [];
        this.addDev.imageName = [];
        this.addDev.imageId = [];
        this.addLabelVisible = true;
      },

      addLabelConfirm(){
        this.addLabelVisible = false;
        var checkFlag = false;
        var tmp = {};
        tmp.label = this.addDev.label;
        tmp.imageName = [];
        tmp.contents = [];
        tmp.imageId = [];
        for(var item of this.tableData){
          if(item.label == tmp.label){
            checkFlag = true;
          }
        }
        if(tmp.label.indexOf(",") != -1 ||tmp.label.indexOf("，") != -1
          ||tmp.label.indexOf(".") != -1 ||tmp.label.indexOf("。") != -1){
          this.$message({
            type: 'error',
            message: "标签名中含有非法字符"
          });
        }
        else if(this.tableData.length == 0 || checkFlag == false){
          this.tableData.push(tmp);
          var uData = JSON.stringify({
            userName: this.account,
            modelName: this.modelName,
            label: tmp.label
          })
          axios.post(apiUrl.addLabel,uData,{
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            console.log(response.data)
          }).catch(function (error) {
            console.log(error);
          });
          this.isChange = 1;
        }
        else {
          this.$message({
            type: 'info',
            message: "该标签名已存在"
          });
        }
      },

      addLabelCancel(){
        this.addLabelVisible = false;
        this.addDev.label = '';
        this.addDev.contents = [];
        this.addDev.imageName = [];
        this.addDev.imageId = [];
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
            userName: this.account,
            modelName: this.modelName,
            label: item.label
          })
          axios.post(apiUrl.deleteLabel,uData,{
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            if(response.data == "Delete Label Success"){
              this.$message({
                type: 'success',
                message: "标签删除成功"
              });
              this.isChange = 1;
            }
          }.bind(this)).catch(function (error) {
            console.log(error);
          });
          this.tableData.splice(this.tableData.indexOf(item),1);
        }).catch(() => {});
      },

      selectImg(item){
        // 将模型名、标签名跟随图片文件传送到Django后端
        const self = this;
        self.uploadData.account = self.account;
        self.uploadData.model_name = self.modelName;
        self.uploadData.label = item.label;
        self.isChange = 1;
      },

      selectTestImg(){
        // 将模型名、标签名跟随图片文件传送到Django后端
        const self = this;
        self.uploadTestData.account = self.account;
        self.uploadTestData.modelName = self.modelName;
      },

      beforeUpload(file){
        // 将逻辑删除标记、文件名跟随图片文件传送到Django后端
        // 限制图片尺寸（不得过大或者过小）
        this.uploadData.delete = '0';
        this.uploadData.image_name = file.name;
        self.isChange = 1;
      },

      handleSuccess(response, file, fileList){
        if(response == "Name Check Failed!") {
          this.$message({
            type: 'error',
            message: "文件名重复，上传失败"
          });
          fileList.splice(fileList.indexOf(file),1);
        }
        else {
          // 将上传的图片信息（文件路径）存储在tableData中
          for(var item of this.tableData){
            if(item.label == this.uploadData.label){
              item.imageName.push(file.name);
              item.contents.push(file.url);
              break;
            }
          }
        }
        self.uploadData = {};
        self.isChange = 1;
      },

      handleTestSuccess(response, file, fileTestList){
        const self = this;
        self.testOutput = response;
        self.uploadTestData = {};
      },

      handleTestChange(file, fileTestList){
        if (fileTestList.length > 1){
          fileTestList.splice(0, 1);
        }
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
        self.isChange = 1;
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
            self.$message({
              type: 'success',
              message: "图片删除成功"
            });
          }
        }).catch(function (error) {
          console.log(error);
        });
      },

      submitReTraining(){
        /** 提交并训练函数 */
        const self = this;
        var tmp = false;
        if(this.tableData.length == 0){
          this.$message({
            type: 'error',
            message: "训练数据不能为空"
          });
          tmp = true;
        }
        else if(this.tableData.length < 2){
          this.$message({
            type: 'error',
            message: "训练标签数至少为2"
          });
          tmp = true;
        }
        else{
          for (var item of this.tableData) {
            if(item.contents.length == 0){
              this.$message({
                type: 'error',
                message: "训练样本不能为空"
              });
              tmp = true;
              break;
            }
          }
        }
        var labels = [];
        for(var item of this.tableData){
          labels.push(item.label);
        }
        //提交训练数据确认函数
        if(tmp == false){
          this.$refs["ruleForm"].validate((valid) => {
            if (valid) {
              this.$confirm('是否提交?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                const loading = this.$loading({
                  lock: true,
                  text: '正在训练，请稍候...',
                  spinner: 'el-icon-loading',
                  background: 'rgba(0, 0, 0, 0.7)'
                });
                var uData = JSON.stringify({
                  userName:this.account,
                  modelName:this.modelName,
                  label:labels,
                  publicStatus:this.ruleForm.isPublic,
                  isChange: this.isChange
                })
                axios.post(apiUrl.trainImgModel,uData,{
                  headers:{"Content-Type": "application/json;charset=utf-8"}
                }).then(function (response) {
                  loading.close();
                  if(response.data.train_result == "Success"){
                    self.isSuccess = true;
                    self.$message({
                      type: 'success',
                      message: "训练成功"
                    });
                    var tmp = {
                      trainAccuracy: '',
                      trainTime: ''
                    }
                    tmp.trainAccuracy = self.toPercent(Number(response.data.train_acc));
                    tmp.trainTime = response.data.train_time;
                    self.outputData = [];
                    self.outputData.push(tmp);
                  }
                  else{
                    self.isSuccess = false;
                    self.$message({
                      type: 'error',
                      message: "训练失败"
                    });
                  }

                  self.isChange = 0;
                }).catch(function (error) {
                  loading.close();
                  console.log(error);
                });
              })
            }
          });
        }
      },

      toPercent(point){
        /** 百分比转换函数 */
        if (point==0) {
          return 0;
        }
        var str=Number(point*100).toFixed();
        str+="%";
        return str;
      },

      publishModel(){
        const self = this;
        this.$confirm(`确定发布合作模型？`, '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
          var uData = JSON.stringify({
            userName:this.account,
            modelName:this.modelName,
            isChange: this.isChange,
            publicStatus: this.ruleForm.isPublic
          })
          axios.post(apiUrl.publishImgModel,uData,{
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            var username = self.account;
            if(username == ""){
              this.$message({
                type: 'info',
                message: "您尚未登录"
              });
              window.location.href = "https://homepagetest.tuopinpin.com/";
            }
            else{
              console.log("sdfasdfasd")
              self.$router.push("/modelbaseTeacher");
            }
          }).catch(function (error) {
            console.log(error);
          });
          this.isChange = 0;
        }).catch(() => {});
      }
    }
  }

</script>

<style>
  .model_part{
    margin-left: 100px;
    height: 50px;
  }
  .main_container{
    margin-top: 30px;
    margin-left: 150px;
    margin-right: 150px;
  }
  .model_type{
    font-size:30px;
    line-height:50px;
    float:left;
  }
  .notes{
    margin-left: 10px;
    color:#999999;
  }
  .add_label_button{
    margin-top: 30px;
    margin-left: 130px;
  }
  .mid_block{
    margin-top: -20px;
    margin-left: 130px;
  }
  .image_train_container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    height: calc(100vh - 230px);
    min-height: 200px;
  }
  .image_label_container {
    flex: 1;
    flex-grow: 1;
    border: .8em #777 solid;
    border-radius: 2em;
    margin: 1em;
    min-width: 25em;
    max-width: 47%;
    max-height: calc(100% - 25px);
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .image_label_header {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    height: 1em;
  }
  .image_label {
    text-align: center;
    font-size: 2em;
    font-weight: 700;
    color: #006400;
    position: relative;
    top: -1em;
    background-color: #fff;
    width: 90%;
    padding-left: 5px;
    padding-right: 5px;
  }
  .image_delete_label {
    background-color: #fff;
    border-radius: 1em;
    cursor: pointer;
    position: absolute;
    top: -.8em;
    right: 0;
  }
  .image_label_container .image_delete_label{
    display:none;/*默认隐藏*/
  }
  .image_label_container:hover .image_delete_label{
    display:inline;/*当鼠标hover时展示*/
  }
  .image_sample {
    padding: .8em;
    overflow-y: scroll;
    margin-bottom: .4em;
    flex: 1;
  }
  .images_item {
    background-color: #e0e0e0;
    margin: .5em;
    padding: .5em .7em;
    font-size: 1.2em;
    float: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 95%;
  }
  .delete_sample {
    cursor: pointer;
    padding: 0 0 0 .35em;
    float: right;
  }
  .images_item .delete_sample{
    visibility: hidden;/*默认隐藏*/
  }
  .images_item:hover .delete_sample{
    visibility: visible;/*当鼠标hover时展示*/
  }
  .image_foot{
    text-align: center;
    height: 45px;
  }

  .image_size{
    max-height: 60px;
    max-height: 100px;
  }
  .add_label_button{
    margin-left: 100%;
  }


</style>
