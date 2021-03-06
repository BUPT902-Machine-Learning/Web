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
const trainingImagePage = resolve => require(["src/pages/trainingImage"], resolve);
const numbersValueSetPage = resolve => require(["src/pages/numbersValueSet"], resolve);
const coNumbersValueSetPage = resolve => require(["src/pages/coNumbersValueSet"], resolve);

const coTrainStuTextPage = resolve => require(["src/pages/coTrainStuText"], resolve);
const coTrainTeaTextPage = resolve => require(["src/pages/coTrainTeaText"], resolve);
const coTrainStuNumbersPage = resolve => require(["src/pages/coTrainStuNumbers"], resolve);
const coTrainTeaNumbersPage = resolve => require(["src/pages/coTrainTeaNumbers"], resolve);

const textModelEditPage = resolve => require(["src/pages/textModelEdit"], resolve);
const numbersModelEditPage = resolve => require(["src/pages/numbersModelEdit"], resolve);

const coTrainEditTextPage = resolve => require(["src/pages/coTrainEditText"], resolve);
const coTrainEditNumbersPage = resolve => require(["src/pages/coTrainEditNumbers"], resolve);
const textModelTestPage = resolve => require(["src/pages/textModelTest"], resolve);
const numbersModelTestPage = resolve => require(["src/pages/numbersModelTest"], resolve);

const imageModelTestPage = resolve => require(["src/pages/imageModelTest"], resolve);
const imageModelEditPage = resolve => require(["src/pages/imageModelEdit"], resolve);

const coTrainTeaImagePage = resolve => require(["src/pages/coTrainTeaImage"], resolve);
const coTrainStuImagePage = resolve => require(["src/pages/coTrainStuImage"], resolve);
const coTrainEditImagePage = resolve => require(["src/pages/coTrainEditImage"], resolve);

const router = new VueRouter({
	mode: 'hash',
	routes: [
		{
			name: '/',
			path: '/',
			component:modelbaseStudentPage
		},
    {
      name: 'coTrainEditImage',
      path: '/coTrainEditImage/:modelName',
      component:coTrainEditImagePage
    },
    {
      name: 'coTrainTeaImage',
      path: '/coTrainTeaImage/:modelName',
      component:coTrainTeaImagePage
    },
    {
      name: 'coTrainStuImage',
      path: '/coTrainStuImage/:teacherName/:modelName',
      component:coTrainStuImagePage
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
			name: 'textModelEdit',
			path: '/textModelEdit/:modelName',
			component:textModelEditPage
		},
    {
      name: 'numbersModelEdit',
      path: '/numbersModelEdit/:modelName',
      component:numbersModelEditPage
    },
		{
			name: 'trainingImage',
			path: '/trainingImage/:modelName',
			component:trainingImagePage
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
      name: 'coTrainStuNumbers',
      path: '/coTrainStuNumbers/:teacherName/:modelName',
      component: coTrainStuNumbersPage
    },
    {
      name: 'coTrainTeaNumbers',
      path: '/coTrainTeaNumbers/:modelName',
      component: coTrainTeaNumbersPage
    },
		{
			name: 'coTrainEditText',
			path: '/coTrainEditText/:modelName',
			component: coTrainEditTextPage
		},
    {
      name: 'coTrainEditNumbers',
      path: '/coTrainEditNumbers/:modelName',
      component: coTrainEditNumbersPage
    },
		{
			name: 'textModelTest',
			path: '/textModelTestPage/:userName/:modelName',
			component: textModelTestPage
		},
    {
      name: 'numbersModelTest',
      path: '/numbersModelTestPage/:userName/:modelName',
      component: numbersModelTestPage
    },
    {
      name: 'numbersValueSet',
      path: '/numbersValueSet/:modelName',
      component: numbersValueSetPage
    },
    {
      name: 'coNumbersValueSet',
      path: '/coNumbersValueSet/:modelName',
      component: coNumbersValueSetPage
    },
    {
      name: 'trainingNumbers',
      path: '/trainingNumbers/:modelName',
      component: trainingNumbersPage
    }
	]
})

export default router
