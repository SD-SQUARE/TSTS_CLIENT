
import { Layout, Space } from "antd"
import NavBar from "./components/layouts/Nav/NavBar"
import NavItem from "./components/layouts/Nav/components/NavItem"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "./routes/AppRoutes"
import { APP_BASE_PATH } from "./app/config"
import { useTranslation } from "react-i18next"
import GuardedRoute from "./routes/GuardedRoute"
import { useEffect, useState } from "react"
import { getUserData } from "./utils/getUserData.utils"
import { authInitialized, loginSuccess } from "./features/login/store/authSlice"
import { useDispatch, useSelector } from "react-redux"
import { loadCsrfToken } from "./api/http"

function App() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth);
    
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
        <BrowserRouter>
            <Layout style={{ width: '100%', minHeight: '100vh' }} className="white-bg" >
                {/* Navigation bar */}
                <NavBar>
                    {!user ?
                        <NavItem >{t('HOME')}</NavItem>
                        : (
                        
                        < >
                            <NavItem to={`${APP_BASE_PATH}/dashboard`}>{t('DASHBOARD')}</NavItem>
                            <NavItem to={`${APP_BASE_PATH}/knowledge-base`}>{t('Knowledge-Base')}</NavItem>
                            <NavItem to={`/${user.role.toLowerCase()}/tickets`}>{t('Tickets')}</NavItem>
                            <GuardedRoute roles={["admin"]} allowNavigation={false}>
                                <NavItem to={`/identities/groups`}>{t('Personnel')}</NavItem>
                            </GuardedRoute>    
                            <GuardedRoute roles={["admin"]} allowNavigation={false}>
                                <NavItem to={`/settings/domains`}>{t('Settings')}</NavItem>
                            </GuardedRoute>    
                        </>
                    )}
                </NavBar>

                {/* Pages Content */}
                <AppRoutes />

            </Layout>
        </BrowserRouter>
    )
}

export default App;