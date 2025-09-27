const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const viewRouter = require('./routes/viewRoute');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { handleWaterVolumeToday } = require('./models/ETO_Calculator');
const app = express();
dotenv.config({ path: './config.env' });
require('./config/mqtt');
require('./config/webSocket');
require('./controllers/webSocketController');

if (process.env.ENV == 'development') {
    app.use(morgan('dev'));
} else {
    console.log('production');
}
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173','http://127.0.0.1:5173','http://localhost:3000', 'http://127.0.0.1:5502', 'http://127.0.0.1:5504','http://127.0.0.1:5500',
        'http://localhost:5500',],
    credentials: true
}));

const scriptSrcUrls = [
    'https://unpkg.com/',
    'https://tile.openstreetmap.org',
    'https://cdnjs.cloudflare.com',
    'https://*.cloudflare.com',
    'https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.min.js'
];

const styleSrcUrls = [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

const fontSrcUrls = [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/'
];


    if (process.env.ENV === 'development') {
        app.use(helmet({ contentSecurityPolicy: false }));
    } else {
        app.use(helmet());
    }

app.use('/api/view', viewRouter)

app.listen(3000, () => {
    console.log('App is running on port 3000!');

})