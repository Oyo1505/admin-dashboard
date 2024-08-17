import NextAuth, { User } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { JWT } from "next-auth/jwt";
import { getAuthorizedEmails } from "@/components/auth/action/action";

const prisma = new PrismaClient()

// const GOOGLE_AUTHORIZATION_URL =
//   "https://accounts.google.com/o/oauth2/v2/auth?" +
//   new URLSearchParams({
//     prompt: "consent",
//     access_type: "offline",
//     response_type: "code",
//   })


/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */


async function refreshAccessToken(token:JWT) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      })

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log(error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}
export const { handlers, auth, signIn, signOut } = NextAuth ({
  adapter: PrismaAdapter(prisma),
  providers : [Google({
    clientId:process.env.NEXT_PUBLIC_GOOGLE_ID,
    clientSecret: process.env.NEXT_PUBLIC_GOOGLE_SECRET,
    authorization: {  
      params: {
      access_type: 'offline',
      prompt: 'consent',
    }, },
})],
  session: { strategy: "jwt",  
    maxAge: 60 * 60 * 2, 
    updateAge: 10 * 60, },
  callbacks: {
    async signIn({ user }) {
      const { mails } = await getAuthorizedEmails()
      const usersEmail = mails?.map((item: any) => item?.email)
      
       if(user?.email && !usersEmail?.includes(user?.email)) return false
      return true
    },
    async jwt({ token, account, profile }) {
      
      if (account) {
        // First login, save the `access_token`, `refresh_token`, and other
        // details into the JWT

        const userProfile: User = {
          id: token.sub,
          name: profile?.name,
          email: profile?.email,
          image: token?.picture,
              
        }
      
        return {
          id_token : account.id_token,
          access_token: account.access_token,
          expires_at: Math.floor(Date.now() / 1000) + (account.expires_in || 60 * 60),
          refresh_token: account.refresh_token,
          user: userProfile,
        }
      } else if (token.expires_at && Date.now() < Number(token.expires_at) * 1000) {
     
        // Subsequent logins, if the `access_token` is still valid, return the JWT
        return token
      } else {
        // Subsequent logins, if the `access_token` has expired, try to refresh it
        if (!token.refresh_token) throw new Error("Missing refresh token")
 
        try {
          // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
          // at their `/.well-known/openid-configuration` endpoint.
          // i.e. https://accounts.google.com/.well-known/openid-configuration
          const response = await refreshAccessToken(token)

          //@ts-ignore
          const responseTokens = await response.json() 
          //@ts-ignore
          if (!response.ok) throw responseTokens
 
          return {
            // Keep the previous token properties
            ...token,
            access_token: responseTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + (responseTokens.expires_in as number)),
            // Fall back to old refresh token, but note that
            // many providers may only allow using a refresh token once.
            refresh_token: responseTokens.refresh_token ?? token.refresh_token,
          }
        } catch (error) {
          console.error("Error refreshing access token", error)
          // The error property can be used client-side to handle the refresh token error
          return { ...token, error: "RefreshAccessTokenError" as const }
        }
      }
    },
    async redirect({ url }) {
      return process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/home` : url
    },
    async session({ session, token }: { session: any, token: any}) {
 
      session.accessToken = token.access_token;
      session.idToken = token.id_token;
      session.refreshToken = token.refresh_token;
      session.error = token.error;
      session.expiresAt = token.expires_at
      session.user = token.user
  
      return session
    }
  },


})