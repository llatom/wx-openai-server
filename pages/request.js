const axios = require('axios')

const DEFAULT_CONFIG = {
  method: 'POST',
  baseURL: process.env.OPEN_AI_PROXY,
  timeout: 60000,
  showLoading: false,
  errorType: 'notification',
  checkStatus: true,
  errorAction: true,
  formData: false
}

async function request(path, params, optionsSource) {
  const {
    method = 'POST',
    checkStatus = true,
    formData = false,
    errorAction = true,
    headers = {},
    showLoading = false,
    ...axiosOptions
  } = { ...DEFAULT_CONFIG, ...optionsSource }

  // 默认传递的参数
  const defaultParams = {}

  const sendData = {
    url: path,
    method,
    headers,
    ...axiosOptions
  }

  const paramsData = { ...defaultParams, ...params }

  if (method === 'GET') {
    const paramsStr = toSearch(paramsData)
    sendData.url = sendData.url + paramsStr
  } else if (formData) {
    const formDataObj = new FormData()
    Object.keys(paramsData).forEach(key => {
      formDataObj.append(key, paramsData[key])
    })
    sendData.data = formDataObj
  } else {
    sendData.data = paramsData
  }

  try {
    const res = await axios.request(sendData)
    return res.data
  } catch (err) {
    let errH = err
    if (err.isAxiosError && err.response?.data) {
      errH = parseResData(err.response?.data)
    }

    errH.path = path
    errH.sendData = sendData
    errH.resData = err

    return errorAction ? Promise.reject(errH) : Promise.resolve(errH)
  }
}

function toSearch(obj, hasQuestionMark = true) {
  const arr = Object.entries(obj).map(([key, val]) => {
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
