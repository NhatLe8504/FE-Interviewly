import type { Metadata } from "next";
import Script from "next/script";
import StoreProvider from "@/redux/StoreProvider";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/context/I18nContext";

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
        <StoreProvider>
          <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}