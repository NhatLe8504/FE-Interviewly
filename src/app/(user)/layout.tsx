import "@/styles/user-globals.css";
import Header from "@/components/user-component/layout/Header";
import Footer from "@/components/user-component/layout/Footer";

export default function UserLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth?: React.ReactNode;
}>) {
  return (
    <div className="user-root min-h-screen flex flex-col justify-between">
      <Header />
      <main className="flex-1">{children}</main>
      {auth}
      <Footer />
    </div>
  );
}