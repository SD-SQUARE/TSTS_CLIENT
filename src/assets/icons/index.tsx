
import Icon from '@ant-design/icons';
import type { GetProps } from 'antd';

import { SecurityShield } from './SecurityShield';
import { BrokenSecurityShield } from './BrokenSecurityShield';

type CustomIconComponentProps = GetProps<typeof Icon>;

export const SecurityShieldIcon: React.FC<Partial<CustomIconComponentProps>> = (props) => (
    <Icon component= { SecurityShield } { ...props } />
);

export const BrokenSecurityShieldIcon: React.FC<Partial<CustomIconComponentProps>> = (props) => (
    <Icon component= { BrokenSecurityShield } { ...props } />
);