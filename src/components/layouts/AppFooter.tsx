import { Footer } from "antd/es/layout/layout"
import Text from "antd/es/typography/Text"
import { useTranslation } from "react-i18next"


const AppFooter = () => {

    const { t } = useTranslation();

    return (
        <Footer style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            maxHeight: "1em",
        }} className="primary-bg" >
            <Text strong className="gray-color">
                {t('FOOTER')} © {new Date().getFullYear()}
            </Text>
        </Footer>
    )
}

export default AppFooter