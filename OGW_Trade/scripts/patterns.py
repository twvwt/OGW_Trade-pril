import re
import json



def parse_imac(text):
    # Регулярное выражение для iMac M3 и M4
    pattern = r"""
        🖥\[([A-Z0-9]+)\]                # Артикул (например, MWUF3 или MQRN3)
        (?:\s*\[([A-Z0-9]+)\])?\s*      # Второй артикул (опционально)
        iMac\s(M3|M4)\s                 # Модель (M3 или M4)
        \(([^)]+)\)\s                  # Конфигурация в скобках
        ([^\s🇺🇸🇷🇺🇭🇰]+)               # Цвет (до эмодзи страны)
        \s*(🇺🇸|🇷🇺|🇭🇰|🇺🇸🇭🇰)?          # Флаг страны (опционально)
        \s*[—]\s*                      # Разделитель цены
        (\d+\.\d+)                     # Цена (формат 118.000)
    """
    
    imacs = []
    for match in re.finditer(pattern, text, re.VERBOSE):
        # Извлекаем данные
        articul1 = match.group(1)
        articul2 = match.group(2)
        model = f"iMac {match.group(3)}"  # M3 или M4
        config = match.group(4)
        color = match.group(5).strip()
        country_flag = match.group(6) or ""
        price = match.group(7).replace('.', '')  # Удаляем точки (118.000 → 118000)

        # Обрабатываем артикулы (если есть второй)
        articul = articul1
        if articul2:
            articul = f"{articul1}/{articul2}"

        # Парсим конфигурацию (поддержка всех форматов)
        if 'c CPU' in config:  # Формат: 8c CPU/10c GPU/8/256
            cpu_part, gpu_part, ram, storage = map(str.strip, config.split('/'))
            cpu = cpu_part.split()[0]  # Берём только цифру (из "8c CPU")
            gpu = gpu_part.split()[0]  # Берём только цифру (из "10c GPU")
        else:  # Формат: 8/8/16/256 или 8/10/24/1Tb
            parts = config.split('/')
            cpu = parts[0]
            gpu = parts[1] if len(parts) > 1 else "N/A"
            ram = parts[2] if len(parts) > 2 else "N/A"
            storage = parts[3] if len(parts) > 3 else "N/A"

        # Определяем страну
        country = {
            '🇺🇸': 'US',
            '🇷🇺': 'RU',
            '🇭🇰': 'HK',
            '🇺🇸🇭🇰': 'US/HK'
        }.get(country_flag, "")

        # Формируем результат
        imacs.append({
            'articul': articul,
            'model': model,
            'color': color,
            'configuration': {
                'cpu': cpu,
                'gpu': gpu,
                'ram': f"{ram}GB",
                'storage': storage
            },
            'price': int(price),
            'country': country
        })

    return imacs

