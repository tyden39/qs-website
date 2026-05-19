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
} from "@react-email/components";
import * as React from "react";

export interface NewsletterConfirmProps {
  email: string;
  unsubscribeUrl: string;
}

export function NewsletterConfirmEmail({ email, unsubscribeUrl }: NewsletterConfirmProps) {
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
            <Text style={eyebrow}>[ Xác nhận đăng ký ]</Text>
            <Heading as="h1" style={title}>
              Cảm ơn bạn đã đăng ký nhận tin từ QS Technology
            </Heading>
            <Text style={body_text}>
              Địa chỉ <strong>{email}</strong> đã được thêm vào danh sách nhận bản tin kỹ thuật
              của QS Technology. Bạn sẽ nhận được cập nhật về:
            </Text>

            <ul style={list}>
              <li style={listItem}>Sản phẩm và firmware mới nhất</li>
              <li style={listItem}>Tài liệu kỹ thuật và application note</li>
              <li style={listItem}>Tin tức ngành CNC và servo</li>
              <li style={listItem}>Ưu đãi và chương trình đặc biệt</li>
            </ul>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>
              Nếu bạn không đăng ký, hãy bỏ qua email này.{" "}
              <Link href={unsubscribeUrl} style={unsubLink}>Hủy đăng ký</Link>
            </Text>
            <Text style={footerSmall}>
              QS Technology Co., Ltd · 123 KCN Tân Bình, Quận Tân Bình, TP. Hồ Chí Minh
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

const body_text: React.CSSProperties = {
  fontSize: "14px",
  color: "#3a3a3a",
  lineHeight: 1.7,
  margin: "0 0 16px",
};

const list: React.CSSProperties = {
  margin: "0 0 0 0",
  paddingLeft: "20px",
};

const listItem: React.CSSProperties = {
  fontSize: "14px",
  color: "#3a3a3a",
  lineHeight: 1.9,
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

const unsubLink: React.CSSProperties = {
  color: "#c8a84b",
  textDecoration: "underline",
};

const footerSmall: React.CSSProperties = {
  fontSize: "11px",
  color: "#a8a499",
  margin: 0,
  textAlign: "center" as const,
};

export default NewsletterConfirmEmail;
