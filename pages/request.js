const axios = require('axios')

const DEFAULT_CONFIG = {
  method: 'POST',
  baseURL: process.env.API_BASE,
  timeout: 60000, // 一分钟超时
  showLoading: false,
  errorType: 'notification',
  checkStatus: true,
  errorAction: true,
  formData: false,
  addTimeStamp: false
}

/** 发起一个请求 */
async function request(path, params, optionsSource) {
  const options = Object.assign({}, DEFAULT_CONFIG, optionsSource)
  const { method, checkStatus, formData, errorAction, headers = {}, showLoading, addTimeStamp, ...axiosOptions } = options

  // 默认传递的参数
  const defaultParams = {}

  if (addTimeStamp) {
    defaultParams['t'] = Date.now()
  }

  const sendData = {
    url: path,
    method,
    headers,
    ...axiosOptions
  }

  const paramsData = Object.assign({}, defaultParams, params)

  if (method === 'GET') {
    const paramsStr = toSearch(paramsData)
    sendData.url = sendData.url + paramsStr
  } else if (formData) {
    const formData = new FormData()
    Object.keys(paramsData).forEach(key => {
      formData.append(key, paramsData[key])
    })
    sendData.data = formData
  } else {
    sendData.data = paramsData
  }

  return axios
    .request(sendData)
    .then(res => {
      const dataH = res.data
      return dataH
    })
    .catch(err => {
      let errH = err
      if (err.isAxiosError && err.response?.data) {
        errH = parseResData(err.response?.data)
      }

      if (typeof err !== 'object') {
        errH = {
          message: err
        }
      }

      if (errorAction) {
        return Promise.reject({ ...errH, path, sendData, resData: err })
      } else {
        return Promise.resolve(errH)
      }
    })
}

/** 转换成 url search */
function toSearch(obj, hasQuestionMark = true) {
  const arr = Object.keys(obj).map(key => {
    let val = obj[key]

    if (typeof val !== 'string') {
      try {
        val = JSON.stringify(val)
      } catch (err) {
        console.error(err)
      }
    }

    return `${key}=${encodeURIComponent(val)}`
  })
  return (hasQuestionMark ? '?' : '') + arr.join('&')
}

function parseResData(resData) {
  return resData
}

async function getGPT(params, options) {
  return request('/v1/chat/completions', params, {
    method: 'POST',
    baseURL: process.env.OPEN_AI_PROXY,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPEN_API_KEY}`
    },
    ...options
  })
}

module.exports = {
  getGPT
}
