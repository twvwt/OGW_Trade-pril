from pyrogram import Client
import datetime
from pyrogram.types import InputMediaPhoto
import time
from pyrogram.errors import FloodWait
import pandas as pd
import random
from patterns import parse_iphone16, parse_iphone15, parse_iphone13, parse_mac, parse_imac, parse_ipad, parse_airpods
from pymongo import MongoClient
from catalog import create_catalog_iphone, create_catalog_macbook, create_catalog_imac, create_catalog_ipad, create_catalog_airpods

# Подключение к MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["ogwplus"]
products_collection = db["products"]

def save_to_mongo(product_data, category):
    """Сохраняет товар в MongoDB"""
    product = {
        'name': product_data['name'],
        'category': category,
        'subcategory': product_data.get('postcategory', ''),
        'price': float(product_data['price']),
        'oldPrice': float(product_data['new_price']) if product_data.get('new_price') else None,
        'description': product_data.get('description', ''),
        'specs': {
            'storage': product_data.get('ssd', ''),
            'color': product_data.get('color', ''),
            'country': product_data.get('country', '')
        },
        'images': [
            product_data['photo1'],
            product_data['photo2'],
            product_data['photo3']
        ],
        'isActive': True,
        'createdAt': datetime.datetime.now(),
        'updatedAt': datetime.datetime.now()
    }
    
    # Проверяем, существует ли уже такой товар
    existing = products_collection.find_one({
        'name': product['name'],
        'specs.storage': product['specs']['storage'],
        'specs.color': product['specs']['color']
    })
    
    if existing:
        # Обновляем существующий товар
        products_collection.update_one(
            {'_id': existing['_id']},
            {'$set': {
                'price': product['price'],
                'oldPrice': product['oldPrice'],
                'updatedAt': datetime.datetime.now()
            }}
        )
    else:
        # Добавляем новый товар
        products_collection.insert_one(product)

# Модифицируем функции из catalog.py для сохранения в MongoDB
def create_catalog_iphone_mongo(*args, **kwargs):
    product_data = create_catalog_iphone(*args, **kwargs)
    save_to_mongo(product_data, 'iPhone')

api_id = 24373411
api_hash = '195b8f73d79491b07e658b1ca6dae0c9'

message_ids = [10982, 10983, 10991, 11186, 11187, 12064, 11198, 11193, 11194, 11197, 11199, 11200, 11384, 11510, 12116, 12117, 12118, 12119, 12149]
chat_id = '@BigSaleApple'

start_date = datetime.datetime(2023, 4, 10)

