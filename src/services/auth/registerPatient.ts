/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import z from "zod";

const registerValidationZodSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    address: z.string().optional(),
    email: z.email({ message: "Valid email is required" }),
    password: z
      .string()
      .min(6, {
        error: "Password is required and must be at least 6 characters long",
      })
      .max(100, {
        error: "Password must be at most 100 characters long",
      }),
    confirmPassword: z.string().min(6, {
      error:
        "Confirm Password is required and must be at least 6 characters long",
    }),
  })
  .refine((data: any) => data.password === data.confirmPassword, {
    error: "Passwords do not match",
    path: ["confirmPassword"],
  });

// aikhane currentState er age _currentState diyechi karon amra currentState use korbo na, but parameter ta thakbe function signature er jonno
export const registerPatient = async (
  _currentState: any,
  formData: any,
): Promise<any> => {
  try {
    const validationData = {
      name: formData.get("name"),
      address: formData.get("address"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const validatedFields =
      registerValidationZodSchema.safeParse(validationData);

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

    // aikahne registerData name a arekta object nia formData theke data gulo ber kore nissi. Abar sei data gulo ke new FormData() er moddhe append kortesi. er main reason holo formdata er moddhe akta object er moddhe all property ase. But backend a amra jei payload pathabo tar structure holo {password: "", patient:{aikhane aro property}}. But formData te ai format a na thakai registerData namer variable a store kore. Abar formData te appand korte hosse. Othwersie uprer formData ke api te direct send korte partam.

    // [Note: aikhane amra normal object ba json na send kore formData send kortesi. Karon backend a ai api a fileUpload system rakha ase. Jar jonno oi api a formDatar maddhome data recive kortese. Ar jodi backend a file upload system na rakhbo or formaDatar maddhome na get korto tahole aikhane normal json object a send kortam.]
    const registerData = {
      password: formData.get("password"),
      patient: {
        name: formData.get("name"),
        email: formData.get("email"),
        address: formData.get("address"),
      },
    };

    const newFormData = new FormData();
    newFormData.append("data", JSON.stringify(registerData));

    const res = await fetch(
      "http://localhost:5000/api/v1/user/create-patient",
      {
        method: "POST",
        body: newFormData,
      },
    ).then((res) => res.json());

    console.log(res, "response from api");
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
};
