import { redirect } from "next/navigation";

import { getServerMeSafe } from "../lib/auth";
import SignupClient from "./signup-client";

export default async function SignupPage() {
  const me = await getServerMeSafe();
  if (me) redirect("/dashboard");

  return <SignupClient />;
}
