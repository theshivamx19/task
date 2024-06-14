import express from "express";
import auth from '../middlewares/authMiddleware.js'
import { createPost, createUser, deletePost, getAllPosts, login, updatePost } from "../controllers/User.js";
import { upload } from "../middlewares/multerConfig.js"

const router = express.Router()

router.post('/createUser', createUser);
router.post('/login', login)
router.post('/createPost', auth, upload.any(), createPost)
router.put('/updatePost/:id', auth, updatePost)
router.get('/getAllPosts', auth, getAllPosts)
router.delete('/deletePost/:id', auth, deletePost)


export default router   