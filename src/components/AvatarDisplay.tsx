
import React from 'react';
import { Avatar, Tooltip } from 'antd';
import type { DisplayMember } from '../features/Groups/Types/groups';


interface AvatarDisplayProps {
  member: DisplayMember;
  maxInitials?: number;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ member }) => {

  if (!member || !member.name) {
    return null;
  }

  const getInitials = (name: string): string => {
    return name
      .split(/\s+/)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Tooltip title={member.name}>
      <Avatar
        style={{ backgroundColor: '#87d068', marginInlineEnd: 2 }}
        size="small"
      >
        {getInitials(member.name)}
      </Avatar>
    </Tooltip>
  );
};

export default AvatarDisplay;