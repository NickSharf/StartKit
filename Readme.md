# Стартовый проект с gulp

<table>
  <thead>
    <tr>
      <th>Команда</th>
      <th>Результат</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td width="22%"><code>npm i</code></td>
      <td>Установить зависимости</td>
    </tr>
    <tr>
      <td><code>npm start</code></td>
      <td>Запустить сборку, сервер и слежение за файлами</td>
    </tr>
    <tr>
      <td><code>gulp ЗАДАЧА</code></td>
      <td>Запустить задачу с названием ЗАДАЧА (список задач в <code>./gulpfile.js</code>)</td>
    </tr>
    <tr>
      <td><code>npm test</code></td>
      <td>Проверка сборки на ошибки</td>
    </tr>
    <tr>
      <td><code>npm run build</code></td>
      <td>Сборка проекта</td>
    </tr>
    <tr>
      <td><code>gulp deploy</code></td>
      <td>Отправка содержимого папки сборки на github-pages</td>
    </tr>
  </tbody>
</table>

## Как начать новый проект c этим репозиторием

1. Клонировать этот репозиторий в новую папку (`git clone https://github.com/NickSharf/StartKit.git new-project`, см. [шпаргалку](https://github.com/nicothin/web-development/tree/master/git#%D0%9A%D0%BB%D0%BE%D0%BD%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5-%D1%80%D0%B5%D0%BF%D0%BE%D0%B7%D0%B8%D1%82%D0%BE%D1%80%D0%B8%D1%8F)) и зайти в неё (`cd new-project`).
2. Стереть историю разработки этого репозитория (`rm -rf .git`), инициировать новый (`git init`), создать удалённый репозиторий и привязать его (`git remote add origin АДРЕС`, см. [шпаргалку](https://github.com/nicothin/web-development/tree/master/git#%D0%A3%D0%B4%D0%B0%D0%BB%D1%91%D0%BD%D0%BD%D1%8B%D0%B5-%D1%80%D0%B5%D0%BF%D0%BE%D0%B7%D0%B8%D1%82%D0%BE%D1%80%D0%B8%D0%B8)).
3. Отредактировать `README.md`, `package.json` (название проекта, автор, лицензия, сторонние пакеты и пр.) 
4. Установить зависимости (`npm i`).
5. Запустить сервер разработки (`npm start`).
