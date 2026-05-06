/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { UserInfo } from "@/types/user.interface";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getCookie } from "./tokenHandler";

export const getUserInfo = async (): Promise<UserInfo | null> => {
  try {
    const accessToken = await getCookie("accessToken");

    if (!accessToken) {
      return null;
    }

    const verifiedToken = jwt.verify(
      accessToken,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    if (!verifiedToken) {
      return null;
    }

    const userInfo: UserInfo = {
      name: verifiedToken.name || "Unknown User",
      email: verifiedToken.email,
      role: verifiedToken.role,
    };

    return userInfo;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};
