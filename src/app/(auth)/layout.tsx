import "@/styles/user-globals.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="user-root min-h-screen bg-[#f8f4ee] text-[#211914]">
      {children}
    </div>
  );
}