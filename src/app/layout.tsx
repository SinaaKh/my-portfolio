import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Cursor } from "@/components/layout/cursor";
import { Nav } from "@/components/layout/nav";
import { Footer } from "@/components/sections/footer";
import { site } from "@/content/site";

// Same family and weights as the reference. 900 is intentionally not loaded,
// so `font-black` renders at 800 like the original.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Site-wide defaults. Each page adds its own canonical URL and social card via pageMetadata().
export const metadata: Metadata = {
  metadataBase: new URL(site.meta.url),
  title: {
    default: site.meta.title,
    template: site.meta.titleTemplate,
  },
  description: site.meta.description,
  applicationName: site.meta.name,
  authors: [{ name: site.meta.name, url: site.meta.url }],
  creator: site.meta.name,
  keywords: site.meta.keywords,
  icons: {
    icon: [
      { url: site.meta.icons.svg, type: "image/svg+xml" },
      { url: site.meta.icons.png, sizes: "32x32", type: "image/png" },
    ],
    apple: site.meta.icons.apple,
  },
  openGraph: {
    type: "website",
    locale: site.meta.locale,
    siteName: site.meta.name,
    title: site.meta.title,
    description: site.meta.description,
    images: [{ url: site.meta.ogImage.src, width: site.meta.ogImage.width, height: site.meta.ogImage.height, alt: site.meta.ogImage.alt }],
  },
  twitter: {
    card: "summary_large_image",
    images: [site.meta.ogImage.src],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} antialiased`}>
      <body className="bg-paper font-sans text-ink">
        <Providers>
          <a
            href="#main"
            className="sr-only z-[10001] rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            {site.nav.skipLabel}
          </a>
          <Cursor />
          <Nav />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
