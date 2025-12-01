import React from 'react';
import { Form, Input, TimePicker, Checkbox, Switch, Tag } from 'antd';
import { GenericCrudPage } from '../../../components/GenericCrudPage';
// import { workHoursApi } from '../services/api'; //comented for now
import type { WorkHour } from '../../profile/types';


const STATIC_DATA: WorkHour[] = [
  {
    id: 1,
    name_en: 'Morning Shift',
    startTime: '08:00',
    endTime: '16:00',
    isActive: true,
    daysOfWeek: [0, 1, 2, 3, 4], // Sun, Mon, Tue, Wed, Thu
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
    daysOfWeek: [5, 6], // Fri, Sat
  },
];

const mockService = {
  getAll: async () => {
    console.log('Fetching static data...');
    return new Promise<WorkHour[]>((resolve) => {
      setTimeout(() => resolve(STATIC_DATA), 500);
    });
  },
  create: async (data: any) => {
    console.log('Mock Create:', data);
    return Promise.resolve(data);
  },
  update: async (id: string | number, data: any) => {
    console.log('Mock Update:', id, data);
    return Promise.resolve(data);
  },
  delete: async (id: string | number) => {
    console.log('Mock Delete:', id);
    return Promise.resolve();
  }
} as any; 

const WorkHoursPage: React.FC = () => {
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
          {days.sort().map(d => (
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
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      )
    }
  ];

  const formItems = (
    <>
      <Form.Item 
        name="name" 
        label="Shift Name" 
        rules={[{ required: true, message: 'Please enter a name' }]}
      >
        <Input placeholder="e.g. Morning Shift" />
      </Form.Item>

      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item 
          name="startTime" 
          label="Start Time" 
          style={{ flex: 1 }}
          rules={[{ required: true }]}
        >
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item 
          name="endTime" 
          label="End Time" 
          style={{ flex: 1 }}
          rules={[{ required: true }]}
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


  return (
    <GenericCrudPage<WorkHour>
      title="Work Hours (Test Mode)"
      service={mockService} 
      columns={columns}
      formItems={formItems}
      disableAdd={true}
    />
  );
};

export default WorkHoursPage;