def parse_mac(text):
    # Регулярное выражение для поиска информации о Mac
    pattern = r"""
        (?:^|\n)\s*  # Начало строки или новой строки
        (?:\[([A-Z0-9]+)\]\s*)?  # Артикул (необязательно)
        (Mac\s(?:Mini|Studio|Book\sPro)\s(?:M\d[\s\S]*?))  # Модель
        (?:\s\d{4})?  # Год (необязательно)
        (?:\s*\/\s*([\dC\sCPU,\/GPUGBTBSSDGBE]+))?  # Конфигурация (необязательно)
        \s*[-—]\s*  # Разделитель перед ценой
        (\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)  # Цена (правильный формат)
        \s*(🇺🇸|🇭🇰|🇪🇺|🇯🇵|🇰🇼|🇨🇳|🇸🇬|🇰🇷|🇦🇪|🇨🇦|🇮🇳|🇬🇪|🇧🇷|🇳🇪)?  # Флаг страны (необязательно)
    """
    
    macs = []
    for match in re.finditer(pattern, text, re.VERBOSE):
        articul = match.group(1) or ""
        model = match.group(2).strip()
        config = match.group(3).strip() if match.group(3) else ""
        price = match.group(4).replace(' ', '').replace(',', '.').replace('\xa0', '') if match.group(4) else '0'
        country_flag = match.group(5) if match.group(5) else ""
        
        # Преобразуем флаг страны в название
        country_codes = {
            '🇺🇸': 'US',
            '🇭🇰': 'HH',
            '🇪🇺': 'EU',
            '🇯🇵': 'JP',
            '🇰🇼': 'KW',
            '🇨🇳': 'CN',
            '🇸🇬': 'SG',
            '🇰🇷': 'KR',
            '🇦🇪': 'AE',
            '🇨🇦': 'CA',
            '🇮🇳': 'IN',
            '🇬🇪': 'GE',
            '🇧🇷': 'BR',
            '🇳🇪': 'NE'
        }
        country = country_codes.get(country_flag, "")
        
        # Определяем тип устройства
        if "Mac Mini" in model:
            category = "Mac Mini"
        elif "Mac Studio" in model:
            category = "Mac Studio"
        elif "MacBook Pro" in model:
            category = "MacBook Pro"
        else:
            category = "Mac"
        
        macs.append({
            'articul': articul,
            'model': model,
            'category': category,
            'configuration': config,
            'price': price,
            'country': country
        })
    
    return macs

def parse_iphone13(text):
    # Регулярное выражение для поиска информации об iPhone 13
    pattern = r"""
        (?:^|\n)\s*  # Начало строки или новой строки
        (13(?:\sPro)?(?:\sMax)?)\s  # Модель (13, 13 Pro, 13 Pro Max)
        (\d+[GT]B|\d+)\s  # Объем памяти
        (Black|White|Midnight|Starlight|Blue|Green|Red|Pink|Grey)\s*-?\s*  # Цвет
        (?:\(CPO\sОриг.\sУпаковка\)\s)?  # Восстановленные устройства
        (\d[\d,.]*)\s*  # Цена (число с возможными разделителями)
        (?:🇺🇸|🇭🇰|🇪🇺|🇯🇵|🇰🇼|🇨🇳|🇸🇬|🇰🇷|🇦🇪|🇨🇦|🇮🇳|🇬🇪|🇧🇷|🇳🇪)  # Флаг страны
        (?:\s*([^*]*?)(?:\s*актив|\s*Актив|\s*\*|\.|$))  # Примечание
    """
    
    iphones = []
    for match in re.finditer(pattern, text, re.VERBOSE):
        model = match.group(1).strip()
        storage = match.group(2).strip()
        color = match.group(3).strip()
        is_cpo = "(CPO Ориг. Упаковка)" in match.group(0)
        price_str = match.group(4).replace('.', '').replace(',', '.') if match.group(4) else '0'
        country_flag = match.group(0)[-2:]  # Получаем флаг страны из совпадения
        note = match.group(5).strip() if match.group(5) else ""
        
        try:
            price = float(price_str) if '.' in price_str else int(price_str)
        except (ValueError, TypeError):
            price = 0
        
        # Преобразуем флаг страны в название
        country_codes = {
            '🇺🇸': 'USA',
            '🇭🇰': 'Hong Kong',
            '🇪🇺': 'Europe',
            '🇯🇵': 'Japan',
            '🇰🇼': 'Kuwait',
            '🇨🇳': 'China',
            '🇸🇬': 'Singapore',
            '🇰🇷': 'South Korea',
            '🇦🇪': 'UAE',
            '🇨🇦': 'Canada',
            '🇮🇳': 'India',
            '🇬🇪': 'Georgia',
            '🇧🇷': 'Brazil',
            '🇳🇪': 'Niger'
        }
        country = country_codes.get(country_flag, country_flag)
        
        condition = "CPO" if is_cpo else ("Актив" if "актив" in note.lower() else "Новый")
        
        iphones.append({
            'model': f"iPhone {model}",
            'storage': storage,
            'color': color,
            'price': price,
            'country': country,
            'condition': condition,
            'note': note
        })
    
    return iphones

