
// 1. IMPORT MODULES.
const express = require('express');
const app = express();
const fs = require('node:fs');
const router = express.Router();
require('dotenv').config(); 

// MIDDLEWARE позволяет Express автоматически разбирать JSON-данные из POST, PUT, PATCH запросов.
//обязательно
app.use(express.json()); 

// MIDDLEWARE для обработки ошибки
app.use((err, _req, _res, next) => {
    console.log(err.stack); //логирование стека ошибки
})

// 2. GENERATING AN ARRAY.
const usersArray = Array.from({ length: 20 }, (_,i) => ({
    id: i + 1,
    name: 'User' + (i + 1),
    age: Math.floor(Math.random() * 100) + 1
}));

// 3.CREATING A FILE.
fs.writeFile('user.txt', JSON.stringify(usersArray, null, 2), 'utf8', (err) => { 
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

// MIDDLEWARE вызывается каждый раз перед каждым API запросом
const readUsersFile = (req, res, next) => {
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
router.use(readUsersFile);

// 5. НАСТРОЙКА МАРШРУТИЗАЦИИ
app.use('/user', router);

// 4. СОЗДАНИЕ ЗАПРОСОВ

//GET - получаем всех пользователей 
// http://localhost:3000/user  POSTMAN
router.get('/', (req, res) => { //вызываем функцию    =>    //API метод
    res.send(req.users);
});

//GET - вызов аользователя по id
// http://localhost:3000/user/:id  POSTMAN
router.get('/:id', (req, res) => { //вызываем функцию    =>    //API метод
    const id = parseInt(req.params.id);//parseInt() принимает строку в качестве 
    // аргумента и возвращает целое число в соответствии с указанным основанием системы счисления.
    const user = req.users.find(userId => userId.id === id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    };
    res.send(user);
});

//POST - добавление нового USER по имени
//http://localhost:3000/user
//{"name": "Alex"}
router.post('/', (req, res) => {
    const newUser = {
        id: req.users.length ? req.users[req.users.length - 1].id + 1 : 1,
        name: req.body.name,
        age: Math.floor(Math.random() * 100) + 1
    };
    req.users.push(newUser); // Добавляем нового пользователя в массив
    fs.writeFile('user.txt', JSON.stringify(req.users, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file:`, err);
        }
        res.json({
            message: 'User successfully added',
            newUser,
            users: req.users
        });
    });
});        
  
//PUT - изменение имени User по id
//http://localhost:3000/user/5
////{"name": "Alex"}
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
    const user = req.users.find(userId => userId.id === id);// функция .find() перебирает весь массив и 
    // выбирает пользователя с нужным id после записывает его в переменную user
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    };
    user.name = newName; // Изменяем имя
    fs.writeFile('user.txt', JSON.stringify(req.users, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file:`, err);
        }
        res.json({ message: "New name", user , users: req.users});
    });
});

//DELETE - удаление по id
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const resultUsers = req.users.filter(userId => userId.id !== id);
        //Метод filter() создаёт новый массив со всеми элементами, прошедшими проверку, задаваемую в передаваемой функции.
    fs.writeFile('user.txt', JSON.stringify(resultUsers, null, 2), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing file:`, err);
        }
        res.json({ message: `User delete + ${id}`, users: resultUsers});
    });
});      
    
//5.создаем порт для прослушивания /метод который запускает сервер
app.listen(process.env.DB_PORT, (error) => {
    error ? console.log(error) : console.log(`App listening on http://localhost:${process.env.DB_PORT}/`)
});