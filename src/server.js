require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connection = require('./config/database')

const authRouter = require('./routers/authentication');
const imageRouter = require('./routers/image');
const userInfoRouter = require('./routers/userInfo');
const postRouter = require('./routers/post');
const commentRouter = require('./routers/comment');
const groupRouter = require('./routers/group');

const app = express();
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connecting database
connection();

// Call router
app.use('/api/auth', authRouter);
app.use('/api/image', imageRouter);
app.use('/api/user-info', userInfoRouter);
app.use('/api/post', postRouter);
app.use('/api/comment', commentRouter);
app.use('/api/group', groupRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Hello from the server' });
});

// App listening in port
app.listen(process.env.PORT, () => {
    console.log('Listening ...')
})
