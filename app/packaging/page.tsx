import Link from "next/link";
import Packaging from "@/components/Packaging";

export default function PackagingPage() {
  return (
    <main className="min-h-[75svh]">
      <Packaging />
      <div className="mx-auto max-w-5xl px-4 pb-16 text-center">
        <Link href="/calc" className="inline-block rounded-full bg-orange-400 px-7 py-3.5 font-bold text-[#0B1B3A] shadow-lg shadow-orange-300/60">
          Подобрать рацион
        </Link>
      </div>
    </main>
  );
}