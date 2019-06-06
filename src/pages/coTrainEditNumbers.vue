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
        <span class="model_type">数字</span>
      </div>
      <div class="top_train_block">
        <el-row type="flex" class="row-bg" justify="end">
          <el-button type="primary" @click="labelAdd()">添加标签</el-button>
          <el-button type="success" @click="submitData()">提交并训练</el-button>
          <el-dialog title="添加标签" v-if='addLabelVisible' :visible.sync="addLabelVisible" :modal-append-to-body="false" align='center'>
            <el-form  :model="addLabel" :rules="labelRules" ref="addLabel">
              <el-row>
                <el-form-item label="标签名称：" style="width:50%" prop="label">
                  <el-input v-model="addLabel.label"></el-input>
                </el-form-item>
              </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button @click="cancelAddLabel()">取 消</el-button>
              <el-button type="primary" @click="confirmAddLabel()">确 定</el-button>
            </div>
          </el-dialog>
        </el-row>
      </div>

      <div class="text_train_container">
        <div class="text_label_container" v-for="(item, index) in tableData" :key='index'>

          <div class="text_label_header">
            <span class="text_label">{{item.label}}</span>
          </div>

          <div class="delete_label">
            <span class="iconfont icon-label_close" @click="deleteLabel(item)"/>
          </div>

          <div class="text_sample">
            <div class="numbers_item" v-for="(item2, index2) in item.contents" :key="index2">
              <span class="delete_sample iconfont icon-sample_close" @click="deleteSample(item.contents, index2)"/>
              <table  style="border-collapse:separate; border-spacing:0px 5px;font-family:STHeiti">
                <tr v-for="(item3, index3) in item2" style="font-size: .9em;display:table-row;">
                  <td align="right">
                    {{valueForm.valueData[index3].value}}
                  </td>
                  <td style="padding-left: 15px">
                    {{getInputValue(item3, index3)}}
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <div class="text_foot">
            <button class="add_text_button" @click="sampleAdd(index)">
              添加样本
            </button>
            <el-dialog title="添加样本" v-if='addSampleVisible' :visible.sync="addSampleVisible" align='center'>
              <el-form label-width="80px" :model="valueForm" :rules="valueRule" ref="valueForm">
                <template v-for="(item2, index2) in valueForm.valueData">
                  <el-form-item v-if="item2.type == 1" :label="item2.value" :prop="'valueData.' + index2 +'.inputValue'" :rules="valueRule.inputRule" style="width:50%">
                    <el-input v-model.number="item2.inputValue"></el-input>
                  </el-form-item>
                  <el-form-item v-if="item2.type == 0" :label="item2.value" :prop="'valueData.' + index2 +'.inputValue'" :rules="valueRule.selectRule" style="width:50%">
                    <el-select v-model="item2.inputValue" placeholder="数值选择" :disabled="isReadonly" style="width:100%">
                      <template v-for="(select, index3) in item2.multiSelect">
                        <el-option :key="select" :value=index3 :label="select"></el-option>
                      </template>
                    </el-select>
                  </el-form-item>
                </template>
              </el-form>
              <div slot="footer" class="dialog-footer">
                <el-button @click="cancelAddSample()">取 消</el-button>
                <el-button type="primary" @click='confirmAddSample()'>确 定</el-button>
              </div>
            </el-dialog>
          </div>
        </div>
      </div>

      <div v-if="isSuccess == true" class = 'foot_block'>
        <el-table :data="outputData" style="width: 100%">
          <el-table-column prop="trainLoss" label="训练误差" width="470" align="center"></el-table-column>
          <el-table-column prop="trainAccuracy" label="训练准确度" width="470" align="center"></el-table-column>
          <el-table-column prop="trainTime" label="训练用时(s)" width="470" align="center"></el-table-column>
        </el-table>
      </div>

      <div v-if="isSuccess == true" class="test_block">
        <el-form ref="test_data" label-width="120px">
          <el-form-item label="测试数据">
            <el-form label-width="80px" :model="testValueForm" :rules="valueRule" ref="testValueForm">
              <template v-for="(item, index) in testValueForm.valueData">
                <el-form-item v-if="item.type == 1" :label="item.value" :prop="'valueData.' + index +'.inputValue'" :rules="valueRule.inputRule" style="width:300px;margin-bottom: 20px">
                  <el-input v-model.number="item.inputValue"></el-input>
                </el-form-item>
                <el-form-item v-if="item.type == 0" :label="item.value" :prop="'valueData.' + index +'.inputValue'" :rules="valueRule.selectRule" style="width:300px;margin-bottom: 20px">
                  <el-select v-model="item.inputValue" placeholder="数值选择" :disabled="isReadonly" style="width:100%">
                    <template v-for="(select,index2) in item.multiSelect">
                      <el-option :key="select" :value=index2 :label="select"></el-option>
                    </template>
                  </el-select>
                </el-form-item>
              </template>
            </el-form>
            <el-button type="success" @click="confirmTestSubmit()">提交测试</el-button>
          </el-form-item>
        </el-form>

        <el-form label-width="120px">
          <el-form-item label="测试结果">
            <el-col :span=8>
              <span>{{test_output}}</span>
            </el-col>
          </el-form-item>
        </el-form>

        <el-form label-width="120px">
          <el-form-item label="测试用时">
            <el-col :span=8>
              <span>{{test_time}}</span>
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
        /** trainingText 数据 */
        account: '',          //用户名
        role: '',             //用户身份
        modelbasePath: '',    //我的模型库路径
        token: '',            //是否登录标识
        sessionId: '',        //会话标识
        classId: '',          //用户所在班级号
        isSuccess: false,     //模型是否已经训练
        dynamicTags:[],       //存储某一标签的所有样本
        isChange: 1,          //全局变量，用于判断数据表格是否发生变动
        modelName: '',        //模型名
        trainType: '',        //训练数据类型(文本)
        valueForm:{
          valueData:[]
        },
        testValueForm:{
          valueData:[]
        },
        addSampleVisible:false,
        addLabelVisible: false,
        addLabel:{
          label: ''
        },
        addSample:{
          sample:''
        },
        sampleButton: '',
        tableData: [],        //存放还原的所有训练数据
        outputData: [],       //存放训练模型的输出结果
        inputTestData:{
          testData: ''         //测试数据
        },
        test_data: [],
        test_output:'',
        test_time:'',
        trainUrl: '',         //训练URL
        testUrl: 'knnTest',   //测试URL
        labelRules:{
          label:[
            {required: true, message: '请输入标签名称', trigger: 'blur'},
            {min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur'}
          ]
        },
        valueRule:{
          inputRule:[
            { required: true, message: '请输入数值', trigger: 'blur' },
            { type: 'number', message: '输入必须为数值', trigger: 'blur' }
          ],
          selectRule:[
            {
              required: true,
              trigger: 'change',
              message: '请选择值'
            }
          ]
        },
        rules1:{              //模型公开权限&算法选择规则
          isPublic:[
            {
              required: true,
              trigger: 'change',
              message: '请选择模型权限'
            }
          ]
        },
        csrfToken: '',

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
        username:self.account,
        modelName:self.modelName
      })
      axios.post(apiUrl.numbersModelGetValue,uData,{
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        self.valueForm.valueData = JSON.parse(JSON.stringify(response.data.valueData));
        self.testValueForm.valueData = JSON.parse(JSON.stringify(response.data.valueData));
        console.log(self.valueForm.valueData);
      }).catch(function (error) {
        console.log(error);
      });
      axios.post(apiUrl.numbersIfTrain,uData,{
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        console.log(response.data[0])
        if(response.data[0] == "模型未训练"){
          self.ifTrain = false;
          var uData = JSON.stringify({
            teacher_name:self.account,
            model_name:self.modelName
          })
          axios.post(apiUrl.trainNumbersModel,uData,{
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            response.data.model_datas.forEach(element => {
              var tmpAddDev = {};
              tmpAddDev.label = element.label;
              tmpAddDev.contents = element.content;
              self.tableData.push(tmpAddDev);
            });
          })
            .catch(function (error) {
              console.log(error);
            });
        }
        else{
          self.ifTrain = true;
          var uData = JSON.stringify({
            username:self.account,
            modelName:self.modelName
          })
          axios.post(apiUrl.numbersEditModel,uData,{
            headers:{"Content-Type": "application/json;charset=utf-8"}
          }).then(function (response) {
            self.tableData = response.data.trainData;
            self.valueForm.valueData = JSON.parse(JSON.stringify(response.data.valueData));
            self.testValueForm.valueData = JSON.parse(JSON.stringify(response.data.valueData));
          }).catch(function (error) {
            console.log(error);
          });
        }
      }).catch(function (error2) {
        console.log(error2);
      });
    },
    methods: {
      myModelBase(){
        /** 我的模型库跳转函数 */
        const self = this;
        var username = self.account;
        if(username == ""){
          this.$message({
            type: 'info',
            message: "您尚未登录"
          });
        }
        else{
          self.$router.push(this.modelbasePath);
        }
      },

      logout(){
        /** 注销函数 */
        window.location.href = "https://homepagetest.tuopinpin.com/";
      },

      getInputValue(item, index){
        var ret = "";
        if (this.valueForm.valueData[index].type == 1)
          ret = item;
        else
          ret = this.valueForm.valueData[index]["multiSelect"][item];
        return ret;
      },

      confirmTestSubmit(){
        /** 模型测试提交函数 */
        this.$refs["testValueForm"].validate((valid) => {
          if (valid) {
            this.test_data = [];
            var username = this.account;
            for (var item of this.testValueForm.valueData){
              this.test_data.push(item.inputValue);
            }
            var tData = JSON.stringify({
              username:username,
              modelName:this.modelName,
              testData:this.test_data
            })
            axios.post(apiUrl.numbersTestModel,tData,{
              headers:{"Content-Type": "application/json;charset=utf-8"}
            })
              .then(function (response) {
                this.test_output = response.data.prediction;
                this.test_time = response.data.time;
              }.bind(this))
              .catch(function (error) {
                console.log(error);
              });
          }
        });
      },

      submitData(){
        /** 模型提交训练函数 */
        var tmp = false;
        if(this.tableData.length == 0){
          this.$message({
            type: 'error',
            message: "训练数据不能为空"
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
        if(tmp == false){
          //提交训练数据确认函数
          this.$confirm('是否提交?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
          }).then(() => {
            this.confirmSubmit();
          })
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
            model_type: 1,
            public_status:1,
            valueData:this.valueForm.valueData,
            trainData:[]
          })
        } //当数据部分未发生修改的时候，traindata部分置为空（不重复发送未改变的数据）
        else{
          tData = JSON.stringify({
            username:this.account,
            modelName:this.modelName,
            trainData:this.tableData,
            valueData:this.valueForm.valueData,
            public_status:1,
            model_type: 1
          })
          this.isChange = 0;
        }
        console.log(tData);
        const self = this;
        axios.post(apiUrl.numbersOptimalTrain,tData,{    
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
          self.isSuccess = true;
          self.$message({
            type: 'success',
            message: "训练成功"
          });
        })
        .catch(function (error) {
        console.log(error);
        });
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

      labelAdd() {
        /** 标签添加函数 */
        this.addLabelVisible = true;
        this.isChange = 1;
      },

      confirmAddLabel(){
        /** 标签添加确认函数 */
        this.$refs["addLabel"].validate((valid) => {
          if (valid) {
            let flag = true;
            for(var item of this.tableData){
              if(this.addLabel.label == item.label){
                flag = false;
                break;
              }
            }
            if (flag){
              var tmp = {};
              tmp.label = this.addLabel.label;
              tmp.contents = [];
              this.tableData.push(tmp);
              this.isChange = 1;
            }
            this.addLabel.label = "";
            this.addLabelVisible = false;
          }
        })
      },

      cancelAddLabel() {
        /** 取消函数（按钮） */
        this.addLabelVisible = false;
        this.addLabel.label = "";
      },

      deleteLabel(item){
        this.$confirm(`确定移除 标签： ${ item.label }？`, '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
          // 向Django后端发送物理删除请求，将该标签的文件夹删除，并删除数据库中该文件夹所有的内容
          this.tableData.splice(this.tableData.indexOf(item),1);
          this.isChange = 1;
        }).catch(() => {});
      },

      sampleAdd(index) {
        /** 样本添加函数 */
        this.sampleButton = index;
        this.addSampleVisible = true;
        this.isChange = 1;
      },

      confirmAddSample(){
        /** 添加样本确认函数 */
        var index = this.sampleButton;
        this.$refs["valueForm"][index].validate((valid) => {
          if (valid) {
            var uData = [];
            for (var item2 of this.valueForm.valueData){
              uData.push(item2.inputValue);
              item2.inputValue = "";
            }
            this.tableData[index].contents.push(uData);
            this.addSampleVisible = false;
            this.sampleButton = "";
            this.isChange = 1;
          }
        });
      },

      cancelAddSample() {
        this.addSampleVisible = false;
        for (var item2 of this.valueForm.valueData){
          item2.inputValue = "";
        }
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
  .delete_label {
    background-color: #fff;
    border-radius: 1em;
    cursor: pointer;
    position: absolute;
    top: -.8em;
    right: 0;
  }
  .text_label_container .delete_label{
    display:none;/*默认隐藏*/
  }
  .text_label_container:hover .delete_label{
    display:inline;/*当鼠标hover时展示*/
  }
  .numbers_item {
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
  .numbers_item .delete_sample{
    visibility: hidden;/*默认隐藏*/
  }
  .numbers_item:hover .delete_sample{
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
