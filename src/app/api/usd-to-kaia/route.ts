import { NextResponse } from 'next/server';

export async function GET(){
    try {
        const res = await fetch(`${process.env.COINMARKETCAP_API_URL}/v2/cryptocurrency/quotes/latest?symbol=KAIA&convert=USD`,{
            headers: {
                'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
            },
            next: {
                revalidate: 60, // Cache for 60 seconds
            },
        });
        const {data} = await res.json();
        const kaiaInfo = data['KAIA'][0];
        const usdToKaia = 1 / kaiaInfo?.quote?.USD?.price;
        return NextResponse.json({kaia: usdToKaia});
    } catch (error) {
        console.error('Error fetching KAIA price:', error);
        return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
    }
}

// This API route fetches the current price of KAIA in USD from CoinGecko
// export async function GET() {
//     try {
//         const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kaia&vs_currencies=usd');
//         const data = await res.json();
//
//         const usdToKaia = 1 / data.kaia.usd;
//
//         return NextResponse.json({ kaia: usdToKaia });
//     } catch (error) {
//         console.error('Error fetching KAIA price:', error);
//         return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
//     }
// }
