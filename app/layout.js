import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "Hostel Complaints",
  description: "Hostel complaint tracking system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
