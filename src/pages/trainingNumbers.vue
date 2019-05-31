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
              <el-tag v-for="content in scope.row.contents" :type="tagColor[scope.$index % 4]" closable :disable-transitions="false" @close="handleClose(content,scope.row.contents)">
                {{getInputValue(content)}}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align='center'>
            <template slot-scope="scope">
              <el-button size="mini" type="text" @click="handleEdit(scope.row)">添加样本</el-button>
              <el-dialog title="添加样本" :visible.sync="addTagVisible" align='center'>
                <el-form label-width="80px" :model="valueForm" :rules="valueRule" ref="valueForm">
                  <template v-for="(item, index) in valueForm.valueData">
                    <el-form-item v-if="item.type == 1" :label="item.value" :prop="'valueData.' + index +'.inputValue'" :rules="valueRule.inputRule" style="width:50%">
                      <el-input v-model.number="item.inputValue"></el-input>
                    </el-form-item>
                    <el-form-item v-if="item.type == 0" :label="item.value" :prop="'valueData.' + index +'.inputValue'" :rules="valueRule.selectRule" style="width:50%">
                      <el-select v-model="item.inputValue" placeholder="数值选择" :disabled="isReadonly" style="width:100%">
                        <template v-for="(select, index2) in item.multiSelect">
                          <el-option :key="select" :value=index2 :label="select"></el-option>
                        </template>
                      </el-select>
                    </el-form-item>
                  </template>
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

          <!--<el-form-item label="算法选择" prop="algoSelect">-->
            <!--<el-select v-model="ruleForm.algoSelect" placeholder="请选择训练算法" @change="trueAlgorithm">-->
              <!--<el-option label="K-最近邻算法" value=1></el-option> -->
              <!--<el-option label="卷积神经网络" value=2></el-option> -->
              <!--<el-option label="循环神经网络" value=3></el-option> -->
            <!--</el-select>-->
            <!--<span class="notes">选择某一种算法进行模型训练</span>-->
          <!--</el-form-item>-->
        <!--</el-form>-->
        <!--<el-form :model="param" :rules="rules2" ref="param" label-width="140px">-->
          <!--<el-form-item v-if="isCNN" label="词向量维度" prop="embedding_dim">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.embedding_dim"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">每一个词汇用向量表示的总维度大小（默认值：32）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isCNN" label="卷积核数目" prop="num_filters">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.num_filters"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">每一层卷积层的卷积核数目（默认值：3） </span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isCNN" label="卷积核尺寸" prop="kernel_size">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.kernel_size"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">不同数据窗口的数据和卷积核（一个滤波矩阵）作内积的操作叫做卷积（默认值：3，建议范围：1~5）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isCNN" label="全连接层神经元数目" prop="fully_connected_dim">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.fully_connected_dim"></el-input>-->
            <!--</el-col>-->
             <!--<span class="notes">全连接层的每一个神经元都与上一层的所有结点相连，用来把前边提取到的特征综合起来（默认值：16）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isCNN" label="保留结果比例" prop="dropout_keep_prob">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.dropout_keep_prob"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">节点输出被舍弃的概率，减少了节点之间的共适应（默认值：0.5，范围0~1）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isCNN" label="每批次训练数目" prop="batch_size">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.batch_size"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">每批次输入多少个训练集进行训练（默认值：5）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isCNN" label="总迭代次数" prop="num_epochs">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.num_epochs"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">循环训练轮次（默认值：5）</span>-->
          <!--</el-form-item>-->



          <!--<el-form-item v-if="isRNN" label="词向量维度" prop="embedding_dim">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.embedding_dim"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">每一个词汇用向量表示的总维度大小（默认值：64）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isRNN" label="隐藏层层数" prop="num_layers">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.num_layers"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">除输入层和输出层以外的其他各层叫做隐藏层（默认值：2，建议范围：0~2）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isRNN" label="隐藏层神经元数目" prop="hidden_dim">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.hidden_dim"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">隐藏层神经元节点的数目（默认值：64，建议范围：1≤x≤128）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isRNN" label="循环神经网络类型" prop="rnn_type">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.rnn_type"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">rnn的类型，包括“lstm”和“gru”两种（默认值：0，0表示“lstm”，1表示“gru”）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isRNN" label="保留结果比例" prop="dropout_keep_prob">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.dropout_keep_prob"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">节点输出被舍弃的概率，减少了节点之间的共适应（默认值：0.5，规定范围0~1）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isRNN" label="每批次训练数目" prop="batch_size">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.batch_size"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">每批次输入多少个训练集进行训练（默认值：128）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isRNN" label="总迭代次数" prop="num_epochs">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.num_epochs"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">循环训练轮次（默认值：10）</span>-->
          <!--</el-form-item>-->

          <!--<el-form-item v-if="isKNN" label="K值" prop="k">-->
            <!--<el-col :span=5>-->
              <!--<el-input v-model.number="param.k"></el-input>-->
            <!--</el-col>-->
            <!--<span class="notes">曼哈顿距离最大值为k范围内的节点（默认值：3，建议范围：2~7）</span>-->
          <!--</el-form-item>-->
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
        <el-form ref="test_data" label-width="120px">
          <el-form-item label="测试数据">
            <el-form label-width="80px" :model="valueForm2" :rules="valueRule" ref="valueForm2">
              <template v-for="(item, index) in valueForm2.valueData">
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
import { mapActions, mapState, mapGetters } from "vuex";

  export default {
    data() {
      return {
        account: '',
        role: '',
        modelbasePath: '',
        token: '',
        sessionid: '',
        tagColor:[
          "",
          "success",
          "warning",
          "danger"
        ],
        valueForm:{
          valueData:[]
        },
        valueForm2:{
          valueData:[]
        },
        isSuccess: false,
        isKNN: false, 
        isCNN: false,
        isRNN: false,
        ruleForm:{
          isPublic:''
        },
        param:{},
        dynamicTags:[],
        isChange: 0,    //全局变量，用于判断数据表格是否发生变动
        modelName: '',  //模型名
        trainType: '',  //训练数据类型(文本)
        addTagVisible:false,
        editVisible: false,
        addVisible: false,
        addTestData: false,
        editDev: {
          label: '',
          content: [],
        },
        addDev: {
          label: '',
          contents:[]
        },
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
    computed: {
      ...mapGetters([
        'getValueData'
      ]),
    },
    mounted(){
      const self = this;
      self.valueForm.valueData = this.getValueData;
      self.valueForm2.valueData = this.getValueData;
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
      getInputValue(content){
        var ret = "";
        for (var i in content){
          if (this.valueForm.valueData[i].type == 1)
            ret = ret + this.valueForm.valueData[i].value + "：" + content[i] + " || ";
          else
            ret = ret + this.valueForm.valueData[i].value + "：" + this.valueForm.valueData[i]["multiSelect"][content[i]] + " || ";
        }
        return ret;
      },
      trueAlgorithm(value){
        /** 算法选择函数 */
        this.param = {};
        if(value == 1){
          console.log("1");
          this.isKNN = true;
          this.isCNN = false;
          this.isRNN = false;
          this.trainUrl = apiUrl.knnTrain;
          this.testUrl = apiUrl.knnTest;
        }
        else if(value == 2){
          console.log("2");
          this.isKNN = false;
          this.isCNN = true;
          this.isRNN = false;
          this.trainUrl = apiUrl.cnnTrain;
          this.testUrl = apiUrl.cnnTest;
        }
        else{
          console.log("3");
          this.isKNN = false;
          this.isCNN = false;
          this.isRNN = true;
          this.trainUrl = apiUrl.rnnTrain;
          this.testUrl = apiUrl.rnnTest;
        }
      },
      
      confirmTestSubmit(){
        /** 模型测试提交函数 */
        if(this.isSuccess == false){
          alert("请先进行模型训练");
        }
        else{
          this.$refs["valueForm2"].validate((valid) => {
            if (valid) {
              this.test_data = [];
              var username = this.account;
              for (var item of this.valueForm2.valueData){
                this.test_data.push(item.inputValue);
              }
              var tData = JSON.stringify({
                username:username,
                model_name:this.modelName,
                test_data:this.test_data
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
        }
      },

      submitData(){
        /** 模型提交训练函数 */
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
        var valueData = []
        for (var item of this.valueForm.valueData)
        {
          valueData.push({
            value:item.value,
            type:item.type,
            multiSelect:item.multiSelect
          });
        }
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
        if(this.isChange == 0){
          tData = JSON.stringify({
            username:this.account,
            modelName:this.modelName,
            public_status: this.ruleForm.isPublic,
            model_type: 1,
            trainData:[],
            valueData:valueData
            // params:params
          })
        } //当数据部分未发生修改的时候，traindata部分置为空（不重复发送未改变的数据）
        else{
          tData = JSON.stringify({
            username:this.account,
            modelName:this.modelName,
            trainData:this.tableData,
            public_status: this.ruleForm.isPublic,
            model_type: 1,
            valueData:valueData
            // params:params
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

      confirmAddLabel(){
        /** 标签添加确认函数 */
          var tmp = {};
          tmp.label = this.addDev.label;
          tmp.contents = [];
          this.tableData.push(tmp);
          this.addVisible = false;
          this.isChange = 1;
      },

      confirmAddTag(){
        /** 添加样本确认函数 */
        this.$refs["valueForm"].validate((valid) => {
          if (valid) {
            var tmp=[];
            var i=0;
            for(var item of this.tableData){
              if(item.label == this.editDev.label){
                var uData = [];
                for (var item2 of this.valueForm.valueData){
                  uData.push(item2.inputValue);
                  item2.inputValue = "";
                }
                item.contents.push(uData);
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
          }
        });
      },

      handleClose(tag,dynamicTags) {
        /** 样本删除函数 */
          dynamicTags.splice(dynamicTags.indexOf(tag), 1);
          this.isChange = 1;
      },
      
      handleEdit(row) {
        /** 样本添加函数 */
        this.addTagVisible = true;
        this.editDev.label = row.label;
        this.isChange = 1;
      },

      handleAdd() {
        /** 标签添加函数 */
        this.addDev.label = "";
        this.addVisible = true;
        this.isChange = 1;
      },

      cancel() {
        /** 取消函数（按钮） */
        this.addTagVisible = false;
        this.addVisible = false;
        this.editDev.label = '';
        this.editDev.content = '';
        this.addDev.typeName = '';
      },

      confirmDelete(row) {
        /** 删除确认函数 */
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
