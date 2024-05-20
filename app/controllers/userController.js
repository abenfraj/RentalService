const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { client } = require("../../config/database");
const { ObjectId } = require("mongodb");

const db = client.db("RentalService");
const usersCollection = db.collection("users");

const createUser = async (req, res) => {
  const { name, email, password, type } = req.body;

  try {
    let existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    if (!type || (type !== "tenant" && type !== "owner")) {
      return res
        .status(400)
        .json({ msg: "User type must be either 'tenant' or 'owner'" });
    }

    if (password === undefined || password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      type,
    });

    const newUser = await usersCollection.findOne({ _id: result.insertedId });
    const token = jwt.sign(
      { id: newUser._id, type: newUser.type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user: newUser });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const signIn = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const user = await usersCollection.findOne({
      $or: [{ email: identifier }, { name: identifier }],
    });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).json({ msg: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ msg: "Failed to authenticate token" });
    }
    req.userId = decoded.id;
    req.userType = decoded.type;
    next();
  });
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.userId),
    });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
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
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err.message);
    res.status(500).send("Server Error");
  }
};

const updateUser = async (req, res) => {
  const { name, email, password, type } = req.body;

  try {
    let updateFields = { name, email };

    if (type && type !== "tenant" && type !== "owner") {
      return res
        .status(400)
        .json({ msg: "User type must be either 'tenant' or 'owner'" });
    }

    if (type) {
      updateFields.type = type;
    }

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
    }

    let result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    if (!result.value) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(result.value);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const deleteUser = async (req, res) => {
  try {
    let result = await usersCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json({ msg: "User removed" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createUser,
  signIn,
  verifyToken,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
