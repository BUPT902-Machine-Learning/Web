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
          <el-button type="success" @click="handleShow()">发布模型</el-button>
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
        /** coTrainTeaText 数据 */
        account: '',          //用户名
        token: '',              //是否登录标识
        sessionId: '',          //会话ID
        isSuccess: false,       //模型是否训练  
        dynamicTags:[],         //存储某一标签的所有样本
        isChange: 0,            //全局变量，用于判断数据表格是否发生变动
        modelName: '',          //模型名
        addTagVisible:false,    //添加样本输入框是否可见
        addVisible: false,      //添加标签输入框是否可见
        editDev: {              //临时存储当前添加的样本信息
          label: '',
          content: '',
        },
        addDev: {               //临时存储某一行训练数据
          label: '',
          contents:[]
        },
        tableData: [],          //存放还原的所有训练数据
        outputData: [],         //存放训练模型的输出结果
        testData: '',           //测试数据
        testOutput:'',          //测试输出结果
        testTime:'',            //测试用时
        trainUrl: '',           //训练URL
        testUrl: 'knnTest',     //测试URL
        rules1:{                //模型公开权限&算法选择规则
          isPublic:[
            {
              required: true,
              trigger: 'change',
              message: '请选择模型权限'
            }
          ]
        },
        csrfToken: '',          //CSRF标识
        classId: ''             //用户所在班级号
      }
    },
    mounted(){ 
      const self = this;
      self.modelName = self.$route.params.modelname;
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
      myModelBase(){
        const self = this;
        var username = self.account;
        if(username == ""){
          alert("您尚未登录");
        }
        else{
          self.$router.push("/modelbaseTeacher");
      }
      },
      logout(){
        /** 注销函数 */
        window.location.href = "https://homepagetest.tuopinpin.com/";
      },

      confirmTestSubmit(){
        const self = this;
        if(this.isSuccess == false){
          alert("请先进行模型训练");
        }
        else if(this.testData.length == 0){
          alert("测试数据不能为空");
        }
        else{
          var tData = JSON.stringify({
            username:self.account,
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
      handleShow(){
        //教师创建模型，但未提交训练，此时点击该按钮，完成发布模型功能：后端接受请求，存储该模型当前所有信息，此时学生的教师模型部分存在该模型的基础信息
        var tmp = false;
        if(this.tableData.length == 0){
          alert("训练数据不能为空");
          tmp = true;
        }
        if(tmp == false){
          //提交训练数据确认函数
          this.$confirm('是否提交?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.confirmSubmit(1);
          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消提交'
            });
          });            
        }
      },

      confirmSubmit(isShow){
        var tData = {};
        var params = {};
        var self = this;
        if(this.isChange != 0)
        {
          this.isChange = 0;
          //表示该请求是发布模型
          tData = JSON.stringify({
            username:this.account,
            modelName:this.modelName,
            model_type:"share",
            trainData:this.tableData
          })
          axios.post(apiUrl.createModel,tData,{    
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            alert("共享模型发布成功");
            self.$router.push("/modelbaseTeacher");
          }).catch(function (error) {
            console.log(error);
          });
        }
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
