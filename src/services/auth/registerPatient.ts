/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { registerPatientValidationZodSchema } from "@/zod/auth.validation";
import { loginUser } from "./loginUser";

export const registerPatient = async (
  _currentState: any,
  formData: any,
): Promise<any> => {
  try {
    console.log(formData.get("address"));
    const payload = {
      name: formData.get("name"),
      address: formData.get("address"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    if (
      zodValidator(payload, registerPatientValidationZodSchema).success ===
      false
    ) {
      return zodValidator(payload, registerPatientValidationZodSchema);
    }

    // aikahne registerData name a arekta object nia formData theke data gulo ber kore nissi. Abar sei data gulo ke new FormData() er moddhe append kortesi. er main reason holo formdata er moddhe akta object er moddhe all property ase. But backend a amra jei payload pathabo tar structure holo {password: "", patient:{aikhane aro property}}. But formData te ai format a na thakai registerData namer variable a store kore. Abar formData te appand korte hosse. Othwersie uprer formData ke api te direct send korte partam.

    // [Note: aikhane amra normal object ba json na send kore formData send kortesi. Karon backend a ai api a fileUpload system rakha ase. Jar jonno oi api a formDatar maddhome data recive kortese. Ar jodi backend a file upload system na rakhbo or formaDatar maddhome na get korto tahole aikhane normal json object a send kortam.]
    const validatedPayload: any = zodValidator(
      payload,
      registerPatientValidationZodSchema,
    ).data;
    const registerData = {
      password: validatedPayload.password,
      patient: {
        name: validatedPayload.name,
        address: validatedPayload.address,
        email: validatedPayload.email,
      },
    };

    const newFormData = new FormData();

    newFormData.append("data", JSON.stringify(registerData));

    if (formData.get("file")) {
      newFormData.append("file", formData.get("file") as Blob);
    }

    const res = await serverFetch.post("/user/create-patient", {
      body: newFormData,
    });

    const result = await res.json();

    if (result.success) {
      await loginUser(_currentState, formData);
    }

    return result;
  } catch (error: any) {
    // Re-throw NEXT_REDIRECT errors so Next.js can handle them
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error.message : "Registration Failed. Please try again."}`,
    };
  }
};
