import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { ROLES } from "@/lib/roles";

const fallbackUsers = [
  {
    id: "env-admin",
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "assist2026",
    name: "Administrator",
    email: "admin@assist.local",
    role: ROLES.ADMIN,
  },
  {
    id: "env-support-digital",
    username: process.env.SUPPORT_DIGITAL_USERNAME || "support",
    password: process.env.SUPPORT_DIGITAL_PASSWORD || "assist2026",
    name: "Support Digital",
    email: "support.digital@assist.local",
    role: ROLES.SUPPORT_DIGITAL,
  },
  {
    id: "env-service-manager",
    username: process.env.SERVICE_MANAGER_USERNAME || "manager",
    password: process.env.SERVICE_MANAGER_PASSWORD || "assist2026",
    name: "Service Manager",
    email: "service.manager@assist.local",
    role: ROLES.SERVICE_MANAGER,
  },
].map((user) => ({
  ...user,
  username: user.username.trim(),
  password: user.password.trim(),
}));

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const inputUsername = String(credentials?.username ?? "").trim();
        const inputPassword = String(credentials?.password ?? "").trim();

        const fallbackUser = fallbackUsers.find(
          (user) =>
            user.username === inputUsername && user.password === inputPassword
        );

        if (fallbackUser) {
          return {
            id: fallbackUser.id,
            name: fallbackUser.name,
            email: fallbackUser.email,
            role: fallbackUser.role,
          };
        }

        const user = await prisma.user.findUnique({
          where: { username: inputUsername },
        });

        if (
          user?.is_active &&
          (await verifyPassword(inputPassword, user.password_hash))
        ) {
          return {
            id: String(user.id),
            name: user.name,
            email: `${user.username}@assist.local`,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
