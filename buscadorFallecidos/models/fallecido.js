const mongoose = require("mongoose");

const fallecidoSchema = new mongoose.Schema({
    id: Number,
    nombres: String,
    apellidos: String,
    fechaDefuncion: String,
    cementerio: String,

});

const fallecido = mongoose.model('fallecidoList',fallecidoSchema);

module.exports = fallecido;