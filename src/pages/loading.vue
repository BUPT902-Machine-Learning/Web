<template>
    <div>
        <div class="app-head" >
            <div class="app-head-inner">
                <div class="head-nav">
                <ul class="nav-list">
                    <img src = "../assets/client.jpg" align = "left">
                </ul>
                </div>  
            </div>
        </div>
        <div class="container">
            <div class="top_load_block">
                <el-form :model="loadMsg" ref="loadMsg" label-width="80px">
                    <el-form-item label="账号" prop="account">
                        <el-col :span="7">
                            <el-input type="text" v-model="loadMsg.account" autocomplete="off"></el-input>
                        </el-col>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-col :span="7">
                            <el-input type="password" v-model="loadMsg.password" autocomplete="off"></el-input>
                        </el-col>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="confirmSubmit()">登 录</el-button>
                        <el-button type="success" @click="cancel()">重 置</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <div class="app-foot">
            <p>Machine Learning for Tuopinpin</p>
        </div>
    </div>
</template>
<script>
//用户登录界面
import axios from 'axios'
import qs from 'qs'
import Store from './store';
import { loadavg } from 'os';
import { apiUrl } from '../utils/apiUrl';
import modelbaseVue from './modelbase.vue';
export default {
    data() {
      return {
        loadMsg: {
            account: '',
            password: ''
        }
      }
    },
    mounted(){
        if(window.localStorage.getItem('USER_ACCOUNT') != null){
            this.$router.push('/modelbase')
        }
        //this.username = window.localStorage.setItem('USER_ACCOUNT', JSON.stringify('未登录'));
        //this.username = window.localStorage.setItem('USER_PASSWORD', JSON.stringify(''));
    },
    methods: {
        cancel() {
            this.loadMsg.account = '';
            this.loadMsg.password = '';
        },
        
        confirmSubmit(){
            const self = this;
            if(this.loadMsg.account.length == 0 || this.loadMsg.password.length == 0){
                alert("账号或密码不能为空");
                window.localStorage.setItem('USER_ACCOUNT', JSON.stringify('未登录'));
                window.localStorage.setItem('USER_PASSWORD', JSON.stringify(''));
            }
            else{
                var uData = JSON.stringify({
                    userAccount:this.loadMsg.account,
                    password:this.loadMsg.password
                })
                window.localStorage.setItem('USER_ACCOUNT', JSON.stringify(this.loadMsg.account));
                window.localStorage.setItem('USER_PASSWORD', JSON.stringify(this.loadMsg.password));
            }
            
            axios.post(apiUrl.userLogin,uData,{    
                headers:{"Content-Type": "application/json;charset=utf-8"}
            })
            .then(function (response) {
                console.log(response);
                if(response.data == "no such user"){
                    alert("没有这个用户");
                    window.localStorage.setItem('USER_ACCOUNT', JSON.stringify(''));
                    window.localStorage.setItem('USER_PASSWORD', JSON.stringify(''));
                }
                else if(response.data == "login_denied"){
                    alert("密码错误");
                    window.localStorage.setItem('USER_ACCOUNT', JSON.stringify(''));
                    window.localStorage.setItem('USER_PASSWORD', JSON.stringify(''));
                }
                else{
                    window.localStorage.setItem('NUM',JSON.stringify('1'));
                    console.log(window.localStorage.getItem('NUM'));
                    self.$router.push('/modelbase') 
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        },
    }    
}
</script>

<style>
  .top_load_block{
    margin-top: 300px;
    margin-left: 830px;
  }
</style>