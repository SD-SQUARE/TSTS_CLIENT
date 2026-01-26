
import { Layout } from "antd"
import NavBar from "./components/layouts/Nav/NavBar"
import NavItem from "./components/layouts/Nav/components/NavItem"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "./routes/AppRoutes"
import { APP_BASE_PATH } from "./app/config"
import { useTranslation } from "react-i18next"
import i18n from "./i18n"

function App() {
    const { t } = useTranslation();

    return (
        <BrowserRouter>
            <Layout style={{ width: '100%', height: '100vh' }} className="white-bg" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
                {/* Navigation bar */}
                <NavBar>
                    <NavItem to={`${APP_BASE_PATH}/`}>{t('HOME')}</NavItem>
                    <NavItem to={`${APP_BASE_PATH}/identities/groups`}>{t('Personnel')}</NavItem>
                    <NavItem to={`${APP_BASE_PATH}/settings/domains`}>{t('Settings')}</NavItem>
                </NavBar>

                {/* Pages Content */}
                <AppRoutes />

            </Layout>
        </BrowserRouter>
    )
}

export default App
