
// 1. Импортируем модули.
const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('node:fs');

app.use(express.json()); //Этот middleware позволяет Express автоматически разбирать JSON-данные из POST, PUT, PATCH запросов.

// 2. Генерация массива.
function genUsers() {
    const users = []; //создаем пустой массив
    const letters = 'abcdefghijklmnopqrst'; // создаю контент для формирования имени , 20 букв на каждый из обектов
    for (let i = 0; i < letters.length; i++) { //создание обектов ограниченно количеством букв 
        users.push({ //добавляет указанные элементы в конец массива и возвращает новую длину массива.
            id: i + 1, //присваиваем каждому порядковый номер
            name: letters[i], //выбирает из массива последовательно буквы 
            age: Math.floor(Math.random() * (65 - 18 + 1)) + 18 //генерирует случайные числа от 18 до 65
        });
    };
    return users;
}

// 3.Создание файла
const data = genUsers();
fs.writeFile('user.txt', JSON.stringify(data, null, 2), 'utf8', (err) => { 
    //  syntax -  JSON.stringify(value, replacer, space) -  
    // это метод, который превращает объект data в строку JSON с форматированием.
    // value - Значение для преобразования в строку JSON. 
    // replacer (второй аргумент, null) — можно передать функцию или массив, чтобы выбрать, 
    // какие ключи включить (но null значит "все ключи").
    // space - cтрока или число, которые используются для вставки пробелов 
    if (err) {
        console.error(`Error writing file:`, err);
    } else {
        console.log(`The file user.txt was written successfully!`)
    };
}
);

// 4.сoздание запросов
//app.METHOD(PATH, HANDLER)
//app - является экземпляром express.
//METHOD — метод HTTP-запроса , в нижнем регистре.
//PATH - это путь на сервере.
//HANDLER -функция, выполняемая при совпадении маршрута.


//GET
app.get('/', (req, res) => { //вызываем функцию 
    // ('/') - адрес по которому идет обращение
    // второй параметр CB функция которая отрабатывает на этот запрос
    fs.readFile('user.txt', 'utf8', (err, data) => { 
                if (err) {
                    console.log(`Read error:`, err);
                    }
                else {
                    res.setHeader('Content-Type', 'application/json'); //GET отправляет JSON, а не HTML
                    res.json(JSON.parse(data));
                }
                
            });
});

//POST
app.post('/', (req, res) => {
    fs.readFile('user.txt', 'utf8', (err, data) => {
        let users = [];
        if (err) {
            console.error(`Error reading file:`, err);
        } else {
            users = (JSON.parse(data));
        }
        const newUser = {
            id: users.length ? users[users.length - 1].id + 1 : 1,
            ...req.body,
            age: Math.floor(Math.random() * (65 - 18 + 1)) + 18,
        };
        users.push(newUser); // Добавляем нового пользователя в массив

        fs.writeFile('user.txt', JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file:`, err);
            }
            res.json(newUser);
        });
    });        
});
    
//PUT   
app.put('/:id', (req, res) => {
    //id - тут является динамическим параметром
    const id = parseInt(req.params.id);
    //Функция parseInt() принимает строку в качестве аргумента 
    // и возвращает целое число в соответствии с указанным основанием системы счисления.Другими словами приводим id к числу
    //req.params.id -Данное свойство представляет собой объект, содержащий свойства, 
    // связанные с именованными параметрами маршрута. Например, если у нас имеется маршрут user/:name,
    //  тогда значение свойства name можно получить через req.params.name. Дефолтным значением является {}.
    const newUserName = req.body.name;
    //reg.body - Содержит пары ключ-значение данных, содержащихся в запросе. 
    fs.readFile('user.txt', 'utf8', (err, data) => { 
        if (err) {
            console.error(`Error reading file:`, err);
        }
        let users = JSON.parse(data);//users создается после чтения файла user.txt. и представляется в виде массива
        let user = users.find(userId => userId.id === id);// функция .find() перебирает весь массив и 
        // выбирает пользователя с нужным id после записывает его в переменную user
        user.name = newName; // Изменяем имя
        fs.writeFile('user.txt', JSON.stringify(users, null, 2), 'utf8', (err) => {
            if (err) {
                console.error(`Error writing file:`, err);
            }
            res.json({ message: "New name", user });
        });
    });
});

app.delete('/:id', (req, res) => {
    fs.readFile('user.txt', 'utf8', (err, data) => {
        if (err) {
            console.log(`Read error:`, err);
        }
        else {
            res.setHeader('Content-Type', 'application/json'); //GET отправляет JSON, а не HTML
            res.json(JSON.parse(data));
        }
    });      
    res.send('Got a DELETE request at /user')
});




//4.создаем порт для прослушивания /метод который запускает сервер
app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`Example app listening on port ${PORT}`)
});