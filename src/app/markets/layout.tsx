"use client";

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="markets-layout">
      {children}
    </div>
  );
}
