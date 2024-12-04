import dotenv from 'dotenv';

dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN,
  salesId: process.env.SALES_ID,
  adminId: process.env.ADMIN_ID,
  port: process.env.PORT || 3000
};