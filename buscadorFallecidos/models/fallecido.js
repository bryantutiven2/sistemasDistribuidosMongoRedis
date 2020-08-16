const mongoose = require("mongoose");

const fallecidoSchema = new mongoose.Schema({
    ci: Number,
    nombres: String,
    apellidos: String,
    defuncion: String,
    nacimiento: String,
    cementerio: String,
    provincia: String,
    nolapida: String,
});

const fallecido = mongoose.model('difuntos',fallecidoSchema);

module.exports = fallecido;