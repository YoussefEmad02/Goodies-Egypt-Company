require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { v4 } = require("uuid");
const { connectToDb, getDb } = require('../../config/db');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const GridFSBucket = require('mongodb').GridFSBucket;
const fs = require('fs');
const { getSessionToken } = require("../../utils/session");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bodyParser = require('body-parser');

const app = express();

// Set a larger limit for JSON body
app.use(bodyParser.json({ limit: '10mb' }));

// Set a larger limit for URL-encoded body
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ... other routes and configurations


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

} catch (err) {
console.error('Error connecting to MongoDB:', err);
}
})();
///////////////////////////////////////////////////////////////////////////////
const getUser = async function (req) {
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect("/");
  }
  const db = getDb();
  

  try {
    await client.connect();
    const sessionsCollection = db.collection('sessions');

    const user = await sessionsCollection.findOne({ token: sessionToken });

    if (user) {
      // If a user is found in the sessions collection, you can proceed to get additional user information
      const usersCollection = db.collection('users');
      const userDetails = await usersCollection.findOne({ _id: user.userid });

      console.log('user =>', userDetails);
      return userDetails;
    } else {
      // Handle the case where the session token is not found
      return res.status(301).redirect('/');
    }
  } finally {
    await client.close();
  }
};
/////////////////////////////////////////////////////////////////////////////////
// get all the messages
module.exports = function (app) {
app.get('/api/ContactUsMsgs', async (req, res) => {
try {
console.log('hello')
const db = getDb();
const ContactUsCollection = db.collection('ContactUs');
// Query the database with pagination parameters
const Message = await ContactUsCollection.find().toArray();
res.json({
Message: Message
});
} catch (error) {
console.error('An error occurred while retrieving messages:', error);
res.status(500).json({ message: 'An error occurred while retrieving message' });
}
});



// delete message
app.delete('/api/ContactUsMsgs/:id', async (req, res) => {
try {
const db = getDb();
const ContactUsCollection = db.collection('ContactUs');
const deleteMessage = await ContactUsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
res.json(deleteMessage);
} catch (error) {
console.error('An error occurred while deleting message:', error);
res.status(500).json({ message: 'An error occurred while deleting message' });
}
});
//////////////////////////////////////////////////////////////////////
// get all the cvs
app.get('/api/Career', async (req, res) => {
  try {
    console.log('hello')
    const db = getDb();
    const CareerCollection = db.collection('Career');
    // Query the database with pagination parameters
    const CV = await CareerCollection.find().toArray();
    res.json({
      CV: CV
    });
  } catch (error) {
    console.error('An error occurred while retrieving CVS:', error);
    res.status(500).json({ message: 'An error occurred while retrieving CVS' });
  }
});
app.get('/api/download/Career/:filename', async (req, res) => {
  try {
      const db = getDb();
      const bucket = new GridFSBucket(db);

      const filename = req.params.filename;

      const downloadStream = bucket.openDownloadStreamByName(filename);

      // Set the appropriate headers for the response
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      res.setHeader('Content-type', 'application/pdf');

      // Pipe the file stream to the response
      downloadStream.pipe(res);
  } catch (error) {
      console.error('An error occurred while downloading CV:', error);
      res.status(500).json({ message: 'An error occurred while downloading CV' });
  }
});


// delete CV
app.delete('/api/Career/:id', async (req, res) => {
try {
const db = getDb();
const CareeerCollection = db.collection('Career');
const deleteCV = await CareeerCollection.deleteOne({ _id: new ObjectId(req.params.id) });
res.json(deleteCV);
} catch (error) {
console.error('An error occurred while deleting message:', error);
res.status(500).json({ message: 'An error occurred while deleting message' });
}
});
//////////////////////////////////////////////////////////////////////

// get the Home components
app.get('/api/Home', async (req, res) => {
  try {
      console.log('hello');
      const db = getDb();
      const HomeCollection = db.collection('HomePage');
      const bucket = new GridFSBucket(db);

      // Query the database with pagination parameters
      const Home = await HomeCollection.find().toArray();

      // Retrieve image data using GridFS
      const homeWithImages = await Promise.all(
          Home.map(async (item) => {
              if (item.ExportImg) {
                  const imageBuffer = await bucket.openDownloadStreamByName(item.ExportImg).toArray();
                  const base64Image = Buffer.concat(imageBuffer).toString('base64');
                  item.ExportImgData = base64Image;
              }
              if (item.OurstoryImg) {
                const imageBuffer = await bucket.openDownloadStreamByName(item.OurstoryImg).toArray();
                const base64Image = Buffer.concat(imageBuffer).toString('base64');
                item.OurstoryImgData = base64Image;
            }
            if (item.MissionImg) {
              const imageBuffer = await bucket.openDownloadStreamByName(item.MissionImg).toArray();
              const base64Image = Buffer.concat(imageBuffer).toString('base64');
              item.MissionImgData = base64Image;
          }
          if (item.VisionImg) {
            const imageBuffer = await bucket.openDownloadStreamByName(item.VisionImg).toArray();
            const base64Image = Buffer.concat(imageBuffer).toString('base64');
            item.VisionImgData = base64Image;
        }

              // Repeat the process for other image fields if needed
              // ...

              return item;
          })
      );

      res.json({
          Home: homeWithImages
      });
  } catch (error) {
      console.error('An error occurred while retrieving Home:', error);
      res.status(500).json({ message: 'An error occurred while retrieving Home' });
  }
});
// update new home
app.patch('/api/Home/update/:id', upload.fields([
  { name: 'ExportImg' },
  { name: 'VisionImg' },
  { name: 'MissionImg' }
]), async (req, res) => {
  try {
    const db = getDb();
    const HomeCollection = db.collection('HomePage');
    const bucket = new GridFSBucket(db);

    const HomeId = req.params.id;
    const updateFields = {};

    if (!ObjectId.isValid(HomeId)) {
      return res.status(400).json({ message: 'Invalid ObjectId format' });
    }

    // Process uploaded images using GridFS
    const imageFields = ['ExportImg', 'VisionImg', 'MissionImg'];
    for (const field of imageFields) {
      if (req.files && req.files[field] && req.files[field][0]) {
        const file = req.files[field][0];
        const filename = file.originalname;
        const uploadStream = bucket.openUploadStream(filename);
        uploadStream.end(file.buffer);
        updateFields[field] = filename; // Update the image field
      }
    }

    // Process other fields
    const textFields = [
      'OurStoryPara', 'MissionPara', 'VisionPara',
      'ExportPara', 'ExportHeader', 'OurstoryHeader',
      'VisionHeader', 'MissionHeader'
    ];

    textFields.forEach((field) => {
      const fieldValue = req.body[field];
      if (fieldValue !== undefined) {
        updateFields[field] = fieldValue;
      }
    });

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No changes to update' });
    }

    const result = await HomeCollection.updateOne(
      { _id: new ObjectId(HomeId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Home page not found' });
    }

    res.json({ message: 'Home page updated successfully' });
  } catch (error) {
    console.error('An error occurred while updating home page:', error);
    res.status(500).json({ message: 'An error occurred while updating home page' });
  }
});

//////////////////////////////////////////////////////////////////////

// create new user
app.post("/api/user", async function (req, res) {
    const db = getDb();
  
    // Check if user already exists in the system
    const userExists = await db.collection("Users").findOne({ email: req.body.email });
  
    if (userExists) {
      return res.status(400).json("User exists");
    }
  
    const newUser = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: req.body.password,
    };
  
    try {
      const result = await db.collection("Users").insertOne(newUser);
      
      const insertedId = result.insertedId;
      const insertedUser = await db.collection("Users").findOne({ _id: insertedId });
  
      if (insertedUser) {
        return res.status(200).json({ message: 'User registered successfully', insertedUser });
      } else {
        console.error('Inserted user document not found in the collection');
        return res.status(500).json({ message: 'Inserted user document not found' });
      }
    } catch (e) {
      console.error(e.message);
      return res.status(400).send("Could not register user");
    }
  });
      
    // delete user
    app.delete('/api/user/:id', async (req, res) => {
        try {
        const db = getDb();
        const UserCollection = db.collection('Users');
        const deleteUser = await UserCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json(deleteUser);
        } catch (error) {
        console.error('An error occurred while deleting user:', error);
        res.status(500).json({ message: 'An error occurred while deleting user' });
        }
    });
    app.patch('/api/Home/update/vision/:id', upload.fields([
   
      { name: 'VisionImg' }
  
    ]), async (req, res) => {
      try {
        const db = getDb();
        const HomeCollection = db.collection('HomePage');
        const bucket = new GridFSBucket(db);
    
        const HomeId = req.params.id;
        const updateFields = {};
    
        if (!ObjectId.isValid(HomeId)) {
          return res.status(400).json({ message: 'Invalid ObjectId format' });
        }
    
        // Process uploaded images using GridFS
        const imageFields = ['VisionImg'];
        for (const field of imageFields) {
          if (req.files && req.files[field] && req.files[field][0]) {
            const file = req.files[field][0];
            const filename = file.originalname;
            const uploadStream = bucket.openUploadStream(filename);
            uploadStream.end(file.buffer);
            updateFields[field] = filename; // Update the image field
          }
        }
    
        // Process other fields
        const textFields = [
          'OurStoryPara', 'MissionPara', 'VisionPara',
          'ExportPara', 'ExportHeader', 'OurstoryHeader',
          'VisionHeader', 'MissionHeader'
        ];
    
        textFields.forEach((field) => {
          const fieldValue = req.body[field];
          if (fieldValue !== undefined) {
            updateFields[field] = fieldValue;
          }
        });
    
        if (Object.keys(updateFields).length === 0) {
          return res.status(400).json({ message: 'No changes to update' });
        }
    
        const result = await HomeCollection.updateOne(
          { _id: new ObjectId(HomeId) },
          { $set: updateFields }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Home page not found' });
        }
    
        res.json({ message: 'Home page updated successfully' });
      } catch (error) {
        console.error('An error occurred while updating home page:', error);
        res.status(500).json({ message: 'An error occurred while updating home page' });
      }
    });
    app.patch('/api/Home/update/mission/:id', upload.fields([
   
    
      { name: 'MissionImg' }
    ]), async (req, res) => {
      try {
        const db = getDb();
        const HomeCollection = db.collection('HomePage');
        const bucket = new GridFSBucket(db);
    
        const HomeId = req.params.id;
        const updateFields = {};
    
        if (!ObjectId.isValid(HomeId)) {
          return res.status(400).json({ message: 'Invalid ObjectId format' });
        }
    
        // Process uploaded images using GridFS
        const imageFields = [ 'MissionImg'];
        for (const field of imageFields) {
          if (req.files && req.files[field] && req.files[field][0]) {
            const file = req.files[field][0];
            const filename = file.originalname;
            const uploadStream = bucket.openUploadStream(filename);
            uploadStream.end(file.buffer);
            updateFields[field] = filename; // Update the image field
          }
        }
    
        // Process other fields
       
    
        if (Object.keys(updateFields).length === 0) {
          return res.status(400).json({ message: 'No changes to update' });
        }
    
        const result = await HomeCollection.updateOne(
          { _id: new ObjectId(HomeId) },
          { $set: updateFields }
        );
    
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Home page not found' });
        }
    
        res.json({ message: 'Home page updated successfully' });
      } catch (error) {
        console.error('An error occurred while updating home page:', error);
        res.status(500).json({ message: 'An error occurred while updating home page' });
      }
    });
  }