const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000


const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false
console.log(store_id, store_passwd)
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
            const cursor = OrderCollection.find(query).sort({ date: -1 })
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/allOrder/unprocess', async (req, res) => {
            const query = {
                process: 'no'
            }
            const cursor = OrderCollection.find(query)
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/allorders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const cursor = OrderCollection.find(query).sort({ date: -1 });
            // console.log(cursor)
            const result = await cursor.toArray();
            // console.log(result[0].paymentData.toArray())
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

        app.post('/onlinePayment', async (req, res) => {
            const paymentData = req.body;
            // OrderCollection.insertOne(OrderDataBooked)
            const transectionId = new ObjectId().toString();
            const data = {
                total_amount: paymentData.OvarAllPrice,
                currency: paymentData.currency,
                tran_id: transectionId, // use unique tran_id for each api call
                success_url: `https://resturent-manager-server.vercel.app/paymentSuccess?transectionId=${transectionId}`,
                fail_url: `https://resturent-manager-server.vercel.app/paymentFail?transectionId=${transectionId}`,
                cancel_url: `https://resturent-manager-server.vercel.app/paymentCancel?transectionId=${transectionId}`,
                ipn_url: 'https://resturent-manager-server.vercel.app',
                shipping_method: 'Courier',
                product_name: paymentData.productName,
                product_category: 'Electronic',
                product_profile: 'general',
                cus_name: paymentData.name,
                cus_email: paymentData.email,
                cus_add1: paymentData.address,
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: paymentData.phone,
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data).then(apiResponse => {
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL
                res.send({ url: GatewayPageURL })
                console.log('Redirecting to: ', GatewayPageURL)
            });
            const OrderDataBooked = { ...paymentData, transectionId };
            OrderCollection.insertOne(OrderDataBooked)

        })

        app.post('/paymentSuccess', async (req, res) => {
            const { transectionId } = req.query;
            // console.log(req)
            const filter = {
                transectionId: transectionId
            }
            const updatedDoc = {
                $set: {
                    payment: true,
                    fraud: 'no'
                }
            }
            const result = await OrderCollection.updateOne(filter, updatedDoc);
            if (result.modifiedCount > 0) {
                res.redirect(`https://hungrycafe.web.app/paymentSuccess?transectionId=${transectionId}`)
            }

        })
        app.post('/paymentFail', async (req, res) => {
            const { transectionId } = req.query;

            res.redirect(`https://hungrycafe.web.app/paymentFail?transectionId=${transectionId}`)


        })
        app.post('/paymentCancel', async (req, res) => {
            const { transectionId } = req.query;

            res.redirect(`https://hungrycafe.web.app/paymentCancel?transectionId=${transectionId}`)


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

        app.put('/updateProcessing/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: new ObjectId(id)
            };
            const updatedDoc = {
                $set: {
                    process: 'yes'
                }
            }
            const result = await OrderCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })
        app.put('/updateDelevered/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {
                _id: new ObjectId(id)
            };
            const updatedDoc = {
                $set: {
                    delivered: 'yes'
                }
            }
            const result = await OrderCollection.updateOne(filter, updatedDoc);
            res.send(result);
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

                _id: new ObjectId(id)
            };
            const result = await ReviewCollection.deleteOne(query);
            res.send(result)
        })
        app.delete('/OrderDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = {

                _id: new ObjectId(id)
            };
            const result = await OrderCollection.deleteOne(query);
            res.send(result)
        })

        app.delete('/deleteOrderfromProfile/:id', async (req, res) => {
            const id = req.params.id;
            const query = {

                _id: new ObjectId(id)
            };
            const result = await OrderCollection.deleteOne(query);
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