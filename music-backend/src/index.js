import {
  jwtVerify,
  createRemoteJWKSet,
  SignJWT,
} from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://spodcastv2.vercel.app",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ==========================
    // GOOGLE LOGIN
    // ==========================
    if (
      request.method === "POST" &&
      url.pathname === "/api/auth/google"
    ) {
      try {
        const { idToken } = await request.json();

        const { payload } = await jwtVerify(
          idToken,
          GOOGLE_JWKS,
          {
            issuer: [
              "accounts.google.com",
              "https://accounts.google.com",
            ],
            audience:
              env.GOOGLE_CLIENT_ID,
          }
        );

        const googleId = payload.sub;
        const email = payload.email;
        const name = payload.name;
        const avatar = payload.picture;

        let user = await env.music_db
          .prepare(
            "SELECT * FROM users WHERE google_id = ?"
          )
          .bind(googleId)
          .first();

        if (!user) {
          await env.music_db
            .prepare(
              `
              INSERT INTO users
              (google_id,email,name,avatar)
              VALUES (?,?,?,?)
            `
            )
            .bind(
              googleId,
              email,
              name,
              avatar
            )
            .run();

          user = await env.music_db
            .prepare(
              "SELECT * FROM users WHERE google_id = ?"
            )
            .bind(googleId)
            .first();
        }

        // JWT Generate
        const secret =
          new TextEncoder().encode(
            env.JWT_SECRET
          );

        const token =
          await new SignJWT({
            id: user.id,
            googleId,
            email,
          })
            .setProtectedHeader({
              alg: "HS256",
            })
            .setIssuedAt()
            .setExpirationTime("30d")
            .sign(secret);

        return Response.json(
          {
            success: true,
            token,
            user,
          },
          {
            headers: corsHeaders,
          }
        );
      } catch (err) {
        console.error(
          "AUTH ERROR:",
          err
        );

        return Response.json(
          {
            success: false,
            error: err.message,
          },
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }
    }

    // ==========================
    // PROFILE API
    // ==========================
    if (
      request.method === "GET" &&
      url.pathname === "/api/user/me"
    ) {
      try {
        const authHeader =
          request.headers.get(
            "Authorization"
          );

        if (!authHeader) {
          return Response.json(
            {
              success: false,
              message:
                "No token provided",
            },
            {
              status: 401,
              headers: corsHeaders,
            }
          );
        }

        const token =
          authHeader.replace(
            "Bearer ",
            ""
          );

        const secret =
          new TextEncoder().encode(
            env.JWT_SECRET
          );

        const { payload } =
          await jwtVerify(
            token,
            secret
          );

        const user =
          await env.music_db
            .prepare(
              "SELECT * FROM users WHERE id = ?"
            )
            .bind(payload.id)
            .first();

        if (!user) {
          return Response.json(
            {
              success: false,
              message:
                "User not found",
            },
            {
              status: 404,
              headers: corsHeaders,
            }
          );
        }

        return Response.json(
          {
            success: true,
            user,
          },
          {
            headers: corsHeaders,
          }
        );
      } catch (err) {
        return Response.json(
          {
            success: false,
            message:
              "Invalid token",
          },
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }
    }

    return Response.json(
      {
        success: true,
        message:
          "Worker Running 🚀",
      },
      {
        headers: corsHeaders,
      }
    );
  },
};