def parse_iphone15(text):
    # Регулярное выражение для поиска информации об iPhone
    pattern = r"""
        (?:^|\n)\s*  # Начало строки или новой строки
        (15(?:\sPlus)?(?:\sPro)?(?:\sMax)?)\s  # Модель (16, 16 Plus, 16 Pro, 16 Pro Max)
        (\d+[GT]B|\d+)\s  # Объем памяти
        (Black|White|Natural|Desert|Teal|Pink|Ultramarine)\s*-?\s*  # Цвет
        (\d[\d,.]*)\s*  # Цена (число с возможными разделителями)
        (?:🇺🇸|🇭🇰|🇪🇺|🇯🇵|🇰🇼|🇨🇳|🇸🇬|🇰🇷|🇦🇪|🇨🇦|🇮🇳|🇬🇪|🇧🇷)  # Флаг страны
        (?:\s*([^*]*?)(?:\s*актив|\s*Актив|\s*\*|\.|$))  # Примечание
    """
    
    iphones = []
    for match in re.finditer(pattern, text, re.VERBOSE):
        model = match.group(1).strip()
        storage = match.group(2).strip()
        color = match.group(3).strip()
        price_str = match.group(4).replace('.', '').replace(',', '.') if match.group(4) else '0'
        country_flag = match.group(0)[-2:]  # Получаем флаг страны из совпадения
        note = match.group(5).strip() if match.group(5) else ""
        
        try:
            price = float(price_str) if '.' in price_str else int(price_str)
        except (ValueError, TypeError):
            price = 0
        
        # Преобразуем флаг страны в название
        country_codes = {
            '🇺🇸': 'USA',
            '🇭🇰': 'Hong Kong',
            '🇪🇺': 'Europe',
            '🇯🇵': 'Japan',
            '🇰🇼': 'Kuwait',
            '🇨🇳': 'China',
            '🇸🇬': 'Singapore',
            '🇰🇷': 'South Korea',
            '🇦🇪': 'UAE',
            '🇨🇦': 'Canada',
            '🇮🇳': 'India',
            '🇬🇪': 'Georgia',
            '🇧🇷': 'Brazil'
        }
        country = country_codes.get(country_flag, country_flag)
        
        iphones.append({
            'model': f"iPhone {model}",
            'storage': storage,
            'color': color,
            'price': price,
            'country': country,
            'note': note
        })
    
    return iphones
def parse_iphone16(text):
    # Регулярное выражение для поиска информации об iPhone
    pattern = r"""
        (?:^|\n)\s*  # Начало строки или новой строки
        (16(?:\sPlus)?(?:\sPro)?(?:\sMax)?)\s  # Модель (16, 16 Plus, 16 Pro, 16 Pro Max)
        (\d+[GT]B|\d+)\s  # Объем памяти
        (Black|White|Natural|Desert|Teal|Pink|Ultramarine)\s*-?\s*  # Цвет
        (\d[\d,.]*)\s*  # Цена (число с возможными разделителями)
        (?:🇺🇸|🇭🇰|🇪🇺|🇯🇵|🇰🇼|🇨🇳|🇸🇬|🇰🇷|🇦🇪|🇨🇦|🇮🇳|🇬🇪|🇧🇷)  # Флаг страны
        (?:\s*([^*]*?)(?:\s*актив|\s*Актив|\s*\*|\.|$))  # Примечание
    """
    
    iphones = []
    for match in re.finditer(pattern, text, re.VERBOSE):
        model = match.group(1).strip()
        storage = match.group(2).strip()
        color = match.group(3).strip()
        price_str = match.group(4).replace('.', '').replace(',', '.') if match.group(4) else '0'
        country_flag = match.group(0)[-2:]  # Получаем флаг страны из совпадения
        note = match.group(5).strip() if match.group(5) else ""
        
        try:
            price = float(price_str) if '.' in price_str else int(price_str)
        except (ValueError, TypeError):
            price = 0
        
        # Преобразуем флаг страны в название
        country_codes = {
            '🇺🇸': 'USA',
            '🇭🇰': 'Hong Kong',
            '🇪🇺': 'Europe',
            '🇯🇵': 'Japan',
            '🇰🇼': 'Kuwait',
            '🇨🇳': 'China',
            '🇸🇬': 'Singapore',
            '🇰🇷': 'South Korea',
            '🇦🇪': 'UAE',
            '🇨🇦': 'Canada',
            '🇮🇳': 'India',
            '🇬🇪': 'Georgia',
            '🇧🇷': 'Brazil'
        }
        country = country_codes.get(country_flag, country_flag)
        
        iphones.append({
            'model': f"iPhone {model}",
            'storage': storage,
            'color': color,
            'price': price,
            'country': country,
            'note': note
        })
    
    return iphones


