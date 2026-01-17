import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    debug: true,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.name,
                    email: profile.email,
                    image: profile.picture,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            console.log("JWT Callback - Token:", token);
            if (user) {
                token.id = user.id;
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Session Callback - Session User:", session.user);
            if (token?.id && session.user) {
                session.user.id = token.id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};