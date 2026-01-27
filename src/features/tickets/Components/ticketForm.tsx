/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Upload, Tag, Dropdown, Space, Typography, message, Flex, Card, Steps, Badge } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAdmins, useSpecializations, useTechnicians, useTicketDetails, useTicketMutations } from '../Hooks/useTicketForm';
import RequiredTag from '../../../components/RequiredTag';
import { useSelector } from 'react-redux';

const { TextArea } = Input;

const TicketForm: React.FC = () => {
    const { t } = useTranslation();
    const { id, role } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { user } = useSelector((state: any) => state.auth);

    const isEdit = !!id;
    const isRequester = role === 'requester';
    const canEditAttachments = !isEdit || (isEdit && isRequester);

    const { data: specs } = useSpecializations();
    const { data: techs } = useTechnicians();
    const { data: admins } = useAdmins();
    const { data: ticketData, isLoading } = useTicketDetails(id);
    const { createMutation, updateMutation, coordinateMutation } = useTicketMutations(id);

    const [selectedSpecs, setSelectedSpecs] = useState<any[]>([]);
    const [fileList, setFileList] = useState<any[]>([]);


    const currentStatus = Form.useWatch('status', form);
    const currentPriority = Form.useWatch('priority', form);

    const getStepperData = () => {
        // Default middle state if none is selected or if 'open' is selected
        const middleStates = ['in_progress', 'pending', 'out_of_service'];
        const activeMiddleState = middleStates.includes(currentStatus) ? currentStatus : 'in_progress';

        const steps = [
            { key: 'open', title: t('status.open') },
            { key: 'middle', title: t(`status.${activeMiddleState}`) },
            { key: 'closed', title: t('status.closed') }
        ];

        let currentStepIndex = 0;
        if (currentStatus === 'closed') {
            currentStepIndex = 2;
        } else if (middleStates.includes(currentStatus)) {
            currentStepIndex = 1;
        } else {
            currentStepIndex = 0; // 'open'
        }

        return { steps, currentStepIndex };
    };

    const { steps, currentStepIndex } = getStepperData();

    const getPriorityColor = (prio: string) => {
        switch (prio) {
            case 'important/urgent': return 'volcano';
            case 'important': return 'orange';
            case 'urgent': return 'red';
            case 'NA': return 'cyan';
            default: return 'blue';
        }
    };

    useEffect(() => {
        if (ticketData) {
            form.setFieldsValue({
                ...ticketData,
                assignee: ticketData.assignee?.map((a: any) => a.id),
            });
            if (ticketData.specialization) {
                const incoming = Array.isArray(ticketData.specialization) ? ticketData.specialization : [ticketData.specialization];
                setSelectedSpecs(incoming);
            }
            if (ticketData.attachments && Array.isArray(ticketData.attachments)) {
                const existingFiles = ticketData.attachments.map((file: any) => ({
                    uid: file.id,
                    name: file.fileName || file.name || 'Attachment',
                    status: 'done',
                    url: file.url,
                }));
                setFileList(existingFiles);
            }
        }
    }, [ticketData, form]);

    const allPossibleAssignees = [
        ...(techs || []),
        ...(admins || [])
    ].map((user: any) => ({
        value: user.id,
        label: `${user.first_name} ${user.last_name}`,
        group: user.user_type
    }));

    const onFinish = async (values: any) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('requester', user.id);

        const specId = selectedSpecs[0]?.id;
        if (specId) formData.append('specialization', specId);

        fileList.forEach((file) => {
            if (file.originFileObj instanceof File) {
                formData.append("media", file.originFileObj);
            }
        });


        if (!isRequester && isEdit) {
            formData.append('priority', values.priority);
            formData.append('status', values.status);
            formData.append('assigneeList', JSON.stringify(values.assignee));
        }

        try {
            if (!isEdit) {
                await createMutation.mutateAsync(formData);
            } else {
                if (!isRequester) {
                    await coordinateMutation.mutateAsync(formData);
                } else {
                    await updateMutation.mutateAsync(formData);
                }
            }
            message.success(t('success.saved'));
            navigate(`/${role}/tickets`);
        } catch (err) {
            message.error(t('errors.submitFailed'));
        }
    };

    const handleSpecSelect = (spec: any) => {
        setSelectedSpecs([spec]);
    };


    const specMenu = {
        items: specs?.map((s: any) => ({
            key: s.id,
            label: s.name,
            onClick: () => handleSpecSelect(s)
        }))
    };

    if (isEdit && isLoading) return <Card loading={true} />;

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div style={{ width: '100%', padding: '24px', boxSizing: 'border-box' }}>
            <Badge.Ribbon
                text={!isRequester && currentPriority ? t(`priority.${currentPriority}`) : ''}
                color={getPriorityColor(currentPriority)}
                style={{
                    display: !isRequester && currentPriority ? 'block' : 'none',
                    top: -10
                }}
            >
                <Card bordered={false}>
                    { }
                    {!isRequester && isEdit && (
                        <div style={{ marginBottom: 48, marginTop: 12, padding: '0 40px' }}>
                            <Steps
                                size="small"
                                current={currentStepIndex}
                                items={steps}
                            />
                        </div>
                    )}

                    <Typography.Title level={3} style={{ marginBottom: 24 }}>
                        {isEdit ? t('tickets.editTicket') : t('tickets.newTicket')}
                    </Typography.Title>

                    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ width: '100%' }}>

                        <Form.Item style={{ marginBottom: 24 }} label={
                            <Flex align="center" gap="middle" wrap="wrap" style={{ marginBottom: 8 }}>
                                <span>{t('tickets.problemType')}</span>
                                <Space size={8} wrap align="center">
                                    {selectedSpecs.length > 0 ? (
                                        <Tag color="blue" variant='outlined' style={{ marginInlineEnd: 0 }}>
                                            {selectedSpecs[0].name}
                                        </Tag>
                                    ) : (
                                        <Tag color="red" variant='outlined' style={{ marginInlineEnd: 0 }}>{t('tickets.autoAssignPlaceholder')}</Tag>
                                    )}
                                    <Dropdown menu={specMenu} trigger={['click']}>
                                        <Button type="dashed" shape="circle" size="small" icon={<PlusOutlined />} style={{ marginLeft: 4 }} />
                                    </Dropdown>
                                </Space>
                            </Flex>
                        } />


                        {!isRequester && isEdit && (
                            <div style={{ marginBottom: 24, borderRadius: '8px' }}>
                                <Flex gap="middle" wrap="wrap">
                                    <Form.Item name="priority" label={t('tickets.priority')} style={{ flex: 1, minWidth: '200px' }}>
                                        <Select options={[
                                            { value: 'important/urgent', label: t('priority.important/urgent') },
                                            { value: 'important', label: t('priority.important') },
                                            { value: 'urgent', label: t('priority.urgent') },
                                            { value: 'NA', label: t('priority.NA') }
                                        ]} />
                                    </Form.Item>
                                    <Form.Item name="status" label={t('tickets.status')} style={{ flex: 1, minWidth: '200px' }}>
                                        <Select options={[
                                            { value: 'open', label: t('status.open') },
                                            { value: 'in_progress', label: t('status.in_progress') },
                                            { value: 'pending', label: t('status.pending') },
                                            { value: 'out_of_service', label: t('status.out_of_service') },
                                            { value: 'closed', label: t('status.closed') }
                                        ]} />
                                    </Form.Item>
                                </Flex>
                                <Form.Item name="assignee" label={t('tickets.assignee')} style={{ marginBottom: 0 }}>
                                    <Select mode="multiple" placeholder={t('tickets.selectTechs')} options={allPossibleAssignees} optionRender={(option) => (
                                        <Flex justify="space-between">
                                            <span>{option.label}</span>
                                            <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                                                {option.data.group}
                                            </Typography.Text>
                                        </Flex>
                                    )} />
                                </Form.Item>
                            </div>
                        )}


                        <Form.Item name="title" label={<Flex align="center" gap="small"><span>{t('tickets.title')}</span><RequiredTag /></Flex>} rules={[{ required: true }]}>
                            <Input style={{ width: '100%' }} showCount maxLength={255} />
                        </Form.Item>


                        <Form.Item name="description" label={<Flex align="center" gap="small"><span>{t('tickets.description')}</span><RequiredTag /></Flex>} rules={[{ required: true }]}>
                            <TextArea style={{ width: '100%' }} showCount maxLength={20000} rows={6} />
                        </Form.Item>


                        <Form.Item label={
                            <Flex align="center" gap="middle">
                                <span>{t('tickets.attachments')}</span>
                                {canEditAttachments && (
                                    <Upload
                                        multiple
                                        fileList={fileList}
                                        beforeUpload={() => false}
                                        onChange={({ fileList }) => setFileList(fileList)}
                                        showUploadList={false}
                                    >
                                        <Button type="dashed" shape="circle" size="small" icon={<PlusOutlined />} />
                                    </Upload>
                                )}
                            </Flex>
                        }>
                            <Upload
                                listType="picture"
                                fileList={fileList}
                                onRemove={(file) => {
                                    if (!canEditAttachments) return false;
                                    const index = fileList.indexOf(file);
                                    const newFileList = fileList.slice();
                                    newFileList.splice(index, 1);
                                    setFileList(newFileList);
                                }}
                                showUploadList={{
                                    showRemoveIcon: canEditAttachments
                                }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginTop: 32 }}>
                            <Flex justify="flex-end" gap="middle">
                                <Button size="large"
                                    onClick={handleBack}>{t('common.back')}</Button>
                                <Button size="large" onClick={() => form.resetFields()}>{t('common.reset')}</Button>
                                <Button size="large" type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending || coordinateMutation.isPending}>
                                    {isEdit ? t('common.save') : t('common.create')}
                                </Button>
                            </Flex>
                        </Form.Item>
                    </Form>
                </Card>
            </Badge.Ribbon>
        </div>
    );
};

export default TicketForm;