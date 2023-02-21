const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const { Sequelize, DataTypes } = require("sequelize");
// 从环境变量中读取数据库配置
const {MYSQL_DATABASE, MYSQL_USERNAME, MYSQL_PASSWORD, MYSQL_ADDRESS = "" } = process.env;
const [host, port] = MYSQL_ADDRESS.split(":");
const sequelize = new Sequelize("wx_openai_db", MYSQL_USERNAME, MYSQL_PASSWORD, {
  host,
  port,
  dialect: "mysql" /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
});

// 定义 Message 模型
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  fromUserName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  response: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  aiType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
    allowNull: false,
  },
});

// 数据库初始化方法
async function init() {
  await Message.sync({ alter: true });
}

// 导出初始化方法和模型
module.exports = {
  init,
  Message,
};
