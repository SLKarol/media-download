# Media download

![Скриншот](https://raw.githubusercontent.com/SLKarol/media-download/main/screenshots/screen1.png)

![Скриншот](https://raw.githubusercontent.com/SLKarol/media-download/main/screenshots/screen2.png)

Программа написана с использованием [reactjs](https://reactjs.org/) и [electron](electronjs.org/).
Несмотря на то, что есть и другие загрузчики медиа-файлов, я решил в качестве самообразования и практики написать свой вариант.
Пока что он поддерживает следующие хосты:

- www.reddit.com
- www.yaplakal.com
- www.redgifs.com
- imgur.com

_(Кстати для работы с Reddit необходимо там зарегистрироваться и получить данные о приложении. [Узнать подробнее](https://rymur.github.io/intro). )_

Так как программу пишу для себя, то она помимо скачивания фото может делать рассылку с выбранными медиа в телеграмм-каналы.

Небольшая справка по командам:

**npm start** - Для старта в режиме разработки требуется команда

**npm run make** - Получить скомпилированную программу (в каталоге out)
