// import User from '../models/User.js'
// import Post from '../models/Post.js'
// import jwt from 'jsonwebtoken'
// import bcrypt from 'bcrypt'
// import { isValidObjectId } from 'mongoose'
// const saltRounds = 10


// export const createUser = async (req, res, next) => {
//     try {
//         const data = req.body
//         const { name, email, password } = data
//         const hashedPass = await bcrypt.hash(password, saltRounds)

//         const user = { name, email, password: hashedPass }
//         const newUser = new User(user)
//         await newUser.save()
//         return res.status(201).json(newUser)
//     } catch (error) {
//         next(error)
//     }
// }

// export const login = async (req, res, next) => {
//     try {
//         const data = req.body;
//         const { email, password } = data;
//         if (!email || !password) {
//             return res.status(400).json("Email and password are required to login");
//         }
//         const getUser = await User.findOne({ email });
//         if (!getUser) {
//             return res.status(404).json("No such user exists");
//         }
//         const isPasswordValid = await bcrypt.compare(password, getUser.password);
//         if (!isPasswordValid) {
//             return res.status(401).json("Invalid password");
//         }
//         const token = jwt.sign({ userId: getUser._id }, "shivamsecretkey", { expiresIn: '2h' });
//         res.setHeader('Authorization', `Bearer ${token}`);
//         res.status(200).json({ token });
//     } catch (error) {
//         next(error)
//     }
// }


// export const createPost = async (req, res, next) => {
//     try {
//         const { user_id, title, description, image } = req.body;
//         if(!user_id || !title || !description || !image){
//             return res.status(400).json("All fields are mandotory to create post")
//         }
//         const post = new Post({ user_id, title, description, image });
//         await post.save();
//         res.status(201).json(post);
//     } catch (error) {
//         next(error)
//     }
// };

// export const updatePost = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const { user_id, title, description, image } = req.body;
        
//         const updatedPost = await Post.findByIdAndUpdate(id, { user_id, title, description, image }, { new: true });
//         if (!updatedPost) {
//             return res.status(404).json("Post not found");
//         }
//         res.json(updatedPost);
//     } catch (error) {
//         next(error)
//     }
// };


// export const getAllPosts = async (req, res, next) => {
//     try {
//         const posts = await Post.find();
//         res.json(posts);
//     } catch (error) {
//         next(error)
//     }
// };

// export const deletePost = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const deletedPost = await Post.findByIdAndDelete(id);
//         if (!deletedPost) {
//             return res.status(404).json("Post not found");
//         }
//         res.json(deletedPost);
//     } catch (error) {
//         next(error)
//     }
// }


import Post from '../models/Post.js'
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import bcrypt from 'bcrypt';
const saltRounds = 10;

export const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPass = await bcrypt.hash(password, saltRounds);
        const user = { name, email, password: hashedPass };
        const newUser = new User(user);
        await newUser.save();
        return res.status(201).json(newUser);
    } catch (error) {
        next(error);
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

        const token = jwt.sign({ userId: getUser._id }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.setHeader('Authorization', `Bearer ${token}`);
        res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req, res, next) => {
    try {
        const { user_id, title, description, image } = req.body;

        if (!user_id || !title || !description || !image) {
            return res.status(400).json({ message: "All fields are mandatory to create a post" });
        }

        const post = new Post({ user_id, title, description, image });
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        next(error);
    }
};

export const updatePost = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user_id, title, description, image } = req.body;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const updatedPost = await Post.findByIdAndUpdate(id, { user_id, title, description, image }, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json(updatedPost);
    } catch (error) {
        next(error);
    }
};

export const getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find();
        res.json(posts);
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        next(error);
    }
};