import { prisma } from "@/src/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const FixedPrismaAdapter = PrismaAdapter(prisma) as any;

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  adapter: FixedPrismaAdapter,
  theme: {
    logo: "/onlineclass.svg",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
          role: profile.role ? profile.role : "user",
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
