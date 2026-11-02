import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PublicNavigationHistory } from "@/components/layout/PublicNavigationHistory";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PublicNavigationHistory><Header />{children}<Footer /></PublicNavigationHistory>;
}
