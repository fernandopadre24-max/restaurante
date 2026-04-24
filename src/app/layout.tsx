
import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { RestaurantProvider } from "@/context/RestaurantContext"
import { AuthProvider } from "@/context/AuthContext"
import { AuthWrapper } from "@/components/AuthWrapper"
import LayoutContent from "@/components/layout/LayoutContent"

export const metadata: Metadata = {
  title: 'ChefPro - Gestão de Restaurantes',
  description: 'Gestão moderna e inteligente para o seu restaurante.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <AuthProvider>
          <RestaurantProvider>
            <SidebarProvider>
              <AuthWrapper>
                <LayoutContent>
                  {children}
                </LayoutContent>
              </AuthWrapper>
              <Toaster />
            </SidebarProvider>
          </RestaurantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
