import type { Metadata } from "next";
import "../styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "EduPresence Dashboard",
  description: "Sistema de controle de frequência acadêmica",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full overflow-hidden">
        <div className="h-full min-h-0 min-w-0">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
