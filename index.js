const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        const ItemsCollection = client.db('HungryCafe').collection('ItemsCollection')


        app.get('/allItem', async (req, res) => {
            const query = {}
            const cursor = ItemsCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
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