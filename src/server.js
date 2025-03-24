require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connection = require('./config/database')

const authRouter = require('./routers/authentication');

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
connection()

//
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Hello from the server' });
});

//
app.listen(process.env.PORT, () => {
    console.log('Listening ...')
})

