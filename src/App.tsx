
import { Layout } from "antd"
import NavBar from "./components/layouts/Nav/NavBar"
import NavItem from "./components/layouts/Nav/components/NavItem"
import { AppRoutes } from "./routes/AppRoutes"
import { useTranslation } from "react-i18next"
import GuardedRoute from "./routes/GuardedRoute"
import { useEffect } from "react"
import { getUserData } from "./utils/getUserData.utils"
import { authInitialized, loginSuccess } from "./features/login/store/authSlice"
import { useDispatch, useSelector } from "react-redux"
import { loadCsrfToken } from "./api/http"
import RealtimeBridge from "./features/communications/components/RealtimeBridge"
import { RobotOutlined } from "@ant-design/icons"

function App() {

    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth);
    const userRole = typeof user?.role === "string" ? user.role.toLowerCase() : "";

    useEffect(() => {
        loadCsrfToken().catch(console.error);
        const userData = getUserData();
        if (userData) {
            dispatch(loginSuccess(userData));
        } else {
            dispatch(authInitialized());
        }
    }, []);

    return (
        <>
            <Layout style={{ width: '100%', minHeight: '100vh' }}  >
                <RealtimeBridge />
                {/* Navigation bar */}
                <NavBar>
                    {!user ?
                        <NavItem >{t('HOME')}</NavItem>
                        : (

                            < >
                                <GuardedRoute roles={["admin"]} allowNavigation={false}>
                                    <NavItem to="/dashboard">{t("sidebar.menu.dashboard")}</NavItem>
                                </GuardedRoute>
                                
                                <NavItem to="/knowledge-base">{t("sidebar.menu.knowledgeBase")}</NavItem>
                                
                                {userRole && <NavItem to={`/${userRole}/tickets`}>{t("sidebar.menu.tickets")}</NavItem>}

                                {/* AI Assistant - only for requesters */}
                                {userRole === "requester" && (
                                    <NavItem to="/ai-assistant">
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <RobotOutlined />
                                            {t("ai_assistant.title", "AI Assistant")}
                                        </span>
                                    </NavItem>
                                )}
                                
                                <GuardedRoute roles={["admin"]} allowNavigation={false}>
                                    <NavItem to="/identities" activePrefixes={["/identities"]}>{t("sidebar.menu.personnel")}</NavItem>
                                </GuardedRoute>
                                
                                <GuardedRoute roles={["admin"]} allowNavigation={false}>
                                    <NavItem to="/settings/system-info" activePrefixes={["/settings"]}>{t("sidebar.menu.settings")}</NavItem>
                                </GuardedRoute>
                            </>
                        )}
                </NavBar>

                {/* Pages Content */}
                <AppRoutes />

            </Layout>
        </>
    )
}

export default App;
