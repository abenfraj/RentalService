const { client } = require("../../config/database");
const { ObjectId } = require("mongodb");

const db = client.db("myFirstDatabase");
const usersCollection = db.collection("users");

const createUser = async (userData) => {
  const result = await usersCollection.insertOne(userData);
  return result.ops[0];
};

const getAllUsers = async () => {
  const users = await usersCollection.find().toArray();
  return users;
};

const getUserById = async (id) => {
  const user = await usersCollection.findOne({ _id: new ObjectId(id) });
  return user;
};

const updateUser = async (id, userData) => {
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: userData },
    { returnDocument: "after" }
  );
  return result.value;
};

const deleteUser = async (id) => {
  const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
