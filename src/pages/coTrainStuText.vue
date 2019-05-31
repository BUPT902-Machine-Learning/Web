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
            </template>
          </el-table-column>
        </el-table>
      
        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="success" @click="submitData()">提交数据</el-button>
        </el-row>
        
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
        /** coTrainEditText 数据 */
        account: '',              //用户名
        token: '',                //是否登录标识
        sessionId: '',            //会话ID
        dynamicTags:[],
        isChange: 0,              //全局变量，用于判断数据表格是否发生变动
        modelName: '',            //模型名
        trainType: '',            //训练数据类型
        addTagVisible:false,      //添加样本输入框是否可见
        editDev: {                //临时存储当前添加的样本信息
          label: '',
          content: '',
        },
        addDev: {                 //临时存储某一行训练数据
          label: '',
          contents:[]
        },
        tableData: [],            //存储所有训练数据
        teacherName: '',          //存储教师名
        classId: '',              //存储用户所在班级号
        role: '',                 //存储用户角色
        csrfToken: ''             //CSRF标识
      }
    },
    mounted(){ 
      const self = this;
      self.modelName = self.$route.params.modelName;
      self.teacherName = self.$route.params.teacherName;
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

      var uData = JSON.stringify({
        username:self.teacherName,
        modelName:self.modelName
      })
      axios.post(apiUrl.getModelData,uData,{    
          headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
          response.data.forEach(element => {
            var tmpAddDev = {contents: []};
            tmpAddDev.label = element.label;
            self.tableData.push(tmpAddDev);
          });
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
          self.$router.push("/modelbaseStudent");
        }
      },

      logout(){
        /** 注销函数 */
        window.location.href = "https://homepagetest.tuopinpin.com/";
      },

      submitData(){
        //提交训练数据确认函数
        var tmpFlag = false;
        this.tableData.forEach(element =>{
          if(element.contents.length == 0){
            tmpFlag = true;
          }
        });
        if(tmpFlag == true){
          alert("发送数据不能为空");
        }
        else{
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
      },
    
      confirmSubmit(){
        const self = this;
        var username = self.account;
        var teacher = self.teacherName;
        var confirmFlag = 0;  //当满足发送条件时置为1
        var tData = {};
        var params = {};
          tData = JSON.stringify({
            student_name:username,
            teacher_name:teacher,
            model_name:self.modelName,
            train_data:self.tableData
          })
        axios.post(apiUrl.pushData,tData,{    
        headers:{"Content-Type": "application/json;charset=utf-8"}
       })
        .then(function (response) {
          alert("添加成功");
          self.$router.push("/modelbaseStudent");
        })
        .catch(function (error) {
          console.log(error);
        });
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

      cancel() {
        this.addTagVisible = false;
        this.editDev.label = '';
        this.editDev.content = '';
        this.addDev.typeName = '';
      },
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
