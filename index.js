/** parametros para conexão com o banco */

const Mongoose = require('mongoose')

Mongoose.connect('mongodb://queops:004748@localhost:27017/estoque',
    { useNewUrlParser: true }, function (error) {
        if (!error) return;

        console.log('Falha na conexão!', erro)
    })
const connection = Mongoose.connection
connection.once('open', () => console.log('data base rodando !!!'))

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

/** parametros para conexão com o banco */
const model = Mongoose.model('estoque', estoqueSchema)

/** Parametros Para Leitura do QrCode */

const QRReader = require('qrcode-reader');
const fs = require('fs');
const jimp = require('jimp');


/** parametro para Leitura de codigo de barras */
const zbarimg = require('node-zbarimg')


/** parametros para a conexão do Telegram */
const TelegramBot =  require('node-telegram-bot-api');
const token = '1144471494:AAGcagQ0VFAfxhI9gPqrPrVrKMYvErAqjrA'
const bot = new TelegramBot(token, {polling: true});

lista = []
ct = 0
var photo =  ''; 
var codigofinal = '...'
var maior = 0
chatId = 0
var testeVariavel = 'Fora'
bot.on('message', function (msg) {
    chatId = msg.chat.id;
    const dados = (msg.photo)
    bot.sendMessage(chatId,'A procura do Codigo')
    bot.downloadFile(dados[0].file_id,'')
    apagatudo()

  //  estruturaCodigoBarras()

});


//****************************************************************************************** */
// Função que converte a imagem captada para o codigo de barras
//****************************************************************************************** */
function estruturaCodigoBarras() {
  
    codigofinal = 'file_.jpg';
    maior = 0

    fs.readdir("./", (err, paths) => {
        for(i = 0; i < paths.length; i++) {
            
            numero = paths[i].split('.')[0]
            if('file_' === paths[i].substring(0,5)) 	{
                numero = parseInt(numero.split('_')[1])		
               
                if(numero > maior) {
                    maior = numero
                }
            }
            
        }
        console.log('entrei na procura do file_ -> ',maior)

        codigofinal = 'file_'+maior.toString()+'.jpg';


        zbarimg(codigofinal, async function(err, code) {
            
            codigoEncontrado = code
            CODIGO_BARRAS = Number(code)
            
            if (codigoEncontrado !== null ) {

                try {

                    const [{nome, valorunitario}] = 
                     await model.find({codigobarras: CODIGO_BARRAS}).exec();
                    bot.sendMessage(chatId, "<b>"+codigoEncontrado+'  '+nome+' X 01 = '+valorunitario+"</b>",{parse_mode : "HTML"});
                    lista[ct] =  codigoEncontrado+'  '+nome+' X 01 = '+valorunitario
                    ct++
                    console.log(CODIGO_BARRAS, nome, valorunitario);
                    return nome, valorunitario;
                } catch (err) {
                      bot.sendMessage(chatId,"Produto não Cadastrado")
                    return 'Produto não Cadastrado';
                }
                     
            }

        })
 
   }) //end readdir
}

function apagatudo() {

    fs.readdir("./", (err, paths) => {
        
         for(i = 0; i < paths.length; i++) {              
             if('file_' === paths[i].substring(0,5)) {
                 console.log('Gerando antes '+paths[i])
                 fs.unlinkSync("E:/Queops/ChatBootInstagram/"+paths[i]);
            }
         }  

    })


    // setTimeout(() => {
    //     estruturaCodigoBarras()
    // }, 1000);

    setTimeout(() => {
        QrcodeBusca ()

    }, 2000);

  
} 


async function QrCodeMais() { // async


    console.log('QrCode - entrei na procura do file_ -> ',codigofinal)
   // codigofinal = 'bosta.jpg'
    const img = await jimp.read(fs.readFileSync('./'+codigofinal));
    // const img =  await jimp.read(fs.readFileSync('./daerrado.jpg')); //wait

    const qr = new QRReader();
    
    //qrcode-reader's API doesn't support promises, so wrap it
    const value = await new Promise((resolve, reject) => { //wait
        qr.callback = (err, v) => err != null ? reject(err) : resolve(v);
        qr.decode(img.bitmap);
    });
 
 
    console.log('Saida - ',value.result);
    bot.sendMessage(chatId,"<b> <a href=\"\">"+value.result+"</a></b> " ,{parse_mode : "HTML"});
    
}

function QrcodeBusca () {

    fs.readdir("./", (err, paths) => {
        for(i = 0; i < paths.length; i++) {
            
            numero = paths[i].split('.')[0]
            if('file_' === paths[i].substring(0,5)) 	{
                numero = parseInt(numero.split('_')[1])		
               
                if(numero > maior) {
                    maior = numero
                }
            }
            
        }

        codigofinal = 'file_'+maior.toString()+'.jpg';


        QrCodeMais(codigofinal)
    })
 

    
}  