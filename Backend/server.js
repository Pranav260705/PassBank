const express = require('express')
const app = express()
const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
const cors = require('cors')
const bodyparser=require('body-parser')
const port = 3000

dotenv.config()
app.use(cors())
app.use(bodyparser.json())

const url = process.env.MONGO_URL
const client = new MongoClient(url);



async function connectDB() {
    await client.connect();
    console.log('Connected successfully to server');
    return 'done.';
}

connectDB();

const dbName = "PassBank"
const db = client.db(dbName);

app.get('/', async (req, res) => {
    const collection = db.collection('logins')
    const logins = await collection.find({}).toArray();
    res.json(logins)
})

app.post('/', async (req, res) => {
  const login = req.body;

  if (!Array.isArray(login) || login.length === 0) {
    return res.status(400).send({ success: false, message: "No data to insert" });
  }

  const collection = db.collection('logins');
  const result = await collection.insertMany(login);
  res.send({ success: true, result });
});

app.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const collection = db.collection('logins');
  const result = await collection.deleteOne({ id });
  res.send({ success: true, result });
});

app.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const collection = db.collection('logins');

  const result = await collection.updateOne(
    { id },
    { $set: updatedData }
  );
  res.send({ success: true, result });
});


app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})