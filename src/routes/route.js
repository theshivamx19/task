import express from "express";
import { createPost, createUser, deletePost, getAllPosts, login, updatePost } from "../controllers/User.js";

const router = express.Router()

router.post('/createUser', createUser);
router.post('/login', login)
router.post('/createPost', createPost)
router.put('/updatePost/:id', updatePost)
router.get('/getAllPosts', getAllPosts)
router.delete('/deletePost/:id', deletePost)


export default router   