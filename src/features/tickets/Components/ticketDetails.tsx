/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, Typography, Spin, Flex, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTicketDetails } from '../Hooks/useTicketForm';
import { useTicketActivities, useTicketMedia } from '../Hooks/useTicket';
import TicketInfoTab from './ticketTabs/InfoTab';
import TicketMediaTab from './ticketTabs/MediaTab';
import TicketHistoryTab from './ticketTabs/HistoryTab';
import TicketChatTab from './ticketTabs/ChatTab';
import { useGetChatMessagesQuery } from '../store/services/chatApi';

const TicketView: React.FC = () => {
    const { t } = useTranslation();
    const { id, role } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { data: ticket, isLoading: infoLoading, refetch : refetchInfo } = useTicketDetails(id);
    const { data: media, isLoading: mediaLoading, refetch : refetchMedia } = useTicketMedia(id);
    const { refetch : refetchHistory } = useTicketActivities(id);
    const { refetch : refetchChat } = useGetChatMessagesQuery(id);

    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    const activeKey = ['media', 'chat', 'history'].includes(lastPart) ? lastPart : 'info';

    useEffect(() => {
        if (activeKey === 'info') {
            refetchInfo();
        } else if (activeKey === 'media') {
            refetchMedia();
        }
        else if (activeKey === 'chat') {
            refetchChat();
        }
        else if (activeKey === 'history') {
            refetchHistory();
        }
    }, [activeKey, refetchInfo, refetchMedia, refetchChat, refetchHistory]);

    const assigneeNames = ticket?.assignee

        ?.map((a: any) => a.name || `${a.first_name} ${a.last_name}`)
        .join(', ');

    const handleTabChange = (key: string) => {
        if (key === 'info') {
            navigate(`/${role}/tickets/${id}`);
        } else {
            navigate(`/${role}/tickets/${id}/${key}`);
        }
    };

    const handleEdit = () => {
        navigate(`/${role}/tickets/${id}/edit`);
    };

    const handleBack = () => {
        navigate(`/${role}/tickets`);
    };

    if (infoLoading) return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;

    const tabItems = [
        {
            key: 'info',
            label: t('tickets.tabInfo'),
            children: <TicketInfoTab ticket={ticket} onEdit={handleEdit} />,
        },
        {
            key: 'media',
            label: t('tickets.tabMedia'),
            children: <TicketMediaTab media={media} isLoading={mediaLoading} />,
        },
        {
            key: 'chat',
            label: t('tickets.tabChat'),
            children: <TicketChatTab assigneeName={assigneeNames} />
        },
        ...(role === 'admin' ? [{
            key: 'history',
            label: t('tickets.tabHistory'),
            children: <TicketHistoryTab />,
        }] : []),
    ];

    return (
        <div style={{ padding: '24px', paddingBottom: 0, backgroundColor: '#fff', borderRadius: '8px' }}>
<Flex align="center" gap="middle" style={{ marginBottom: 24 }}>
                <Button 
                    type="text" 
                    icon={<ArrowLeftOutlined />} 
                    onClick={handleBack}
                    style={{ fontSize: '18px' }}
                />
                <Typography.Title level={2} style={{ margin: 0 }}>
                    {t('tickets.ticketDetails')}
                </Typography.Title>
            </Flex>            <Tabs  activeKey={activeKey} onChange={handleTabChange} items={tabItems} />
        </div>
    );
};

export default TicketView;