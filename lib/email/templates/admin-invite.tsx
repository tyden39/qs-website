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
  Font,
  Button,
} from "@react-email/components";
import * as React from "react";

export interface AdminInviteProps {
  inviteUrl: string;
  role: string;
  inviterName?: string;
  expiresInHours: number;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Quản trị viên",
  editor: "Biên tập viên",
};

export function AdminInviteEmail({
  inviteUrl,
  role,
  inviterName,
  expiresInHours,
}: AdminInviteProps) {
  const roleLabel = ROLE_LABELS[role] ?? role;

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
            <Text style={headerSubtitle}>Kỹ thuật · Controller · Servo</Text>
          </Section>

          {/* Main content */}
          <Section style={content}>
            <Text style={eyebrow}>[ Lời mời tham gia ]</Text>
            <Heading as="h1" style={title}>
              Bạn được mời vào QS Admin Console
            </Heading>
            {inviterName ? (
              <Text style={bodyText}>
                <strong>{inviterName}</strong> đã mời bạn tham gia hệ thống quản
                trị QS Technology với vai trò <strong>{roleLabel}</strong>.
              </Text>
            ) : (
              <Text style={bodyText}>
                Bạn được mời tham gia hệ thống quản trị QS Technology với vai
                trò <strong>{roleLabel}</strong>.
              </Text>
            )}
            <Text style={bodyText}>
              Nhấn nút bên dưới để kích hoạt tài khoản và thiết lập mật khẩu:
            </Text>

            <Section style={ctaSection}>
              <Button href={inviteUrl} style={ctaButton}>
                Kích hoạt tài khoản →
              </Button>
            </Section>

            <Text style={expiryNote}>
              Liên kết này sẽ hết hạn sau{" "}
              <strong>{expiresInHours} giờ</strong>. Nếu bạn không yêu cầu lời
              mời này, hãy bỏ qua email.
            </Text>

            <Text style={bodyText}>
              Hoặc sao chép URL sau vào trình duyệt:
            </Text>
            <Link href={inviteUrl} style={rawLink}>
              {inviteUrl}
            </Link>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Email này được gửi tự động từ hệ thống QS Technology Admin
              Console. Vui lòng không trả lời trực tiếp email này.
            </Text>
            <Text style={footerSmall}>
              QS Technology Co., Ltd · TP. Hồ Chí Minh, Việt Nam
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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

const content: React.CSSProperties = {
  padding: "32px 32px 24px",
};

const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#c8a84b",
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  margin: "0 0 12px",
};

const title: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#0e0e0c",
  margin: "0 0 16px",
  lineHeight: 1.3,
};

const bodyText: React.CSSProperties = {
  fontSize: "14px",
  color: "#3a3a3a",
  lineHeight: 1.7,
  margin: "0 0 16px",
};

const ctaSection: React.CSSProperties = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#c8a84b",
  color: "#0e0e0c",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
};

const expiryNote: React.CSSProperties = {
  fontSize: "13px",
  color: "#8a8676",
  lineHeight: 1.6,
  margin: "0 0 16px",
  padding: "12px 16px",
  backgroundColor: "#f8f6f0",
  borderLeft: "3px solid #c8a84b",
};

const rawLink: React.CSSProperties = {
  fontSize: "12px",
  color: "#c8a84b",
  wordBreak: "break-all" as const,
  display: "block",
  margin: "0 0 16px",
};

const divider: React.CSSProperties = {
  borderColor: "#e8e4da",
  margin: "0 32px",
};

const footerSection: React.CSSProperties = {
  padding: "20px 32px 24px",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#8a8676",
  margin: "0 0 8px",
  textAlign: "center" as const,
};

const footerSmall: React.CSSProperties = {
  fontSize: "11px",
  color: "#a8a499",
  margin: 0,
  textAlign: "center" as const,
};

export default AdminInviteEmail;
