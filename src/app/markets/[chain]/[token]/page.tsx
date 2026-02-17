import { DesktopMarketDetailV2 } from '@/components/Desktop/pages/MarketDetail/v2';

interface MarketDetailPageProps {
  params: Promise<{
    chain: string;
    token: string;
  }>;
}

export default async function MarketDetailPage({ params }: MarketDetailPageProps) {
  const { chain, token } = await params;
  return <DesktopMarketDetailV2 chain={chain} token={token} />;
}
