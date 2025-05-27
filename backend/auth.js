
import passport from 'passport';
import { findOrCreate } from './db.js';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback"
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      const user = await findOrCreate(profile.id, profile.displayName, profile.emails[0].value);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

