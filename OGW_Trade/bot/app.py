import os
from dotenv import load_dotenv
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")

# Парсинг админов из .env
def parse_admins(env_var):
    admins = {}
    for pair in os.getenv(env_var, "").split(","):
        if not pair.strip():
            continue
        user_id, name = pair.strip().split(":")
        admins[int(user_id)] = name
    return admins

SUPERADMINS = parse_admins("SUPERADMINS")
ADMINS = parse_admins("ADMINS")

# Загрузка ссылок из .env
ADMIN_PANEL_URL = os.getenv("ADMIN_PANEL_URL")
SUPERADMIN_PANEL_URL = os.getenv("SUPERADMIN_PANEL_URL")
SHOP_URL = os.getenv("SHOP_URL")

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Клавиатура для суперадмина
def get_superadmin_keyboard():
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="Админ-панель", web_app=types.WebAppInfo(url=ADMIN_PANEL_URL)),
            InlineKeyboardButton(text="Панель суперадмина", web_app=types.WebAppInfo(url=SUPERADMIN_PANEL_URL)),
        ],
        [
            InlineKeyboardButton(text="Магазин", web_app=types.WebAppInfo(url=SHOP_URL)),
        ]
    ])

# Клавиатура для админа
def get_admin_keyboard():
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="Админ-панель", web_app=types.WebAppInfo(url=ADMIN_PANEL_URL)),
        ],
        [
            InlineKeyboardButton(text="Магазин", web_app=types.WebAppInfo(url=SHOP_URL)),
        ]
    ])

# Клавиатура для обычного пользователя
def get_user_keyboard():
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="Магазин", web_app=types.WebAppInfo(url=SHOP_URL)),
        ]
    ])

@dp.message(CommandStart())
async def start(message: types.Message):
    user_id = message.from_user.id
    user_name = message.from_user.first_name

    if user_id in SUPERADMINS:
        admin_name = SUPERADMINS[user_id]
        await message.answer(
            f"👑 Привет, **Суперадмин {admin_name}**!",
            reply_markup=get_superadmin_keyboard(),
            parse_mode="Markdown"
        )
    elif user_id in ADMINS:
        admin_name = ADMINS[user_id]
        await message.answer(
            f"🛠 Привет, **Админ {admin_name}**!",
            reply_markup=get_admin_keyboard(),
            parse_mode="Markdown"
        )
    else:
        await message.answer(
            f"🛍 Привет, **{user_name}**! Добро пожаловать в магазин!",
            reply_markup=get_user_keyboard(),
            parse_mode="Markdown"
        )

if __name__ == "__main__":
    dp.run_polling(bot)