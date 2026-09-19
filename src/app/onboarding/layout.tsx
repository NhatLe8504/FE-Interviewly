import "@/styles/user-globals.css";
import { UserToaster } from "@/components/user-component/toast";

export default function OnboardingStandaloneLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-screen bg-white text-[#211914] antialiased overflow-hidden">
      <UserToaster />
      {children}
    </div>
  );
}