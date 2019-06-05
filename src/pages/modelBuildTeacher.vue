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
    <div class="table_container">
        <div class="top_build_block">
            <el-form ref="firstForm" :model="firstForm" label-width="80px">
                <el-form-item label="模型名称">
                    <el-col :span="7">
                        <el-input v-model="firstForm.modelName" placeholder="请为你的模型命名" id="modelname"></el-input>
                    </el-col>
                </el-form-item>
                <el-form-item label="数据类型">
                    <el-select v-model="firstForm.trainDataType" placeholder="请选择数据类型" id="trainDataType"  style="width:200px">
                        <el-option label="文本" value="text"></el-option>
                        <el-option label="数字" value="numbers"></el-option>
                        <el-option label="图像" value="image"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="模型类型">
                    <el-select v-model="firstForm.trainModelType" placeholder="请选择模型类型" id="trainModelType"  style="width:200px">
                        <el-option label="普通模型" value="normal"></el-option>
                        <el-option label="共享模型" value="share"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item size="large">
                    <el-button type="success" @click="buildNewModel()">立即创建</el-button>
                    <el-button type="primary" @click="cancel()">取消</el-button>
                </el-form-item>
            </el-form>
        </div>
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
        /** modelbuild 数据*/
        account: '',                //用户名
        firstForm: {
            modelName: '',          //输入模型名
            trainDataType: '',      //训练数据类型
            trainModelType: '',     //模型类型
            isPublic: '',           //模型权限
        },
        token: '',                  //是否登录标识
        sessionId: '',              //存储会话信息
        role: '',                   //用户身份
        classId: '',                //用户所在班级号
        csrfToken: ''               //CSRF标识
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
    },
    methods:{
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
              self.$router.push("/modelbaseTeacher");
          }
      },
      logout(){
          /** 注销函数 */
          window.location.href = "https://homepagetest.tuopinpin.com/";
      },
      buildNewModel(){
          /** 创建新模型函数 */
          const self = this;
          //非法信息检测：信息空置、非法字符、重复模型名
          if(self.firstForm.modelName.length==0 || self.firstForm.trainDataType.length==0){
            this.$message({
              type: 'info',
              message: "模型名或训练类型不为空"
            });
              window.location.reload();
          }else if(self.firstForm.modelName.indexOf(',') != -1 || self.firstForm.modelName.indexOf('.') != -1 || self.firstForm.modelName.indexOf('，') != -1 || self.firstForm.modelName.indexOf('。') != -1 ){
            this.$message({
              type: 'info',
              message: "非法模型名"
            });
              window.location.reload();
          }
          else{
              if(self.firstForm.modelName.length != 0){
                //根据输入信息跳转至不同类型的新建模型页面
                var name = self.firstForm.modelName;
                if(self.firstForm.trainDataType == 'text'){
                  var uData = JSON.stringify({
                    username:self.account,
                    model_name:self.firstForm.modelName,
                    train_data_type:"text"
                  })
                }
                else if(self.firstForm.trainDataType == 'numbers'){
                  var uData = JSON.stringify({
                    username:self.account,
                    model_name:self.firstForm.modelName,
                    train_data_type:"numbers"
                  })
                }
                else{
                  var uData = JSON.stringify({
                    username:self.account,
                    model_name:self.firstForm.modelName,
                    train_data_type:"image"
                  })
                }
                axios.post(apiUrl.namedCheck,uData,{
                  headers:{"Content-Type": "application/json;charset=utf-8"}
                }).then(function (response) {
                  if (response.data[0] == "模型名已存在") {
                    this.$message({
                      type: 'info',
                      message: "模型名已存在"
                    });
                    window.location.reload();
                  }
                  else{
                    if(self.firstForm.trainModelType == 'share') {
                      if(self.firstForm.trainDataType == 'text'){
                        self.$router.push({name:'coTrainTeaText',params:{modelName:name}});
                      }
                      else if(self.firstForm.trainDataType == 'numbers'){
                        self.$router.push({name:'coNumbersValueSet',params:{modelName:name}});
                      }
                      else{
                        self.$router.push({name:'coTrainTeaImage',params:{modelName:name}});
                      }
                    }
                    else{
                      if(self.firstForm.trainDataType == 'text'){
                        self.$router.push({name:'trainingText',params:{modelName:name}});
                      }
                      else if(self.firstForm.trainDataType == 'numbers'){
                        self.$router.push({name:'numbersValueSet',params:{modelName:name}});
                      }
                      else{
                        self.$router.push({name:'trainingImage',params:{modelName:name}});
                      }
                    }
                  }
                }).catch(function (error) {
                  console.log(error);
                });
              }
          }
      },
      cancel(){
          const self = this;
          self.$router.push('/modelbaseTeacher');
      }
    }
  }

</script>

<style>
  .top_build_block{
    margin-top: 250px;
    margin-left: 730px;
  }
</style>
