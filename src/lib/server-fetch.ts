import { getCookie } from "@/services/auth/tokenHandler";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:5000/api/v1";

// /auth/login
const serverFetchHelper = async (
  endpoint: string,
  options: RequestInit,
): Promise<Response> => {
  const { headers, ...restOptions } = options;

  console.log({ body: options.body });

  const accessToken = await getCookie("accessToken");

  const response = await fetch(`${BACKEND_API_URL}${endpoint}`, {
    headers: {
      ...headers,
      // Backend a token ke get kore every api a oi user Authenticate and authorize korar jonno token use kore. Sei token jodi backend a headers er maddhome get kore tahole front-end theke api call kora somoi sei accessToken ke pass korte hoi. But jodi cookie theke get kore backend a. Tahole frontend theke cookie ke manualy send korte hoina. Request er somoi automatic jai and cookie er maddhome token pass kore besi secure. Amra PH backend a cookie theke get koresi. But jeheto amra NextJs er server component theke api call kortesi, jar fole backend sei token ke access korte pabena directly. Jemonta login korar somoi amra dekhesi. Login hole direct browser er cookie te token set hossena. set hoto jodi server compoentn er maddhome api call na kore client component er maddhome call kotam. Similarly aikhanew api call korar somoi sei token ke manually cookie er maddhome pass korte hobe.

      // ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),   // Bearer token aivabe pass korle, backend a split kore Bearer ke remove korte hobe.

      // ...(accessToken ? { "Authorization": accessToken } : {}), // Ar backend a Barer use na korle direct sudho token ta pass korlei hobe.

      Cookie: accessToken ? `accessToken=${accessToken}` : "", // Amra jeheto cookie theke get kortesi backend a tai, aivabe send korbo.
    },
    ...restOptions,
  });

  return response;
};

export const serverFetch = {
  get: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: "GET" }),

  post: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: "POST" }),

  put: async (endpoint: string, options: RequestInit = {}): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: "PUT" }),

  patch: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: "PATCH" }),

  delete: async (
    endpoint: string,
    options: RequestInit = {},
  ): Promise<Response> =>
    serverFetchHelper(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Kono compoennt theke aivabe call korbo. Tahole method ta automatic set hoye jabe.
 * serverFetch.get("/auth/me")
 * serverFetch.post("/auth/login", { body: JSON.stringify({}) })
 */
