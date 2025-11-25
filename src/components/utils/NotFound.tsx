import { Button, Result } from "antd"
import { useTranslation } from "react-i18next";
import { useGoBack } from "../../hooks/useGoBack";

const NotFound = () => {
    const { t } = useTranslation();
    const goBack = useGoBack();

    return (<Result
        status="404"
        title="404"
        subTitle={t('NOT_FOUND')}
        extra={
            <Button type="primary" className="primary-bg white-color" onClick={goBack}>{t('GO_BACK')}</Button>
        }
    />)
}

export default NotFound;
