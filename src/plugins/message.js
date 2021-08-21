import Vue from 'vue'
import {Message} from 'element-ui'

Vue.prototype.$message = Message
Vue.prototype.$message.success = msg => Message({
    duration: 2000,
    type: 'success',
    message: msg
})
Vue.prototype.$message.info = msg => Message({
    duration: 2000,
    type: 'info',
    message: msg
})
Vue.prototype.$message.warning = msg => Message({
    duration: 2000,
    type: 'warning',
    message: msg
})
Vue.prototype.$message.error = msg => Message({
    duration: 2000,
    type: 'error',
    message: msg
})
