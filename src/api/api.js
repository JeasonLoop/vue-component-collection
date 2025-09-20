import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加认证token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 添加请求标识
    config.headers['X-Request-Id'] = generateRequestId()

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data

    // 自定义业务状态码处理
    if (res.code !== 200) {
      ElMessage.error(res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    }

    return res
  },
  error => {
    // 统一错误处理
    let message = error.message
    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求错误'
          break
        case 401:
          message = '未授权，请重新登录'
          // 跳转登录页
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址出错'
          break
        case 408:
          message = '请求超时'
          break
        case 500:
          message = '服务器内部错误'
          break
        case 501:
          message = '服务未实现'
          break
        case 502:
          message = '网关错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网关超时'
          break
        case 505:
          message = 'HTTP版本不受支持'
          break
        default:
          message = '网络错误'
      }
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

// 生成唯一请求ID
function generateRequestId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// 请求取消控制器Map
const cancelRequestMap = new Map()

/**
 * 添加请求到取消控制器
 * @param {string} requestId 请求唯一标识
 * @param {AbortController} controller 取消控制器
 */
function addCancelController(requestId, controller) {
  cancelRequestMap.set(requestId, controller)
}

/**
 * 取消请求
 * @param {string} requestId 请求唯一标识
 */
function cancelRequest(requestId) {
  const controller = cancelRequestMap.get(requestId)
  if (controller) {
    controller.abort()
    cancelRequestMap.delete(requestId)
  }
}

/**
 * 取消所有pending中的请求
 */
function cancelAllRequests() {
  cancelRequestMap.forEach(controller => {
    controller.abort()
  })
  cancelRequestMap.clear()
}

/**
 * 封装GET请求
 * @param {string} url
 * @param {object} params
 * @param {object} config
 * @returns {Promise}
 */
export function get(url, params = {}, config = {}) {
  const controller = new AbortController()
  const requestId = generateRequestId()
  addCancelController(requestId, controller)

  return service({
    url,
    method: 'get',
    params,
    signal: controller.signal,
    ...config
  }).finally(() => {
    cancelRequestMap.delete(requestId)
  })
}

/**
 * 封装POST请求
 * @param {string} url
 * @param {object} data
 * @param {object} config
 * @returns {Promise}
 */
export function post(url, data = {}, config = {}) {
  const controller = new AbortController()
  const requestId = generateRequestId()
  addCancelController(requestId, controller)

  return service({
    url,
    method: 'post',
    data,
    signal: controller.signal,
    ...config
  }).finally(() => {
    cancelRequestMap.delete(requestId)
  })
}

/**
 * 封装PUT请求
 * @param {string} url
 * @param {object} data
 * @param {object} config
 * @returns {Promise}
 */
export function put(url, data = {}, config = {}) {
  const controller = new AbortController()
  const requestId = generateRequestId()
  addCancelController(requestId, controller)

  return service({
    url,
    method: 'put',
    data,
    signal: controller.signal,
    ...config
  }).finally(() => {
    cancelRequestMap.delete(requestId)
  })
}

/**
 * 封装DELETE请求
 * @param {string} url
 * @param {object} params
 * @param {object} config
 * @returns {Promise}
 */
export function del(url, params = {}, config = {}) {
  const controller = new AbortController()
  const requestId = generateRequestId()
  addCancelController(requestId, controller)

  return service({
    url,
    method: 'delete',
    params,
    signal: controller.signal,
    ...config
  }).finally(() => {
    cancelRequestMap.delete(requestId)
  })
}

/**
 * 封装文件上传
 * @param {string} url
 * @param {FormData} formData
 * @param {object} config
 * @returns {Promise}
 */
export function upload(url, formData, config = {}) {
  const controller = new AbortController()
  const requestId = generateRequestId()
  addCancelController(requestId, controller)

  return service({
    url,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    signal: controller.signal,
    onUploadProgress: progressEvent => {
      if (progressEvent.total > 0) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        config.onProgress && config.onProgress(percent)
      }
    },
    ...config
  }).finally(() => {
    cancelRequestMap.delete(requestId)
  })
}

export default service
