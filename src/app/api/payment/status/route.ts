import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("id");

    if (!paymentId) {
        return NextResponse.json(
            { message: "Missing paymentId in query" },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(`https://payment.dappportal.io/api/payment-v1/payment/status?id=${paymentId}`, {
            method: "GET",
            headers: {
                "X-Client-Id": process.env.NEXT_PUBLIC_CLIENT_ID as string,
                "X-Client-Secret": process.env.CLIENT_SECRET as string,
            },
            cache: "no-store", // optional: Netlify/Next.js edge 캐싱 방지
        });

        if (!res.ok) {
            return NextResponse.json(
                { message: "Failed to fetch payment info" },
                { status: res.status }
            );
        }

        const data = await res.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching payment info:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}