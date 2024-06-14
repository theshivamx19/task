
import Post from '../models/Post.js'
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose, { isValidObjectId } from 'mongoose';
import fs from 'fs';
import sharp from 'sharp';

import bcrypt from 'bcrypt';
const saltRounds = 10;

export const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (email) {
            const checkEmail = await User.findOne({ email })
            if (checkEmail) {
                return res.status(409).json("Given email already exists")
            }
        }
        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: "Invalid input types" });
        }

        console.log('Hashing password...');
        const hashedPass = await bcrypt.hash(password, saltRounds);
        console.log('Hashed password:', hashedPass);

        const user = { name, email, password: hashedPass };
        const newUser = new User(user);
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required to login" });
        }

        const getUser = await User.findOne({ email });
        if (!getUser) {
            return res.status(404).json({ message: "No such user exists" });
        }

        const isPasswordValid = await bcrypt.compare(password, getUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }


        const token = jwt.sign({ userId: getUser._id }, "mysecretkey", { expiresIn: '2h' });
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
export const createPost = async (req, res, next) => {
    try {
        const { title, description } = req.body;
        const userId = req.user._id;

        if (!title || !description) {
            return res.status(400).json({ message: "All fields are mandatory to create a post" });
        }

        const uploadImage = async (imageFile) => {
            if (!imageFile) {
                return null;
            }

            const url = req.protocol + "://" + req.get("host");
            const uploadsDirectory = "./data/uploads/";
            const imageDirectory = "images/";
            const documentDirectory = "documents/";

            if (!fs.existsSync(uploadsDirectory)) {
                fs.mkdirSync(uploadsDirectory, { recursive: true });
            }
            if (!fs.existsSync(uploadsDirectory + imageDirectory)) {
                fs.mkdirSync(uploadsDirectory + imageDirectory, { recursive: true });
            }
            if (!fs.existsSync(uploadsDirectory + documentDirectory)) {
                fs.mkdirSync(uploadsDirectory + documentDirectory, { recursive: true });
            }

            let imageUrl;
            if (['image/jpeg', 'image/jpg', 'image/png'].includes(imageFile.mimetype)) {
                const formattedImageFileName = Date.now() + "-" + imageFile.originalname.split(" ").join("-");
                imageUrl = `${url}/${imageDirectory}${formattedImageFileName}`;
                const imagePath = `${uploadsDirectory}${imageDirectory}${formattedImageFileName}`;
                await sharp(imageFile.buffer).resize({ width: 600 }).toFile(imagePath);
            } else if (imageFile.mimetype === 'application/pdf') {
                const formattedDocumentFileName = Date.now() + "-" + imageFile.originalname.split(" ").join("-");
                imageUrl = `${url}/${documentDirectory}${formattedDocumentFileName}`;
                fs.writeFileSync(`${uploadsDirectory}${documentDirectory}${formattedDocumentFileName}`, imageFile.buffer);
            }
            return imageUrl;
        };

        const imageUrl = await uploadImage(req.files.find(file => file.fieldname === "image"));
        console.log(imageUrl)

        const post = new Post({ userId, title, description, image: imageUrl });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};
export const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const getPost = await Post.findOne({ _id: id })
        console.log(getPost)
        if (!(req.user._id.equals(getPost.userId))) {
            console.log(req.user._id, getPost.userId)
            return res.status(403).json("you are not authorized to update")
        }
        const { title, description } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }
        const uploadImage = async (imageFile) => {
            if (!imageFile) {
                return null;
            }

            const url = req.protocol + "://" + req.get("host");
            const uploadsDirectory = "./data/uploads/";
            const imageDirectory = "images/";
            const documentDirectory = "documents/";

            if (!fs.existsSync(uploadsDirectory)) {
                fs.mkdirSync(uploadsDirectory, { recursive: true });
            }
            if (!fs.existsSync(uploadsDirectory + imageDirectory)) {
                fs.mkdirSync(uploadsDirectory + imageDirectory, { recursive: true });
            }
            if (!fs.existsSync(uploadsDirectory + documentDirectory)) {
                fs.mkdirSync(uploadsDirectory + documentDirectory, { recursive: true });
            }

            let imageUrl;
            if (['image/jpeg', 'image/jpg', 'image/png'].includes(imageFile.mimetype)) {
                const formattedImageFileName = Date.now() + "-" + imageFile.originalname.split(" ").join("-");
                imageUrl = `${url}/${imageDirectory}${formattedImageFileName}`;
                const imagePath = `${uploadsDirectory}${imageDirectory}${formattedImageFileName}`;
                await sharp(imageFile.buffer).resize({ width: 600 }).toFile(imagePath);
            } else if (imageFile.mimetype === 'application/pdf') {
                const formattedDocumentFileName = Date.now() + "-" + imageFile.originalname.split(" ").join("-");
                imageUrl = `${url}/${documentDirectory}${formattedDocumentFileName}`;
                fs.writeFileSync(`${uploadsDirectory}${documentDirectory}${formattedDocumentFileName}`, imageFile.buffer);
            }
            return imageUrl;
        };

        const updatedPost = await Post.findByIdAndUpdate(id, { title, description }, { new: true });
        if (req.files) {
            const imageUrl = await uploadImage(req.files.find(file => file.fieldname === "image"));
            updatePost.image = imageUrl
        }
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export const getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ userId: req.user._id });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

export const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }
        const getPost = await Post.findOne({ _id: id })
        if(!getPost){
            return res.status(404).json("Either not exists or already deleted")
        }
        console.log(getPost)
        if (!(req.user._id.equals(getPost.userId))) {
            console.log(req.user._id, getPost.userId)
            return res.status(403).json("you are not authorized to delete this post")
        }
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};