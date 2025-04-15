
// 1. Импортируем модули.
const express = require('express');
const app = express();
const fs = require('node:fs');
const router = express.Router();
require('dotenv').config(); 

//middleware позволяет Express автоматически разбирать JSON-данные из POST, PUT, PATCH запросов.
//обязательно
app.use(express.json()); 

// middleware для обработки ошибки
app.use((err, req, res, next) => {
    console.log(err.stack); //логирование стека ошибки
})

// 2. Генерация массива.
const users = Array.from({ length: 20 }, (_,i) => ({
    id: i + 1,
    name: 'User' + (i + 1),
    age: Math.floor(Math.random() * 100) + 1
}));
const data = [];
users.forEach(user => {
    data.push(user); 
});

// 3.Создание файла
fs.writeFile('user.txt', JSON.stringify(data, null, 2), 'utf8', (err) => { 
    // syntax -  JSON.stringify(value, replacer, space) -  
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

//вызывается каждый раз перед каждым API запросом
const readFile = (req, res, next) => {
    fs.readFile('user.txt', 'utf8', (err, data) => {
        
        if (err) {
            return res.status(500).send({ error: 'Error reading' });
        }
        try {
            req.users = JSON.parse(data);
            console.log(`Reading works`);
            next();
        }
        catch (err) {
            return res.status(500).send({ error: 'Error parse' });
        };
    });
};
app.use(readFile);

// Использование роутера
app.use('/user', router);

// 4.сoздание запросов
//GET
router.get('/:id', (req, res) => { //вызываем функцию    =>    //API метод
    const id = parseInt(req.params.id);//parseInt() принимает строку в качестве 
    // аргумента и возвращает целое число в соответствии с указанным основанием системы счисления.
    const user = users.find(userId => userId.id === id);
    res.send(user)
});

//POST
router.post('/', (req, res) => {
    const newUser = {
        id: users.length ? users[users.length - 1].id + 1 : 1,
        ...req.body,
        age: Math.floor(Math.random() * 100) + 1
    };
    users.push(newUser); // Добавляем нового пользователя в массив
    fs.writeFile('user.txt', JSON.stringify(users, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file:`, err);
        }
        res.json(newUser);
    });
});        
  
//PUT   
router.put('/:id', (req, res) => {
    //id - тут является динамическим параметром
    const id = parseInt(req.params.id);
    //Функция parseInt() принимает строку в качестве аргумента 
    // и возвращает целое число в соответствии с указанным основанием системы счисления.Другими словами приводим id к числу
    //req.params.id -Данное свойство представляет собой объект, содержащий свойства, 
    // связанные с именованными параметрами маршрута. Например, если у нас имеется маршрут user/:name,
    //  тогда значение свойства name можно получить через req.params.name. Дефолтным значением является {}.
    const newName = req.body.name;
    //reg.body - Содержит пары ключ-значение данных, содержащихся в запросе. 
    const user = users.find(userId => userId.id === id);// функция .find() перебирает весь массив и 
    // выбирает пользователя с нужным id после записывает его в переменную user
    user.name = newName; // Изменяем имя
    fs.writeFile('user.txt', JSON.stringify(users, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file:`, err);
        }
        res.json({ message: "New name", user });
    });
});

//DELETE
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    let users = data.trim() ? JSON.parse(data) : [];
    let resultUsers = users.filter(user => user.id !== id);
        //Метод filter() создаёт новый массив со всеми элементами, прошедшими проверку, задаваемую в передаваемой функции.
    fs.writeFile('user.txt', JSON.stringify(resultUsers, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file:`, err);
        }
        res.json({ message: "User delete" , id});
    });
});      
    
//5.создаем порт для прослушивания /метод который запускает сервер
app.listen(process.env.DB_PORT, (error) => {
    error ? console.log(error) : console.log(`App listening on http://localhost:${process.env.DB_PORT}/`)
});