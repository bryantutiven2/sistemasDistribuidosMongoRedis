const express = require('express');
const Handlebars = require('handlebars')
const hbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
const clearCache = require('./services/cache')
const mongoose = require("mongoose");
const {
    allowInsecurePrototypeAccess
} = require('@handlebars/allow-prototype-access')

const port = 3000;

const app = express();

// mongoose.connect('mongodb://localhost:27017/mapavirtual', {
mongoose.connect(
    'mongodb+srv://bryan:12345@cluster0.plvsi.mongodb.net/mapavirtual?retryWrites=true&w=majority', {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
mongoose.connection
    .once('open', () => console.log('connected to database'))
    .on('error', (err) => console.log("connection to database failed!!", err))

const fallecido = require('./models/fallecido');


app.engine('handlebars', hbs({
    defaulLayout: 'main',
    handlebars: allowInsecurePrototypeAccess(Handlebars)
}));

app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


app.use(methodOverride('_method'));


app.get('/', function (req, res, next) {
    res.render('buscarfallecidos');
});

app.get('/get', (req, res) => {
    fallecido.find({})
        .cache()
        .then((data) => {
            res.json({
                found: true,
                data: data
            });
        })
        .catch((err) => {
            console.log(err)
            res.json({
                found: false,
                data: null
            });
        })
})

app.get('/get/:id', (req, res) => {
    fallecido.find({id: req.params.id})
        .cache(req.params.id)
        .then((data) => {
            res.render('detallebusqueda', {
                title: 'Search',
                data: data
            });
        })
        .catch((err) => {
            console.log(err)
            res.json({
                found: false,
                data: null
            });
        })
})
app.get("/api/:id", async (req, res) => {
    let books;
    if (req.params.id) {
      books = await fallecido.find({ ci: req.params.id },  function (err, data) {
        console.log(data);
        
    }).cache(req.params.id);
    } else {
      books = await fallecido.find({}).cache({
        time: 10
      });
    }

    res.send(books);
  });

app.get('/fallecido/add', function (req, res, next) {
    res.render('addfallecido');
});

app.post('/fallecido/success', (req, res) => {
    new fallecido(req.body)
        .save()
        .then((v_data) => {
            console.log(v_data);
            res.render('detalle', {
                data: v_data
            });
            clearCache(v_data.ci)
        })
        .catch((err) => {
            console.log(err)
            res.json({
                save: false
            })
        })
})

app.post('/fallecido/buscar', function (req, res) {

    var query = {
        "ci": req.body.id
    };
    if (query) {
        fallecido.findOne(query, function (err, data) {
            console.log(data)
            res.render('detallebusqueda', {
                title: 'Search',
                data: data
            });
        }).cache(req.body.id)
    } else {
        fallecido.find().cache({
            time: 10
        });
    }

})
app.get('/:id/', (req, res) => {
    fallecido.find({
            id: req.params.cedula
        })
        .cache(req.params.ci)
        .then((data) => {
            console.log(data);
            res.render('detallebusqueda', {
                data
            });
        })
        .catch((err) => {
            console.log(err)
            res.json({
                found: false,
                data: null
            })
        })
})


app.listen(port, function () {
    console.log('Servidor inicializado en el puerto: ' + port);
});