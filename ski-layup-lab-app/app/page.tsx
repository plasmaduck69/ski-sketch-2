import { redirect } from "next/navigation";

// /lab checks the session and sends signed-out visitors to /login.
export default function Home() {
  redirect("/lab");
}
