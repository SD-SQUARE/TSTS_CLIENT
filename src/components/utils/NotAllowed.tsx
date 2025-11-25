import { Button, Result } from "antd"
import { useTranslation } from "react-i18next";
import { useGoBack } from "../../hooks/useGoBack";

const NotAllowed = () => {
    const { t } = useTranslation();
    const goBack = useGoBack();
    
    return (<Result
        status="403"
        title="403"
        subTitle={t('NOT_ALLOWED')}
        extra={
            <Button onClick={goBack} type="primary" className="primary-bg white-color">{t('GO_BACK')}</Button>
        }
    />)
}

export default NotAllowed;