import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Typography, Tag, Flex, theme } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import guideMd from './integration-guide.md?raw';

const { useToken } = theme;

const IntegrationGuidePage: React.FC = () => {
  const { token } = useToken();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <Flex align="center" gap={10} style={{ marginBottom: 24 }}>
        <ApiOutlined style={{ fontSize: 28, color: token.colorPrimary }} />
        <div>
          <Typography.Title level={2} style={{ margin: 0 }}>
            API Integration Guide
          </Typography.Title>
          <Typography.Text type="secondary">
            How to authenticate and use the TSTS API with an API key
          </Typography.Text>
        </div>
        <Tag color="green" style={{ marginLeft: 'auto' }}>Public</Tag>
      </Flex>

      <div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => <Typography.Title level={1} style={{ marginTop: 0 }}>{children}</Typography.Title>,
            h2: ({ children }) => <Typography.Title level={2} style={{ marginTop: 32, borderBottom: `1px solid ${token.colorBorderSecondary}`, paddingBottom: 8 }}>{children}</Typography.Title>,
            h3: ({ children }) => <Typography.Title level={3} style={{ marginTop: 24 }}>{children}</Typography.Title>,
            p: ({ children }) => <Typography.Paragraph>{children}</Typography.Paragraph>,
            code: ({ className, children }) => {
              const isBlock = className?.startsWith('language-');
              if (isBlock) {
                return (
                  <pre style={{
                    background: token.colorFillTertiary,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadiusLG,
                    padding: '14px 16px',
                    overflowX: 'auto',
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: '12px 0',
                  }}>
                    <code style={{ fontFamily: 'monospace' }}>{children}</code>
                  </pre>
                );
              }
              return <Typography.Text code style={{ fontSize: 13 }}>{children}</Typography.Text>;
            },
            table: ({ children }) => (
              <div style={{ overflowX: 'auto', margin: '16px 0' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                  border: `1px solid ${token.colorBorderSecondary}`,
                }}>
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th style={{
                background: token.colorFillSecondary,
                padding: '8px 12px',
                textAlign: 'left',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                fontWeight: 600,
              }}>{children}</th>
            ),
            td: ({ children }) => (
              <td style={{
                padding: '8px 12px',
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
              }}>{children}</td>
            ),
            a: ({ href, children }) => (
              <Typography.Link href={href} target="_blank" rel="noopener noreferrer">{children}</Typography.Link>
            ),
            ul: ({ children }) => <ul style={{ paddingLeft: 24, marginBottom: 12 }}>{children}</ul>,
            ol: ({ children }) => <ol style={{ paddingLeft: 24, marginBottom: 12 }}>{children}</ol>,
            li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
            hr: () => <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, margin: '24px 0' }} />,
          }}
        >
          {guideMd}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default IntegrationGuidePage;
