type StripeConnectModalProps = {
  onConnect?: () => void;
};

export function StripeConnectModal({ onConnect }: StripeConnectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000B2] px-4 py-8 backdrop-blur-[1px]">
      <div className="w-full max-w-[500px] rounded-[4px] border border-black/10 bg-[#f5f5f3] px-7 py-8 shadow-[0_0_0_1px_rgba(0,0,0,0.04)] md:px-10 md:py-10">
        <div className="mt-2 flex justify-center">
          <div className="text-[52px] font-black leading-none tracking-[-0.06em] text-[#6d67fd]">stripe</div>
        </div>

        <h2 className="mt-[17px] text-center text-[22px] font-black uppercase leading-[38px] tracking-[1px] text-black">
          Connect your Stripe account
        </h2>

        <div className="mt-[18px] space-y-5 text-center text-[16px] font-normal leading-[24px] text-black">
          <p>
            To start selling tickets and receive payments for your events, you need to connect your Stripe
            account to Y.
          </p>
          <p>
            This securely connects your business to Stripe and allows Y to process customer payments and
            manage your event payouts.
          </p>
        </div>

        <div className="mt-[40px]">
          <button
            type="button"
            onClick={onConnect}
            className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-[4px] border border-black bg-black text-[14px] font-bold uppercase leading-[24px] tracking-[0.04em] text-white transition hover:opacity-90"
          >
            Connect Stripe account
          </button>
        </div>

        <p className="mt-[13px] text-center text-[14px] leading-[18px] text-[#000000CC]">
          You&apos;ll be redirected to Stripe to complete your business and payment setup.
        </p>
      </div>
    </div>
  );
}
