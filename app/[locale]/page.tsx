import { setRequestLocale } from "next-intl/server";
import { HeroScroll } from "./HeroScroll";
import { Navbar } from "./Navbar";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <Navbar />
      <HeroScroll />
    </main>
  );
}
