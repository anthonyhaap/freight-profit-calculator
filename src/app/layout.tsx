import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Freight Profit Calculator",
  description: "Calculate freight shipping profits",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
