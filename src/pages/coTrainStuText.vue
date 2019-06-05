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
        <img src = '../assets/images/model_name.png'  style="width:50px;height:50px;margin-right: 20px;">
        <span class="model_type">{{modelName}}</span>
        <img src = '../assets/images/model_type.png'  style="width:50px;height:50px;margin-left: 200px;margin-right: 20px">
        <span class="model_type">文本</span>
      </div>
      <div class="top_train_block">
        <!--<el-table ref="multipleTable" :data="tableData" tooltip-effect="dark" style="width: 100%" border>-->
          <!--<el-table-column property="label" label="标签" align='center'></el-table-column>-->
          <!--<el-table-column label="样本" property="contents" align='center'>-->
            <!--<template slot-scope="scope">-->
              <!--<el-tag v-for="content in scope.row.contents" :key="content" closable :disable-transitions="false" @close="handleClose(content,scope.row.contents)">-->
                <!--{{content}}-->
              <!--</el-tag>-->
            <!--</template>-->
          <!--</el-table-column>-->
          <!--<el-table-column label="操作" align='center'>-->
            <!--<template slot-scope="scope">-->
              <!--<el-button size="mini" type="text" @click="handleEdit(scope.row)">添加样本</el-button>-->
              <!--<el-dialog title="添加样本" :visible.sync="addTagVisible" :modal-append-to-body="false">-->
                <!--<el-form :model="editDev" ref="editType">-->
                    <!--<el-row>-->
                        <!--<el-form-item label="样本名称：">-->
                            <!--<el-input v-model="editDev.content"></el-input>-->
                        <!--</el-form-item>-->
                    <!--</el-row>-->
                <!--</el-form>-->
                <!--<div slot="footer" class="dialog-footer">-->
                  <!--<el-button @click="cancel()">取 消</el-button>-->
                  <!--<el-button type="primary" @click='confirmAddTag()'>确 定</el-button>-->
                <!--</div>-->
              <!--</el-dialog>-->
            <!--</template>-->
          <!--</el-table-column>-->
        <!--</el-table>-->

        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="success" @click="submitData()">提交数据</el-button>
        </el-row>
      </div>

      <div class="text_train_container">
        <div class="text_label_container" v-for="(item, index) in tableData" :key='index'>
          <div class="text_label_header">
            <span class="text_label">{{item.label}}</span>
          </div>

          <div class="text_sample">
            <div class="text_item" v-for="(item2, index2) in item.contents" :key="index2">
              <span class="delete_sample iconfont icon-sample_close" @click="deleteSample(item.contents, index2)"/>
              <span style="font-size: .9em;font-family:STHeiti;white-space: normal;">{{item2}}</span>
            </div>
          </div>

          <div class="text_foot">
            <button class="add_text_button" @click="sampleAdd(index)">
              添加样本
            </button>
            <el-dialog title="添加样本" v-if='addSampleVisible' :visible.sync="addSampleVisible" align='center'>
              <el-form  :model="addSample" :rules="SampleRules" ref="addSample">
                <el-row>
                  <el-form-item label="样本名称：" style="width:50%" prop="sample">
                    <el-input v-model="addSample.sample"></el-input>
                  </el-form-item>
                </el-row>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button @click="cancelAddSample()">取 消</el-button>
                <el-button type="primary" @click='confirmAddSample()'>确 定</el-button>
              </div>
            </el-dialog>
          </div>
        </div>
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
        addSampleVisible:false,
        addSample:{
          sample:''
        },
        sampleButton: '',
        tableData: [],            //存储所有训练数据
        teacherName: '',          //存储教师名
        classId: '',              //存储用户所在班级号
        role: '',                 //存储用户角色
        csrfToken: '',             //CSRF标识
        sampleRules:{
          label:[
            {required: true, message: '请输入样本', trigger: 'blur'}
          ]
        }
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
          this.$message({
            type: 'info',
            message: response.data.message
          });
          window.location.href = "https://homepagetest.tuopinpin.com/";
        }
      }).catch(function (error) {
        console.log(error);
      });

      var uData = JSON.stringify({
        username:self.teacherName,
        modelName:self.modelName
      })
      axios.post(apiUrl.getTextModelData,uData,{    
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
          this.$message({
            type: 'info',
            message: "发送数据不能为空"
          });
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
        axios.post(apiUrl.pushTextData,tData,{    
        headers:{"Content-Type": "application/json;charset=utf-8"}
       })
        .then(function (response) {
          this.$message({
            type: 'info',
            message: "添加成功"
          });
          self.$router.push("/modelbaseStudent");
        })
        .catch(function (error) {
          console.log(error);
        });
      },

      sampleAdd(index){
        this.sampleButton = index;
        this.addSampleVisible = true;
        this.isChange = 1;
      },

      confirmAddSample(){
        /** 添加样本确认函数 */
        var index = this.sampleButton;
        this.$refs["addSample"][index].validate((valid) => {
          if (valid) {
            var tmp=[];
            var i=0;
            this.tableData[index].contents.push(this.addSample.sample);
            this.addSample.sample = "";
            this.addSampleVisible = false;
            this.sampleButton = "";
            this.isChange = 1;
          }
        })
      },

      cancelAddSample() {
        this.addSampleVisible = false;
        this.addSample.sample = "";
      },

      deleteSample(item, index) {
        /** 样本删除函数 */
        item.splice(index, 1);
        this.isChange = 1;
      }
    }
  }

</script>

<style>
  .model_part{
    padding-left: 35%;
    height: 50px;
  }
  .main_container{
    margin-top: 30px;
    margin-left: 150px;
    margin-right: 150px;
  }
  .model_type{
    position: absolute;
    font-size:30px;
    line-height:50px;
    display:inline-block;
  }
  .notes{
    margin-left: 10px;
    color:#999999;
  }
  .top_train_block{
    margin-top: 30px;
    margin-left: 130px;
  }
  .text_train_container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    height: calc(100vh - 230px);
    min-height: 200px;
  }
  .text_label_container {
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
  .text_label_header {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    height: 1em;
  }
  .text_label {
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
  .text_item {
    background-color: #e0e0e0;
    margin: .5em;
    padding: 10px 15px;
    font-size: 1.2em;
    float: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 95%;
  }
  .text_sample {
    padding: .8em;
    overflow-y: scroll;
    margin-bottom: .4em;
    flex: 1;
  }
  .delete_sample {
    cursor: pointer;
    padding: 0 0 0 .35em;
    float: right;
  }
  .text_item .delete_sample{
    visibility: hidden;/*默认隐藏*/
  }
  .text_item:hover .delete_sample{
    visibility: visible;/*当鼠标hover时展示*/
  }
  .text_foot{
    text-align: center;
    height: 45px;
  }
  .add_text_button{
    font-size: 15px;
    text-align: center;
  }
</style>
