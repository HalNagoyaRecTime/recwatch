import { redirect } from "react-router";

export function loader() {
  return redirect("/dashboard");
}

export default function IndexRoute() {
  return null;
}
