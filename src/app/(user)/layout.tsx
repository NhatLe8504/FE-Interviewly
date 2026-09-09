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
    <>
      <Header />
      {children}
      {auth}
      <Footer />
    </>
  );
}
