import { AuthPage } from "@/components/auth/AuthPage";

export default function ResetPasswordPage() {
  return (
    <AuthPage
      title="Reset password"
      subtitle="Let get start & enter your details to reset your password"
      footer={
        <p className="text-center text-[14px] leading-[24px] text-black">
          Back to <a href="/login" className="font-bold uppercase">LOG IN</a>
        </p>
      }
    >
      <div className="rounded-none border border-dashed border-black/40 bg-white p-8 text-center text-sm text-black/70">
        Reset password form will be added here in the future.
      </div>
    </AuthPage>
  );
}
