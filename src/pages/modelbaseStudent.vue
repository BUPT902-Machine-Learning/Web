<template>
    <div>
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
                    <el-button type="success" size="small" @click="myModelBase()">
                      我的模型库
                    </el-button>
                    <el-button type="warning" size="small" @click="myTurntoScratch()">
                      进入scratch3
                    </el-button>
                  </ul>
                </div>
            </div>
        </div>

        <div class="my_model_block">
            <img class = "model_pic" src = '../assets/myModel.png' style="width:50px;height:50px;">
            <span style="font-size:25px;">我的模型</span>
            <el-row type="flex" class="row-bg" justify="end">
              <el-button type="primary" @click="buildNewModel()">＋训练新模型</el-button>
            </el-row>
            <el-table ref="multipleTable" :data="studentData" tooltip-effect="dark" style="width: 100%">
                <el-table-column property="Number" label="编号" type="index" align='center' width="150px"></el-table-column>

                <el-table-column property="ModelName" label="模型名" align='center' width="150px"></el-table-column>

                <el-table-column property="DataType" label="数据类型" align='center' width="150px"></el-table-column>

                <el-table-column property="UsingAlgorithm" label="训练算法" align='center' width="150px"></el-table-column>

                <el-table-column property="BuildTime" label="模型创建时间" align='center'></el-table-column>

                <el-table-column property="UpdateTime" label="更新时间" align='center'></el-table-column>

                <el-table-column label="操作" align='center' width="300px">
                    <template slot-scope="scope">
                      <el-button-group>
                        <el-button size="mini" type="success" @click="testMyModel(scope.row)" icon="el-icon-check" plain>测试</el-button>
                        <el-button size="mini" type="primary" @click="editModel(scope.row)" icon="el-icon-edit" plain>修改</el-button>
                        <el-button size="mini" type="danger" @click="deleteModel(scope.row, scope.$index)" icon="el-icon-delete" plain>删除</el-button>
                      </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <div class="teacher_model_block">
            <img class = "model_pic" src = '../assets/teacherModel.png'  style="width:50px;height:50px;">
            <span style="font-size:25px;">教师模型</span>
            <el-table ref="multipleTable" :data="teacherData" tooltip-effect="dark" size = "medium" style="width: 100%" >
                <el-table-column property="Number" label="编号" type="index" align='center'></el-table-column>

                <el-table-column property="ModelName" label="模型名" align='center'></el-table-column>

                <el-table-column property="TeacherName" label="创建教师" align='center'></el-table-column>

                <el-table-column property="DataType" label="数据类型" align='center'></el-table-column>

                <el-table-column property="UsingAlgorithm" label="训练算法" align='center'></el-table-column>

                <el-table-column property="BuildTime" label="模型创建时间" align='center'></el-table-column>

                <el-table-column property="UpdateTime" label="更新时间" align='center'></el-table-column>

                <el-table-column label="操作" align='center'>
                    <template slot-scope="scope">
                      <el-button size="mini" type="success" @click="testTModel(scope.row)" icon="el-icon-check" plain>测试</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="cooperate_model_block">
            <img class = "model_pic" src = '../assets/cooperation.png'  style="width:50px;height:50px;">
            <span style="font-size:25px;">合作模型</span>
            <el-table ref="multipleTable" :data="cooperateData" tooltip-effect="dark" size = "medium" style="width: 100%" >
                <el-table-column property="Number" label="编号" type="index" align='center'></el-table-column>

                <el-table-column property="ModelName" label="模型名" align='center'></el-table-column>

                <el-table-column property="TeacherName" label="创建教师" align='center'></el-table-column>

                <el-table-column property="DataType" label="数据类型" align='center'></el-table-column>

                <el-table-column property="UsingAlgorithm" label="训练算法" align='center'></el-table-column>

                <el-table-column property="BuildTime" label="模型创建时间" align='center'></el-table-column>

                <el-table-column property="UpdateTime" label="更新时间" align='center'></el-table-column>

                <el-table-column label="操作" align='center' width="300px">
                    <template slot-scope="scope">
                      <el-button-group>
                        <el-button size="mini" type="success" @click="testCooperateModel(scope.row)" icon="el-icon-check" plain>测试</el-button>
                        <el-button size="mini" type="success" @click="turntoScratch(scope.row)" icon="el-icon-check" plain>scratch</el-button>
                        <el-button size="mini" type="primary" @click="addData(scope.row)" icon="el-icon-edit" plain>添加数据</el-button>
                      </el-button-group>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="app-foot">
            <p>Machine Learning for Tuopinpin</p>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import qs from 'qs'
