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
        const UserCollection = client.db('HungryCafe').collection('UserCollection')
        const CartCollection = client.db('HungryCafe').collection('CartCollection')
        const ReviewCollection = client.db('HungryCafe').collection('ReviewCollection')
        const OrderCollection = client.db('HungryCafe').collection('OrderCollection')




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

        app.get('/allUser/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await UserCollection.findOne(query);
            // const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/alluser/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await UserCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        })

        app.get('/myCart', async (req, res) => {
            const email = req.query;
            const query = { email: email.email };
            const cursor = CartCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/cartCalculation', async (req, res) => {
            const email = req.query;
            const query = { email: email.email };
            const cursor = CartCollection.find(query);
            const result = await cursor.toArray();
            // console.log(result)
            const sum = result?.reduce((accumulator, object) => {
                return accumulator + object.totalPrice;
            }, 0)
            // console.log(sum)
            res.send({ sum })
        })

        app.get('/allReview', async (req, res) => {
            const query = {};
            const cursor = ReviewCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/allUser', async (req, res) => {
            const query = {};
            const cursor = UserCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/allOrders', async (req, res) => {
            const query = {};
            const cursor = OrderCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        //post method start here


        app.post('/addUser', async (req, res) => {
            const query = req.body;
            const result = await UserCollection.insertOne(query);
            res.send(result);
        })

        app.post('/AddBanner', async (req, res) => {
            const data = req.body;
            const result = await BannerCollection.insertOne(data);
            res.send(result);

        })
        app.post('/addToCart', async (req, res) => {
            const data = req.body;
            const result = await CartCollection.insertOne(data);
            res.send(result)
        })

        app.post('/addPopular', async (req, res) => {
            const data = req.body;
            const result = await PopularCollection.insertOne(data);
            res.send(result);
        })

        app.post('/itemsDisable/:id', async (req, res) => {
            const id = req.params.id;
            const result = await ItemCollection.updateOne({ "items._id": id }, {
                $set: {
                    "items.$.available": 0
                }
            });
            res.send(result)
        })
        app.post('/itemsMakeAble/:id', async (req, res) => {
            const id = req.params.id;
            const result = await ItemCollection.updateOne({ "items._id": id }, {
                $set: {
                    "items.$.available": 1
                }
            });
            res.send(result)
        })

        app.post('/clientReview', async (req, res) => {
            const body = req.body;
            const result = await ReviewCollection.insertOne(body)
            res.send(result)
        })

        app.post('/createOrder', async (req, res) => {
            const body = req.body;
            const result = await OrderCollection.insertOne(body)
            res.send(result)
        })


        //PUT method start here

        app.put('/quantity/:id', async (req, res) => {
            const id = req.params.id;

            const filter = {
                _id: new ObjectId(id)
            }
            const findItem = await CartCollection.findOne(filter)
            // console.log(findItem.quantity + 1)
            const itemsPrice = ((findItem?.price - (findItem?.discount ? findItem?.discount / 100 : 0)));

            const updatedDoc = {
                $inc: {
                    quantity: 1,

                },
                $set: {
                    totalPrice: (findItem?.price * (findItem?.quantity + 1)) - (findItem?.discount ? ((findItem?.price) * (findItem?.discount / 100) * (findItem?.quantity + 1)) : 0)
                }

            };
            const result = await CartCollection.updateOne(filter, updatedDoc);
            res.send(result)
        })
        app.put('/decrease/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: new ObjectId(id)
            }
            const findItem = await CartCollection.findOne(filter)
            // console.log(findItem.quantity + 1)
            const itemsPrice = ((findItem?.price - (findItem?.discount ? findItem?.discount / 100 : 0)));

            const updatedDoc = {
                $inc: {
                    quantity: -1
                },
                $set: {
                    totalPrice: (findItem?.price * (findItem?.quantity - 1)) - (findItem?.discount ? ((findItem?.price) * (findItem?.discount / 100) * (findItem?.quantity - 1)) : 0)
                }
            };
            const result = await CartCollection.updateOne(filter, updatedDoc);
            res.send(result)
        })

        app.put('/updateReviewDisplay/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: new ObjectId(id)
            };
            const updatedDoc = {
                $set: {
                    display: 'ok'
                }
            };
            const result = await ReviewCollection.updateOne(filter, updatedDoc)
            res.send(result)
        })


        //Delete method start here

        app.delete('/banner/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            }
            const result = await BannerCollection.deleteOne(query)
            res.send(result);
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id)
            };
            const result = await CartCollection.deleteOne(query);
            res.send(result);
        })

        app.delete('/popularDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                //objectid not use because database has not it
                _id: (id)
            };
            const result = await PopularCollection.deleteOne(query);
            res.send(result)
        })

        app.delete('/reviewDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                //objectid not use because database has not it
                _id: new ObjectId(id)
            };
            const result = await ReviewCollection.deleteOne(query);
            res.send(result)
        })

        // app.put('/items/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = {
        //         "items._id": id
        //     }
        //     const result = await ItemCollection.items.updateOne(query, { $pop: { items: query } })
        //     res.send(result)
        // })


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