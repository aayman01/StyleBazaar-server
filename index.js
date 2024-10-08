const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xrbh57q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("styleBazar").collection("products");

    //products api
    app.get("/products", async (req, res) => {
      const search = req.query.search;
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page) - 1;
      const sort = req.query.sort;
      const {  category, brand, minPrice, maxPrice } = req.query;
      // console.log( brand );

      let query = {};

      if (category) query.category = category;
      if (brand) query.brand = brand;
      if (minPrice) query.price = { $gte: parseFloat(minPrice) };
      if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };

      // let query = {};

      if (search) {
        query = {
          $or: [
            { productName: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { brandName: { $regex: search, $options: "i" } },
          ],
        };
      }

      let sortQuery;
      switch (sort) {
        case "asc":
          sortQuery = { price: 1 };
          break;
        case "dsc":
          sortQuery = { price: -1 };
          break;
        case "new":
          sortQuery = { productCreationDateTime: -1 };
          break;
        default:
          sortQuery = {};
          break;
      }
      const result = await productCollection
        .find(query)
        .sort(sortQuery)
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // get all data for pagination
    app.get("/products-count", async (req, res) => {
      const count = await productCollection.countDocuments();
      res.send({ count });
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req, res )=>{
    res.send("App server is running")
})

app.listen(port , () => {
    console.log(`App server is running on port,${port}`)
})