def parse_iphone_16pro_promax(text):
    # Регулярное выражение для поиска информации об iPhone
    pattern = r"""
        (16\sPro\s?(?:Max)?)\s      # Модель (Pro или Pro Max)
        (\d+[GT]B|\d+)\s            # Объем памяти
        (Black|White|Natural|Desert)\s*-?\s*  # Цвет
        (\d[\d,.]*)\s*              # Цена (число с возможными разделителями)
        (?:🇺🇸|🇭🇰|🇪🇺|🇯🇵|🇰🇼|🇨🇳|🇸🇬|🇰🇷|🇦🇪|🇨🇦|🇮🇳|🇬🇪|🇧🇷)  # Флаг страны
        (?:\s*\((.*?)\))?           # Примечание (необязательно)
    """
    
    iphones = []
    for match in re.finditer(pattern, text, re.VERBOSE):
        model = match.group(1).strip()
        storage = match.group(2).strip()
        color = match.group(3).strip()
        price_str = match.group(4).replace('.', '').replace(',', '.') if match.group(4) else '0'
        country_flag = match.group(0)[-2:]  # Получаем флаг страны из совпадения
        note = match.group(5).strip() if match.group(5) else ""
        
        try:
            price = float(price_str) if '.' in price_str else int(price_str)
        except (ValueError, TypeError):
            price = 0
        
        # Преобразуем флаг страны в название
        country_codes = {
            '🇺🇸': 'USA',
            '🇭🇰': 'Hong Kong',
            '🇪🇺': 'Europe',
            '🇯🇵': 'Japan',
            '🇰🇼': 'Kuwait',
            '🇨🇳': 'China',
            '🇸🇬': 'Singapore',
            '🇰🇷': 'South Korea',
            '🇦🇪': 'UAE',
            '🇨🇦': 'Canada',
            '🇮🇳': 'India',
            '🇬🇪': 'Georgia',
            '🇧🇷': 'Brazil'
        }
        country = country_codes.get(country_flag, country_flag)
        
        iphones.append({
            'model': model,
            'storage': storage,
            'color': color,
            'price': price,
            'country': country,
            'note': note
        })
    
    return iphones

