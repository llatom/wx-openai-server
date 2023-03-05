const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');
const { Message } = require("./db");

const {OPEN_API_KEY, OPEN_AI_PROXY} = process.env;
const AI_TYPE_TEXT = 'text';
const MESSAGE_STATUS_THINKING = 1;
const MESSAGE_STATUS_ANSWERED = 2;

const configuration = new Configuration({
  apiKey: OPEN_API_KEY,
});

const openai = new OpenAIApi(configuration);

// async function getAIResponse(prompt) {
//   const completion = await openai.createCompletion({
//     model: 'text-davinci-003',
//     prompt,
//     max_tokens: 1024,
//     temperature: 0.1,
//   });
//   return (completion?.data?.choices?.[0].text || 'AI 挂了').trim();
// }

async function getAIResponse(prompt){
  const requestOptions = {
    method: "POST",
    url: `${OPEN_AI_PROXY}/v1/chat/completions`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: prompt}],
    }),
  };

  try {
    const response = await axios(requestOptions);
    return (response?.data?.choices?.[0].text || 'AI 挂了').trim();
  } catch (error) {
    console.error("Error on request:", error);
  }
}


async function getAIMessage({ Content, FromUserName, CreateTime }) {
  const message = await Message.findOne({
    where: {
      fromUserName: FromUserName,
      content: Content,
      aiType: AI_TYPE_TEXT,
      status: MESSAGE_STATUS_ANSWERED,
    },
    order: [['createdAt', 'DESC']],
  });

  if (message) {
    return message.response;
  }

  // 先往数据库存一条回复记录，把用户的提问存下来，以便后续查询。
  // 设置回复的内容为空，设置状态为“回复中”。
  const newMessage = await Message.create({
    fromUserName: FromUserName,
    response: '',
    createdAt: CreateTime,
    content: Content,
    aiType: AI_TYPE_TEXT,
    status: MESSAGE_STATUS_THINKING,
  });

  const response = await getAIResponse(Content);

   // 更新数据库中的回复记录，把状态更新为“已回答”，并把回复内容更新上。
  await newMessage.update(
    {
      response: response,
      status: MESSAGE_STATUS_ANSWERED,
    },
    {
      where: {
        fromUserName: FromUserName,
        content: Content,
      },
    },
  );

  return response;
}

module.exports = {
    getAIMessage,
};
