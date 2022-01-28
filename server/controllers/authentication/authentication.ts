import passport from "passport";
import createHttpError from "http-errors";
import express from "express";
import { body } from "express-validator";
import processValidation from "../../utils/processValidation";
import User, { UserDocument } from "../../models/User";
import bcrypt from "bcryptjs";

const debug = require("debug")("facebook:controllers:authentication");

const tryLogin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (info) {
      return res.send(info);
    }
    req.logIn(user, function (err: any) {
      if (err) {
        return next(err);
      }
      return res.send(user);
    });
  })(req, res, next);
};

// TODO: Add stronger password requirements via express-validator
const signup = [
  body("email", "Please provide an email"),
  body("password", "Please provide a password"),
  processValidation,
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const existingUser = await User.findOne({
        email: req.body.email,
      }).exec();

      if (existingUser) {
        const info = {
          statusCode: 200,
          message: "That email is already in use.",
        };
        return res.send(info);
      }
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const user = new User({
        email: req.body.email,
        firstName: "placeholder",
        lastName: "placeholder",
        password: hashedPassword,
      });
      await user.save();
      return res.status(201).send(user);
    } catch (err) {
      return next(err);
    }
  },
];

const ensureAuthenticated = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    const error = createHttpError(401, "Please login to view this");
    return res.send(error);
  }
};

const getAuthStatus = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.isAuthenticated()) {
    return res.send(req.user);
  } else {
    return res.send(false);
  }
};

const googleAuth = [
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
];

const googleAuthRedirect = [
  passport.authenticate("google"),
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    return res.send(req.user);
  },
];

const logout = [
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    req.logOut();
    return res.send("Logged Out");
  },
];

export {
  tryLogin,
  signup,
  ensureAuthenticated,
  getAuthStatus,
  googleAuth,
  googleAuthRedirect,
  logout,
};