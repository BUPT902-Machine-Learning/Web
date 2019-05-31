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
      <div class="top_train_block">
        <el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%" border>
          <el-table-column property="label" label="标签" align='center'></el-table-column>
          <el-table-column label="样本" property="contents" align='center'>
            <template slot-scope="scope">
              <el-tag v-for="content in scope.row.contents" :key="content" closable :disable-transitions="false" @close="handleClose(content,scope.row.contents)">
                {{content}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align='center'>
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleEdit(scope.row)">添加样本</el-button>
              <el-dialog title="添加样本" :visible.sync="addTagVisible" :modal-append-to-body="false">
                <el-form :model="editDev" ref="editType">
                    <el-row>
                        <el-form-item label="样本名称：">
                            <el-input v-model="editDev.content"></el-input>
                        </el-form-item>
                    </el-row>
                </el-form>
                <div slot="footer" class="dialog-footer">
                  <el-button @click="cancel()">取 消</el-button>
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
            <el-button @click="cancel()">取 消</el-button>
            <el-button type="primary" @click="confirmAddLabel()">确 定</el-button>
          </div>
        </el-dialog>
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
      
      <div class = 'foot_block'>
        <el-table :data="outputData" style="width: 100%">
          <el-table-column prop="trainLoss" label="训练误差" width="470" align="center"></el-table-column>
          <el-table-column prop="trainAccuracy" label="训练准确度" width="470" align="center"></el-table-column>
          <el-table-column prop="trainTime" label="训练用时(s)" width="470" align="center"></el-table-column>
        </el-table>
      </div>

      <div class="test_block">
        <el-form ref="testData" label-width="120px">
          <el-form-item label="测试数据">
            <el-col :span=8>
              <el-input  v-model="testData" placeholder="请输入测试数据"></el-input>
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
        /** modelEdit 数据 */
        account: '',        //用户名
        role: '',           //用户身份
        classId: '',        //用户所在班级号
        modelbasePath: '',  //跳转回我的模型库的路径
        token: '',          //是否登录标识
        sessionId: '',      //存储会话信息
        isKNN: false,       //是否使用KNN算法
        isCNN: false,       //是否使用CNN算法
        isRNN: false,       //是否使用RNN算法
        ruleForm:{
          isPublic:'',      //模型是否公开
        },
        dynamicTags:[],     //存储某一标签的所有样本
        isChange: 0,        //全局变量，用于判断数据表格是否发生变动
        modelName: '',      //模型名
        trainType: '',      //训练数据类型
        addTagVisible:false,//添加样本输入框是否可见
        addVisible: false,  //添加标签输入框是否可见
        editDev: {          //临时存储当前添加的样本信息
          label: '',
          content: '',
        },
        addDev: {           //临时存储某一行训练数据
          label: '',
          contents:[]
        },
        tableData: [],      //存放还原的所有训练数据
        outputData: [],     //存放训练模型的输出结果
        testData: '',       //测试数据
        testOutput:'',      //测试输出结果
        testTime:'',        //测试用时
        trainUrl: '',       //训练URL
        testUrl: 'knnTest', //测试URL
        rules1:{            //模型公开权限&算法选择规则
          isPublic:[
            {
              required: true,
              trigger: 'change',
              message: '请选择模型权限'
            }
          ]
        },
        csrfToken: ''       //CSRF标记 
      }
    },
    mounted(){
      const self = this;
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
      var uData = JSON.stringify({
        username:self.account,
        modelName:self.modelName
      })
      axios.post(apiUrl.editModels,uData,{    
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        if(response.data.isPublic == '1'){
          self.ruleForm.isPublic = '1';
        }
        else{
          self.ruleForm.isPublic = '0';
        }
        self.tableData = response.data.trainData;
      })
      .catch(function (error) {
          console.log(error);
      });
    },
    methods: {
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
      },
      confirmTestSubmit(){
        if(this.testData.length == 0){
          alert("测试数据不能为空");
        }
        else{
          const self = this;
          var username = self.account;
          var tData = JSON.stringify({
            username:username,
            modelName:self.modelName,
            testData:self.testData
          })
          axios.post(self.testUrl,tData,{    
          headers:{"Content-Type": "application/json;charset=utf-8"}
          })
          .then(function (response) {
            self.testOutput = response.data.prediction;
            self.testTime = response.data.time;
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
      },
    
      confirmSubmit(){
        /** 提交确认函数（按钮） */
        var confirmFlag = 0;  //当满足发送条件时置为1
        var tData = {};
        if(this.isChange == 0){
          tData = JSON.stringify({
            username:this.account,
            modelName:this.modelName,
            public_status: this.ruleForm.isPublic,
            model_type: 1,
            trainData:[]
          })
        } //当数据部分未发生修改的时候，traindata部分置为空（不重复发送未改变的数据）
        else{
          tData = JSON.stringify({
            username:this.account,
            modelName:this.modelName,
            trainData:this.tableData,
            public_status: this.ruleForm.isPublic,
            model_type: 1
          })
          this.isChange = 0;
        }
        const self = this;
        axios.post(self.trainUrl,tData,{    
          headers:{"Content-Type": "application/json;charset=utf-8"}
        })
        .then(function (response) {
          var tmp = {
            trainLoss: '',
            trainAccuracy: '',
            trainTime: ''
          }
          tmp.trainLoss = response.data.loss;
          tmp.trainAccuracy = self.toPercent(Number(response.data.acc));
          tmp.trainTime = response.data.time;
          self.outputData = [];
          self.outputData.push(tmp);
        })
        .catch(function (error) {
        console.log(error);
        });
      },

      toPercent(point){
          if (point==0) {
            return 0;
          }
          var str=Number(point*100).toFixed();
          str+="%";
          return str;
      },

      confirmAddLabel(){
          var tmp = {};
          tmp.label = this.addDev.label;
          tmp.contents = [];
          this.tableData.push(tmp);
          this.addVisible = false;
          this.isChange = 1;
      },

      confirmAddTag(){
          var tmp=[];
          var i=0;
          for(var item of this.tableData){
              if(item.label == this.editDev.label){
                  item.contents.push(this.editDev.content);
                  tmp = item.contents;
                  break;
              }else{
                  i++;
              }
          }
          this.tableData[i].contents = tmp;
          this.addTagVisible = false;
          this.editDev.label="";
          this.editDev.content = "";
          this.isChange = 1;
      },

      handleClose(tag,dynamicTags) {
          dynamicTags.splice(dynamicTags.indexOf(tag), 1);
          this.isChange = 1;
      },
      
      handleEdit(row) {
        this.addTagVisible = true;
        this.editDev.label = row.label;
        this.isChange = 1;
      },

      handleAdd() {
        this.addDev.label = "";
        this.addVisible = true;
        this.isChange = 1;
      },

      cancel() {
        this.addTagVisible = false;
        this.addVisible = false;
        this.editDev.label = '';
        this.editDev.content = '';
        this.addDev.typeName = '';
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
