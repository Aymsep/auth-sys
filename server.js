const express = require('express');
const app = express();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');

//Middlewares
app.use(cookieParser());
app.use(express.json());    
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

//secret key


const secretKey = 'secretKeyArkx2024'


//rendering
app.get('/login', avoidAuth,(req, res) => {
    res.render('login')
});

app.get('/register',avoidAuth, (req, res) => {
    res.render('register')
});

app.get('/profile',isAuthenticated, (req, res) => {
   
    res.render('profile',{username:req.user.username})
});










//register endpoint

app.post('/register', (req, res) => {   
    try{
        const { username, email, password } = req.body;
        const result = axios.post('http://localhost:8500/users', {
            username,
            email,
            password
        })
        res.status(302).redirect('/login')

    }catch(err){
        return res.status(501).send('server error')
    }
});



app.post('/login', async(req, res) => {
    try{
        const {email, password} = req.body;
        const result =await axios.get('http://localhost:8500/users')
        const user = result.data.find(us=>us.email === email && us.password === password)
        if(!user){
            return res.status(401).send('Invalid credentials')
        }
        const token = jwt.sign({email:user.email,username:user.username},secretKey,{expiresIn:'1h'})
        res.cookie('tokenJSon',token)
        res.status(302).redirect('/profile')

    }catch(err){

    }   
})




//middleware to verify token

function isAuthenticated(req, res, next){
    try{
        const token = req.cookies.tokenJSon || undefined
        if(!token){
            res.status(302).redirect('/login')
        }
        const verify = jwt.verify(token, secretKey)
        if(!verify){
            res.status(302).redirect('/login')
        }
        req.user = verify
        next()
    }catch(err){

    }

}

function avoidAuth(req, res, next){
    const token = req.cookies.tokenJSon || null
    if(!token){
       next()
    }
    const verify = jwt.verify(token, secretKey)
    if(!verify){
       next()
    }
    return res.status(302).redirect('/profile')
}

















app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
