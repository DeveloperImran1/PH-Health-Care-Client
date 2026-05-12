/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";

export async function getReviews(queryString?: string) {
    try {
        const url = queryString ? `/review?${queryString}` : "/review";

        const response = await serverFetch.get(url);
        const result = await response.json();

        return {
            success: true,
            data: result.data,
            meta: result.meta,
        };
    } catch (error: any) {
        console.error("Get reviews error:", error);
        return {
            success: false,
            message: error.message || "Failed to fetch reviews",
            data: null,
        };
    }
}