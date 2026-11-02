import { SiteHeader } from "@/components/site-header";
import { Diary } from "@/components/diary";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="wrap"><Diary /></main>
    </>
  );
}
