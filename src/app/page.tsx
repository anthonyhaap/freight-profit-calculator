export default function Home() {
  return (
    <main>
      <h1>Freight Profit Calculator</h1>
    </main>
  );
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/calculator");
}
