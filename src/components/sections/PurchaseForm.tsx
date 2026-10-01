"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { createOrder, initialPurchaseFormState } from "@/lib/actions/orders";

interface PurchaseFormProps {
  appSlug: string;
  appName: string;
  onlinePaymentEnabled: boolean;
  directPaymentEnabled: boolean;
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={disabled || pending}>
      {pending ? "Submitting..." : "Submit Order"}
    </Button>
  );
}

export default function PurchaseForm({
  appSlug,
  appName,
  onlinePaymentEnabled,
  directPaymentEnabled,
}: PurchaseFormProps) {
  const [state, formAction] = useActionState(
    createOrder,
    initialPurchaseFormState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  const availableMethods: Array<{ value: "online" | "direct"; label: string }> =
    [
      ...(onlinePaymentEnabled
        ? [{ value: "online" as const, label: "Online Payment" }]
        : []),
      ...(directPaymentEnabled
        ? [{ value: "direct" as const, label: "Direct Payment" }]
        : []),
    ];

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-border bg-accent-light p-6 text-center">
        <p className="text-sm font-medium text-ink">Order received</p>
        <p className="mt-2 text-sm text-ink-soft">
          Thanks — we&apos;ve recorded your order for {appName}
          {state.orderId && (
            <>
              {" "}
              (reference{" "}
              <span className="font-mono text-ink">
                {state.orderId.slice(0, 8)}
              </span>
              )
            </>
          )}
          . This confirms your order was submitted; it does not mean payment
          has been completed yet. We&apos;ll follow up with next steps for
          payment and confirmation.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="app_slug" value={appSlug} />

      {/* Honeypot: hidden from real users, tab-skipped, and unlabeled so
          screen readers don't announce it as a field to fill in. Any bot
          that blindly fills every input trips this and the server drops
          the submission. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {state.status === "error" && state.error && (
        <div className="rounded-xl border border-danger/30 bg-danger-light px-4 py-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="customer_name" className="block text-sm font-medium text-ink">
          Full Name
        </label>
        <input
          id="customer_name"
          name="customer_name"
          type="text"
          required
          maxLength={100}
          autoComplete="name"
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="customer_email" className="block text-sm font-medium text-ink">
          Email Address
        </label>
        <input
          id="customer_email"
          name="customer_email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      </div>

      <div>
        <label htmlFor="customer_phone" className="block text-sm font-medium text-ink">
          Phone Number{" "}
          <span className="font-normal text-ink-soft">(optional)</span>
        </label>
        <input
          id="customer_phone"
          name="customer_phone"
          type="tel"
          maxLength={30}
          autoComplete="tel"
          className="mt-1.5 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink outline-none focus:border-brand"
        />
      </div>

      {availableMethods.length > 0 ? (
        <fieldset>
          <legend className="block text-sm font-medium text-ink">
            Payment Method
          </legend>
          <div className="mt-2 space-y-2">
            {availableMethods.map((method, index) => (
              <label
                key={method.value}
                htmlFor={`payment_method_${method.value}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-ink hover:border-brand"
              >
                <input
                  id={`payment_method_${method.value}`}
                  name="payment_method"
                  type="radio"
                  value={method.value}
                  required
                  defaultChecked={index === 0}
                  className="h-4 w-4 border-border text-brand focus:ring-brand"
                />
                {method.label}
              </label>
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-ink-soft">
          No payment method is available for {appName} yet.
        </p>
      )}

      <SubmitButton disabled={availableMethods.length === 0} />
    </form>
  );
}
