import { Suspense } from "react";
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
      className="text-gray-600 dark:text-gray-300 dark:bg-black"
      lang="en"
    >
      <body>
        <Suspense>
          <Nav>
            <div className="flex w-full h-full p-5 self-stretch grow flex-col">
              {children}
            </div>
          </Nav>
        </Suspense>
      </body>
    </html>
  );
}
