import React, { useMemo, useState } from 'react';
import {
  AutoComplete,
  Button,
  Card,
  DatePicker,
  Flex,
  Grid,
  Input,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  FilterOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useKnowledgeGeneratorReports } from '../../tickets/Hooks/useTicketFinalReport';
import { useUsersLookup } from '../../communications/hooks/useCommunicationApi';
import LocalizedDateText from '../../../components/LocalizedDateText';

const { RangePicker } = DatePicker;

const KnowledgeGeneratorPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dates, setDates] = useState<[string | undefined, string | undefined]>([
    undefined,
    undefined,
  ]);

  const { data, isLoading } = useKnowledgeGeneratorReports({
    title,
    author,
    startDate: dates[0],
    endDate: dates[1],
    page,
    limit: pageSize,
  });

  const authorLookupQuery = useUsersLookup(author, author.trim().length > 0);

  const titleOptions = useMemo(
    () =>
      Array.from(
        new Set(
          (data?.items || [])
            .map((item) =>
              (i18n.language === 'ar'
                ? item.title_ar || item.title_en
                : item.title_en || item.title_ar) || '',
            )
            .filter(Boolean),
        ),
      ).map((value) => ({ value })),
    [data?.items, i18n.language],
  );

  const authorOptions = useMemo(
    () =>
      (authorLookupQuery.data || []).map((item) => ({
        value: item.name_en || item.name_ar || item.email || '',
        label: (
          <Flex align="center" gap={10}>
            <img
              src={item.image || undefined}
              alt=""
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                objectFit: 'cover',
                display: item.image ? 'block' : 'none',
              }}
            />
            {!item.image && <UserOutlined style={{ color: '#0f4c81' }} />}
            <div>
              <Typography.Text strong>
                {i18n.language === 'ar'
                  ? item.name_ar || item.name_en || item.email
                  : item.name_en || item.name_ar || item.email}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                {item.email}
              </Typography.Text>
            </div>
          </Flex>
        ),
      })),
    [authorLookupQuery.data, i18n.language],
  );

  const publishedCount = useMemo(
    () => (data?.items || []).filter((item) => Boolean(item.publishedKnowledgeItemId)).length,
    [data?.items],
  );

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{
          borderRadius: 28,
          marginBottom: 18,
          background: 'linear-gradient(135deg, #0d2f57 0%, #184f8c 100%)',
          border: 'none',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.12)',
        }}
        styles={{
          body: {
            padding: 28,
          },
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={16}>
          <div>
            <Typography.Title level={2} style={{ margin: 0, color: '#fff' }}>
              {t('knowledge.generator.title')}
            </Typography.Title>
            <Typography.Text style={{ color: 'rgba(255,255,255,0.82)' }}>
              {t('knowledge.generator.subtitle')}
            </Typography.Text>
          </div>

          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/knowledge-base')}
            style={{ borderRadius: 999 }}
          >
            {t('common.back')}
          </Button>
        </Flex>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: screens.xl ? 'minmax(0, 1fr) 280px 280px' : '1fr',
          gap: 18,
          marginBottom: 18,
        }}
      >
        <Card style={{ borderRadius: 24, borderColor: '#e7edf7' }}>
          <Space direction="vertical" size="small">
            <Typography.Text type="secondary">{t('common.filter')}</Typography.Text>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('knowledge.generator.detailTitle')}
            </Typography.Title>
            <Typography.Text type="secondary">
              {t('knowledge.generator.previewHint')}
            </Typography.Text>
          </Space>

          <Flex gap={12} wrap="wrap" align="center" style={{ marginTop: 18 }}>
            <AutoComplete
              options={titleOptions}
              value={title}
              onChange={(val) => {
                setTitle(val);
                if (!val) setPage(1);
              }}
              onSelect={(val) => {
                setTitle(val);
                setPage(1);
              }}
              filterOption={(inputValue, option) =>
                (option?.value as string)?.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
              }
              style={{ minWidth: 240, flex: '1 1 240px' }}
            >
              <Input
                prefix={<FilterOutlined />}
                placeholder={t('knowledge.generator.filters.title')}
                style={{ height: 44, borderRadius: 14 }}
              />
            </AutoComplete>

            <AutoComplete
              options={authorOptions}
              value={author}
              onSearch={(val) => setAuthor(val)}
              onChange={(val) => {
                setAuthor(val);
                if (!val) setPage(1);
              }}
              onSelect={(val) => {
                setAuthor(val);
                setPage(1);
              }}
              filterOption={false}
              style={{ minWidth: 240, flex: '1 1 240px' }}
            >
              <Input
                placeholder={t('knowledge.generator.filters.author')}
                style={{ height: 44, borderRadius: 14 }}
              />
            </AutoComplete>

            <RangePicker
              style={{ minHeight: 44 }}
              onChange={(values) => {
                setDates([
                  values?.[0]?.startOf('day').format('YYYY-MM-DD'),
                  values?.[1]?.endOf('day').format('YYYY-MM-DD'),
                ]);
                setPage(1);
              }}
            />
          </Flex>
        </Card>

        <Card style={{ borderRadius: 24, borderColor: '#e7edf7' }}>
          <Statistic title={t('knowledge.generator.columns.status')} value={publishedCount} />
          <Typography.Text type="secondary">
            {t('knowledge.generator.status.published')}
          </Typography.Text>
        </Card>

        <Card style={{ borderRadius: 24, borderColor: '#e7edf7' }}>
          <Statistic title={t('knowledge.generator.title')} value={data?.meta.total || 0} />
          <Typography.Text type="secondary">
            {t('knowledge.generator.columns.title')}
          </Typography.Text>
        </Card>
      </div>

      <Card style={{ borderRadius: 24, borderColor: '#e7edf7' }}>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={data?.items || []}
          pagination={{
            current: page,
            pageSize,
            total: data?.meta.total || 0,
            onChange: (nextPage, nextPageSize) => {
              setPage(nextPage);
              setPageSize(nextPageSize);
            },
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/knowledge-base/generator/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          columns={[
            {
              title: t('knowledge.generator.columns.ticket'),
              dataIndex: 'ticketNumber',
              key: 'ticketNumber',
              width: 110,
              render: (value) => value || '-',
            },
            {
              title: t('knowledge.generator.columns.title'),
              key: 'title',
              render: (_, record) => {
                const title =
                  (i18n.language === 'ar'
                    ? record.title_ar || record.title_en
                    : record.title_en || record.title_ar) || '-';

                return (
                  <Typography.Text ellipsis={{ tooltip: title }} style={{ maxWidth: 320 }}>
                    {title}
                  </Typography.Text>
                );
              },
            },
            {
              title: t('knowledge.generator.columns.author'),
              key: 'author',
              width: 240,
              render: (_, record) => record.author?.name || '-',
            },
            {
              title: t('knowledge.generator.columns.status'),
              key: 'published',
              width: 140,
              render: (_, record) =>
                record.publishedKnowledgeItemId ? (
                  <Tag color="green">{t('knowledge.generator.status.published')}</Tag>
                ) : (
                  <Tag color="gold">{t('knowledge.generator.status.draft')}</Tag>
                ),
            },
            {
              title: t('knowledge.generator.columns.updatedAt'),
              key: 'updatedAt',
              width: 180,
              render: (_, record) =>
                record.updatedAt ? (
                  <LocalizedDateText value={record.updatedAt} language={i18n.language} />
                ) : '-',
            },
            {
              title: t('translation.view'),
              key: 'action',
              width: 120,
              render: (_, record) => (
                <Button
                  icon={<EyeOutlined />}
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/knowledge-base/generator/${record.id}`);
                  }}
                >
                  {t('translation.view')}
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default KnowledgeGeneratorPage;
