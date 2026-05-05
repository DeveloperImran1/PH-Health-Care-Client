/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import {
  getDefaultDashboardRoute,
  isValidRedirectForRole,
  UserRole,
} from "@/lib/auth-utils";
import { parse } from "cookie";

import jwt, { JwtPayload } from "jsonwebtoken";
import { redirect } from "next/navigation";
import z from "zod";
import { setCookie } from "./tokenHandler";

const loginValidationZodSchema = z.object({
  email: z.email({
    message: "Email is required",
  }),
  password: z
    .string("Password is required")
    .min(6, {
      error: "Password is required and must be at least 6 characters long",
    })
    .max(100, {
      error: "Password must be at most 100 characters long",
    }),
});

export const loginUser = async (
  _currentState: any,
  formData: any,
): Promise<any> => {
  try {
    const redirectTo = formData.get("redirect") || null;
    let accessTokenObject: null | any = null;
    let refreshTokenObject: null | any = null;
    const loginData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validatedFields = loginValidationZodSchema.safeParse(loginData);

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.issues.map((issue) => {
          return {
            field: issue.path[0],
            message: issue.message,
          };
        }),
      };
    }

    // aikhane login data ke kinto formData te convert kore send korini. Karon backend a api data ta json format a nissa. formData format a noi. tai JSON.stiryfy(loginData) kore sudho send koresi. and headers dita hoiase. headers er moddhe bole dita hobe content er type json.
    const res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(loginData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await res.json();

    // Login thikvabe done. But cookie te token set hossena. Jodio backend er api te likha ase frontend er cookie te token set korar kotha. But amra NextJS er server er maddhome api call kortesi. Tai NextJS er client ba front-end porjonto sei token jassena. Aitar jonno akto kaj korte hobe.
    const setCookieHeaders = res.headers.getSetCookie();

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie: string) => {
        const parsedCookie = parse(cookie);

        if (parsedCookie["accessToken"]) {
          accessTokenObject = parsedCookie;
        }
        if (parsedCookie["refreshToken"]) {
          refreshTokenObject = parsedCookie;
        }
      });
    } else {
      throw new Error("No Set-Cookie header found");
    }

    if (!accessTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    if (!refreshTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    // Upore cookie use koresi, oita akta npm package. But cookies() aita nextjs er akkta function. Jeita browser a cookie te cookie set kore. 2ta different.

    await setCookie("accessToken", accessTokenObject.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: parseInt(accessTokenObject["Max-Age"]) || 1000 * 60 * 60,
      path: accessTokenObject.Path || "/",
      sameSite: accessTokenObject["SameSite"] || "none",
    });

    await setCookie("refreshToken", refreshTokenObject.refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge:
        parseInt(refreshTokenObject["Max-Age"]) || 1000 * 60 * 60 * 24 * 90,
      path: refreshTokenObject.Path || "/",
      sameSite: refreshTokenObject["SameSite"] || "none",
    });
    const verifiedToken: JwtPayload | string = jwt.verify(
      accessTokenObject.accessToken,
      process.env.JWT_SECRET as string,
    );

    if (typeof verifiedToken === "string") {
      throw new Error("Invalid token");
    }

    const userRole: UserRole = verifiedToken.role;

    if (!result.success) {
      // throw new Error(result.message || "Login failed");
      throw new Error(
        `${process.env.NODE_ENV === "development" ? result.message : "Login failed"}`,
      );
    }

    if (redirectTo) {
      const requestedPath = redirectTo.toString();
      if (isValidRedirectForRole(requestedPath, userRole)) {
        redirect(`${requestedPath}?loggedIn=true`);
      } else {
        redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
      }
    } else {
      redirect(`${getDefaultDashboardRoute(userRole)}?loggedIn=true`);
    }
  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors so Next.js can handle them
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error; // aikhane kinto throw new Error() kortesina. Aikhane sudho throw error. kortesi. Jeita nextJS er error ke re-throw kore.
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error.message : "Login Failed. You might have entered incorrect email or password."}`,
    };
  }
};
