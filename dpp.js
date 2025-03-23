
// 1. Импортируем модули.
const express = require('express');
const app = express();
const PORT = 3000;
const fs = require('node:fs');

// 2. Генерация массива.
function generatArray() {
    const array = []; //создаем пустой массив
    const letters = 'abcdefghijklmnopqrst'; // создаю контент для формирования имени , 20 букв на каждый из обектов
    for (let i = 0; i < letters.length; i++) { //создание обектов ограниченно количеством букв 
        array.push({ //добавляет указанные элементы в конец массива и возвращает новую длину массива.
            id: i + 1, //присваиваем каждому порядковый номер
            name: letters[i], //выбирает из массива последовательно буквы 
            age: Math.floor(Math.random() * (65 - 18 + 1)) + 18 //генерирует случайные числа от 18 до 65
        });
    };
    return array;
}

// 3.Создание файла
const data = generatArray();
fs.writeFile('user.txt', JSON.stringify(data, null, 2), 'utf8', (err) => { 
    //  syntax -  JSON.stringify(value, replacer, space) -  
    // это метод, который превращает объект data в строку JSON с красивым форматированием.
    // value - Значение для преобразования в строку JSON. 
    // replacer (второй аргумент, null) — можно передать функцию или массив, чтобы выбрать, 
    // какие ключи включить (но null значит "все ключи").
    // space - cтрока или число, которые используются для вставки пробелов 
  if (err) {
    console.error(`Error writing file:`, err);
    return;
  }
  console.log(`The file user.txt was written successfully!`);
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
                    res.send(`File Content: ${data}`); 
                }
                
            });
});

// app.post('/', (req, res) => {
//   res.send('Got a POST request')
// })

// app.put('/user', (req, res) => {
//   res.send('Got a PUT request at /user')
// })

// app.delete('/user', (req, res) => {
//   res.send('Got a DELETE request at /user')
// })

// 3.Cоздаем  HTTP сервер.


//4.создаем порт для прослушивания
app.listen(PORT, (error) => {
    error ? console.log(error) : console.log(`Example app listening on port ${PORT}`)
});