const { Message } = require('./db')
const { getGPT } = require('./request')

const AI_TYPE_TEXT = 'text'
const MESSAGE_STATUS_THINKING = 1
const MESSAGE_STATUS_ANSWERED = 2

const getAIResponse = prompt => {
  const data = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }]
  }
  return getGPT(data)
    .then(response => {
      return (response?.choices?.[0].message?.content || 'AI 挂了').trim()
    })
    .catch(error => {
      console.log('error', error)
    })
}

async function getAIMessage({ Content, FromUserName, CreateTime }) {
  const message = await Message.findOne({
    where: {
      fromUserName: FromUserName,
      content: Content,
      aiType: AI_TYPE_TEXT,
      status: MESSAGE_STATUS_ANSWERED
    },
    order: [['createdAt', 'DESC']]
  })

  if (message) {
    return message.response
  }

  // 先往数据库存一条回复记录，把用户的提问存下来，以便后续查询。
  // 设置回复的内容为空，设置状态为“回复中”。
  const newMessage = await Message.create({
    fromUserName: FromUserName,
    response: '',
    createdAt: CreateTime,
    content: Content,
    aiType: AI_TYPE_TEXT,
    status: MESSAGE_STATUS_THINKING
  })

  const response = await getAIResponse(Content)

  // 更新数据库中的回复记录，把状态更新为“已回答”，并把回复内容更新上。
  await newMessage.update(
    {
      response: response,
      status: MESSAGE_STATUS_ANSWERED
    },
    {
      where: {
        fromUserName: FromUserName,
        content: Content
      }
    }
  )

  return response
}

module.exports = {
  getAIMessage
}
