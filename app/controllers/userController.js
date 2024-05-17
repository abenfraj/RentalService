const { client } = require("../../config/database");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

const db = client.db("RentalService");
const usersCollection = db.collection("users");

const createUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log("Creating user with data:", { name, email });

    // Check if email already exists
    let existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log("Email already exists:", email);
      return res.status(400).json({ msg: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
    });
    console.log("User created:", result);

    // Fetch the newly created user
    const newUser = await usersCollection.findOne({ _id: result.insertedId });
    res.json(newUser);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).send("Server Error");
  }
};

const signIn = async (req, res) => {
  const { identifier, password } = req.body; // Use 'identifier' to represent either email or username

  try {
    // Check if user exists using either email or username
    const user = await usersCollection.findOne({
      $or: [{ email: identifier }, { name: identifier }],
    });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    res.json({ msg: "Sign-in successful", user });
  } catch (err) {
    console.error("Error signing in:", err.message);
    res.status(500).send("Server Error");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (err) {
    console.error("Error fetching all users:", err.message);
    res.status(500).send("Server Error");
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    if (!user) {
      console.log("User not found with ID:", req.params.id);
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err.message);
    res.status(500).send("Server Error");
  }
};

const updateUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let updateFields = { name, email };
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    let result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    if (!result.value) {
      console.log("User not found with ID:", req.params.id);
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(result.value);
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).send("Server Error");
  }
};

const deleteUser = async (req, res) => {
  try {
    let result = await usersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 0) {
      console.log("User not found with ID:", req.params.id);
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ msg: "User removed" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createUser,
  signIn,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
