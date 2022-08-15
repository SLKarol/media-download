# Media download

![Скриншот](https://raw.githubusercontent.com/SLKarol/media-download/main/screenshots/screen1.png)

![Скриншот](https://raw.githubusercontent.com/SLKarol/media-download/main/screenshots/screen2.png)

![Скриншот](https://raw.githubusercontent.com/SLKarol/media-download/main/screenshots/screen3.png)

Программа написана с использованием [reactjs](https://reactjs.org/) и [electron](electronjs.org/).
Несмотря на то, что есть и другие загрузчики медиа-файлов, я решил в качестве самообразования и практики написать свой вариант.
Пока что он поддерживает следующие хосты:

- www.reddit.com
- www.yaplakal.com
- www.redgifs.com
- imgur.com
- www.youtube.com
- gfycat.com

Из reddit берётся подписка на каналы и во время скачивания отправляется голосование (можно отключить эту опцию).

_(Кстати для работы с Reddit необходимо там зарегистрироваться и получить данные о приложении. [Узнать подробнее](https://rymur.github.io/intro). )_

Программа вызывает [ffmpeg](https://ffmpeg.org/) для работы медиа-ресурсами. Я подумал, что в сборку программы не буду добавлять **ffmpeg**, поэтому её установка, настройка (необходимо добавить в _PATH_ путь к ffmpeg) целиком лежит на пользователе.

Так как программу пишу для себя, то она помимо скачивания фото может делать рассылку с выбранными медиа в телеграмм-каналы.

Небольшая справка по командам:

**npm start** - Для старта в режиме разработки требуется команда

**npm run make** - Получить скомпилированную программу (в каталоге out)

## История изменений

**13.08.2022** v0.1.1

- Обработка случая, когда в reddit заметка не содержит мультимедиа

**13.08.2022** v0.1.0

- Обновление пакетов
- FIX: не удаётся скачать альбом
- FIX: не удаётся получить инфу из видео, если это youtube в заметке reddit
- Вывод версии в заголовке программы

**12.08.2022** v0.0.13

- Не давать скачивать медиа, если не загружен preview
- refactor: отправка видео в телеграмм
- refactor: работа с сайтам ЯП, redgifs
- chore: удалён пакет axios
- style: добавлен в нижнюю часть тулбар ленты ЯП

**11.08.2022** v0.0.12

- Параметр паузы отправки в телеграмм вынесен в настройку
- Текст описания праздника сделан шаблоном, хранится в настройках
- Перед отправкой фото в телеграмм написать к-во картинок
- Добавлено тултип в кнопку "Выбрать другой праздник"

**10.08.2022** v0.0.11

- FIX: ошибка загрузки gif из урла (относится к сообщениям reddit)
- Добавлен разбор инфы из gfycat.com
- Для ютуб теперь можно выбирать качество видео (720p, 1080p и т.д.)

**02.08.2022** v0.0.10

- Показать коллекцию изображений из reddit
- FIX: ошибка скачивания видео, если нет аудиодорожки
- FIX: некорректное обращение к imgur

**26.07.2022** v0.0.9

- Скачивать ресурс из ютуба и разрезать его на главы
- FIX: отправка ютуб-ресурса в телеграм

**10.07.2022** v0.0.8

- Исправление ошибки отправки видео в телеграм
- Скачивание ресурса из ютуб

**21.06.2022** v0.0.7

- Постраничный запрос к reddit
- Логирование ошибок
- Вывод в заголовке окна "Идёт загрузка"

**14.06.2022** v0.0.6

- Исправлено: листание ленты яплакал: не правильно рассчитывалась предыдущая страница и был некорректный запрос к серверу.

**13.06.2022** v0.0.5

- В "Скачать по ссылке" теперь можно вводить адрес форума ЯП

**12.06.2022** v0.0.4

- Чтение форумов yaplakal
- Рефакторинг: mobx redditNewsStore перенёс на mediaNewsStore

**01.06.2022** v.0.0.2

- Оптимизация загрузки новостей из reddit;
- Исправление ошибки передачи видео в телеграм из reddit
- Исправление ошибки получения видео из yaplakal
