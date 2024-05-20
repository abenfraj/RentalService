const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../controllers/userController");

router.post("/signup", userController.createUser);
router.post("/signin", userController.signIn);
router.get("/me", verifyToken, userController.getCurrentUser);

router.get("/users", verifyToken, userController.getAllUsers);
router.get("/users/:id", verifyToken, userController.getUserById);
router.put("/users/:id", verifyToken, userController.updateUser);
router.delete("/users/:id", verifyToken, userController.deleteUser);

module.exports = router;
