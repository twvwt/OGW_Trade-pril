const axios = require('axios');
const Order = require('../models/Order');

const sendTelegramNotification = async (chatId, message, replyMarkup = null) => {
  try {
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };
    
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, payload);
  } catch (error) {
    console.error('Error sending Telegram notification:', error.message);
  }
};

const notifyAdminAboutNewOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('items.productId', 'name price');
    if (!order) return;
    
    let message = `🛒 <b>New Order #${order._id}</b>\n\n`;
    message += `💰 Total: $${order.totalAmount.toFixed(2)}\n`;
    message += `📦 Status: ${order.status}\n\n`;
    message += `<b>Items:</b>\n`;
    
    order.items.forEach(item => {
      message += `- ${item.productId.name} x${item.quantity} ($${item.price.toFixed(2)})\n`;
    });
    
    message += `\n🚚 Shipping to: ${order.shippingAddress.city}, ${order.shippingAddress.country}`;
    
    // Send to admin chat
    await sendTelegramNotification(process.env.ADMIN_CHAT_ID, message);
  } catch (error) {
    console.error('Error notifying admin about new order:', error);
  }
};

module.exports = {
  sendTelegramNotification,
  notifyAdminAboutNewOrder,
};