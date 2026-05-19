import { getResend } from "./client";

// Streams extend this map by augmenting EmailTemplateMap with their own
// (template name -> props) entries via TypeScript declaration merging.
export interface EmailTemplateMap {
  // Populated by parallel streams. Keys remain typed via module augmentation:
  //   declare module "@/lib/email/send" {
  //     interface EmailTemplateMap { "lead-notification": LeadNotificationProps }
  //   }
}

export type EmailTemplate = keyof EmailTemplateMap;

export type SendEmailArgs<T extends EmailTemplate> = {
  to: string | string[];
  template: T;
  props: EmailTemplateMap[T];
  subject: string;
  replyTo?: string;
};

type RenderFn<T extends EmailTemplate> = (props: EmailTemplateMap[T]) => Promise<{
  html: string;
  text?: string;
}>;

const renderers = new Map<EmailTemplate, RenderFn<EmailTemplate>>();

export function registerEmailTemplate<T extends EmailTemplate>(name: T, render: RenderFn<T>): void {
  renderers.set(name, render as RenderFn<EmailTemplate>);
}

export async function sendEmail<T extends EmailTemplate>(args: SendEmailArgs<T>): Promise<void> {
  const render = renderers.get(args.template);
  if (!render) {
    throw new Error(`No renderer registered for email template: ${String(args.template)}`);
  }
  const from = process.env.RESEND_FROM;
  if (!from) throw new Error("RESEND_FROM is not set.");
  const { html, text } = await render(args.props);
  const resend = getResend();
  await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html,
    text,
    replyTo: args.replyTo,
  });
}
