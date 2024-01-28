require('dotenv').config();
    const express = require('express');
    const multer = require('multer');
    const { v4 } = require("uuid");
    const { connectToDb, getDb } = require('../../config/db');
    const { ObjectId } = require('mongodb');



    const app = express();
    const PORT =process.env.PORT || 3000;;
    const cors= require('cors');

    app.use(cors());
    app.use(express.json());
    // app.use(express.urlencoded({ extended: false }));


    (async () => {
    try {
    // Connect to MongoDB
    await connectToDb();

    // Your routes and other middleware follow...

    // Server
 
    }catch (err) {
    console.error('Error connecting to MongoDB:', err);
    }
    })();
    module.exports = function (app) {
        
    // login user         
    app.post("/api/user/login", async function (req, res) {
    try {
        const db = getDb();
        const user = await db.collection("Users").findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json("User does not exist");
        }

        if (user.password !== req.body.password) {
            return res.status(400).json("Invalid credentials");
        }

        const token = v4();
        const currentDateTime = new Date();
        const expiresat = new Date(+currentDateTime + 1800000); // expire in 30 minutes

        const session = {
            userid: user._id,
            token,
            expiresat,
        };

        await db.collection("sessions").insertOne(session);

        const response = {
            message: "Login successful",
            token,  
            expiresat: expiresat.getTime(),
            userid: user._id,
        };

        // In the response, set a cookie on the client with the name "session_cookie"
        // and the value as the UUID we generated. We also set the expiration time.
        return res
            .cookie("session_token", token, { expires: expiresat })
            .status(200)
            .json(response);
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Could not login user', error: error.message });
    }
    });
        


    }