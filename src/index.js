const QRReader = require('qrcode-reader');
const fs = require('fs');
const jimp = require('jimp');

/** parametro para Leitura de codigo de barras */
const zbarimg = require('node-zbarimg')

/** parametros para a conexão do Telegram */
 const configs = require('./config/configs');
 const TelegramBot =  require('node-telegram-bot-api');
 
 //const TOKEN_TELEGRAM = configs.TOKEN_TELEGRAM
 const TOKEN_TELEGRAM='1149372353:AAHkalQk1yUc8GWWUlbHtYzsmscqTwOO3bs'
 const bot = new TelegramBot(TOKEN_TELEGRAM, {polling: true});

const MongoDB = require('./mongodb/mongodb');
const contextConectar = new MongoDB();
contextConectar.conectar();


lista = []
ct = 0
var photo =  ''; 
var codigofinal = '...'
var maior = 0
chatId = 0

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
                 // verifica a existencia do arquivo
                 if( fs.existsSync("E:/Queops/ChatBootInstagram/"+paths[i])) { 
                     console.log('achei o arquivo');
                     // elimina o arquivo
                     fs.unlinkSync("E:/Queops/ChatBootInstagram/"+paths[i]); //
                 }
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

    const img = await jimp.read(fs.readFileSync('./'+codigofinal));
 
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