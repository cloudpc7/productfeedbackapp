const { onRequest } = require('firebase-functions/v2/https');
const express = require("express");
const cors = require("cors");
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

const { setGlobalOptions } = require("firebase-functions/v2");

admin.initializeApp(); // Initialize firebase admin for authentication

const db = admin.firestore(); // connect to database in firestore

const app = express(); // create express app
app.use(cors({ origin: true }));

const bucket = admin.storage().bucket();

// Create  function
app.post("/feedback", async (req, res) => {
    const { id, title, category, upvotes, status, description, comments} = req.body; // destructure object from request body in json format

    const newProductRequest = { // create a new request object 
            id,
            title,
            category,
            upvotes: upvotes || 0,
            status: status || "suggestion",
            description,
            comments: comments || []
        };
    try {
        if (!id) { // Verify if there is an id for the document
            logger.error("Create Feedback Failed: Missing ID", { body: req.body}); // logging the error to firestore
            return res.status(400).send("Failed to create feedback: Missing Id"); // return the error message
        };

        await db.collection("productRequests").doc(id.toString()).set(newProductRequest);
        return res.status(201).send(`Feedback  with category ${category} created successfully!`);

    } catch (error) {
        logger.error("Firestore Write Error: ", { error: error.message, id}); // create an object for context and readability in google cloud console
        return res.status(500).send("Internal Server Error"); // return a 500 server error message stating there is a server error
    };

});

// Read Function
app.get("/feedback", async (req, res) => {

    try {
        let query = db .collection("productRequests"); // query the database collection
        
        if (req.query.category) { // filter by categories
            query = query.where("category", "==", req.query.category);
        };

        if (req.query.status) { // filter by status
            query = query.where("status", "==", req.query.status);
        };

        if (req.query.upvotes) { // sort by upvotes
            query = query.orderBy("upvotes", "desc");
        }; 

        const snapshot = await query.get(); // get the collection based on provided query

        if (snapshot.empty) return res.status(200).json([]); // if no document exists return an empty array

        const feedbackList = snapshot.docs.map((doc) => { // map over the array of documents and return the object
            return { id: doc.id, ...doc.data() };
        });

        return res.status(200).json(feedbackList); // return the list

    } catch (error) {
        logger.error("Firestore Read Error: ", { error: error.message});
        return res.status(500).send("Failed to retreive feedback List");
    };

});

// Update Function
app.patch("/feedback/:id", async (req, res) => {
    const id = req.params.id; // get the id of the request
    const updates = {...req.body}; // get the full request of what needs to be changed use a spread operator to change all fields

    try {
        const docRef = db.collection("productRequests").doc(id); // create a variabler for the database collection and id of the requested document with specific id
        const doc = await docRef.get();

        if(!doc.exists) {
            logger.warn(`Failed to update document ${id} not found`);
            return res.status(404).send(`Feedback item with id ${id} not found`);
        };

        if(updates.upvotes !== undefined) { // verify if upvotes exists
            const amount = typeof updates.upvotes === "number" ? updates.upvotes : 1; // return an amount
            updates.upvotes = admin.firestore.FieldValue.increment(amount);
        };

        await docRef.update(updates); 
        res.status(200).json({ id,...updates });

    } catch (error) {
        logger.error("Firestore Update Error: ", { error: error.message, id});
        return res.status(500).send("Internal Server Error");
    };
});

// Delete Function
app.delete("/feedback/:id", async (req, res) => {
    const id = req.params.id;
    const request = req.body;
    try {
        const docRef = db.collection("productRequests").doc(id);
        const doc = await docRef.get();

        if(!doc.exists) {
            logger.warn(`Failed to update document ${id} not found`);
            return res.status(404).send(`Feedback item with id ${id} not found`);
        };

        await docRef.delete();
        logger.info(`Feedback ${id} was permanently deleted.`, { deletedById: req.user?.id || "unknown" });
        res.status(200).json({ message: `Feedback item with id ${id} deleted successfully`});

    } catch (error) {
        logger.error("Firestore Update Error: ", { error: error.message, id});
        return res.status(500).send("Internal Server Error");
    };

});

app.get("/user-image/:fileName", async (req, res) => {
    try {
        const fileName = req.params.fileName;
        const bucketName = bucket.name; // This automatically gets your bucket name
        
        // 1. Point to the file in the 'users' folder
        const file = bucket.file(`users/${fileName}`);

        // 2. Check existence
        const [exists] = await file.exists();
        if (!exists) {
            return res.status(404).send("Image not found");
        }

        // 3. Construct the URL...
        // We use encodeURIComponent for the fileName to handle spaces or special characters
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/users%2F${encodeURIComponent(fileName)}?alt=media`;

        res.status(200).json({ url: publicUrl });

    } catch (error) {
        logger.error("Storage Link Error", { error: error.message });
        res.status(500).send("Error generating image link");
    }
});

setGlobalOptions({ region: "us-central1"});
exports.api = onRequest(app);



