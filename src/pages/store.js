const USER_ACCOUNT = ''
const USER_PASSWORD = ''
const USER_MODELNAMES = []
const NUM = ''
export default  {
  fetch () {
    return JSON.parse(window.localStorage.getItem(USER_ACCOUNT) || '[]')

  },
  save (todos) {    // watch所监听的函数名称
    window.localStorage.setItem(USER_ACCOUNT, JSON.stringify(todos));
  }
}
