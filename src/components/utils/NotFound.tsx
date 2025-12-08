import { Button, Result } from "antd"
import { useTranslation } from "react-i18next";
import { useGoBack } from "../../hooks/useGoBack";
import Body from "../layouts/Body";

const NotFound = () => {
    const { t } = useTranslation();
    const goBack = useGoBack();

    return (
        <Body>

            <Result
            status="404"
            title="404"
            subTitle={t('NOT_FOUND')}
            extra={
                <Button type="primary" className="primary-bg white-color" onClick={goBack}>{t('GO_BACK')}</Button>
            }
            />
        </Body>
    )
}

export default NotFound;