def parse_ipad(text):
    ipads = []
    
    # Предопределенные цвета для проверки
    colors = ['Blue', 'Gray', 'Grey', 'Black', 'White', 'Silver', 
              'Starlight', 'Purple', 'Pink', 'Yellow', 'Space']
    
    # Обрабатываем каждую строку текста
    for line in text.split('\n'):
        line = line.strip()
        
        # Пропускаем строки, не относящиеся к iPad
        if not line.startswith('iPad'):
            continue
            
        # Разделяем строку на часть с характеристиками и ценой
        if '-' not in line:
            continue
            
        parts = line.split('-', 1)
        product_part = parts[0].strip()
        price_part = parts[1].strip()
        
        # Извлекаем цену
        price_match = re.search(r'\d{1,3}(?:\.\d{3})*', price_part)
        price = price_match.group().replace('.', '') if price_match else '0'
        
        # Извлекаем страну
        country = 'USA' if '🇺🇸' in price_part else ('Singapore' if '🇸🇬' in price_part else '')
        
        # Извлекаем примечание
        note = ''.join(c for c in price_part if c in {'•', '”', '*', ',', "'", '"', '‘', '’'})
        
        # 1. Извлекаем память - основной вариант (число + GB/TB)
        memory = ''
        memory_match = re.search(r'(\d+)\s*(GB|Gb|gb|TB|Tb|tb)\b', product_part, re.IGNORECASE)
        if memory_match:
            size = memory_match.group(1)
            unit = memory_match.group(2).upper()
            unit = unit.replace('GB', 'GB').replace('TB', 'TB')
            memory = f"{size}{unit}"
            # Удаляем найденную память из product_part
            product_part = product_part.replace(memory_match.group(0), '').strip()
        
        # 2. Если память не найдена, ищем просто число (в предположении, что это GB)
        if not memory:
            size_match = re.search(r'(^|\s)(\d+)(\s|$)', product_part)
            if size_match and 16 <= int(size_match.group(2)) <= 2048:  # Проверяем разумный диапазон
                memory = f"{size_match.group(2)}GB"
                product_part = product_part.replace(size_match.group(0), '').strip()
        
        # 3. Извлекаем цвет
        color = ''
        for c in colors:
            if re.search(rf'\b{c}\b', product_part, re.IGNORECASE):
                color = c if c != 'Grey' else 'Gray'
                break
        
        # 4. Очищаем название от лишней информации
        name = product_part
        # Удаляем цвет, если он был найден
        if color:
            name = re.sub(rf'\b{color}\b', '', name, flags=re.IGNORECASE).strip()
        # Удаляем лишние пробелы и скобки
        name = re.sub(r'\s+', ' ', name).strip()
        name = re.sub(r'\(\s*\)', '', name).strip()
        
        ipad = {
            'model': name,
            'ssd': memory,
            'color': color,
            'price': price,
            'country': country,
            'note': note
        }
        
        ipads.append(ipad)
    
    return ipads


def parse_airpods(text):
    airpods = []
    
    # Основной паттерн для AirPods
    airpod_pattern = re.compile(
        r'(🎧AirPods.*?|🎧EarPods.*?)'  # Название (начинается с 🎧AirPods или 🎧EarPods)
        r'(?:\s*\([^)]*\))*'          # Пропускаем текст в скобках
        r'\s*-\s*'                     # Разделитель
        r'(\d{1,3}(?:\.\d{3})*)'      # Цена
        r'(?:\s*([🇺🇸🇪🇺]+))?'         # Страна
        r'(?:\s*([”*🆕]+))?'          # Примечание
    )
    
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if 'AirPods' not in line and 'EarPods' not in line:
            continue
            
        match = airpod_pattern.search(line)
        if not match:
            continue
            
        name = match.group(1).strip()
        price = match.group(2).replace('.', '')
        country = match.group(3) or ''
        note = match.group(4) or ''
        
        # Определяем поколение и тип
        generation = ''
        model_type = ''
        
        # Поколение
        if '3rd Gen' in name:
            generation = '3'
        elif '4' in name:
            generation = '4'
        elif 'Pro' in name:
            generation = 'Pro 2'
        elif 'Max' in name:
            generation = 'Max'
        
        # Тип
        if 'Lightning' in name:
            model_type = 'Lightning'
        elif 'MagSafe' in name:
            model_type = 'MagSafe'
        elif 'USB-C' in name:
            model_type = 'USB-C'
        elif 'шумоподавлением' in name:
            model_type = 'ANC'
        
        airpod = {
            'model': name,
            'generation': generation,
            'ssd': model_type,
            'price': price,
            'country': country,
            'note': note
        }

        airpods.append(airpod)
    
    return airpods