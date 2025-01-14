import passport from 'passport';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const GOOGLE_CLIENT_ID = `240896014026-79fd82ku0sgjmrn6921pmlvvgkbbkv1i.apps.googleusercontent.com`;
const GOOGLE_CLIENT_SECRET = `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`;

//TODO: ENVIROMENT VARIABLES!!!!!

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
    //todo??????
  }
));
