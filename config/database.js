const { MongoClient } = require("mongodb");

const uri =
  "mongodb+srv://ayoubbenfraj013:w46zCZNE75VxQ7JI@rentalservice.smqnwte.mongodb.net/?retryWrites=true&w=majority&appName=RentalService";

const client = new MongoClient(uri, {
  serverApi: {
    version: "1",
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
});

const connectDB = async () => {
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB Atlas!");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = { connectDB, client };
