import { redirect } from "next/navigation";

import { getServerMeSafe } from "../lib/auth";
import { buildSignupPlans, getServerPricing } from "../lib/pricing";
import SignupClient from "./signup-client";

export default async function SignupPage() {
  const me = await getServerMeSafe();
  if (me) redirect("/dashboard");

  const pricing = await getServerPricing();
  const plans = buildSignupPlans(pricing);

  return <SignupClient plans={plans} />;
}
