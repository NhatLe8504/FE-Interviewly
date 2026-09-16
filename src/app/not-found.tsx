import Link from "next/link";
import "@/styles/user-globals.css";

export default function NotFound() {
  return (
    <main className="user-root min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-3">404 - Page Not Found</h1>
      <p className="text-stone-600 mb-6">The page you are looking for does not exist.</p>
      <Link href="/" className="px-5 py-2.5 bg-[#211914] text-white rounded-lg hover:opacity-90 transition">
        Back to Home
      </Link>
    </main>
  );
}