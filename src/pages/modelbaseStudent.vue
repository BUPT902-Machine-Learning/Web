<template>
    <div>
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

        <div class="my_model_block">
            <img class = "model_pic" src = '../assets/myModel.png' style="width:50px;height:50px;">
            <span style="font-size:25px;">我的模型</span>
            <el-table ref="multipleTable" :data="studentData" tooltip-effect="dark" size = "medium" style="width: 100%" >
                <el-table-column property="Number" label="编号" align='center'></el-table-column>

                <el-table-column property="ModelName" label="模型名" align='center'></el-table-column>

                <el-table-column property="DataType" label="数据类型" align='center'></el-table-column>

                <el-table-column property="UsingAlgorithm" label="训练算法" align='center'></el-table-column>

                <el-table-column property="BuildTime" label="模型创建时间" align='center'></el-table-column>

                <el-table-column property="UpdateTime" label="更新时间" align='center'></el-table-column>

                <el-table-column label="操作" align='center'>
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="editModel(scope.row)">修改模型</el-button>
                        <el-button size="mini" type="text" @click="deleteModel(scope.row)">删除模型</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <el-row type="flex" class="row-bg" justify="end">
                <el-button type="primary" @click="buildNewModel()">训练新模型</el-button>
                <el-button type="success" @click="myTurntoScratch()">进入Scratch3</el-button>
            </el-row>
        </div>

        <div class="teacher_model_block">
            <img class = "model_pic" src = '../assets/teacherModel.png'  style="width:50px;height:50px;">
            <span style="font-size:25px;">教师模型</span>
            <el-table ref="multipleTable" :data="teacherData" tooltip-effect="dark" size = "medium" style="width: 100%" >
                <el-table-column property="Number" label="编号" align='center'></el-table-column>

                <el-table-column property="ModelName" label="模型名" align='center'></el-table-column>

                <el-table-column property="TeacherName" label="创建教师" align='center'></el-table-column>

                <el-table-column property="DataType" label="数据类型" align='center'></el-table-column>

                <el-table-column property="UsingAlgorithm" label="训练算法" align='center'></el-table-column>

                <el-table-column property="BuildTime" label="模型创建时间" align='center'></el-table-column>

                <el-table-column property="UpdateTime" label="更新时间" align='center'></el-table-column>

                <el-table-column label="操作" align='center'>
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="testModel(scope.row)">测试模型</el-button>
                        <el-button size="mini" type="text" @click="turntoScratch(scope.row)">应用模型</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="cooperate_model_block">
            <img class = "model_pic" src = '../assets/cooperation.png'  style="width:50px;height:50px;">
            <span style="font-size:25px;">合作模型</span>
            <el-table ref="multipleTable" :data="cooperateData" tooltip-effect="dark" size = "medium" style="width: 100%" >
                <el-table-column property="Number" label="编号" align='center'></el-table-column>

                <el-table-column property="ModelName" label="模型名" align='center'></el-table-column>

                <el-table-column property="TeacherName" label="创建教师" align='center'></el-table-column>

                <el-table-column property="DataType" label="数据类型" align='center'></el-table-column>

                <el-table-column property="UsingAlgorithm" label="训练算法" align='center'></el-table-column>

                <el-table-column property="BuildTime" label="模型创建时间" align='center'></el-table-column>

                <el-table-column property="UpdateTime" label="更新时间" align='center'></el-table-column>

                <el-table-column label="操作" align='center'>
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="testCooperateModel(scope.row)">测试模型</el-button>
                        <el-button size="mini" type="text" @click="turntoScratch(scope.row)">应用模型</el-button>
                        <el-button size="mini" type="text" @click="addData(scope.row)">添加数据</el-button>
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
        csrfToken: ''       //CSRF标识
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
                alert(response.data.message);
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
            var tmpData = response.data.my_models;
            var tmp_count = 1;
            tmpData.forEach(element => {
                var addModel = {};
                addModel.Number = tmp_count;
                tmp_count += 1;
                addModel.ModelName = element.cn_name;
                addModel.UsingAlgorithm = element.algorithm;
                addModel.DataType = element.data_type;
                addModel.BuildTime = element.data_create;
                addModel.UpdateTime = element.data_update;
                self.studentData.push(addModel);
            });
            /** 将学生所在班级的教师的模型信息显示在table中 */
            tmpData = response.data.tech_models;
            tmp_count = 1;
            tmpData.forEach(element => {
                var addModel = {};
                addModel.ModelName = element.cn_name;
                addModel.TeacherName = element.tech_name; //此处添加了从后端获取合作模型的创建者的名字
                addModel.UsingAlgorithm = element.algorithm;
                addModel.DataType = element.data_type;
                addModel.BuildTime = element.data_create;
                addModel.UpdateTime = element.data_update;
                addModel.Number = tmp_count;
                tmp_count += 1;
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
                var tmp_count = 1;
                tmpData.forEach(element => {
                    var addModel = {};
                    addModel.ModelName = element.cn_name;
                    addModel.TeacherName = element.teacher; //此处添加了从后端获取合作模型的创建者的名字
                    addModel.UsingAlgorithm = element.algorithm;
                    addModel.DataType = element.data_type;
                    addModel.BuildTime = element.data_create;
                    addModel.UpdateTime = element.data_update;
                    addModel.Number = tmp_count;
                    tmp_count += 1;
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
            axios.post(apiUrl.ifTrain,uData,{    
                headers:{"Content-Type": "application/json;charset=utf-8"}
            }).then(function (response) {
                if(response.data == "模型已训练"){
                    alert("模型已训练");
                }
                else{
                    var tName = row.TeacherName;
                    var mName = row.ModelName;
                    self.$router.push({name:'coTrainStuText',params:{teacherName:tName,modelName:mName}});
                }
            }).catch(function (error2) {
                console.log(error2);
            });
        },
        testModel(row){
            var self = this;
            self.$router.push({name:'modelTest',params:{userName:row.TeacherName,modelName:row.ModelName}});
        },
        testCooperateModel(row){
            var self = this;
            var uData = JSON.stringify({
                username:row.TeacherName,
                modelName:row.ModelName
            })
            axios.post(apiUrl.ifTrain,uData,{    
                headers:{"Content-Type": "application/json;charset=utf-8"}
            }).then(function (response) {
                if(response.data == "模型未训练"){
                    alert("模型未训练");
                }
                else{
                    self.$router.push({name:'modelTest',params:{userName:row.TeacherName,modelName:row.ModelName}});
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
            self.$router.push({name:'modelEdit',params:{modelName:row.ModelName}});
        },
        deleteModel(row){
            //提交训练数据确认函数
            this.$confirm('是否删除?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(() => {
                this.modelDelete(row);
            }).catch(() => {
                console.log(error);
            });
        },
        modelDelete(row){
            var uData = JSON.stringify({
                username:this.account,
                modelName:row.ModelName,
                data_type:row.DataType
            })
            axios.post(apiUrl.deleteModel,uData,{    
                headers:{"Content-Type": "application/json;charset=utf-8"}
            }).then(function (response) {
                if(response.data == "delete_error"){
                    alert("删除错误");
                    window.location.reload();
                }
                else{
                    alert("删除成功");
                    window.location.reload();
                }
            })
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
  .my_model_block{
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
