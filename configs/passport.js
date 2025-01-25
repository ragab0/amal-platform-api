const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");
const getValidatedName = require("../utils/validateName");
const passport = require("passport");
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
// const Cv = require("../models/cvModel");

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_CALLBACK_URL,
} = process.env;

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with email
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          const firstName =
            profile.name?.givenName || profile.displayName.split(" ")[0];
          const lastName =
            profile.name?.familyName ||
            profile.displayName.split(" ").slice(1).join(" ");

          // Create new user with Google profile data
          user = new User({
            role: "user",
            email: profile.emails[0].value,
            fname: getValidatedName(firstName, true),
            lname: getValidatedName(lastName, false),
            isVerified: true, // Social accounts are pre-verified
            photo: profile.photos[0].value,
          });
          await user.save({ validateBeforeSave: false });
          // Create new CV
          // const cv = new Cv({
          //   user: user._id,
          //   personalInfo: {
          //     fullName: `${user.fname} ${user.lname}`,
          //     photo: user.photo,
          //     email: user.email,
          //   },
          // });
          // await cv.save({ validateBeforeSave: false });
        }
        if (!user.isVerified) {
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// LinkedIn Strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: LINKEDIN_CLIENT_ID,
      clientSecret: LINKEDIN_CLIENT_SECRET,
      callbackURL: LINKEDIN_CALLBACK_URL,
      scope: ["openid", "profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with email
        let user = await User.findOne({ email: profile.email });
        if (!user) {
          const firstName =
            profile.givenName || profile.displayName.split(" ")[0];
          const lastName =
            profile.familyName ||
            profile.displayName.split(" ").slice(1).join(" ");

          // Create new user with LinkedIn profile data
          user = new User({
            role: "user",
            email: profile.email,
            fname: getValidatedName(firstName, true),
            lname: getValidatedName(lastName, false),
            isVerified: true, // Social accounts are pre-verified
            photo: profile.picture,
          });
          await user.save({ validateBeforeSave: false });
          // Create new CV
          // const cv = new Cv({
          //   user: user._id,
          //   personalInfo: {
          //     fullName: `${user.fname} ${user.lname}`,
          //     photo: user.photo,
          //     email: user.email,
          //   },
          // });
          // await cv.save({ validateBeforeSave: false });
        }
        if (!user.isVerified) {
          user.isVerified = true;
          await user.save({ validateBeforeSave: false });
        }
        done(null, user);
      } catch (error) {
        console.error("LinkedIn auth error:", error);
        done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
