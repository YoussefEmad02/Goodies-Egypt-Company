require('dotenv').config();
const { MongoClient } = require('mongodb');
const GridFSBucket = require('mongodb').GridFSBucket;
const { ObjectId } = require('mongodb');
const uri = "mongodb+srv://Goodies123:GoodiesDatabase@cluster0.arerz8l.mongodb.net/"; // Retrieve the connection string from environment variables
//console.log(uri);
const client = new MongoClient(uri, { useUnifiedTopology: true });

let db;

const connectToDb = async () => {
    try {
      const uri = "mongodb+srv://Goodies123:GoodiesDatabase@cluster0.arerz8l.mongodb.net/"; // Update with your MongoDB connection string
      const client = new MongoClient(uri, { useUnifiedTopology: true });
  
      await client.connect();
      db = client.db('Goodies');
      
      console.log('Connected to MongoDB');
  
      return db; // Return the connected db object
    } catch (err) {
      console.error('Failed to connect to MongoDB', err);
      throw err; // Propagate the error
    }
  };

const getDb = () => client.db('Goodies');

module.exports = { connectToDb, getDb };