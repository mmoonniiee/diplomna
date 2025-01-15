import passport from 'passport';
import { findAndCreate } from './db';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    findAndCreate(profile.id, profile.displayName, profile.emails[0].value, function (err, user) {
      return cb(err, user);
    });
    //todo
  }
));

passport.serializeUser(function (user, done) {
    done(null, user);
    //todo
});

passport.deserializeUser(function (user, done) {
    done(null, user);
    //todo
});