
import React, { useEffect, useMemo } from 'react';
import { Form, Card, Flex, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import type { GroupFormData, NamedObject } from '../Types/groups';
import RequiredTag from '../../../components/RequiredTag';
import { formatFullName, useAdmins, useTechnicians, type User } from '../Hooks/useGroupForm';


interface StepProps {
    initialData: GroupFormData;
    onNext: (data: Partial<GroupFormData>) => void;
}

const StepManagers: React.FC<StepProps> = ({ initialData, onNext }) => {
    const { t } = useTranslation();


    const { data: admins, isLoading: isLoadingAdmins } = useAdmins();
    const { data: technicians, isLoading: isLoadingTechnicians } = useTechnicians();


    const mapUsersToAntdOptions = (users: User[] | undefined) => {
        if (!users) return [];
        return users.map(user => ({
            value: user.id,
            label: formatFullName(user),
        }));
    };

    const transformSelectedIdsToNamedObjects = (selectedIds: string[], allUsers: User[] | undefined): NamedObject[] => {
        if (!allUsers || selectedIds.length === 0) {
            return [];
        }
        return selectedIds.map(id => {
            const match = allUsers.find(user => user.id === id);
            return {
                id: id,
                name: match ? formatFullName(match) : 'Unknown User',
            } as NamedObject;
        });
    };


    const adminOptions = useMemo(() => mapUsersToAntdOptions(admins), [admins]);
    const technicianOptions = useMemo(() => mapUsersToAntdOptions(technicians), [technicians]);


    // At the top of your component after useForm()
const { handleSubmit, control, formState: { errors }, reset } = useForm<GroupFormData>({
    defaultValues: initialData,
    mode: 'onChange',
});

useEffect(() => {
    reset(initialData);
}, [initialData, reset]);






    const onSubmit = (data: GroupFormData) => {

        onNext({
            heads: data.heads,
            teamLeaders: data.teamLeaders,
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
                                loading={isLoadingAdmins}
                                options={adminOptions}

                                value={field.value ? field.value.map(h => h.id) : []}

                                onChange={(selectedIds: string[]) => {
                                    const selectedHeads = transformSelectedIdsToNamedObjects(selectedIds, admins);
                                    field.onChange(selectedHeads);
                                }}
                            />
                        )}
                    />
                </Form.Item>

                { }
                <Form.Item
                    label={<Flex align="start" gap="small">
                        <span>{t('translation.team_leader')}</span>
                        <RequiredTag />
                    </Flex>}
                    validateStatus={errors.teamLeaders ? 'error' : ''}
                    help={errors.teamLeaders?.message}
                    required
                >
                    <Controller
                        name="teamLeaders"
                        control={control}
                        rules={{ required: t('required') }}
                        render={({ field }) => (
                            <Select
                                placeholder={t('group_form.team_leader_placeholder')}
                                loading={isLoadingTechnicians}
                                options={technicianOptions}
                                value={field.value?.id || undefined}
                                onChange={(selectedId: string) => {

                                    const selectedLeader = transformSelectedIdsToNamedObjects([selectedId], technicians)[0] || null;
                                    field.onChange(selectedLeader);
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