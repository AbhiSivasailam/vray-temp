import "./globals.css";
import { Nav } from "./nav";

export const metadata = {
  title: "Get Headers tool",
  description: "Tool to get headers from a website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className="text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-900"
      lang="en"
    >
      <body>
        <Nav>{children}</Nav>
      </body>
    </html>
  );
}
