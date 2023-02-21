const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const { init: initDB } = require("./pages/db");
const { getAIMessage } = require('./pages/message')
const router = new Router();
const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
const AI_THINKING_MESSAGE = 'AI 正在思考，请稍后再试...';
// 首页
router.get("/", async (ctx) => {
  ctx.body = homePage;
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 处理用户请求
router.post('/message/post', async ctx => {
  const { ToUserName, FromUserName, Content, CreateTime } = ctx.request.body;

  const message = await Promise.race([
    sleep(2900).then(() => AI_THINKING_MESSAGE),
    getAIMessage({ Content, FromUserName, CreateTime }),
  ]);

  ctx.body = {
    ToUserName: FromUserName,
    FromUserName: ToUserName,
    CreateTime: +new Date(),
    MsgType: 'text',
    Content: message,
  };
});

// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = ctx.request.headers["x-wx-openid"];
  }
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
