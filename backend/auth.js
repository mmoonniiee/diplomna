import passport from 'passport';
import { findOrCreate } from './db.js';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    console.log('access token:', accessToken);
    console.log('refresh token:', refreshToken);
    //TODO: get pfp
    try {
      const user = await findOrCreate(profile.id, profile.displayName, profile.emails[0].value);
      console.log('user:', user);
      return cb(null, user);
    } catch (err) {
      return cb(err, null);
    }
  }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function (_user, done) {
  try {
    const user = await getUser(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});