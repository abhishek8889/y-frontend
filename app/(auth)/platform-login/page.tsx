import { AuthPage } from "@/components/auth/AuthPage";
import IconCard, { EYE_OPEN_ICON } from "@/components/ui/IconCard";
import { InputField } from "@/components/ui/InputField";

export default function PlatformLoginPage() {
  return (
    <AuthPage
      title="LOG IN"
      subtitle="Enter your details to access your account"
      footer={
        <p className="text-center text-[16px] leading-[24px] text-black">
          SUPER ADMIN PORTAL
        </p>
      }
    >
      <div className="space-y-[22px]">
        <InputField
          label="Email"
          type="email"
          placeholder="Enter your email"
          name="email"
          autoComplete="email"
        />

        <InputField
          label="Password"
          type="password"
          placeholder="Enter password"
          name="password"
          autoComplete="current-password"
          suffix={
            <span className="flex h-[20px] w-[20px] items-center justify-center text-black/70">
              <IconCard name={EYE_OPEN_ICON} className="h-4 w-4" />
            </span>
          }
        />

        <div className="mb-0 pb-[40px]">
          <button
            type="button"
            className="cursor-pointer text-left text-[16px] font-bold leading-[24px] text-black underline-offset-2 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="button"
          className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-bold uppercase tracking-[0.04em] text-white transition hover:opacity-90"
        >
          Continue
        </button>
      </div>
    </AuthPage>
  );
}
