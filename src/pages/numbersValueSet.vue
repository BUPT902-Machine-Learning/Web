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
        <el-form ref="ruleForm" :model="ruleForm" :rules="moreNotifyOjbectRules">
          <div v-for="(item, index) in ruleForm.moreNotifyObject" :key="item.key">
            <el-row>
            <el-col :span="7">
              <el-form-item label="数值名称:" :prop="'moreNotifyObject.' + index +'.value'" :rules="moreNotifyOjbectRules.valueRule">
                <el-input v-model="item.value" placeholder="数值名称" :disabled="isReadonly" style="width:300px"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="数值类型:" :prop="'moreNotifyObject.'+ index +'.type'" :rules="moreNotifyOjbectRules.typeRule">
                <el-select v-model="item.type" placeholder="数值类型" @change="typeChange(item)" :disabled="isReadonly" style="width:300px">
                  <el-option label="数字" value=1></el-option>
                  <el-option label="多选" value=0></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item v-if="item.isShow" label="添加选择:" :prop="'moreNotifyObject.' + index +'.multiSelect'" :rules="moreNotifyOjbectRules.multiSelectRule">
                <el-tag v-for="tag in item.multiSelect" closable :disable-transitions="false" @close="handleClose(tag, index)">{{tag}}
                </el-tag>
                <el-input class="input-new-tag" v-if="item.inputVisible" v-model="item.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(item)" @blur="handleInputConfirm(item)">
                </el-input>
                <el-button v-else class="button-new-tag" size="small" @click="showInput(index)">+ 新选项</el-button>
              </el-form-item>
            </el-col>
            </el-row>
            <el-button v-if="index > 0" @click="deleteRules(item, index)" :disabled="isReadonly">删除</el-button>
          </div>
          <el-form-item v-show="!isRead">
            <el-button type="primary" @click="addUser()">添加数值</el-button>
          </el-form-item>
        </el-form>
        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="success" @click="nextStep()">下一步</el-button>
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
        account: '',
        modelName:"",
        role: '',
        modelbasePath: '',
        token: '',
        sessionid: '',
        ruleForm:{
          moreNotifyObject: [{
            value: "",
            type: "",
            multiSelect:[],
            isShow: false,
            inputVisible: false,
            inputValue: ''
          }],
        },
        moreNotifyOjbectRules: {
          valueRule: [
            { required: true, message: '请输入数值名称', trigger: 'blur' },
            {
              validator: (rule, value, callback) => {
                if (value.length > 15 || value.length < 2) {
                  callback(new Error('长度必须为2~8个字符'))
                } else {
                  var reg = new RegExp("[`~!@#$^&*()=|{}':',\\[\\].<>《》/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]")
                  if (reg.test(value)) {
                    callback(new Error('不能含有特殊字符'))
                  } else {
                    callback()
                  }
                }
              },
              trigger: 'change'
            }
          ],
          typeRule: [
            { required: true, message: '请选择数值类型', trigger: 'change' }
          ],
          multiSelectRule:[
            {
              validator: (rule, value, callback) => {
                if (value.length > 10 || value.length < 2) {
                  callback(new Error('选择项必须多余两个'))
                }else {
                  callback()
                }
              }
            }
          ]
        }
      }
    },
    mounted(){
      const self = this;
      self.modelName = self.$route.params.modelName;
       //从cookie中获取token、username、sessionid三个参数
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
      if(self.role == "teacher"){
        this.modelbasePath = "/modelbaseTeacher";
      }
      else{
        self.modelbasePath = "/modelbaseStudent";
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
      this.ruleForm.moreNotifyObject = []
      this.ruleForm.moreNotifyObject.push({
        value: '',
        type: '',
        multiSelect:[],
        isShow: false,
        inputVisible: false,
        inputValue: ''
      })
    },
    methods: {
      myModelBase(){
        /** 我的模型库跳转函数 */
        const self = this;
        var username = self.account;
        if(username == ""){
          alert("您尚未登录");
        }
        else{
          self.$router.push(this.modelbasePath);
        }
      },
      logout(){
        /** 注销函数 */
        const self = this;
        self.isLog = false;
        this.ifShow = false;
        window.location.href = "https://homepagetest.tuopinpin.com/";
        this.ifShow = true;
      },
      typeChange(item){
        if(item.type == 0)
          item.isShow = true;
        else if(item.type == 1){
          item.isShow = false;
          item.multiSelect = [];
        }
      },
      addUser() {
        this.ruleForm.moreNotifyObject.push({
          value: '',
          type: '',
          multiSelect:[],
          isShow: false,
          inputVisible: false,
          inputValue: ''
        })
      },
      deleteRules(item, index) {
        this.index = this.ruleForm.moreNotifyObject.indexOf(item)
        if (index !== -1) {
          this.ruleForm.moreNotifyObject.splice(index, 1)
        }
      },
      handleClose(tag, index) {
        this.ruleForm.moreNotifyObject[index].multiSelect.splice(this.ruleForm.moreNotifyObject[index].multiSelect.indexOf(tag), 1);
      },

      showInput(index) {
        this.ruleForm.moreNotifyObject[index].inputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput[index].$refs.input.focus();
        });
      },

      handleInputConfirm(item) {
        let inputValue = item.inputValue;
        let flag = true;
        if (inputValue) {
          for(var i = 0; i < item.multiSelect.length; i++){
            if(inputValue == item.multiSelect[i]){
              flag = false;
              break;
            }
          }
          if (flag)
            item.multiSelect.push(inputValue);
        }
        item.inputVisible = false;
        item.inputValue = '';
      },
      nextStep(){
        this.$refs["ruleForm"].validate((valid) => {
          if (valid) {
            var nameSet = [];
            for (var i = 0; i < this.ruleForm.moreNotifyObject.length; i++)
              nameSet.push(this.ruleForm.moreNotifyObject[i].value);
            var nary = nameSet.sort();
            for (var i = 0; i < nary.length - 1; i++) {
              if (nary[i] == nary[i + 1]) {
                alert("重复命名");
                return;
              }
            }
            this.$store.dispatch("setValueData", this.ruleForm.moreNotifyObject);
            this.$router.push({name:'trainingNumbers',params:{modelName:this.modelName}});
            // var uData = JSON.stringify({
            //   username:this.account,
            //   model_name:this.modelName,
            //   value_set_data:this.ruleForm.moreNotifyObject
            // })
            // axios.post(apiUrl.numbersValueSet,uData,{
            //   headers:{"Content-Type": "application/json;charset=utf-8"}
            // }).then(function (response) {
            //   var self = this;
            //   /**When logincheck is failed, turn to tuopinpin.com */
            //   this.$router.push({name:'trainingNumbers',params:{modelName:this.modelName}});
            // }.bind(this)).catch(function (error) {
            //   console.log(error);
            // });
          }
        });
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
  .el-tag + .el-tag {
    margin-left: 10px;
  }
  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }
  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
