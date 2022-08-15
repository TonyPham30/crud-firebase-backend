const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fir-training-c0b22-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const express = require("express");
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const app = express()
const database = admin.firestore()
app.use(cors())
// get all
app.get("/", async (req, res) => {
    try {
        const query = database.collection("blog")
        const responseData = []
        await query.get().then(data => {
            const docs = data.docs
            docs.map(doc => {
                const blogDetail = {
                    id: doc.data().id,
                    title: doc.data().title,
                    content: doc.data().content,
                    userName:doc.data().user,
                    dateTime: doc.data().dateTime
                }
                responseData.push(blogDetail)
            })
        })
        return res.status(200).json({
            message: "get all blog successfully",
            blogs: responseData
        })
    } catch (error) {
        return res.status(500).json({
            message: error,
        })
    }
})
// create blog
app.post("/create-blog", async (req, res) => {
    try {
        await database.collection("blog").doc(`/${Date.now()}/`).create({
            id: Date.now(),
            title: req.body.title,
            content: req.body.content,
            user: req.body.userName,
            dateTime: Date.now()
        })
        return res.status(200).json({
            message: "create blog successfully",
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error,
        })
    }
})

// get blog with id
app.get("/blog/:id", async (req, res) => {
    try {
        const reqDoc = database.collection("blog").doc(req.params.id)
        let blogDetail = await reqDoc.get()
        let responseBlog = blogDetail.data()
        if (responseBlog) {
            return res.status(200).json({
                message: "find successfully blog",
                blog: responseBlog
            })
        } else {
            return res.status(400).json({
                message: "blog not found"
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: error,
        })
    }
})
// update blog with id

app.put("/update/:id", async (req, res) => {
    try {
        const reqDoc = database.collection("blog").doc(req.params.id)
        await reqDoc.update({
            title: req.body.title,
            content: req.body.content,
        })
        return res.status(200).json({
            message: "blog updated",
        })
    } catch (error) {
        return res.status(500).json({
            message: error,
        })
    }
})
// delete blog with id
app.delete("/delete/:id", async (req, res) => {
    try {
        const reqDoc = database.collection("blog").doc(req.params.id)
        await reqDoc.delete()
        return res.status(200).json({
            message: "deleted",
        })
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
})
exports.app = functions.https.onRequest(app)