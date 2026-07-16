import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: "Teacher Dashboard | PurpleStars School",
    description: "A calm, modern teacher workspace for classes, attendance, results and school updates.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "PurpleStars Teacher Dashboard",
      description: "Everything you need for a smooth school day, all in one place.",
      type: "website",
      url: baseUrl,
      images: [{ url: socialImage, width: 1731, height: 909, alt: "PurpleStars — A calmer, clearer school day." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "PurpleStars Teacher Dashboard",
      description: "A calmer, clearer school day for teachers.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
