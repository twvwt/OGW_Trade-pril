import json

catalog = []
def create_catalog_iphone(category,postcategory,name, ssd, color, country, price, new_price, description, photo1, photo2, photo3):
    catalog.append({
    'category':category,
    'postcategory':postcategory,
    'name':name,
    'ssd':ssd,
    'color':color,
    'country':country,
    'price':price,
    'new_price':new_price,
    'description':description,
    'photo1':photo1,
    'photo2':photo2,
    'photo3':photo3,
    })
    with open('iphone.json', 'w', encoding='utf-8') as json_file:
        json.dump(catalog, json_file, ensure_ascii=False, indent=4)
        
catalog_macbook = []
def create_catalog_macbook(category,postcategory,name, country,ssd,  price, new_price, description, photo1, photo2, photo3):
    catalog_macbook.append({
    'category':category,
    'postcategory':postcategory,
    'name':name,
    'ssd':ssd,
    'color': '',
    'country':country,
    'price':price,
    'new_price':new_price,
    'description':description,
    'photo1':photo1,
    'photo2':photo2,
    'photo3':photo3,
    })  
    with open('macbook.json', 'w', encoding='utf-8') as json_file:
        json.dump(catalog_macbook, json_file, ensure_ascii=False, indent=4)
        
catalog_imac = []
def create_catalog_imac(category,postcategory,name, ssd, color, country, price, new_price, description, photo1, photo2, photo3):
    catalog_imac.append({
    'category':category,
    'postcategory':postcategory,
    'name':name,
    'ssd':ssd,
    'color':color,
    'country':country,
    'price':price,
    'new_price':new_price,
    'description':description,
    'photo1':photo1,
    'photo2':photo2,
    'photo3':photo3,
    })
    with open('imac.json', 'w', encoding='utf-8') as json_file:
        json.dump(catalog_imac, json_file, ensure_ascii=False, indent=4)
        
        
catalog_ipad= []
def create_catalog_ipad(category,postcategory,name, ssd, color, country, price, new_price, description, photo1, photo2, photo3):
    catalog_ipad.append({
    'category':category,
    'postcategory':postcategory,
    'name':name,
    'ssd':ssd,
    'color':color,
    'country':country,
    'price':price,
    'new_price':new_price,
    'description':description,
    'photo1':photo1,
    'photo2':photo2,
    'photo3':photo3,
    })
    
    with open('ipad.json', 'w', encoding='utf-8') as json_file:
        json.dump(catalog_ipad, json_file, ensure_ascii=False, indent=4)
        
catalog_airpods= []
def create_catalog_airpods(category,postcategory,name, ssd, color, country, price, new_price, description, photo1, photo2, photo3):
    catalog_ipad.append({
    'category':category,
    'postcategory':postcategory,
    'name':name,
    'ssd':ssd,
    'color':color,
    'country':country,
    'price':price,
    'new_price':new_price,
    'description':description,
    'photo1':photo1,
    'photo2':photo2,
    'photo3':photo3,
    })
    
    with open('airpods.json', 'w', encoding='utf-8') as json_file:
        json.dump(catalog_airpods, json_file, ensure_ascii=False, indent=4)