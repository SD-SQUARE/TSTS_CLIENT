/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */


import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, Button, Upload, Tag, Dropdown, Space, Typography, message, Flex, Card, Steps, Badge, TreeSelect } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import RequiredTag from '../../../components/RequiredTag';
import { useSelector } from 'react-redux';
import { fetchAdmins, fetchGroups, fetchGroupUsers,  useTicketDetails, useTicketMutations, useTicketProblems } from '../Hooks/useTicketForm';
import { queryClient } from '../../../app/queryClient';
import ReactQuill from 'react-quill-new';
import i18next from 'i18next';


const TicketForm: React.FC = () => {
    const { t } = useTranslation();
    const { id, role } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { user } = useSelector((state: any) => state.auth);
    const [treeReady, setTreeReady] = useState(false);

    const openstate = "Open"
    const closestate = "Closed"
    const in_progress_state = "In Progress"
    const pending_state = "Pending"
    const out_of_service_state = "Out of Service"
    const resolved_status = "Resolved"

    const isEdit = !!id;
    const isRequester = role === 'requester';
    const canEditAttachments = !isEdit || (isEdit && isRequester);

    const { data: groupedData } = useTicketProblems();
    const { data: ticketData, isLoading } = useTicketDetails(id);
    const { createMutation, updateMutation, coordinateMutation } = useTicketMutations(id);

    const [fileList, setFileList] = useState<any[]>([]);

    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
    
    const [treeData, setTreeData] = useState<any[]>([]);

    const currentStatus = Form.useWatch('status', form);
    const currentPriority = Form.useWatch('priority', form);

    useEffect(() => {
        const loadInitialGroups = async () => {
            try {
                const { data } = await fetchGroups();
                const groups = data.groups.map((g: any) => ({
                    id: g.id,
                    pId: 0,
                    value: g.id,
                    title: g.name,
                    isLeaf: false,
                    selectable: false,
                    checkable: false,
                    color: g.color
                }));
                const adminRoot = {
                    id: 'admin_root',
                    pId: 0,
                    value: 'admin_root',
                    title: t('Admins'),
                    isLeaf: false,
                    selectable: false,
                    checkable: false
                };
                setTreeData([adminRoot, ...groups]);
                setTreeReady(true);
            } catch (error) {
                message.error(t('errors.fetchGroupsFailed'));
            }
        };
        loadInitialGroups();
    }, [t]);

    const onLoadData = ({ id, pId, title }: any) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<void>(async (resolve) => {
            if (treeData.some(node => node.pId === id)) {
                resolve();
                return;
            }

            try {
                if (id === 'admin_root') {
                    const response = await queryClient.fetchQuery({
                        queryKey: ['admins'],
                        queryFn: fetchAdmins
                    });
                    const adminUsers = response.data?.users || [];

                    const adminNodes = adminUsers.map((u: any) => ({
                        id: u.id,
                        pId: 'admin_root',
                        value: u.id,
                        title: `${u.first_name} ${u.last_name}`,
                        isLeaf: true,
                        selectable: true
                    }));

                    setTreeData((prev) => {
                        const newUserIds = new Set(adminNodes.map(n => n.id));
                        const filteredPrev = prev.filter(node => !newUserIds.has(node.id));
                        return [...filteredPrev, ...adminNodes];
                    });
                    resolve();
                    return;
                }
                if (pId === 0) {
                    const roleNodes = [
                        { id: `${id}_tl`, pId: id, value: `${id}_tl`, title: t('team_leader'), isLeaf: false, selectable: false, checkable: false },
                        { id: `${id}_heads`, pId: id, value: `${id}_heads`, title: t('heads'), isLeaf: false, selectable: false, checkable: false },
                        { id: `${id}_techs`, pId: id, value: `${id}_techs`, title: t('Technicians'), isLeaf: false, selectable: false, checkable: false },
                    ];
                    setTreeData((prev) => {
                        const exists = prev.some(node => node.pId === id);
                        if (exists) return prev;
                        return [...prev, ...roleNodes];
                    }); resolve();
                    return;
                }
                const groupId = id.split('_')[0];
                const roleType = id.split('_')[1];

                const { data } = await fetchGroupUsers(groupId);
                let usersArray: any[] = [];

                if (roleType === 'tl' && data.team_leader) {
                    usersArray = [data.team_leader];
                } else if (roleType === 'heads') {
                    usersArray = data.heads || [];
                } else if (roleType === 'techs') {
                    usersArray = data.technicians || [];
                }

                const userNodes = usersArray.map((u: any) => ({
                    id: u.id,
                    pId: id,
                    value: u.id,
                    title: `${u.first_name} ${u.last_name}`,
                    isLeaf: true,
                    selectable: true
                }));

                setTreeData((prev) => {
                    const newUserIds = new Set(userNodes.map(n => n.id));
                    const filteredPrev = prev.filter(node => !newUserIds.has(node.id));
                    return [...filteredPrev, ...userNodes];
                });
                resolve();
            } catch (error) {
                console.error("Load failed", error);
                resolve();
            }
        });
    };
    const getStepperData = () => {
        const middleStates = [in_progress_state, pending_state, out_of_service_state];
        const middleStatesNames = ['in_progress', 'pending', 'out_of_service'];
        let activeMiddleState = 'in_progress';
        switch (currentStatus) {
            case in_progress_state:
                activeMiddleState = middleStatesNames[0];
                break;
            case pending_state:
                activeMiddleState = middleStatesNames[1];
                break;
            case out_of_service_state:
                activeMiddleState = middleStatesNames[2];
                break;
            default:
                activeMiddleState = middleStatesNames[0];
        }

        const steps = [
            { key: 'open', title: t('status.open') },
            { key: 'middle', title: t(`status.${activeMiddleState}`) },
            { key: 'Closed', title: t('status.closed') }
        ];

        let currentStepIndex = 0;
        if (currentStatus === 'Closed') {
            currentStepIndex = 2;
        } else if (middleStates.includes(currentStatus)) {
            currentStepIndex = 1;
        } else {
            currentStepIndex = 0; 
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

    // TODO: Remove useEffect that causes reace-condition
    // useEffect(() => {
    //     if (ticketData) {
    //         const assigneeIds = ticketData.assignee?.map((a: any) => a.id) || [];
    //         form.setFieldsValue({
    //             ...ticketData,
    //             assignee: assigneeIds,
    //             problem: ticketData.problem?.id
    //         });
    //         if (ticketData.assignee && ticketData.assignee.length > 0) {
    //             const ASSIGNED_GROUP_ID = 'currently_assigned_group';

    //             const assignedGroupNode = {
    //                 id: ASSIGNED_GROUP_ID,
    //                 pId: 0,
    //                 value: ASSIGNED_GROUP_ID,
    //                 title: t('tickets.currently_assigned'), 
    //                 isLeaf: false,
    //                 selectable: false,
    //             };
    //             const preloadedNodes = ticketData.assignee.map((a: any) => ({
    //                 id: a.id,
    //                 pId: ASSIGNED_GROUP_ID,
    //                 value: a.id,
    //                 title: a.name || `${a.first_name} ${a.last_name}`,
    //                 isLeaf: true,
    //                 selectable: true
    //             }));

    //             setTreeData((prev) => {
    //                 const newUserIds = new Set(preloadedNodes.map(n => n.id));
    //                 const filteredPrev = prev.filter(node => !newUserIds.has(node.id) && node.id !== ASSIGNED_GROUP_ID);
    //                 return [assignedGroupNode,...filteredPrev, ...preloadedNodes];
    //             });
    //         }
    //         if (ticketData.problem) {
    //             setSelectedProblem({
    //                 id: ticketData.problem.id,
    //                 name: ticketData.problem.name,
    //                 specId: ticketData.specialization?.id
    //             });
    //         }
    //         if (ticketData.attachments && Array.isArray(ticketData.attachments)) {
    //             const existingFiles = ticketData.attachments.map((file: any) => ({
    //                 uid: file.id,
    //                 name: file.fileName || file.name || 'Attachment',
    //                 status: 'done',
    //                 url: file.url,
    //             }));
    //             setFileList(existingFiles);
    //         }
    //     }
    // }, [ticketData, form]);

    useEffect(() => {
        if (!ticketData) return;

        form.setFieldsValue({
            ...ticketData,
            problem: ticketData.problem?.id,
        });

        if (ticketData.problem) {
            setSelectedProblemId(ticketData.problem.id);
        }

        if (Array.isArray(ticketData.attachments)) {
            setFileList(
                ticketData.attachments.map((file: any) => ({
                    uid: file.id,
                    name: file.fileName || file.name || 'Attachment',
                    status: 'done',
                    url: file.url,
                }))
            );
        }
    }, [ticketData]);

    useEffect(() => {
        if (!ticketData || !treeReady) return;

        const assigneeIds = ticketData.assignee?.map((a: any) => a.id) || [];
        if (assigneeIds.length === 0) return;

        const ASSIGNED_GROUP_ID = 'currently_assigned_group';

        const assignedGroupNode = {
            id: ASSIGNED_GROUP_ID,
            pId: 0,
            value: ASSIGNED_GROUP_ID,
            title: t('tickets.currently_assigned'),
            isLeaf: false,
            selectable: false,
            checkable: false
        };

        const preloadedNodes = ticketData.assignee.map((a: any) => ({
            id: a.id,
            pId: ASSIGNED_GROUP_ID,
            value: a.id,
            title: a.name || `${a.first_name} ${a.last_name}`,
            isLeaf: true,
            selectable: true,
        }));

        setTreeData(prev => [
            assignedGroupNode,
            ...prev.filter(n => !preloadedNodes.some(p => p.id === n.id)),
            ...preloadedNodes,
        ]);

        // CRITICAL: AFTER nodes exist
        form.setFieldsValue({ assignee: assigneeIds });

    }, [ticketData, treeReady]);


    const onFinish = async (values: any) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('requester', user.id);

        if (selectedProblemData) {
            formData.append('problem', selectedProblemData.id);
            formData.append('specialization', selectedProblemData.specId);
        }

        fileList.forEach((file) => {
            if (file.originFileObj instanceof File) {
                formData.append("media", file.originFileObj);
            }
        });


        if (!isRequester && isEdit) {
            formData.append('priority', values.priority);
            let status = '';
            switch (values.status) {
                case openstate:
                    status = "open";
                    break;
                case closestate:
                    status = "closed";
                    break;
                case in_progress_state:
                    status = "in_progress";
                    break;
                case pending_state:
                    status = "pending";
                    break;
                case resolved_status:
                    status = "resolved";
                    break;
                case out_of_service_state:
                    status = "out_of_service";
                    break;
                default:
                    status = "open";
            }
            formData.append('status', status);
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

    const selectedProblemData = useMemo(() => {
        if (!selectedProblemId || !groupedData) return null;
        
        for (const spec of groupedData.specializations) {
            const found = spec.problems?.find((p: any) => p.id === selectedProblemId);
            if (found) return { ...found, specId: spec.id };
        }
        return null;
    }, [selectedProblemId, groupedData]);

    const handleCustomReset = () => {
        const currentTitle = form.getFieldValue('title');
        const currentDescription = form.getFieldValue('description');

        form.resetFields();

        const restoredValues: any = {};

        if (currentTitle) restoredValues.title = currentTitle;
        if (currentDescription) restoredValues.description = currentDescription;

        if (Object.keys(restoredValues).length > 0) {
            form.setFieldsValue(restoredValues);
        }

        if (isEdit && ticketData?.attachments?.length) {
            setFileList(
                ticketData.attachments.map((file: any) => ({
                    uid: file.id,
                    name: file.fileName || file.name || 'Attachment',
                    status: 'done',
                    url: file.url,
                }))
            );
        } else {
            setFileList([]);
        }
    };
    // const handleCustomReset = () => {
    //     const currentTitle = form.getFieldValue('title');
    //     const currentDescription = form.getFieldValue('description');
    
    //     form.resetFields();
    
    //     form.setFieldsValue({
    //         title: currentTitle,
    //         description: currentDescription,
    //     });
    
    //     if (isEdit && ticketData?.attachments) {
    //         setFileList(ticketData.attachments.map((file: any) => ({
    //             uid: file.id,
    //             name: file.fileName || file.name || 'Attachment',
    //             status: 'done',
    //             url: file.url,
    //         })));
    //     } else {
    //         setFileList([]);
    //     }
    // };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'clean']
        ],
    };

    const problemMenuItems = groupedData?.specializations?.map((spec: any) => {
        const hasProblems = spec.problems && spec.problems.length > 0;

        return {
            key: `spec-${spec.id}`,
            label: (
                <span title={spec.name} style={{ display: 'inline-block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {spec.name}
                </span>
            ),
            children: hasProblems
                ? spec.problems?.map((prob: any) => ({
                    key: prob.id,
                    label: (
                        <span title={prob.name} style={{ display: 'inline-block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prob.name}
                        </span>
                    ),
                    onClick: () => {
                        setSelectedProblemId(prob.id);
                        form.setFieldValue('problem', prob.id);
                    }
                }))
                : [{
                    key: `empty-${spec.id}`,
                    label: (
                        <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                            <span title={spec.name} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{spec.name}</span>
                            {!hasProblems && <Tag style={{ fontSize: '10px', marginInlineEnd: 0 }}>{t('common.empty')}</Tag>}
                        </Flex>
                    ),
                    disabled: true,
                }]
        };
    }) || [];


    if (isEdit && isLoading) return <Card loading={true} />;

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div style={{ width: '100%', padding: '14px', boxSizing: 'border-box' }}>
            <Badge.Ribbon
                text={!isRequester && currentPriority ? t(`priority.${currentPriority}`) : ''}
                color={getPriorityColor(currentPriority)}
                style={{
                    display: !isRequester && currentPriority ? 'block' : 'none',
                    top: -10
                }}
            >
                <Card bordered={false}>
                    {!isRequester && isEdit && (
                        <div style={{ marginBottom: 14, marginTop: 12, padding: '0 40px' }}>
                            <Steps
                                size="small"
                                current={currentStepIndex}
                                items={steps}
                            />
                        </div>
                    )}

                    <Typography.Title level={3} style={{ marginBottom: 14 }}>
                        {isEdit ? t('tickets.editTicket') : t('tickets.newTicket')}
                    </Typography.Title>

                    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ width: '100%' }} >

                        <Form.Item style={{ marginBottom: 14 }} >
                            <Flex align="center" gap="middle" wrap="wrap" >
                                <span>{t('tickets.problemType')}</span>
                                <Space size={8} wrap align="center">
                                    {selectedProblemData ? (
                                        <Tag color="blue" variant='outlined' style={{ marginInlineEnd: 0 }}>
                                            {selectedProblemData.name}
                                        </Tag>
                                    ) : (
                                        <Tag color="red" variant='outlined' style={{ marginInlineEnd: 0 }}>{t('tickets.autoAssignPlaceholder')}</Tag>
                                    )}
                                    <Dropdown menu={{ items: problemMenuItems }} trigger={['click']}>
                                        <Button type="dashed" shape="circle" size="small" icon={<PlusOutlined />} style={{ marginLeft: 4 }} />
                                    </Dropdown>
                                </Space>
                            </Flex>
                            <Form.Item
                                name="problem"
                                noStyle
                                // rules={[{ required: true, message: t('errors.problemRequired') }]}
                            >
                                <Input type="hidden" />
                            </Form.Item>
                        </Form.Item>


                        {!isRequester && isEdit && (
                            <div style={{ marginBottom: 14, borderRadius: '8px' }}>
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
                                            { value: openstate, label: t('status.open') },
                                            { value: in_progress_state, label: t('status.in_progress') },
                                            { value: pending_state, label: t('status.pending') },
                                            { value: out_of_service_state, label: t('status.out_of_service') },
                                            { value: closestate, label: t('status.closed') },
                                            { value: resolved_status, label: t('status.resolved') }
                                        ]} />
                                    </Form.Item>
                                </Flex>
                                <Form.Item name="assignee" label={t('tickets.assignee')} style={{ marginBottom: 0 }}>
                                    <TreeSelect
                                        treeDataSimpleMode
                                        style={{ width: '100%' }}
                                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                        placeholder={t('tickets.selectTechs')}
                                        loadData={onLoadData}
                                        treeData={treeData}
                                        multiple
                                        treeCheckable
                                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                                        treeExpandAction="click"
                                        treeDefaultExpandAll={false}
                                    />
                                </Form.Item>
                            </div>
                        )}


                        <Form.Item name="title" label={<Flex align="center" gap="small"><span>{t('tickets.title')}</span><RequiredTag /></Flex>} rules={[{ required: true }]}>
                            <Input readOnly={isEdit} style={{ width: '100%' }} showCount maxLength={255} />
                        </Form.Item>


                        <Form.Item
                            name="description"
                            label={
                                <Flex align="center" gap="small">
                                    <span>{t('tickets.description')}</span>
                                    <RequiredTag />
                                </Flex>
                            }
                            rules={[{ required: true }]}
                            valuePropName="value"
                            getValueFromEvent={(value) => value}
                        >
                            <ReactQuill
                                theme="snow"
                                modules={modules}
                                placeholder={t('tickets.descriptionPlaceholder')}
                                readOnly={isEdit}
                                style={{
                                    height: '16rem',
                                    marginBottom: '1.5rem',
                                    direction: i18next.language === 'ar' ? 'rtl' : 'ltr',
                                }}
                            />
                        </Form.Item>
                        {/* <Form.Item 
    name="description" 
    label={<Flex align="center" gap="small"><span>{t('tickets.description')}</span><RequiredTag /></Flex>} 
    rules={[{ required: true }]}
    trigger="onChange"
    validateTrigger="onBlur"
>
    <ReactQuill 
        theme="snow"
        modules={modules}
        placeholder={t('tickets.descriptionPlaceholder')}
        readOnly={isEdit}
        style={{
            height: '200px',
            marginBottom: '1.5rem',
            direction: i18next.language === 'ar' ? 'rtl' : 'ltr'
         }} 
                                
    />
</Form.Item> */}


                        {canEditAttachments && (
                            <Form.Item label={
                                <Flex align="center" gap="middle">

                                    <span>{t('tickets.attachments')}</span>
                                    <Upload
                                        multiple
                                        fileList={fileList}
                                        beforeUpload={() => false}
                                        onChange={({ fileList }) => setFileList(fileList)}
                                        showUploadList={false}
                                    >
                                        <Button type="dashed" shape="circle" size="small" icon={<PlusOutlined />} />
                                    </Upload>

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
                        )}

                        <Form.Item style={{ marginTop: 1 }}>
                            <Flex
                                justify="space-between"
                                align="center"
                                wrap="wrap"
                                gap="middle"
                            >
                                {/* Right side (Actions) */}
                                <Flex gap="small" style={{ width: "100%" }}>
                                    {/* FIXME: Rest handler does not work */}
                                    {/* <Button
                                        size="large"
                                        danger
                                        onClick={handleCustomReset}
                                        styles={{
                                            root: {
                                                width: "100%"
                                            }
                                        }}
                                    >
                                        {t('common.reset')}
                                    </Button> */}

                                    <Button
                                        size="large"
                                        type="primary"
                                        htmlType="submit"
                                        loading={
                                            createMutation.isPending ||
                                            updateMutation.isPending ||
                                            coordinateMutation.isPending
                                        }
                                        styles={{
                                            root: {
                                                width: "100%"
                                            }
                                        }}
                                    >
                                        {isEdit ? t('common.save') : t('common.create')}
                                    </Button>
                                </Flex>
                                {/* Left side (Back) */}
                                <Button
                                    size="large"
                                    onClick={handleBack}
                                    styles={{
                                        root: {
                                            width: "100%"
                                        }
                                    }}
                                >
                                    {t('common.back')}
                                </Button>

                                
                            </Flex>
                        </Form.Item>
                        {/* <Form.Item >
                            <Flex justify="flex-end" gap="middle">
                                <Button size="large"
                                    onClick={handleBack}>{t('common.back')}</Button>
                                <Button size="large" onClick={handleCustomReset}>{t('common.reset')}</Button>
                                <Button size="large" type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending || coordinateMutation.isPending}>
                                    {isEdit ? t('common.save') : t('common.create')}
                                </Button>
                            </Flex>
                        </Form.Item> */}
                    </Form>
                </Card>
            </Badge.Ribbon>
        </div>
    );
};

export default TicketForm;