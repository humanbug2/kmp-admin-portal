import { Inter } from "next/font/google";
import UploadWSubmit from "@/components/UploadWSubmit";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className="h-[100vh]">
      <h1 className="p-12 text-3xl font-bold text-center">Upload Files</h1>
      <div className="mt-10 border border-neutral-200 p-16 bg-gray-400 rounded-2xl">
        <UploadWSubmit />
      </div>
    </div>
  );
}
