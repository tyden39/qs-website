import * as React from "react";
import { render } from "@react-email/components";
import { getResend } from "./client";
import type { LeadNotificationProps } from "./templates/lead-notification";
import type { NewsletterConfirmProps } from "./templates/newsletter-confirm";
import type { AdminInviteProps } from "./templates/admin-invite";

// Streams extend this map by augmenting EmailTemplateMap with their own
// (template name -> props) entries via TypeScript declaration merging.
export interface EmailTemplateMap {
  "lead-notification": LeadNotificationProps;
  "newsletter-confirm": NewsletterConfirmProps;
  "admin-invite": AdminInviteProps;
}

export type EmailTemplate = keyof EmailTemplateMap;

export type SendEmailArgs<T extends EmailTemplate> = {
  to: string | string[];
  template: T;
  props: EmailTemplateMap[T];
  subject: string;
  replyTo?: string;
};

type TemplateFn<T extends EmailTemplate> = (props: EmailTemplateMap[T]) => React.ReactElement;

// Registry maps template name → React component function.
// Templates register themselves so this module stays extensible without
// touching the registry every time a new template is added.
const registry = new Map<EmailTemplate, TemplateFn<EmailTemplate>>();

export function registerEmailTemplate<T extends EmailTemplate>(
  name: T,
  component: TemplateFn<T>,
): void {
  registry.set(name, component as TemplateFn<EmailTemplate>);
}

// Auto-register built-in templates (lazy import avoids circular deps at module
// load time and keeps the build tree-shakeable for non-email code paths).
async function resolveTemplate<T extends EmailTemplate>(
  name: T,
): Promise<TemplateFn<T>> {
  if (!registry.has(name)) {
    if (name === "lead-notification") {
      const { LeadNotificationEmail } = await import("./templates/lead-notification");
      registry.set("lead-notification", LeadNotificationEmail as TemplateFn<EmailTemplate>);
    } else if (name === "newsletter-confirm") {
      const { NewsletterConfirmEmail } = await import("./templates/newsletter-confirm");
      registry.set("newsletter-confirm", NewsletterConfirmEmail as TemplateFn<EmailTemplate>);
    } else if (name === "admin-invite") {
      const { AdminInviteEmail } = await import("./templates/admin-invite");
      registry.set("admin-invite", AdminInviteEmail as TemplateFn<EmailTemplate>);
    }
  }
  const fn = registry.get(name);
  if (!fn) throw new Error(`No renderer registered for email template: ${String(name)}`);
  return fn as TemplateFn<T>;
}

export async function sendEmail<T extends EmailTemplate>(args: SendEmailArgs<T>): Promise<void> {
  const from = process.env.RESEND_FROM;
  if (!from) throw new Error("RESEND_FROM is not set.");

  const component = await resolveTemplate(args.template);
  // react-email v6 render() is async and accepts a ReactElement directly.
  const html = await render(component(args.props));

  const resend = getResend();
  await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html,
    replyTo: args.replyTo,
  });
}
