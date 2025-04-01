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

// Connecting database
connection()

// Call router
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Hello from the server' });
});

// App listening in port
app.listen(process.env.PORT, () => {
    console.log('Listening ...')
})
