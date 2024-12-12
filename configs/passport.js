const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
const User = require("../models/userModel");
const Cv = require("../models/cvModel");

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
          // Create new user with Google profile data
          user = new User({
            role: "user",
            email: profile.emails[0].value,
            fname: profile.name.givenName || profile.displayName.split(" ")[0],
            lname:
              profile.name.familyName ||
              profile.displayName.split(" ").slice(1).join(" "),
            isVerified: true, // Social accounts are pre-verified
            photo: profile.photos[0].value,
          });
          await user.save({ validateBeforeSave: false });
          // Create new CV
          const cv = new Cv({
            user: user._id,
            personalInfo: {
              fname: user.fname,
              lname: user.lname,
              photo: user.photo,
              email: user.email,
            },
          });
          await cv.save({ validateBeforeSave: false });
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
      state: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("LinkedIn profile data:", JSON.stringify(profile, null, 2));

      try {
        // Check if user exists with email
        let user = await User.findOne({ email: profile.email });
        if (!user) {
          // Create new user with LinkedIn profile data
          user = new User({
            role: "user",
            email: profile.email,
            fname: profile.givenName || profile.displayName.split(" ")[0],
            lname:
              profile.familyName ||
              profile.displayName.split(" ").slice(1).join(" "),
            isVerified: true, // Social accounts are pre-verified
            photo: profile.picture,
          });
          await user.save({ validateBeforeSave: false });
          // Create new CV
          const cv = new Cv({
            user: user._id,
            personalInfo: {
              fname: user.fname,
              lname: user.lname,
              photo: user.photo,
              email: user.email,
            },
          });
          await cv.save({ validateBeforeSave: false });
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
