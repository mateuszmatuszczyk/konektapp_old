const express = require ('express');
const body_parser = require("body-parser");

// CONTROLLERS
const user_controller = require("./controllers/userController")

const app = express();
const router = express.Router();

app.use(body_parser.urlencoded({extended:false}));
app.use(body_parser.json());
app.use("/api", router);


// ROUTES
router.route("/").get((req,res)=>{
    console.log("Accessing ROOT");
    res.send("Hello, this is root");
});

// get user by userID
router.route("/user/:uid").get(user_controller.getUser);

// register new user
router.route("/register").post(user_controller.registerUser);

// login user
router.route("/login").post(user_controller.loginUser)

//search for user
router.route("/user/search").post(user_controller.searchUser)

//send connection request
router.route("/user/newconnection").post(user_controller.sendConnectionRequest)

//start the server on the defined port -> 3000
const port = 3000
app.listen(port)
    console.log('Server started on port '+port);





