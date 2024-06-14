const express = require('express')
const cors = require('cors')
// const jwt = require('jsonwebtoken')
// const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config()

const port = process.env.PORT || 5000

const app = express()

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
}))

app.use(express.json())
// app.use(cookieParser())

const uri = `mongodb+srv://${process.env.KEY}:${process.env.KEY}@cluster0.rth5hqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });




// const verifyToken = (req, res, next) => {
//   const token = req?.cookies?.token;
//   if (!token) {
//     return res.status(401).send({ message: 'unauthorized access' })
//   }

//   if (token) {
//     jwt.verify(token, process.env.TOKEN, (err, decoded) => {
//       if (err) {
//         return res.status(401).send({ message: 'unauthorized access' })
//       }
//       req.user = decoded
//       next()
//     })
//   }
// }



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
const userCollection=client.db("connectSphere").collection("users")


app.post('/users', async(req, res)=>{
  const user=req.body;
  const query={email: user.email}
  const existingUser= await userCollection.findOne(query)
  if(existingUser){
    return res.send({message: 'user alredy exist', insertedId: null})
  }
  const result= await userCollection.insertOne(user);
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
    res.send('server is running')
  })
  
  app.listen(port, ()=>{
    console.log('all ok')
  })