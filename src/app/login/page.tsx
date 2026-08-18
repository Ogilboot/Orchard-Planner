import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; verified?: string }>;
}) {
  const { reset, verified } = await searchParams;

  let message: string | undefined;
  if (verified) {
    message = "Your email is verified — you can sign in now.";
  } else if (reset) {
    message = "Your password was reset — sign in with your new password.";
  }

  return <LoginForm message={message} />;
}