import layout from '../components/layout.vue';
import { apiUrl } from '../utils/apiUrl';
export default {
    data() {
      return {
        /** modelbase 数据*/
        studentData: [],    //存放学生模型的具体数据
        teacherData: [],    //存放教师模型的具体数据
        cooperateData: [],  //存放合作模型的具体数据
        account: '',        //用户名
        token: '',          //登录标识
        sessionId: '',      //会话标识
        role: '',           //登录用户身份
        classId: '',        //用户所在班级号
        csrfToken: '',       //CSRF标识
        ifTrain: ''
        }
    },
    mounted: function () {
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
        if(self.role == "teacher"){
            self.$router.push("/modelbaseTeacher");
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

        /** 学生获取普通模型 */
        var uData = JSON.stringify({
            username:self.account,
            class_no:self.classId
        })
        axios.post(apiUrl.stuGetModels,uData,{    
            headers:{"Content-Type": "application/json;charset=utf-8"}
        }).then(function (response) {
            /** 将获取的学生的所有模型信息显示在table中 */
            console.log(response.data);
            var tmpData = response.data.my_models;
            tmpData.forEach(element => {
                var addModel = {};
                addModel.ModelName = element.cn_name;
                addModel.UsingAlgorithm = element.algorithm;
                addModel.DataType = element.data_type;
                addModel.BuildTime = element.data_create;
                addModel.UpdateTime = element.data_update;
                self.studentData.push(addModel);
            });
            /** 将学生所在班级的教师的模型信息显示在table中 */
            tmpData = response.data.teach_models;
            tmpData.forEach(element => {
                var addModel = {};
                addModel.ModelName = element.cn_name;
                addModel.TeacherName = element.teach_name; //此处添加了从后端获取合作模型的创建者的名字
                addModel.UsingAlgorithm = element.algorithm;
                addModel.DataType = element.data_type;
                addModel.BuildTime = element.data_create;
                addModel.UpdateTime = element.data_update;
                self.teacherData.push(addModel);
            });
        }).catch(function (error2) {
            console.log(error2);
        });

        var uData = JSON.stringify({
            username:self.account,
            class_no:self.classId
        })
        axios.post(apiUrl.stuGetCreateModel,uData,{    
            headers:{"Content-Type": "application/json;charset=utf-8"}
        }).then(function (response) {
            if(response.data != "此学生未加入任何班级"){
                var tmpData = response.data;
                tmpData.forEach(element => {
                    var addModel = {};
                    addModel.ModelName = element.cn_name;
                    addModel.TeacherName = element.teach_name; //此处添加了从后端获取合作模型的创建者的名字
                    addModel.UsingAlgorithm = element.algorithm;
                    addModel.DataType = element.data_type;
                    addModel.BuildTime = element.data_create;
                    addModel.UpdateTime = element.data_update;
                    self.cooperateData.push(addModel);
                })
            }
        }).catch(function (error) {
            console.log(error);
        });
    },
    component:{
        'layout':layout
    },
    methods:{
        addData(row){
            //跳转到coTrainStuText页面，并将模型名传递过去
            var self = this;
            var uData = JSON.stringify({
                username:row.TeacherName,
                modelName:row.ModelName
            })
          if (row.DataType == "文本"){
            self.ifTrain = apiUrl.textIfTrain;
          }
          else if (row.DataType == "数字"){
            self.ifTrain = apiUrl.numbersIfTrain;
          }
          else{
            self.ifTrain = apiUrl.imageIfTrain;
          }
            axios.post(self.ifTrain,uData,{    
                headers:{"Content-Type": "application/json;charset=utf-8"}
            }).then(function (response) {
                if(response.data === "模型已训练" || response.data === "模型训练中"){
                  self.$message({
                    type: 'error',
                    message: "模型已训练，无法提交数据"
                  });
                }
                else{
                    var tName = row.TeacherName;
                    var mName = row.ModelName;
                  if (row.DataType == "文本"){
                    self.$router.push({name:'coTrainStuText',params:{teacherName:tName,modelName:mName}});
                  }
                  else if (row.DataType == "数字"){
                    self.$router.push({name:'coTrainStuNumbers',params:{teacherName:tName,modelName:mName}});
                  }
                  else{
                    self.$router.push({name:'coTrainStuImage',params:{teacherName:tName,modelName:mName}});
                  }

                }
            }).catch(function (error2) {
                console.log(error2);
            });
        },
        testMyModel(row){
          /** 测试模型 */
          var self = this;
          if(row.DataType == "图像"){
            var uData = JSON.stringify({
              username:row.teacherName,
              modelName:row.ModelName
            })
            axios.post(apiUrl.imageIfTrain,uData,{
              headers:{"Content-Type": "application/json;charset=utf-8"}
            }).then(function (response) {
              /**When logincheck is failed, turn to tuopinpin.com */
              if(response.data == "模型未训练"){
                self.$message({
                  type: 'error',
                  message: "模型未训练，无法使用！"
                });
              }
              else if(response.data == "模型训练中"){
                self.$message({
                  type: 'info',
                  message: "模型训练中，请稍后！"
                });
              }
              else{
                self.$router.push({name:'imageModelTest',params:{userName:self.account,modelName:row.ModelName}});
              }
            }).catch(function (error) {
              console.log(error);
            });
          }
          else if(row.DataType == "文本"){
            self.$router.push({name:'textModelTest',params:{userName:self.account,modelName:row.ModelName}});
          }
          else {
            self.$router.push({name:'numbersModelTest',params:{userName:self.account,modelName:row.ModelName}});
          }
        },
      testTModel(row){
        /** 测试模型 */
        var self = this;
        if(row.DataType == "图像"){
          var uData = JSON.stringify({
            username:row.TeacherName,
            modelName:row.ModelName
          })
          axios.post(apiUrl.imageIfTrain,uData,{
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            /**When logincheck is failed, turn to tuopinpin.com */
            if(response.data == "模型未训练"){
              self.$message({
                type: 'error',
                message: "模型未训练，无法使用！"
              });
            }
            else if(response.data == "模型训练中"){
              self.$message({
                type: 'info',
                message: "模型训练中，请稍后！"
              });
            }
            else{
              self.$router.push({name:'imageModelTest',params:{userName:row.TeacherName,modelName:row.ModelName}});
            }
          }).catch(function (error) {
            console.log(error);
          });
        }
        else if(row.DataType == "文本"){
          self.$router.push({name:'textModelTest',params:{userName:row.TeacherName,modelName:row.ModelName}});
        }
        else {
          self.$router.push({name:'numbersModelTest',params:{userName:row.TeacherName,modelName:row.ModelName}});
        }
      },
        testCooperateModel(row){
            var self = this;
            var uData = JSON.stringify({
                username:row.TeacherName,
                modelName:row.ModelName
            })
          if (row.DataType == "文本"){
            self.ifTrain = apiUrl.textIfTrain;
          }
          else if (row.DataType == "数字"){
            self.ifTrain = apiUrl.numbersIfTrain;
          }
          else{
            self.ifTrain = apiUrl.numbersIfTrain;
          }
            axios.post(self.ifTrain,uData,{    
                headers:{"Content-Type": "application/json;charset=utf-8"}
            }).then(function (response) {
                if(response.data == "模型未训练"){
                  self.$message({
                    type: 'error',
                    message: "模型未训练"
                  });
                }
                else{
                  if (row.DataType == "文本")
                    self.$router.push({name:'textModelTest',params:{userName:row.TeacherName,modelName:row.ModelName}});
                }
            }).catch(function (error2) {
                console.log(error2);
            });
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
        logout(){
            /** 注销函数 */
            window.location.href = "https://homepagetest.tuopinpin.com/";
        },
        editModel(row){
            //提交训练数据确认函数
            this.$confirm('是否编辑模型?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(() => {
                this.modelEdit(row);
            }).catch(() => {
                console.log(error);
            });
        },
        modelEdit(row) {
            const self = this;
            if (row.DataType == "文本"){
              self.$router.push({name:'textModelEdit',params:{modelName:row.ModelName}});
            }
            else if (row.DataType == "数字"){
              self.$router.push({name:'numbersModelEdit',params:{modelName:row.ModelName}});
            }
            else{
              var uData = JSON.stringify({
                username:row.teacherName,
                modelName:row.ModelName
              })
              axios.post(apiUrl.imageIfTrain,uData,{
                headers:{"Content-Type": "application/json;charset=utf-8"}
              })
                .then(function (response) {
                  var temp = response.data;
                  if(temp === "模型未训练"){
                    var modelStatus = "未训练";
                  }else if(temp === "模型训练中"){
                    var modelStatus = "训练中";
                  }else{
                    var modelStatus = "已训练";
                  }
                  self.$router.push({name:'imageModelEdit',params:{userName:self.account,modelName:row.ModelName,modelStatus:modelStatus}});
                }).catch(function (error) {
                console.log(error);
              });
            }
        },
        deleteModel(row, index){
            //提交训练数据确认函数
            this.$confirm('是否删除?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(() => {
                this.modelDelete(row, index);
            }).catch(() => {
                console.log(error);
            });
        },
        modelDelete(row, index){
          var uData = JSON.stringify({
            username:this.account,
            modelName:row.ModelName,
            data_type:row.DataType
          })
          axios.post(apiUrl.deleteModel,uData,{
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            if(response.data == "delete_error"){
              this.$message({
                type: 'error',
                message: "删除失败"
              });
            }
            else{
              this.$message({
                type: 'success',
                message: "删除成功"
              });
              this.studentData.splice(index, 1);
            }
          }.bind(this))
            .catch(function (error) {
              console.log(error);
            });
        },
        buildNewModel(){
            const self = this;
            self.$router.push('/modelBuildStudent');
        },
        myTurntoScratch(){
            const self = this;
            var username = self.account;
            window.location.href = "https://scratch3test.tuopinpin.com/index.html?username=" + self.account + "&role=" + self.role + "&class_no=" + self.classId;
        },
        turntoScratch(row){
            const self = this;
            var username = self.account;
            window.location.href = "https://scratch3test.tuopinpin.com/index.html?username=" + row.TeacherName + "&modelname=" + row.ModelName;
        },
        setCookie(cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = "expires=" + d.toUTCString();
            console.info(cname + "=" + cvalue + "; " + expires);
            document.cookie = cname + "=" + cvalue + "; " + expires;
            console.info(document.cookie);
        },
        getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
            }
            return "";
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
  .my_model_block{
    margin-top: 50px;
    margin-left: 300px;
    margin-right: 300px;
  }
  .teacher_model_block{
    margin-left: 300px;
    margin-right: 300px;
  }
  .cooperate_model_block{
    margin-top: 50px;
    margin-left: 300px;
    margin-right: 300px;
  }
</style>