with Client("IZ", api_id, api_hash) as app:
    messages = app.get_chat_history(chat_id)
    
    for message in list(messages):
        if message.date>start_date:
            # iPhone 16 Pro/ProMax
            if message.id == 12471:
                iphones = parse_iphone16(message.text)
                for iphone in iphones:
                    create_catalog_iphone(
                                category='iPhone',
                                postcategory=iphone['model'],
                                name=iphone['model'],
                                ssd=iphone['storage'],
                                color=iphone['color'],
                                country=iphone['country'],
                                price=iphone['price'],
                                new_price=int(int(iphone['price'])*1.07),
                                description='',
                                photo1=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/1.jpg',
                                photo2=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/2.jpg',
                                photo3=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/3.jpg'
                                )
        if message.date>start_date:
            # iPhone 16/16e
            if message.id == 12469:
                iphones = parse_iphone16(message.text)
                for iphone in iphones:
                    create_catalog_iphone(
                                category='iPhone',
                                postcategory=iphone['model'],
                                name=iphone['model'],
                                ssd=iphone['storage'],
                                color=iphone['color'],
                                country=iphone['country'],
                                price=iphone['price'],
                                new_price=int(int(iphone['price'])*1.07),
                                description='',
                                photo1=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/1.jpg',
                                photo2=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/2.jpg',
                                photo3=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/3.jpg'
                                )

            # iPhone 15
            if message.id == 12467:
                iphones = parse_iphone15(message.text)
                for iphone in iphones:
                    create_catalog_iphone(
                                category='iPhone',
                                postcategory=iphone['model'],
                                name=iphone['model'],
                                ssd=iphone['storage'],
                                color=iphone['color'],
                                country=iphone['country'],
                                price=iphone['price'],
                                new_price=int(int(iphone['price'])*1.07),
                                description='',
                                photo1=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/1.jpg',
                                photo2=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/2.jpg',
                                photo3=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/3.jpg'
                                )
                    
            # iPhone 13
            if message.id == 12463:
                iphones = parse_iphone13(message.text)
                for iphone in iphones:
                    create_catalog_iphone(
                                category='iPhone',
                                postcategory=iphone['model'],
                                name=iphone['model'],
                                ssd=iphone['storage'],
                                color=iphone['color'],
                                country=iphone['country'],
                                price=iphone['price'],
                                new_price=int(int(iphone['price'])*1.07),
                                description='',
                                photo1=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/1.jpg',
                                photo2=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/2.jpg',
                                photo3=f'photo/iphone/iPhone {iphone['model']}/{iphone['color']}/3.jpg'
                                )
            #MacBook  id = 12460, 12459(не проработан паттерн)
            if message.id == 12460:
                macs = parse_mac(' '.join(message.text.replace('🇺🇸🇭🇰', ' 🇭🇰').replace('(16/512)', '16GB/512GB').split('Mac Mini M4\n    \n')[1:]))
                for mac in macs:
                    create_catalog_macbook(
                                category='MacBook',
                                postcategory=mac['category'],
                                name=mac['model'],
                                country=mac['country'],
                                ssd = mac['configuration'],
                                price=mac['price'],
                                new_price=int(int(mac['price'].replace('.', ''))*1.07),
                                description='',
                                photo1=f'photo/MacBook/{mac['category']}/1.jpg',
                                photo2=f'photo/MacBook/{mac['category']}/2.jpg',
                                photo3=f'photo/MacBook/{mac['category']}/3.jpg'
                                )
            #iMac           
            if message.id == 12456 or message.id == 12455:
                imacs = parse_imac(message.text)
                for imac in imacs:
                    create_catalog_imac(
                                category='iMac',
                                postcategory=' '.join(imac['model'].split(' ')[0:2]),
                                name=imac['model'],
                                country=imac['country'],
                                color = imac['color'],
                                ssd = imac['configuration'],
                                price=imac['price'],
                                new_price=int((imac['price'])*1.07),
                                description='',
                                photo1=f'photo/iMac/{' '.join(imac['model'].split(' ')[0:2])}/1.jpg',
                                photo2=f'photo/iMac/{' '.join(imac['model'].split(' ')[0:2])}/2.jpg',
                                photo3=f'photo/iMac/{' '.join(imac['model'].split(' ')[0:2])}/3.jpg'
                                ) 
            #iPad
            if message.id == 12253 or message.id == 12255 or message.id == 12304:
                ipads = parse_ipad(message.text.replace('64', '64GB').replace('128', '128GB').replace('256', '256GB').replace('512', '512GB'))
                for ipad in ipads:
                    create_catalog_ipad(
                                category='iPad',
                                postcategory='iPad',
                                name=ipad['model'],
                                country=ipad['country'],
                                color = ipad['color'],
                                ssd = ipad['ssd'],
                                price=ipad['price'],
                                new_price=int(float(ipad['price'])*1.07),
                                description='',
                                photo1=f'photo/iPad/1.jpg',
                                photo2=f'photo/iPad/2.jpg',
                                photo3=f'photo/iPad/3.jpg'
                                ) 
            #AiePods
            if message.id == 12207:
                airpods = parse_airpods(message.text)
                for airpod in airpods:
                    create_catalog_ipad(
                                category='AirPods',
                                postcategory=f'AirPods {airpod['generation']}',
                                name=airpod['model'],
                                country=airpod['country'],
                                color = 'White',
                                ssd = airpod['ssd'],
                                price=airpod['price'],
                                new_price=int(float(airpod['price'])*1.07),
                                description='',
                                photo1=f'photo/AirPods/1.jpg',
                                photo2=f'photo/AirPods/2.jpg',
                                photo3=f'photo/AirPods/3.jpg'
                                ) 