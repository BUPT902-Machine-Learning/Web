import Vue from 'vue'
import VueRouter from 'vue-router'
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(VueRouter)

const modelbaseStudentPage = resolve => require(["src/pages/modelbaseStudent"], resolve);
const modelbaseTeacherPage = resolve => require(["src/pages/modelbaseTeacher"], resolve);
const modelBuildStudentPage = resolve => require(["src/pages/modelBuildStudent"], resolve);
const modelBuildTeacherPage = resolve => require(["src/pages/modelBuildTeacher"], resolve);
const trainingTextPage = resolve => require(["src/pages/trainingText"], resolve);
const trainingNumbersPage = resolve => require(["src/pages/trainingNumbers"], resolve);
const trainingIamgePage = resolve => require(["src/pages/trainingImage"], resolve);
const numbersValueSetPage = resolve => require(["src/pages/numbersValueSet"], resolve);

const coTrainStuTextPage = resolve => require(["src/pages/coTrainStuText"], resolve);
const coTrainTeaTextPage = resolve => require(["src/pages/coTrainTeaText"], resolve);
const modelEditPage = resolve => require(["src/pages/modelEdit"], resolve);
const coTrainEditTextPage = resolve => require(["src/pages/coTrainEditText"], resolve);
const modelTestPage = resolve => require(["src/pages/modelTest"], resolve);

const imageModelTestPage = resolve => require(["src/pages/imageModelTest"], resolve);
const imageModelEditPage = resolve => require(["src/pages/imageModelEdit"], resolve);
const router = new VueRouter({
	mode: 'hash',
	routes: [
		{ 
			name: '/',
			path: '/',
			component:modelbaseStudentPage
		},
		{
			name: 'imageModelEdit',
			path: '/imageModelEdit/:userName/:modelName/:modelStatus',
			component:imageModelEditPage
		},
		{
			name: 'imageModelTest',
			path: '/imageModelTest/:userName/:modelName',
			component:imageModelTestPage
		},
		{
			name: 'imageModelEdit',
			path: '/imageModelEdit/:userName/:modelName/:modelStatus',
			component:imageModelEditPage
		},
		{
			name: 'imageModelTest',
			path: '/imageModelTest/:userName/:modelName',
			component:imageModelTestPage
		},
		{
			name: 'modelEdit',
			path: '/modelEdit/:modelName',
			component:modelEditPage
		},
		{
			name: 'trainingImage',
			path: '/trainingImage/:modelName',
			component:trainingIamgePage
		},
		{
			name: 'modelBuildStudent',
			path: '/modelBuildStudent/',
			component:modelBuildStudentPage
		},
		{
			name: 'modelBuildTeacher',
			path: '/modelBuildTeacher/',
			component:modelBuildTeacherPage
		},
		{
			name: 'trainingText',
			path: '/trainingText/:modelName',
			component: trainingTextPage
		},
		{
			name: 'modelbaseStudent',
			path: '/modelbaseStudent/',
			component: modelbaseStudentPage
		},
		{
			name: 'modelbaseTeacher',
			path: '/modelbaseTeacher/',
			component: modelbaseTeacherPage
		},
		{
			name: 'coTrainStuText',
			path: '/coTrainStuText/:teacherName/:modelName',
			component: coTrainStuTextPage
		},
		{
			name: 'coTrainTeaText',
			path: '/coTrainTeaText/:modelName',
			component: coTrainTeaTextPage 
		},
		{
			name: 'coTrainEditText',
			path: '/coTrainEditText/:modelName',
			component: coTrainEditTextPage 
		},
		{
			name: 'modelTest',
			path: '/modelTest/:userName/:modelName',
			component: modelTestPage 
		},
    {
      name: 'numbersValueSet',
      path: '/numbersValueSet/:modelName',
      component: numbersValueSetPage
    },
    {
      name: 'trainingNumbers',
      path: '/trainingNumbers/:modelName',
      component: trainingNumbersPage
    }
	]
})

export default router
