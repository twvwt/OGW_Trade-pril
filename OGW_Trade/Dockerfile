
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=5000
ENV MONGO_URI=mongodb://mongo:27017/ogwplus
ENV JWT_SECRET=your_jwt_secret_here
ENV TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ENV ADMIN_CHAT_ID=your_admin_chat_id

EXPOSE 5000

CMD ["npm", "start"]