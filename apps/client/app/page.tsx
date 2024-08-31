import { trpc } from "./trpc";
import ClientSide from "./ClientSide";

export default async function Home() {
  const { greeting } = await trpc.hello.query({ name: "Bilbo" });
  console.log(greeting);
  return (
    <div>
      <ClientSide />
    </div>
  );
}
