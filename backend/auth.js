import passport from 'passport';
import { findOrCreate } from './db';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    findOrCreate(profile.id, profile.displayName, profile.emails[0].value, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (user, done) {
  try {
    const user = await getUser(id); 
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});