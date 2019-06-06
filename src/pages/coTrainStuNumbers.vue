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
          <el-button type="success" @click="submitData()">提交数据</el-button>
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
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { apiUrl } from '../utils/apiUrl';
import { mapActions, mapState, mapGetters } from "vuex";

  export default {
    data() {
      return {
        account: '',
        role: '',
        modelBasePath: '',
        token: '',
        sessionid: '',
        valueForm:{
          valueData:[]
        },
        isSuccess: false,
        isKNN: false,
        isCNN: false,
        isRNN: false,
        param:{},
        dynamicTags:[],
        isChange: 0,    //全局变量，用于判断数据表格是否发生变动
        modelName: '',  //模型名
        trainType: '',  //训练数据类型(文本)
        addSampleVisible:false,
        addLabelVisible: false,
        addLabel:{
          label: ''
        },
        sampleButton: '',
        tableData: [],
        paginations: {
          page_index: 1, // 当前位于哪页
          total: 0, // 总数
          page_size: 5, // 1页显示多少条
          page_sizes: [1, 5, 10, 15, 20], //每页显示多少条
          layout: "total, sizes, prev, pager, next, jumper" // 翻页属性
        },
        postData:{
        },
        outputData: [
        ],//存放训练模型的输出结果
        test_data: [],
        test_output:'',
        test_time:'',
        trainUrl: '',
        testUrl: '',
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
        rules1:{
          isPublic:[
            {
              required: true,
              trigger: 'change',
              message: '请选择模型权限'
            }
          ],
          algoSelect:[
            {
              required: true,
              trigger: 'change',
              message: '请选择算法'
            }
          ]
        },
        rules2: {
          embedding_dim: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          num_filters: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          kernel_size: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1||value>5) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          fully_connected_dim: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          dropout_keep_prob: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>1||value<0) {
                    callback('数值超出范围');
                  }
                  else if((/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/).test(value) == false) {
                    callback('请输入数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          batch_size: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          num_epochs: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value<1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          num_layers: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>2||value<1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          hidden_dim: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>128||value<1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          rnn_type: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value != 0 && value != 1) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
          ],

          k: [
            {
              validator(rule, value, callback, source, options) {
                var errors = [];
                if (value == ""){
                  if (value>7||value<2) {
                    callback('数值超出范围');
                  }
                  else if ((/^[+]{0,1}(\d+)$/).test(value) == false){
                    callback('请输入整数数值');
                  }
                }
                else{
                  callback();
                }
                callback(errors);
              }
            }
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
      if(self.role == "teacher"){
        this.modelBasePath = "/modelbaseTeacher";
      }
      else{
        self.modelBasePath = "/modelbaseStudent";
      }
      if(this.getValueData == "")
        this.$router.push(this.modelBasePath);
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
      axios.post(apiUrl.numbersModelGetValue,uData,{
        headers:{"Content-Type": "application/json;charset=utf-8"}
      }).then(function (response) {
        self.valueForm.valueData = JSON.parse(JSON.stringify(response.data.valueData));
      }).catch(function (error) {
        console.log(error);
      });
      var uData = JSON.stringify({
        username:self.teacherName,
        modelName:self.modelName
      })
      axios.post(apiUrl.getNumbersModelData,uData,{
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
          self.$router.push(this.modelBasePath);
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

      getInputValue(item, index){
        var ret = "";
        if (this.valueForm.valueData[index].type == 1)
          ret = item;
        else
          ret = this.valueForm.valueData[index]["multiSelect"][item];
        return ret;
      },

      submitData(){
        /** 模型提交训练函数 */
        var tmpFlag = false;
        this.tableData.forEach(element =>{
          if(element.contents.length == 0){
            tmpFlag = true;
          }
        });
        if(tmpFlag == true){
          this.$message({
            type: 'error',
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
          })
        }
      },

      confirmSubmit(){
        /** 提交确认函数（按钮） */
        const self = this;
        var username = self.account;
        var teacher = self.teacherName;
        var confirmFlag = 0;  //当满足发送条件时置为1
        var tData = {};
        var params = {};
        var valueData = []
        var tData = {};
        // var params = {};
        //
        // if(this.isCNN == true){
        //   //默认参数为-1，否则赋上从前端获得的参数值
        //   if(!this.param.embedding_dim){
        //     params.embedding_dim = '-1';
        //   } else{params.embedding_dim = this.param.embedding_dim;}
        //
        //   if(!this.param.num_filters){
        //     params.num_filters = '-1';
        //   } else{params.num_filters = this.param.num_filters;}
        //
        //   if(!this.param.kernel_size){
        //     params.kernel_size = '-1';
        //   } else{params.kernel_size = this.param.kernel_size;}
        //
        //   if(!this.param.fully_connected_dim){
        //     params.fully_connected_dim = '-1';
        //   } else{params.fully_connected_dim = this.param.fully_connected_dim;}
        //
        //   if(!this.param.dropout_keep_prob){
        //     params.dropout_keep_prob = '-1';
        //   } else{params.dropout_keep_prob = this.param.dropout_keep_prob;}
        //
        //   if(!this.param.batch_size){
        //     params.batch_size = '-1';
        //   }else{params.batch_size = this.param.batch_size;}
        //
        //   if(!this.param.num_epochs){
        //     params.num_epochs = '-1';
        //   }else{params.num_epochs = this.param.num_epochs;}
        // }
        // else if(this.isRNN == true){
        //   if(!this.param.embedding_dim){
        //     params.embedding_dim = '-1';
        //   } else{params.embedding_dim = this.param.embedding_dim;}
        //
        //   if(!this.param.num_layers){
        //     params.num_layers = '-1';
        //   } else{params.num_layers = this.param.num_layers;}
        //
        //   if(!this.param.rnn_type){
        //     params.rnn_type = '-1';
        //   } else{params.rnn_type = this.param.rnn_type;}
        //
        //   if(!this.param.hidden_dim){
        //     params.hidden_dim = '-1';
        //   } else{params.hidden_dim = this.param.hidden_dim;}
        //
        //   if(!this.param.dropout_keep_prob){
        //     params.dropout_keep_prob = '-1';
        //   } else{params.dropout_keep_prob = this.param.dropout_keep_prob;}
        //
        //   if(!this.param.batch_size){
        //     params.batch_size = '-1';
        //   } else{params.batch_size = this.param.batch_size;}
        //
        //   if(!this.param.num_epochs){
        //     params.num_epochs = '-1';
        //   } else{params.num_epochs = this.param.num_epochs;}
        // }
        // else{
        //   if(!this.param.k){
        //     params.k = '-1';
        //   } else{params.k = this.param.k;}
        // }
        tData = JSON.stringify({
          student_name:username,
          teacher_name:teacher,
          model_name:self.modelName,
          train_data:self.tableData
        })
        axios.post(apiUrl.pushNumbersData,tData,{    
          headers:{"Content-Type": "application/json;charset=utf-8"}
        })
        .then(function (response) {
          self.$message({
            type: 'success',
            message: "添加成功"
          });
          self.$router.push("/modelbaseStudent");
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
