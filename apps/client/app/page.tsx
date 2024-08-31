"use client";
import { trpc } from "./trpc";
import ClientSide from "./ClientSide";
import { useRouter } from "next/navigation";

export default async function Home() {
  //   const { greeting } = await trpc.hello.query({ name: "Bilbo" });
  //   console.log(greeting);
  const router = useRouter();
  const goToCopy = () => {
    router.push("/copy");
  };
  const goToPaste = () => {
    router.push("/paste");
  };
  return (
    <div className="App flex min-h-screen">
      <div className="flex justify-center items-center w-1/2 bg-gray-200">
        <h3 className="text-black">Copy on this screen</h3>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={goToCopy}
        >
          COPY
        </button>
      </div>

      <div className="flex justify-center items-center w-1/2 bg-gray-100">
        <h3 className="text-black">paste on this creen</h3>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={goToPaste}
        >
          PASTE
        </button>
      </div>
    </div>
  );
}
