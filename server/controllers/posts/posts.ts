import Post, { PostInput, PostDocument } from "../../models/Post";
import Comment, { CommentInput, CommentDocument } from "../../models/Comment";
import { isValidObjectId, Types, HydratedDocument } from "mongoose";
import { body, param } from "express-validator";
import express from "express";
import processValidation from "../../utils/processValidation";

const debug = require("debug")("facebook:controllers/posts");

const getNewsfeedPosts = async (req: any, res: any, next: any) => {
  try {
    if (req.user) {
      const user = req.user;
      const results = await Post.find({
        author: { $in: [...user!.friends!, user._id] },
      }).exec();
      return res.send(results);
    } else {
      throw new Error("req.user is not defined in getNewsfeedPosts");
    }
  } catch (err: any) {
    return next(err);
  }
};

const getPost = [
  param("pid", "A valid PID must be provided")
    .exists()
    .custom((pid) => isValidObjectId(pid)),
  processValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { pid } = req.params;
      const post = await Post.findById(pid);
      if (post === null) {
        return res.sendStatus(404);
      }
      return res.send(post);
    } catch (err) {
      return next(err);
    }
  },
];

const createPost = [
  body("author").isMongoId(),
  body("content").isString(),
  processValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const post: HydratedDocument<PostDocument> = new Post({
        author: req.body.author,
        content: req.body.content,
        comments: [],
      });

      post.save();
      res.status(201);
      return res.send(post);
    } catch (err) {
      next(err);
    }
  },
];

const editPost = [
  param("pid", "A valid PID must be provided")
    .exists()
    .custom((pid) => isValidObjectId(pid)),
  processValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { pid } = req.params;

      const update: any = {};
      Object.keys(req.body).forEach((key) => {
        update[key] = req.body[key];
      });
      const post = await Post.findByIdAndUpdate(pid, update, {
        returnOriginal: false,
      });

      if (!post) {
        return res.sendStatus(404);
      }

      return res.send(post);
    } catch (err) {
      return next(err);
    }
  },
];

const deletePost = [
  param("pid", "Please provide a valid pid.").isMongoId(),
  processValidation,
  async (req: any, res: express.Response, next: express.NextFunction) => {
    try {
      const post = await Post.findById(req.params.pid);
      if (!req.user._id.equals(post?.author)) {
        return res.status(403).json({
          error: "Only the author can delete this content.",
        });
      }
      await post?.delete();

      return res.status(200).json({
        message: "Post has been deleted",
      });
    } catch (err) {
      return next(err);
    }
  },
];

const addComment = [
  param("pid").isMongoId(),
  body("content").isString(),
  processValidation,
  async (req: any, res: express.Response, next: express.NextFunction) => {
    try {
      const post = await Post.findById(req.params.pid);

      const comment: CommentDocument = new Comment({
        author: req.user.id,
        content: req.body.content,
        postID: req.params.pid,
      });

      post?.comments.push(comment);

      post?.save();
      res.status(201);
      return res.send(post);
    } catch (err) {
      next(err);
    }
  },
];

const editComment = [
  param("pid", "Please provide a valid pid").isMongoId(),
  param("cid", "Please provide a valid cid").isMongoId(),
  body("content", "Please provide comment content").exists().isString(),
  processValidation,
  async (req: any, res: express.Response, next: express.NextFunction) => {
    try {
      const post = await Post.findById(req.params.pid);
      const comment = post?.comments.id(req.params.cid);
      if (!req.user._id.equals(comment?.author)) {
        return res.status(403).json({
          error: "Only the author can edit this content.",
        });
      }

      comment?.set(req.body);
      post?.save();
      return res.status(200).send(post);
    } catch (err) {
      return next(err);
    }
  },
];

const deleteComment = [
  param("pid", "Please provide a valid pid").isMongoId(),
  param("cid", "Please provide a valid cid").isMongoId(),
  processValidation,
  async (req: any, res: express.Response, next: express.NextFunction) => {
    try {
      const post = await Post.findById(req.params.pid);
      const comment = post?.comments.id(req.params.cid);
      if (!req.user._id.equals(comment?.author)) {
        return res.status(403).json({
          error: "Only the author can delete this content.",
        });
      }

      await comment?.remove();
      post?.save();
      return res.status(200).send(post);
    } catch (err) {
      return next(err);
    }
  },
];

const likePost = [
  param("pid", "Please provide a valid pid").isMongoId(),
  processValidation,
  async (req: any, res: express.Response, next: express.NextFunction) => {
    try {
      const post = await Post.findById(req.params.pid);
      if (!post) {
        res.status(404);
        throw new Error("Post not found");
      }

      if (post.likes.includes(req.user._id)) {
        res.status(200);
        return res.send({ message: "This post has already been liked." });
      }
      post?.likes.push(req.user._id);
      await post.save();
      res.status(201);
      return res.json(post);
    } catch (err) {
      return next(err);
    }
  },
];

const unlikePost = [
  param("pid", "Please provide a valid pid").isMongoId(),
  processValidation,
  async (req: any, res: express.Response, next: express.NextFunction) => {
    try {
      const post = await Post.findById(req.params.pid);
      if (!post) {
        res.status(404);
        throw new Error("Post not found");
      }
      if (!post.likes.includes(req.user.id)) {
        res.status(200);
        return res.send({
          message: "The post has not been liked by this user.",
        });
      }
      const likes: Types.ObjectId[] = post.likes;
      const uid: string = req.user.id;

      post.likes = likes.filter((id) => id.toString() !== uid);
      await post.save();
      res.status(201);
      return res.json(post);
    } catch (err) {
      return next(err);
    }
  },
];

export {
  getNewsfeedPosts,
  getPost,
  createPost,
  editPost,
  deletePost,
  addComment,
  editComment,
  deleteComment,
  likePost,
  unlikePost,
};