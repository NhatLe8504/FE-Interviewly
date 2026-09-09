export default function UserLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  return (
    <>
      {children}
      {auth}
    </>
  );
}
