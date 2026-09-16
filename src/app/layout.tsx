import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "AI Interview Coach | Practice with clarity",
  description:
    "Practice job interviews with an AI coach, structured feedback, and progress you can see.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}