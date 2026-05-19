import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Hr,
  Row,
  Column,
  Font,
} from "@react-email/components";
import * as React from "react";

export interface LeadNotificationProps {
  id: number;
  source: string;
  name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  locale: string;
  createdAt: Date;
  adminUrl: string;
}

const sourceLabels: Record<string, string> = {
  contact: "Liên hệ",
  newsletter: "Newsletter",
  datasheet: "Yêu cầu Datasheet",
  inquiry: "Yêu cầu Dịch vụ",
};

export function LeadNotificationEmail({
  id,
  source,
  name,
  email,
  phone,
  company,
  message,
  locale,
  createdAt,
  adminUrl,
}: LeadNotificationProps) {
  const sourceLabel = sourceLabels[source] ?? source;
  const dateStr = new Date(createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  return (
    <Html lang="vi" dir="ltr">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>QS Technology</Heading>
            <Text style={headerSubtitle}>Admin Notification</Text>
          </Section>

          {/* Badge */}
          <Section style={badgeSection}>
            <span style={badge}>{sourceLabel}</span>
            <Text style={badgeDate}>{dateStr} · #{id}</Text>
          </Section>

          {/* Lead details */}
          <Section style={detailsSection}>
            <Heading as="h2" style={sectionTitle}>Chi tiết liên hệ</Heading>

            <Row style={fieldRow}>
              <Column style={fieldLabel}>Họ tên</Column>
              <Column style={fieldValue}>{name ?? "—"}</Column>
            </Row>
            <Row style={fieldRow}>
              <Column style={fieldLabel}>Email</Column>
              <Column style={fieldValue}>
                <Link href={`mailto:${email}`} style={link}>{email}</Link>
              </Column>
            </Row>
            {phone && (
              <Row style={fieldRow}>
                <Column style={fieldLabel}>Điện thoại</Column>
                <Column style={fieldValue}>
                  <Link href={`tel:${phone}`} style={link}>{phone}</Link>
                </Column>
              </Row>
            )}
            {company && (
              <Row style={fieldRow}>
                <Column style={fieldLabel}>Công ty</Column>
                <Column style={fieldValue}>{company}</Column>
              </Row>
            )}
            <Row style={fieldRow}>
              <Column style={fieldLabel}>Ngôn ngữ</Column>
              <Column style={fieldValue}>{locale === "vi" ? "Tiếng Việt" : "English"}</Column>
            </Row>
          </Section>

          {/* Message */}
          {message && (
            <Section style={messageSection}>
              <Heading as="h2" style={sectionTitle}>Nội dung</Heading>
              <Text style={messageText}>{message}</Text>
            </Section>
          )}

          <Hr style={divider} />

          {/* CTA */}
          <Section style={ctaSection}>
            <Link href={adminUrl} style={ctaButton}>Mở trong Admin →</Link>
          </Section>

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Email này được gửi tự động bởi hệ thống QS Technology CMS.
              Không trả lời email này.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const body: React.CSSProperties = {
  backgroundColor: "#f0eee8",
  fontFamily: "Inter, Arial, sans-serif",
  margin: 0,
  padding: "32px 0",
};

const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  maxWidth: "560px",
  margin: "0 auto",
  border: "1px solid #d4cfc4",
};

const header: React.CSSProperties = {
  backgroundColor: "#0e0e0c",
  padding: "24px 32px",
};

const headerTitle: React.CSSProperties = {
  color: "#c8a84b",
  fontSize: "18px",
  fontWeight: 700,
  margin: 0,
  letterSpacing: "0.04em",
};

const headerSubtitle: React.CSSProperties = {
  color: "#8a8676",
  fontSize: "11px",
  margin: "4px 0 0",
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
};

const badgeSection: React.CSSProperties = {
  padding: "20px 32px 0",
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const badge: React.CSSProperties = {
  backgroundColor: "#c8a84b",
  color: "#0e0e0c",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  padding: "4px 10px",
  display: "inline-block",
};

const badgeDate: React.CSSProperties = {
  color: "#8a8676",
  fontSize: "11px",
  margin: "0 0 0 12px",
  display: "inline",
};

const detailsSection: React.CSSProperties = {
  padding: "20px 32px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "13px",
  fontWeight: 600,
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "#5a5650",
  margin: "0 0 12px",
};

const fieldRow: React.CSSProperties = {
  borderBottom: "1px solid #f0eee8",
  padding: "8px 0",
};

const fieldLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#8a8676",
  width: "30%",
  fontWeight: 500,
  letterSpacing: "0.06em",
};

const fieldValue: React.CSSProperties = {
  fontSize: "14px",
  color: "#1a1a18",
};

const link: React.CSSProperties = {
  color: "#c8a84b",
  textDecoration: "none",
};

const messageSection: React.CSSProperties = {
  padding: "0 32px 20px",
};

const messageText: React.CSSProperties = {
  fontSize: "14px",
  color: "#3a3a3a",
  lineHeight: "1.7",
  backgroundColor: "#fafaf7",
  border: "1px solid #e8e4da",
  padding: "16px",
  margin: 0,
  whiteSpace: "pre-wrap" as const,
};

const divider: React.CSSProperties = {
  borderColor: "#e8e4da",
  margin: "0 32px",
};

const ctaSection: React.CSSProperties = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#0e0e0c",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const footerSection: React.CSSProperties = {
  padding: "0 32px 24px",
};

const footerText: React.CSSProperties = {
  fontSize: "11px",
  color: "#a8a499",
  margin: 0,
  textAlign: "center" as const,
};

export default LeadNotificationEmail;
