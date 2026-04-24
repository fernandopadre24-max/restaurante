
import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Toaster } from "@/components/ui/toaster"
import { RestaurantProvider } from "@/context/RestaurantContext"

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
        <RestaurantProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <main className="flex-1 overflow-auto p-4 md:p-8">
                {children}
              </main>
            </div>
            <Toaster />
          </SidebarProvider>
        </RestaurantProvider>
      </body>
    </html>
  );
}
