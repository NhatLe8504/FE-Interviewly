import "@/styles/user-globals.css";
import Header from "@/components/user-component/layout/Header";
import Footer from "@/components/user-component/layout/Footer";
import { UserToaster } from "@/components/user-component/toast";

import { UserOnboardingGuard } from "@/components/auth/UserOnboardingGuard";

export default function UserLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth?: React.ReactNode;
}>) {
  return (
    <div className="user-root min-h-screen flex flex-col justify-between">
      <UserToaster />
      <Header />
      <main className="flex-1">
        <UserOnboardingGuard>{children}</UserOnboardingGuard>
      </main>
      {auth}
      <Footer />
    </div>
  );
}