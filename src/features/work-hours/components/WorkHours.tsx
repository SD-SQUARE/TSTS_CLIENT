import React, { useState } from 'react';
import { Form, Select, TimePicker, Tag } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import { workHoursApi } from '../services/workHoursApi'; 
import type { WorkHour, CreateWorkHourDto, UpdateWorkHourDto } from '../types/types';
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';

const formatTime = (time: any) => {
  if (!time) return null;
  return dayjs.isDayjs(time) ? time.format('HH:mm:ss') : time; 
};

const WorkHoursPage: React.FC = () => {
  const { t } = useTranslation();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 50 });

  const {
    data,
    isLoading,
    total, 
    useGetOne,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<WorkHour, CreateWorkHourDto, UpdateWorkHourDto>({
    queryKey: ['workHours', pagination.current, pagination.pageSize],
    
    fetchFn: () => workHoursApi.getAll({ 
      page: pagination.current, 
      page_size: pagination.pageSize 
    }),
    fetchOneFn: (id) => workHoursApi.getById(id),

    createFn: (values: any) => {
      const payload = {
        ...values,
        start_time: formatTime(values.start_time),
        end_time: formatTime(values.end_time),
      };
      return workHoursApi.create(payload as CreateWorkHourDto);
    },

    updateFn: ({ id, data: values }: any) => {
      const payload = {
        ...values,
        start_time: formatTime(values.start_time),
        end_time: formatTime(values.end_time),
      };
      return workHoursApi.update(id, payload as UpdateWorkHourDto);
    },

    deleteFn: (id) => workHoursApi.delete(id),
  });

  const columns = [
    { 
      title: t('start_time') || 'Start Time', 
      dataIndex: 'start_time', 
      key: 'start_time' 
    },
    { 
      title: t('end_time') || 'End Time', 
      dataIndex: 'end_time', 
      key: 'end_time' 
    },
    { 
      title: t('status') || 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => {
        const isActive = status?.toLowerCase() === 'active';
        return (
          <Tag color={isActive ? 'green' : 'red'} bordered={false}>
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      }
    }
  ];

  const formItems = (
    <>
      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item 
          name="start_time" 
          label={t('start_time') || "Start Time"} 
          style={{ flex: 1 }}
          rules={[{ required: true, message: t('required') || 'Please select start time' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item 
          name="end_time" 
          label={t('end_time') || "End Time"} 
          style={{ flex: 1 }}
          rules={[{ required: true, message: t('required') || 'Please select end time' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>
      </div>

      <Form.Item 
        name="status" 
        label={t('status') || "Status"} 
        rules={[{ required: true, message: t('required') || 'Please select status' }]}
      >
        <Select placeholder="Select Status">
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
        </Select>
      </Form.Item>
    </>
  );

  const nestedFieldMappers = {
    start_time: (record: WorkHour) => record.start_time ? dayjs(record.start_time, 'HH:mm:ss') : null,
    end_time: (record: WorkHour) => record.end_time ? dayjs(record.end_time, 'HH:mm:ss') : null,
  };

  return (
    <GenericCrudPage<WorkHour>
      title={t('work_hours') || "Work Hours"}
      columns={columns}
      formItems={formItems}
      data={data ?? []}
      isLoading={isLoading}
      total={total}
      useGetOne={useGetOne}
      pageIndex={pagination.current}
      pageSize={pagination.pageSize}
      onPageChange={(page, size) => setPagination({ current: page, pageSize: size })}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      nestedFieldMappers={nestedFieldMappers}
      tableSize="small"
    />
  );
};

export default WorkHoursPage;