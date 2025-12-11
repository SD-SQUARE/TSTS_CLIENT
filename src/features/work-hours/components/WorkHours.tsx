import React from 'react';
import { Form, Input, TimePicker, Checkbox, Switch, Tag } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
import { useGenericCrud } from '../../../api/common/hooks/common-hooks';
import type { WorkHour, CreateWorkHourDto, UpdateWorkHourDto } from '../types/types';
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';

const STATIC_DATA: WorkHour[] = [
  {
    id: 1,
    name_en: 'Morning Shift',
    startTime: '08:00',
    endTime: '16:00',
    isActive: true,
    daysOfWeek: [0, 1, 2, 3, 4], 
  },
  {
    id: 2,
    name_en: 'Evening Shift',
    startTime: '16:00',
    endTime: '00:00',
    isActive: true,
    daysOfWeek: [0, 1, 2, 3, 4],
  },
  {
    id: 3,
    name_en: 'Weekend Shift',
    startTime: '10:00',
    endTime: '15:00',
    isActive: false,
    daysOfWeek: [5, 6], 
  },
];

const formatTime = (time: any) => {
  if (!time) return '00:00';
  return dayjs.isDayjs(time) ? time.format('HH:mm') : time;
};

const mockWorkHourService = {
  getAll: async (): Promise<WorkHour[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...STATIC_DATA]), 500));
  },
  
  create: async (data: CreateWorkHourDto): Promise<WorkHour> => {
    const newWorkHour = { 
      ...data, 
      id: Date.now(),
      startTime: formatTime(data.startTime), 
      endTime: formatTime(data.endTime)
    } as WorkHour;
    
    STATIC_DATA.push(newWorkHour);
    return Promise.resolve(newWorkHour);
  },

  update: async (id: string | number, data: UpdateWorkHourDto): Promise<WorkHour> => {
    const index = STATIC_DATA.findIndex(item => item.id === id);
    
    if (index > -1) {
      const updated = { 
        ...STATIC_DATA[index], 
        ...data,               
        startTime: formatTime(data.startTime), 
        endTime: formatTime(data.endTime)
      } as WorkHour;
      
      STATIC_DATA[index] = updated; 
      return Promise.resolve(updated);
    }
    return Promise.reject(new Error("Item not found"));
  },

  delete: async (id: string | number): Promise<void> => {
    const index = STATIC_DATA.findIndex(item => item.id === id);
    if (index > -1) {
      STATIC_DATA.splice(index, 1);
    }
    return Promise.resolve();
  },
};

const WorkHoursPage: React.FC = () => {
  const { t } = useTranslation();
  
  const daysOptions = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  const getDayLabel = (val: number) => daysOptions.find(d => d.value === val)?.label || val;

  const {
    data,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useGenericCrud<WorkHour, CreateWorkHourDto, UpdateWorkHourDto>({
    queryKey: ['workHours'],
    fetchFn: mockWorkHourService.getAll,
    createFn: mockWorkHourService.create,
    updateFn: ({ id, data }) => mockWorkHourService.update(id, data),
    deleteFn: mockWorkHourService.delete,
  });

  const columns = [
    { 
      title: 'Name', 
      dataIndex: 'name_en', 
      key: 'name' 
    },
    { 
      title: 'Shift Time', 
      key: 'time',
      render: (_: any, record: WorkHour) => (
        <span>{record.startTime} - {record.endTime}</span>
      )
    },
    { 
      title: 'Days', 
      dataIndex: 'daysOfWeek', 
      key: 'days',
      render: (days: number[]) => (
        <>
          {days?.sort().map(d => (
            <Tag color="blue" key={d}>{getDayLabel(d)}</Tag>
          ))}
        </>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'} bordered={false}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    }
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name_en" 
        label="Shift Name" 
        rules={[
          { required: true, message: 'Please enter a name' },
          { pattern: /^[A-Za-z0-9\s.,-]*$/, message: t("english_only") }
        ]}
      >
        <Input placeholder="e.g. Morning Shift" />
      </Form.Item>

      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item 
          name="startTime" 
          label="Start Time" 
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please select start time' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item 
          name="endTime" 
          label="End Time" 
          style={{ flex: 1 }}
          rules={[{ required: true, message: 'Please select end time' }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>
      </div>

      <Form.Item 
        name="daysOfWeek" 
        label="Working Days" 
        rules={[{ required: true, message: 'Select at least one day' }]}
      >
        <Checkbox.Group options={daysOptions} />
      </Form.Item>

      <Form.Item name="isActive" label="Active Status" valuePropName="checked">
        <Switch />
      </Form.Item>
    </>
  );

  const nestedFieldMappers = {
    startTime: (record: WorkHour) => record.startTime ? dayjs(record.startTime, 'HH:mm') : null,
    endTime: (record: WorkHour) => record.endTime ? dayjs(record.endTime, 'HH:mm') : null,
  };

  return (
    <GenericCrudPage<WorkHour>
      title="Work Hours (Test Mode)"
      columns={columns}
      formItems={formItems}
      data={data}
      isLoading={isLoading}
      createMutation={createMutation}
      updateMutation={updateMutation}
      deleteMutation={deleteMutation}
      nestedFieldMappers={nestedFieldMappers}
      disableAdd={true} 
      tableSize="small"
    />
  );
};

export default WorkHoursPage;