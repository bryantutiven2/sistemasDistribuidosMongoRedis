const express = require('express');
const hbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const port = 3000;

const app = express();

app.engine('handlebars', hbs({
    defaulLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use('/static', express.static('public'));


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(methodOverride('_method'));


app.get('/', function (req, res, next) {
    res.render('buscarfallecidos');
});

app.post('/fallecido/buscar', function (req, res, next) {

});

app.get('/fallecido/add', function (req, res, next) {
    res.render('addfallecido');
});

app.listen(port, function () {
    console.log('Servidor inicializado en el puerto: ' + port);
});