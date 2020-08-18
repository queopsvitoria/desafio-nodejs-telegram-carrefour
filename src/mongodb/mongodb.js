/** parametros para conexão com o banco */

class MongoDB  {


    conectar() {
        const Mongoose = require('mongoose')

        Mongoose.connect('mongodb://queops:004748@localhost:27017/estoque',
            { useNewUrlParser: true }, function (error) {
                if (!error) return;

                console.log('Falha na conexão!', erro)
            })
        const connection = Mongoose.connection
        connection.once('open', () => console.log('data base rodando !!!!'))
    }

    defineMode() {
        const estoqueSchema = new Mongoose.Schema({
            codigobarras: {
                type: String,
                require: true
            },
            nome: {
                type: String,
                require: true
            },
            valorunitario: {
                type: Number,
                require: true
            },
            insertedAt: {
                type: Date,
                default: new Date()
            }
        })
        const model = Mongoose.model('estoque', estoqueSchema)
    }
    /** parametros para conexão com o banco */
}
module.exports = MongoDB