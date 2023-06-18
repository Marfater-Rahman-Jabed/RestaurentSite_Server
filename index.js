const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
// 
app.use(cors())
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.4jznvny.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {

        const ItemCollection = client.db('HungryCafe').collection('ItemCollection')
        const PopularCollection = client.db('HungryCafe').collection('PopularItems')
        const BannerCollection = client.db('HungryCafe').collection('BannerCollection')



        app.get('/allItem', async (req, res) => {
            const query = {}
            const cursor = ItemCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/allItem/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: new ObjectId(id)
            }
            const cursor = ItemCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/allPopularItem', async (req, res) => {
            const query = {}
            const cursor = PopularCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/allBanner', async (req, res) => {
            const query = {}
            const cursor = BannerCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })


        //post method start here

        app.post('/AddBanner', async (req, res) => {
            const data = req.body;
            const result = await BannerCollection.insertOne(data);
            res.send(data);

        })


        //Delete method start here

        app.delete('/banner/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = BannerCollection.deleteOne(query)
            res.send(result);
        })



    }

    finally {

    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Hungry Server is Running')
})

app.listen(port, () => {
    console.log(`Hungry cafe server running  on port ${port}`)
})