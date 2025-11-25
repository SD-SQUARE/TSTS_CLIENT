import { Tag } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next';

const RequiredTag: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div>
            <Tag color="error">{t('forgotPassword.required')}</Tag>
        </div>
    )
}

export default RequiredTag
