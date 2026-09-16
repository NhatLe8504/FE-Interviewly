import "@/styles/admin-globals.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-root min-h-screen bg-background text-foreground antialiased">
      {children}
    </div>
  );
}