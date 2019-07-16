///// ///// IMPORTS ///// /////
///// LIBRARIES ///// 
const mysql = require('mysql');
const bcrypt = require('bcrypt');
///// CUSTOM FILES
// Database configuration file
const dbconfig = require("../config/dbconnection");
// JS file containing helper methods, such as password validation etc. 
const helper = require('./helper.js');

///// ///// DB CONNETION
// Establish connection with MySQL database using credentials from db.config file
const connection = mysql.createConnection(dbconfig.connection);

///// ///// 
exports.registerUser = async (req, res) => {
    const body = req.body;
    const email = body.email;
    const password = body.password;
    const hashed_password = await bcrypt.hash(password, 10)

    console.log("email: " + email + "\npassword: " + password + "\nhashed_password: " + hashed_password)
    const sql = 'SELECT * FROM user WHERE email = ?';

    if (!helper.validateEmail(email)) {
        res.status(200).send("Invalid email.")
        return
    }
    try {
        connection.query(sql, email, function (err, result, fields) {
            // res.status(200).send(result);
            // console.log("User ID :"+req.params.uid + result[0].name)
            try {
                if (result[0]) {
                    console.log("Email address already exists in the database.");
                    res.status(200).send({ error: "This e-mail address is already registered." });
                }
                else {
                    console.log("result not found");
                    const sql =
                        "INSERT INTO `konektdb`.`user` (`email`, `password`) VALUES (?,?)";

                    connection.query(sql, [email, hashed_password], function (err, result, fields) {
                        res.status(200).send(result);
                    })
                }
            }
            catch (err) {
                console.log(err)
            }
        })
    }
    catch (error) {
        console.log(error);
    }
    console.log("Email: " + email + " \nPassword: " + password);
}

exports.loginUser = async (req, res) => {
    const user_email = req.body.email;
    console.log("Logging in " + user_email)

    const sql =
        'SELECT * FROM user WHERE email = ?';

    connection.query(sql, user_email, async (err, result, fields) => {
        const user = result[0]
        if (user == null) {
            return res.status(400).send("User not found")
        }
        try {
            if (await bcrypt.compare(req.body.password, user.password)) {
                console.log("SUCCESS")
                return res.status(200).send('Successfully logged in \nUser ID =' + user.userID)
            }
            else {
                console.log("FAIL")
                return res.status(404).send('user not found')
            }
        }
        catch (err) {
            res.status(500).send(err)
        }
    })
}

exports.searchUser = async (req, res) => {
    // const search_user_email = mysql.escape(req.body.search_email).replace(/'/g,"");
    // mystring = mystring.replace('/r','/');
    const search_user_email = "%" + req.body.search_email + "%"
    console.log("Email to search: " + search_user_email)


    const sql = `SELECT * FROM user WHERE email LIKE ?`;

    connection.query(sql, search_user_email, async (err, result, fields) => {
        console.log(result)
        const search_results = result

        return res.status(200).send(result)
    }
    )
}

exports.getUser = async (req, res) => {
    const uid = req.params.uid;
    // const table_name = "user";
    const sql = 'SELECT * FROM user WHERE userID = ?';

    connection.query(sql, uid, function (err, result, fields) {
        res.status(200).send(result);
        console.log("User ID :" + req.params.uid + "\nName: " + result[0].name)
    })
}

exports.sendConnectionRequest = async (req, res) => {
    const uid = req.body.uid;
    const friend_id = req.body.friend_id

    console.log("UID:"+uid+"FID:"+friend_id)

    const sql =
        `SELECT * FROM user_connection WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`
    connection.query(sql, [uid, friend_id,friend_id, uid], (err, result) => {
        if (err) { console.log(err) }
        console.log(result)
        const user_connections = result[0]
        if (user_connections == null) {
            console.log("Connection not found")

            const sql =
                `INSERT INTO user_connection (user_id, friend_id) VALUES (?, ?);`

            connection.query(sql, [uid, friend_id], function (err, result, fields) {
                if (err) {
                    console.log(err)
                }
                res.status(200).send(result);
                // console.log("User ID :" + req.params.uid + "\nName: " + result[0].name)
            })

        }
        else{
            res.status(200).send("Connection already exists.")
        }

    })
}

exports.acceptConnectionRequest = async (req, res) => {
    const uid = req.body.uid;
    const friend_id = req.body.friend_id
    // const table_name = "user";
    const sql =
        `INSERT INTO user_connection (user_id, friend_id) VALUES (?, ?);`

    connection.query(sql, [uid, friend_id], function (err, result, fields) {
        if (err) {
            console.log(err)
        }
        res.status(200).send(result);
        // console.log("User ID :" + req.params.uid + "\nName: " + result[0].name)
    })
}


