const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.Port || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3rhi256.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toysCollection = client.db('toysVerse').collection('toys');
    const upcomingCollection = client.db('toysVerse').collection('upcoming');

    app.post('/allToys', async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      if(!body){
        return res.status(404).send({message: "Data not found, Not Valid Request."})
      }
      const result = await toysCollection.insertOne(body);
      res.send(result)
    })

    // Creating index
    const indexKeys = { toyName: 1};
    const indexOptions = { name: "toyName"};

    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/toySearchByName/:text", async(req, res) => {
        const searchText = req.params.text;
        const result = await toysCollection.find({
            $or:[
                {toyName : { $regex: searchText, $options: "i"}}
            ]
        })
        .toArray();
        res.send(result)
    })

    app.get('/toys', async(req, res) => {
        const cursor = toysCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/upcoming', async(req, res) => {
        const cursor = upcomingCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/allToys', async(req, res) => {
        const cursor = toysCollection.find().sort({createdAt: 1});
        const result = await cursor.limit(20).toArray();
        res.send(result);
    });

    
    app.get('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.findOne(query);
        res.send(result);
    })

    app.get('/toyDetails/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await toysCollection.findOne(query);
        res.send(result);
    })

    app.get('/myToys/:email', async (req, res) => {
      const result = await toysCollection.find({sellerEmail: req.params.email}).toArray();
      res.send(result);
    })

    app.put('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedToy = req.body;
      const updateDoc = {
        $set: {
          toyName: updatedToy.toyName,
          pictureURl: updatedToy.pictureURl,
          subCategory: updatedToy.subCategory,
          sellerName: updatedToy.sellerName,
          rating: updatedToy.rating,
          price: updatedToy.price,
          availableQuantity: updatedToy.availableQuantity,
          description: updatedToy.description,
        }
      };
      const result = await toysCollection.updateOne(filter, updateDoc, options);
      res.send(result)
    });

    app.delete('/allToys/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("Toys store is open....")
});


app.listen(port, () => {
    console.log(`Toys Store is running on port: ${port}`);
})