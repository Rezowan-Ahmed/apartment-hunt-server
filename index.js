const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
// const ObjectID = require('mongodb').ObjectID;
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svjmy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 9000

console.log(process.env.DB_USER);

app.get('/', (req, res) => {
    res.send('Hello World!')
})


client.connect(err => {
    const servicesCollection = client.db("apartmentHunt").collection("services");
    const bookingsCollection = client.db("apartmentHunt").collection("bookings");
    console.log('db connected')


    //add new services
    app.post('/addServices', (req, res) => {
        const file = req.files.image;
        const title = req.body.title;
        const description = req.body.description;
    
        const Img = file.data;
        const encImg = Img.toString('base64');

        var image = {
            contentType: req.files.image.mimetype,
            size: req.files.image.size,
            img: Buffer.from(encImg, 'base64')
        };
        console.log(file, title,description)
        servicesCollection.insertOne({ title, description, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    //get services
    app.get('/getServices', (req, res) => {
        servicesCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

    // post booking
    app.post('/addBookings', (req, res) => {
        const orders = req.body;
        bookingsCollection.insertOne(orders)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    // get booking
    app.get('/allBookings', (req, res) => {
        bookingsCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })

    })

});

app.listen(process.env.PORT || port)