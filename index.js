require('dotenv').config()
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToMongo = require('./utilities/db');
_ = require("underscore");

const app = express();

const port = process.env.PORT || 8080;

app.use(cors({
    origin: process.env.DOMAIN,
    optionsSuccessStatus: 200,
    credentials: true,
    methods: 'GET, POST, PUT, DELETE'
}));

app.use(cookieParser());

connectToMongo()

app.use(express.json());

app.use('/api', require('./routes/department.route'));
app.use('/api', require('./routes/patient.route'));
app.use('/api', require('./routes/doctor.route'));
app.use('/api', require('./routes/appointment.route'));
app.use('/api', require('./routes/admin.route'));
app.use('/api', require('./routes/files.route'));
app.use('/api', require('./routes/support.routes'));

app.listen(port, () => {
    console.log(`server is running on ${port}`)
})
