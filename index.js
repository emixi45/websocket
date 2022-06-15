const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const Contenedor =require('./contenedor')

const app = express();




app.set('views','./views')
app.set('view engine' , 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const server =http.createServer(app);
const io = new Server (server);
app.use('/public',express.static(__dirname + '/public'))


const products = [
    {name: 'beers', price: 120 },
    {name: 'ron', price: 100 }
]

const contenedorProducts =new Contenedor('products.json')
const contenedorMessage =new Contenedor('message.json')


app.get('/', (req,res)=>{
    res.render('index')
})
app.post('/',(req,res)=>{
    products.push(req.body)
    res.json(req.body)
})
app.get('/products', (req,res)=>{
    res.render('products',{products})
})
app.get('/message', (req,res)=>{
    res.render('message',{
        message:contenedorMessage.getAll()
    })
})

io.on('connection', socket =>{
    socket.on('add', data => {
        products.push(data)
        io.sockets.emit('show', products)
    })
    socket.on('chat-in', data => {
        const dateString =new Date().toLocaleDateString()
        const dataOut = {
            msn:data.msn,
            username : data.username,
            date: dateString
        }
        console.log(dataOut)
        contenedorMessage.save(dataOut)
        io.sockets.emit('chat-out', 'ok')
    })
})

app.listen(8080, ()=>{
    console.log('corriendo')
})