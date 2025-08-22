import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const { status, paymentId } = data;

        if(status === 'CONFIRMED'){
            await fetch(`${process.env.BASE_API_URL}/api/payment/finalize`,{
                method: "POST",
                headers:{
                    "X-Client-Id": process.env.NEXT_PUBLIC_CLIENT_ID as string,
                    "X-Client-Secret": process.env.CLIENT_SECRET as string,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({id: paymentId}),
            })
        }

        return NextResponse.json(
            { message: "POST request received" },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Payment is failed" }, { status: 400 });
    }
}
