const LocalStrategy = require("passport-local").Strategy;
const debug = require("debug")("facebook:passportConfig");
import User from "./models/User";

export default function (passport: any) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email: any, password: any, done: any) => {
        debug("inside passport localstrategy");
        debug(`email: ${email}`);
        debug(`password: ${password}`);
        try {
          const user = await User.findOne({ email: email });
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.serializeUser(function (user: any, done: any) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id: any, done: any) {
    User.findById(id, function (err: any, user: any) {
      done(err, user);
    });
  });
}