import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Layout, Menu, Typography, Tag, Flex, Input, Grid, Drawer, Button, theme } from 'antd';
import { MenuOutlined, SearchOutlined, ApiOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

// ─── Import markdown files as raw strings via Vite ───────────────────────────
import introMd from './docs/intro.md?raw';
import apiIntegrationsMd from './docs/api-integrations.md?raw';
import dbMigrationsMd from './docs/database-migrations.md?raw';
import authV1Md from './docs/authentication/auth-v1.md?raw';
import authV2Md from './docs/authentication/auth-v2.md?raw';
import trustedDevicesMd from './docs/authentication/trusted-devices.md?raw';
import chatMd from './docs/chat/index.md?raw';
import websocketsMd from './docs/chat/websockets.md?raw';
import academicStructureMd from './docs/management/academic-structure.md?raw';
import aiAssistantMd from './docs/management/ai-assistant.md?raw';
import auditLogsMd from './docs/management/audit-logs.md?raw';
import customFormsMd from './docs/management/custom-forms.md?raw';
import desktopAppMd from './docs/management/desktop-app.md?raw';
import groupsMd from './docs/management/groups.md?raw';
import knowledgeBaseMd from './docs/management/knowledge-base.md?raw';
import lookupsMd from './docs/management/lookups.md?raw';
import notificationsMd from './docs/management/notifications.md?raw';
import permissionProfilesMd from './docs/management/permission-profiles.md?raw';
import problemsMd from './docs/management/problems.md?raw';
import recycleBinMd from './docs/management/recycle-bin.md?raw';
import siteSettingsMd from './docs/management/site-settings.md?raw';
import slaMd from './docs/management/sla.md?raw';
import workHoursMd from './docs/management/work-hours.md?raw';
import reportsMd from './docs/reports/index.md?raw';
import ticketChatMd from './docs/tickets/chat.md?raw';
import ticketFinalReportMd from './docs/tickets/final-report.md?raw';
import ticketMediaMd from './docs/tickets/media.md?raw';
import ticketReviewsMd from './docs/tickets/reviews.md?raw';
import ticketsMd from './docs/tickets/tickets.md?raw';
import userProfileMd from './docs/users/profile.md?raw';
import usersMd from './docs/users/users.md?raw';

const { Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const { useToken } = theme;

// ─── Doc registry ─────────────────────────────────────────────────────────────
interface DocEntry {
  key: string;
  label: string;
  content: string;
  group: string;
}

const DOCS: DocEntry[] = [
  { key: 'intro',              label: 'Overview',              content: introMd,              group: 'Getting Started' },
  { key: 'api-integrations',   label: 'API Integrations',      content: apiIntegrationsMd,    group: 'Getting Started' },
  { key: 'database-migrations',label: 'Database Migrations',   content: dbMigrationsMd,       group: 'Getting Started' },
  { key: 'auth-v1',            label: 'Auth v1',               content: authV1Md,             group: 'Authentication' },
  { key: 'auth-v2',            label: 'Auth v2 (WebAuthn+SSO)',content: authV2Md,             group: 'Authentication' },
  { key: 'trusted-devices',    label: 'Trusted Devices',       content: trustedDevicesMd,     group: 'Authentication' },
  { key: 'chat',               label: 'Chat',                  content: chatMd,               group: 'Chat' },
  { key: 'websockets',         label: 'WebSockets',            content: websocketsMd,         group: 'Chat' },
  { key: 'tickets',            label: 'Tickets',               content: ticketsMd,            group: 'Tickets' },
  { key: 'ticket-chat',        label: 'Ticket Chat',           content: ticketChatMd,         group: 'Tickets' },
  { key: 'ticket-media',       label: 'Ticket Media',          content: ticketMediaMd,        group: 'Tickets' },
  { key: 'ticket-reviews',     label: 'Ticket Reviews',        content: ticketReviewsMd,      group: 'Tickets' },
  { key: 'ticket-final-report',label: 'Final Report',          content: ticketFinalReportMd,  group: 'Tickets' },
  { key: 'reports',            label: 'Reports',               content: reportsMd,            group: 'Reports' },
  { key: 'academic-structure', label: 'Academic Structure',    content: academicStructureMd,  group: 'Management' },
  { key: 'ai-assistant',       label: 'AI Assistant',          content: aiAssistantMd,        group: 'Management' },
  { key: 'audit-logs',         label: 'Audit Logs',            content: auditLogsMd,          group: 'Management' },
  { key: 'custom-forms',       label: 'Custom Forms',          content: customFormsMd,        group: 'Management' },
  { key: 'desktop-app',        label: 'Desktop App',           content: desktopAppMd,         group: 'Management' },
  { key: 'groups',             label: 'Groups',                content: groupsMd,             group: 'Management' },
  { key: 'knowledge-base',     label: 'Knowledge Base',        content: knowledgeBaseMd,      group: 'Management' },
  { key: 'lookups',            label: 'Lookups',               content: lookupsMd,            group: 'Management' },
  { key: 'notifications',      label: 'Notifications',         content: notificationsMd,      group: 'Management' },
  { key: 'permission-profiles',label: 'Permission Profiles',   content: permissionProfilesMd, group: 'Management' },
  { key: 'problems',           label: 'Problems',              content: problemsMd,           group: 'Management' },
  { key: 'recycle-bin',        label: 'Recycle Bin',           content: recycleBinMd,         group: 'Management' },
  { key: 'site-settings',      label: 'Site Settings',         content: siteSettingsMd,       group: 'Management' },
  { key: 'sla',                label: 'SLA',                   content: slaMd,                group: 'Management' },
  { key: 'work-hours',         label: 'Work Hours',            content: workHoursMd,          group: 'Management' },
  { key: 'users',              label: 'Users',                 content: usersMd,              group: 'Users' },
  { key: 'user-profile',       label: 'User Profile',          content: userProfileMd,        group: 'Users' },
];

const DOC_MAP = new Map(DOCS.map(d => [d.key, d]));

// Strip frontmatter from markdown
function stripFrontmatter(md: string): string {
  return md.replace(/^---[\s\S]*?---\n?/, '');
}

// Build Ant Design menu items grouped by category
function buildMenuItems(search: string) {
  const filtered = search
    ? DOCS.filter(d => d.label.toLowerCase().includes(search.toLowerCase()))
    : DOCS;

  const groups = new Map<string, DocEntry[]>();
  for (const doc of filtered) {
    if (!groups.has(doc.group)) groups.set(doc.group, []);
    groups.get(doc.group)!.push(doc);
  }

  return Array.from(groups.entries()).map(([group, items]) => ({
    key: `group-${group}`,
    label: group,
    type: 'group' as const,
    children: items.map(item => ({
      key: item.key,
      label: item.label,
    })),
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────
const ApiDocsPage: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const { docId } = useParams<{ docId?: string }>();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeDoc = DOC_MAP.get(docId || 'intro') ?? DOCS[0];

  const handleSelect = useCallback(({ key }: { key: string }) => {
    navigate(`/api-docs/${key}`);
    setDrawerOpen(false);
  }, [navigate]);

  // Scroll to top on doc change
  useEffect(() => { window.scrollTo(0, 0); }, [activeDoc.key]);

  const menuItems = buildMenuItems(search);

  const sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 12px 8px' }}>
        <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
          <ApiOutlined style={{ color: token.colorPrimary, fontSize: 18 }} />
          <Typography.Text strong style={{ fontSize: 15 }}>API Docs</Typography.Text>
        </Flex>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          allowClear
          size="small"
        />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[activeDoc.key]}
          items={menuItems}
          onClick={handleSelect}
          style={{ border: 'none', fontSize: 13 }}
        />
      </div>
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sider
          width={240}
          style={{
            background: token.colorBgContainer,
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {sidebar}
        </Sider>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{ body: { padding: 0 } }}
          title={null}
        >
          {sidebar}
        </Drawer>
      )}

      <Content style={{ maxWidth: 860, margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 40px' }}>
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{ marginBottom: 16 }}
          >
            Menu
          </Button>
        )}

        {/* Breadcrumb tag */}
        <Flex gap={6} wrap="wrap" style={{ marginBottom: 8 }}>
          <Tag color="blue">{activeDoc.group}</Tag>
          <Tag>{activeDoc.label}</Tag>
        </Flex>

        {/* Markdown content */}
        <div className="api-docs-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <Typography.Title level={1} style={{ marginTop: 0 }}>{children}</Typography.Title>
              ),
              h2: ({ children }) => (
                <Typography.Title level={2} style={{ marginTop: 32 }}>{children}</Typography.Title>
              ),
              h3: ({ children }) => (
                <Typography.Title level={3} style={{ marginTop: 24 }}>{children}</Typography.Title>
              ),
              h4: ({ children }) => (
                <Typography.Title level={4} style={{ marginTop: 20 }}>{children}</Typography.Title>
              ),
              p: ({ children }) => (
                <Typography.Paragraph>{children}</Typography.Paragraph>
              ),
              code: ({ className, children, ...props }) => {
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
                return (
                  <Typography.Text code style={{ fontSize: 13 }}>{children}</Typography.Text>
                );
              },
              table: ({ children }) => (
                <div style={{ overflowX: 'auto', margin: '16px 0' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 13,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadius,
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
                }}>
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td style={{
                  padding: '8px 12px',
                  borderBottom: `1px solid ${token.colorBorderSecondary}`,
                  verticalAlign: 'top',
                }}>
                  {children}
                </td>
              ),
              blockquote: ({ children }) => (
                <blockquote style={{
                  borderLeft: `4px solid ${token.colorPrimary}`,
                  marginLeft: 0,
                  paddingLeft: 16,
                  color: token.colorTextSecondary,
                }}>
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <Typography.Link href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </Typography.Link>
              ),
              ul: ({ children }) => (
                <ul style={{ paddingLeft: 24, marginBottom: 12 }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{ paddingLeft: 24, marginBottom: 12 }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: 4 }}>{children}</li>
              ),
              hr: () => <div style={{ borderTop: `1px solid ${token.colorBorderSecondary}`, margin: '24px 0' }} />,
            }}
          >
            {stripFrontmatter(activeDoc.content)}
          </ReactMarkdown>
        </div>

        {/* Prev / Next navigation */}
        <Flex justify="space-between" style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${token.colorBorderSecondary}` }}>
          {(() => {
            const idx = DOCS.findIndex(d => d.key === activeDoc.key);
            const prev = DOCS[idx - 1];
            const next = DOCS[idx + 1];
            return (
              <>
                <div>
                  {prev && (
                    <Typography.Link onClick={() => navigate(`/api-docs/${prev.key}`)}>
                      ← {prev.label}
                    </Typography.Link>
                  )}
                </div>
                <div>
                  {next && (
                    <Typography.Link onClick={() => navigate(`/api-docs/${next.key}`)}>
                      {next.label} →
                    </Typography.Link>
                  )}
                </div>
              </>
            );
          })()}
        </Flex>
      </Content>
    </Layout>
  );
};

export default ApiDocsPage;
