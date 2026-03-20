import { redirect } from "next/navigation";

import { getServerMeSafe } from "../lib/auth";
import LoginClient from "./login-client";

type LoginSearchParams =
  | Promise<{
      created?: string | string[];
      email?: string | string[];
    }>
  | {
      created?: string | string[];
      email?: string | string[];
    };

function getSearchValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const me = await getServerMeSafe();
  if (me) redirect("/dashboard");

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const created = getSearchValue(resolvedSearchParams.created) === "1";
  const email = getSearchValue(resolvedSearchParams.email) || "";

  return <LoginClient accountCreated={created} createdEmail={email} />;
}
