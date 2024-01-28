const { v4 } = require('uuid');
const { connectToDb, getDb } = require('../config/db');
const { getSessionToken } = require('../utils/session');

module.exports = async function (req, res, next) {
  const db = getDb();
  const sessionToken = getSessionToken(req);
  if (!sessionToken) {
    return res.status(301).redirect('/login');
  }

  try {
    // Replace SQL query with MongoDB query to find the user session
    const userSession = await db.collection('sessions').findOne({ token: sessionToken });

    if (!userSession) {
      // If the session token is not present in the sessions collection, return an unauthorized error
      return res.status(301).redirect('/login');
    }

    // If the session has expired, return an unauthorized error, and delete the session from our collection
    if (new Date() > userSession.expiresat) {
      // Assuming you have a method to delete the session by its _id
      await db.collection('sessions').deleteOne({ _id: userSession._id });
      return res.status(301).redirect('/login');
    }

    // If all checks have passed, we can consider the user authenticated
    next();
  } catch (error) {
    console.error('Error during authentication:', error);
    return res.status(500).send('Internal Server Error');
  }
};