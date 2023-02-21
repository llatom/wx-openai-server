# 微信 AI 机器人

这是一个基于微信公众号和 OpenAI 的 AI 机器人，可以回答用户的提问。本项目是一个示例项目，帮助大家快速上手微信公众号开发和使用 OpenAI 进行智能回复。你可以通过修改本项目的代码，快速构建出自己的微信 AI 机器人。

## 使用方法

1. 注册一个 [微信公众号](https://mp.weixin.qq.com/)，并开通开发者模式。你需要在微信公众平台获取 `APPID` 和 `APPSECRET`。
2. 在 [OpenAI 官网](https://beta.openai.com/signup/) 注册账号，获取 API KEY。
3. 下载本项目代码，安装 [Node.js](https://nodejs.org/zh-cn/)，并安装依赖：`npm install`

4. 修改 `.env.example` 文件为 `.env`，并将其中的 `APPID`、`APPSECRET` 和 `OPENAI_API_KEY` 修改为你的 API KEY。
5. 运行代码：`yarn start`


6. 部署代码。推荐使用云服务商，如阿里云、腾讯云、AWS 等。本项目代码使用的是 Koa 框架，部署时需要使用 PM2 进行管理。

## 文件结构
- `db.js`：数据库操作文件。
- `index.html`：用户访问时的首页。
- `index.js`：主要逻辑文件，包含处理微信消息和调用 OpenAI API 的逻辑。
- `message.js`：`Message` 模型定义，使用 Sequelize 进行 ORM。

## 配置文件

配置文件使用 `.env` 文件，需要自行创建。示例：

> * MYSQL_USERNAME=your_mysql_username
> * MYSQL_PASSWORD=your_mysql_password
> * OPENAI_API_KEY=your_openai_api_key

## 使用的库

- [Koa](https://koajs.com/)
- [Sequelize](https://sequelize.org/)
- [wechat](https://github.com/node-webot/wechat)
- [OpenAI API](https://beta.openai.com/docs/api-reference/introduction)

## 开源协议

本项目使用 MIT 开源协议。你可以在遵守协议的前提下自由使用、修改和分享本项目。
