/**
 * 接口API地址
 * add by zeke
 * add date 2018-06-22
 */
export const apiUrl = {
  //public
  loginCheck: "/api/loginCheck/",                                 //登录状态检测
  stuGetModels: "/api/stuGetModels/",                             //学生获取模型（返回学生创建模型及其所在班级教师创建的公开模型）
  teachGetModels: "/api/teachGetModels/",                        //教师获取模型（返回教师创建模型及其所在班级学生创建的公开模型）
  deleteModel: "/api/deleteModel/",                             //删除我的模型
  namedCheck: "/api/namedCheck/",                                 //模型名重名检查
  //text
  textKnnTrain: "/api/text/knnTrain/",                                     //KNN训练
  textCnnTrain: "/api/text/cnnTrain/",                                     //CNN训练
  textRnnTrain: "/api/text/rnnTrain/",                                     //RNN训练
  textKnnTest: "/api/text/knnTest/",                                       //KNN测试
  textCnnTest: "/api/text/cnnTest/",                                       //CNN测试
  textRnnTest: "/api/text/rnnTest/",                                       //RNN测试
  textEditModel: "/api/text/editModel/",
  textTestModel: "/api/text/testModel/",                                   //向已训练的模型发送测试请求
  textOptimalTrain: "/api/text/optimalTrain/",

  //getModels: "/api/getModels/",                                   //获取模型（旧版本，已弃用）
  // editModels: "/api/editModels/",                                 //修改我的模型
  //numbers
  getValue:"/api/ImageClassifier/uploadImg/",
  numbersEditModel: "/api/numbers/editModel/",
  numbersTestModel: "/api/numbers/testModel/",
  numbersOptimalTrain: "/api/numbers/optimalTrain/",
  numbersValueSet: "/api/numbers/valueSet/",
  //image
  upLoadImg: "/api/image/uploadImg/",                                   //上传训练图片样本
  deleteImg: "/api/image/deleteImg/",                                   //（逻辑）删除训练图片样本
  deleteLabel: "/api/image/deleteLabel/",                               //（物理）删除标签
  createImgModel: "/api/image/createImageModel/",                       //创建模型（只存储模型名等基本信息）
  deleteImgModel: "/api/image/deleteImageModel/",                       //删除模型（删除该模型下的所有信息，包括标签，图片文件等）
  trainImgModel: "/api/image/trainImageModel/",                         //训练模型（存储“模型-标签”的映射关系，根据映射关系生成训练数据，训练模型并返回训练结果）
  testImgModel: "/api/image/testImageModel/",                           //测试模型（存储“模型-标签”的映射关系，根据映射关系生成训练数据，训练模型并返回训练结果）
  StatusCheck: "/api/image/StatusCheck/",                               //获取模型训练状态
  editImgModel: "/api/image/editImgModel/",                             //获取已创建模型的原始信息（标签、样本以及图片文件）
  reTrainImgModel: "/api/image/reTrainImgModel/",                       //重新训练已有模型（做数据或者权限的修改后）

  //techGetImgModel: "/api/ImageClassifier/techGetImgModel/",                       //教师获取图像模型 1.获取自己创建的非合作图像模型 2.获取所在班级学生创建的公开图像模型
  //techGetCoImgModel: "/api/ImageClassifier/techGetCoImgModel/",                   //教师获取图像合作模型
  //stuGetImgModel: "/api/ImageClassifier/stuGetImgModel/",                         //学生获取图像模型 1.获取自己创建的非合作图像模型 2.获取所在班级教师创建的公开非合作图像模型
  //stuGetCoImgModel: "/api/ImageClassifier/stuGetCoImgModel/",                     //学生获取图像合作模型



  //cooperation
  createModel: "/api/cooperation/createModel/",                   //发布合作模型（仅教师）
  stuGetCreateModel: "/api/cooperation/stuGetCreateModel/",          //学生获取合作模型信息
  teachGetCreateModel: "/api/cooperation/teachGetCreateModel/",   //教师获取合作模型内容
  getModelData: "/api/cooperation/getModelData/",                 //获取单个模型具体信息
  pushData: "/api/cooperation/pushData/",                         //学生向合作模型添加数据
  trainModel: "/api/cooperation/trainModel/",                     //教师修改合作模型
  ifTrain: "/api/cooperation/ifTrain/",                           //判断一个特定的模型是否已训练
  deleteCreateModel: "/api/cooperation/deleteModel/"                   //删除合作模型
}
