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
    title: "PurpleStars School | Every Child Thrives",
    description: "A caring school community in Lagos nurturing global stars of character, competence and purpose, from Crèche to College.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "PurpleStars School | Every Child Thrives",
      description: "Where every child is known, valued and inspired to shine.",
      type: "website",
      url: baseUrl,
      images: [{ url: socialImage, width: 1731, height: 909, alt: "PurpleStars School — where every child learns to shine." }],
    },
    twitter: {
      card: "summary_large_image",
      title: "PurpleStars School | Every Child Thrives",
      description: "Where every child is known, valued and inspired to shine.",
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
