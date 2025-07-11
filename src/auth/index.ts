import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "../config";
import { VerifyFunction } from "passport-local";
import {
  Profile as GoogleProfile,
  VerifyCallback as GoogleVerifyCallback,
} from "passport-google-oauth20";
import {
  Profile as FacebookProfile,
  VerifyFunction as FacebookVerifyFunction,
} from "passport-facebook";

const prisma = new PrismaClient();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (
      email: string,
      password: string,
      done: (error: any, user?: any, options?: any) => void
    ) => {
      try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password)
          return done(null, false, { message: "Incorrect email or password." });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return done(null, false, { message: "Incorrect email or password." });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: "/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: GoogleVerifyCallback
    ) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0]?.value || "",
              name: profile.displayName,
              emailVerified: true,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: config.facebook.clientId,
      clientSecret: config.facebook.clientSecret,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "displayName"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: FacebookProfile,
      done: (error: any, user?: any, info?: any) => void
    ) => {
      try {
        let user = await prisma.user.findUnique({
          where: { facebookId: profile.id },
        });
        if (!user) {
          user = await prisma.user.create({
            data: {
              facebookId: profile.id,
              email: profile.emails?.[0]?.value || "",
              name: profile.displayName,
              emailVerified: true,
            },
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
