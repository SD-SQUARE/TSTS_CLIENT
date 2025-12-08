import { Button, Result } from "antd"
import { useTranslation } from "react-i18next";
import { useGoBack } from "../../hooks/useGoBack";
import Body from "../layouts/Body";

const ServerError = () => {
    const { t } = useTranslation();
    const goBack = useGoBack();

    return (
        <Body>

        <Result
        status="500"
        title="500"
        subTitle={t('SERVER_ERROR')}
        extra={
            <Button onClick={goBack} type="primary" className="primary-bg white-color">{t('GO_BACK')}</Button>
        }
        />
        </Body>
    )
}

export default ServerError;