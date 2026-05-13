
import React, { useEffect, useMemo } from 'react';
import { Form, Card, Flex, Select, Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import type { GroupFormData, GroupUser, NamedObject } from '../Types/groups';
import RequiredTag from '../../../components/RequiredTag';
import { formatFullName, useGroupHeadCandidates } from '../Hooks/useGroupForm';


interface StepProps {
    initialData: GroupFormData;
    onNext: (data: Partial<GroupFormData>) => void;
}

const StepManagers: React.FC<StepProps> = ({ initialData, onNext }) => {
    const { t } = useTranslation();

    const { data: headCandidates, isLoading: isLoadingHeadCandidates } = useGroupHeadCandidates();


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapUsersToAntdOptions = (users: any) => {
        if (!users) return [];
        return users.map((user) => {
            const userType = user.user_type || '';
            const normalizedType = userType.toLowerCase();
            const roleLabel = normalizedType.includes('technician')
                ? t('translation.technician', { defaultValue: 'Technician' })
                : t('translation.admin', { defaultValue: 'Admin' });
            const name = formatFullName(user);

            return {
            value: user.id,
            label: (
                <Space size={6}>
                    <span>{name}</span>
                    <Tag color={normalizedType.includes('technician') ? 'blue' : 'green'} style={{ marginInlineEnd: 0 }}>
                        {roleLabel}
                    </Tag>
                </Space>
            ),
            textLabel: `${name} ${roleLabel}`,
        };
        });
    };

    const transformSelectedIdsToNamedObjects = (selectedIds: string[], allUsers: GroupUser[] | undefined): NamedObject[] => {
        if (!allUsers || selectedIds.length === 0) {
            return [];
        }
        return selectedIds.map(id => {
            const match = allUsers.find(user => user.id === id);
            return {
                id: id,
                name: match ? formatFullName(match) : 'Unknown User',
                user_type: match?.user_type,
            } as NamedObject;
        });
    };


    const headOptions = useMemo(() => mapUsersToAntdOptions(headCandidates), [headCandidates, t]);
const { handleSubmit, control, formState: { errors }, reset } = useForm<GroupFormData>({
    defaultValues: initialData,
    mode: 'onChange',
});

useEffect(() => {
    reset(initialData);
}, [initialData, reset]);


const filterOption = (input: string, option: any) => {
    if (!option) return false;
    
    return (option.textLabel || '').toLowerCase().includes(input.toLowerCase());
};



    const onSubmit = (data: GroupFormData) => {

        onNext({
            heads: data.heads,
        });
    };

    return (
        <Card title={t('group_form.step_managers_card_title')}>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)} id="step-form" requiredMark={false}>

                { }
                <Form.Item
                    label={<Flex align="start" gap="small">
                        <span>{t('translation.heads')}</span>
                        <RequiredTag />
                    </Flex>}
                    validateStatus={errors.heads ? 'error' : ''}

                    help={errors.heads?.message}
                    required
                >
                    <Controller
                        name="heads"
                        control={control}

                        rules={{
                            required: t('required'),
                            validate: (value) => (value && value.length > 0) || t('group_form.at_least_one_head_required'),
                        }}
                        render={({ field }) => (
                            <Select
                                {...field}
                                mode="multiple"
                                placeholder={t('group_form.select_heads_placeholder')}
                                loading={isLoadingHeadCandidates}
                                options={headOptions}

                                showSearch
                                filterOption={filterOption}

                                value={field.value ? field.value.map(h => h.id) : []}

                                onChange={(selectedIds: string[]) => {
                                    const selectedHeads = transformSelectedIdsToNamedObjects(selectedIds, headCandidates);
                                    field.onChange(selectedHeads);
                                }}
                            />
                        )}
                    />
                </Form.Item>

            </Form>
        </Card>
    );
};

export default StepManagers;
