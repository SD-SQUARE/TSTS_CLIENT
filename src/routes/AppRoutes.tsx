import { Routes, Route } from "react-router-dom";
import { APP_BASE_PATH } from "../app/config.ts";
import NotFound from "../components/utils/NotFound.tsx";
import Home from "../components/Home.tsx";
import ServerError from './../components/utils/ServerError';
import NotAllowed from './../components/utils/NotAllowed';
import MainLayout from "../components/MainLayout";

import {
    CheckOutlined,
    ClockCircleOutlined,
    BankOutlined,
    ApartmentOutlined,
    ProjectOutlined,
    ExperimentOutlined,
    SafetyOutlined,
    TeamOutlined,
    UserOutlined,
    ToolOutlined,
    IdcardOutlined,
    IssuesCloseOutlined,
    PictureOutlined,
    AlertOutlined,
    RestOutlined,
    ApiOutlined
} from '@ant-design/icons';
import GuardedRoute from "./GuardedRoute.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { useTranslation } from "react-i18next";

import { LoginPage } from "../features/login/pages/LoginPage";
import GroupsList from "../features/Groups/GroupsList.tsx";
import UserList from "../features/Users/Components/UsersList.tsx";
import ForgotPasswordForm from "../features/ForgotPasswordForm/ForgotPasswordForm.tsx";
import GroupViewPage from "../features/Groups/GroupViewPage.tsx";
import UserViewPage from "../features/Users/Components/UsersViewPage.tsx";
import UniversitiesPage from "../features/universities/components/Universities";
import DomainsPage from "../features/domains/components/Domains";
import DepartmentsPage from "../features/departments/components/Departments";
import SpecializationsPage from "../features/specializations/components/Specializations";
import PermissionsPage from "../features/permissions/components/Permissions";
import KnowledgeBasePage from "../features/knowledge-base/components/KnowledgeBasePage.tsx";
import KnowledgeGeneratorPage from "../features/knowledge-base/components/KnowledgeGeneratorPage.tsx";
import KnowledgeGeneratorDetailPage from "../features/knowledge-base/components/KnowledgeGeneratorDetailPage.tsx";
import ChatCenterPage from "../features/communications/components/ChatCenterPage.tsx";
import SystemInfoTab from "../features/profile/components/SystemInfo.component.tsx";
import PersonnelDashboard from "../features/Users/Components/PersonnelDashboard.tsx";
import PublicFormPage from "../features/CustomForms/pages/PublicFormPage.tsx";
import CustomFormManager from "../features/CustomForms/components/CustomFormManager";
import FormEditPage from "../features/CustomForms/components/FormEditPage";
import FormPreviewPage from "../features/CustomForms/components/FormPreviewPage";
import ResponsesPage from "../features/CustomForms/components/ResponsesPage";
import SiteSettingsPage from "../features/site-settings/components/SiteSettingsPage";
import SlaManagementPage from "../features/sla/components/SlaManagementPage";
import ApiIntegrationsPage from "../features/api-integrations/components/ApiIntegrationsPage";
import RecycleBinPage from "../features/recycle-bin/components/RecycleBinPage";
import TicketList from "../features/tickets/Components/ticketsList.tsx";
import TicketForm from "../features/tickets/Components/ticketForm.tsx";
import TicketView from "../features/tickets/Components/ticketDetails.tsx";
import Profile from "./../features/profile/Profile.page";
import ProblemsPage from "../features/Problems/components/ProblemsPage.tsx";
import TrustedDevicesPage from "../features/trusted-devices/pages/TrustedDevicesPage.tsx";
import AuditLogList from "../features/AuditLogs/Components/AuditLogsList.tsx";
import AuditLogView from "../features/AuditLogs/Components/AuditLogView.tsx";
import DashboardPage from "../features/Reports/Components/DashboardPage.tsx";
import ReportViewPage from "../features/Reports/Components/ReportPage.tsx";
import AiAssistant from "../features/ai-assistant/AiAssistant.tsx";
import ApiDocsPage from "../features/api-docs/ApiDocsPage.tsx";
import IntegrationGuidePage from "../features/api-docs/IntegrationGuidePage.tsx";

const withBasePath = (path: string) => `${APP_BASE_PATH}${path}`;

export const AppRoutes = () => {
    const { t } = useTranslation();

    const IdentitiesMenuItems = [
        {
            key: withBasePath("/identities"),
            label: t("sidebar.menu.dashboard"),
            icon: <ProjectOutlined />,
        },
        {
            key: withBasePath("/identities/groups"),
            label: t("sidebar.menu.groups"),
            icon: <TeamOutlined />,
        },
        {
            key: withBasePath("/identities/users"),
            label: t("sidebar.menu.users"),
            icon: <UserOutlined />,
            children: [
                {
                    key: withBasePath("/identities/users/admins"),
                    label: t("sidebar.menu.admins"),
                    icon: <SafetyOutlined />,
                },
                {
                    key: withBasePath("/identities/users/technicians"),
                    label: t("sidebar.menu.technicians"),
                    icon: <ToolOutlined />,
                },
                {
                    key: withBasePath("/identities/users/requesters"),
                    label: t("sidebar.menu.requesters"),
                    icon: <IdcardOutlined />,
                },
            ],
        },
    ];
    const SettingsMenuItems = [
        { key: withBasePath("/settings/system-info"), label: t("sidebar.menu.systemInfo"), icon: <ProjectOutlined /> },
        { key: withBasePath("/settings/universities"), label: t("sidebar.menu.universities"), icon: <BankOutlined /> },
        { key: withBasePath("/settings/domains"), label: t("sidebar.menu.domains"), icon: <ProjectOutlined /> },
        { key: withBasePath("/settings/departments"), label: t("sidebar.menu.departments"), icon: <ApartmentOutlined /> },
        { key: withBasePath("/settings/specializations"), label: t("sidebar.menu.specializations"), icon: <ExperimentOutlined /> },
        { key: withBasePath("/settings/problems"), label: t("sidebar.menu.problems"), icon: <IssuesCloseOutlined /> },
        { key: withBasePath("/settings/trusted-devices"), label: t("sidebar.menu.trustedDevices"), icon: <SafetyOutlined /> },
        { key: withBasePath("/settings/permissions"), label: t("sidebar.menu.permissions"), icon: <CheckOutlined /> },
        { key: withBasePath("/settings/site-settings"), label: t("sidebar.menu.siteSettings"), icon: <PictureOutlined /> },
        { key: withBasePath("/settings/api-integrations"), label: t("sidebar.menu.apiIntegrations"), icon: <ApiOutlined /> },
        { key: withBasePath("/settings/sla"), label: t("sidebar.menu.slaManagement"), icon: <AlertOutlined /> },
        { key: withBasePath("/settings/recycle-bin"), label: t("sidebar.menu.recycleBin"), icon: <RestOutlined /> },
        { key: withBasePath("/settings/logs"), label: t("sidebar.menu.auditLogs"), icon: <ClockCircleOutlined /> },
        {
            key: "__api_docs__",
            label: (
                <a href="/api-docs" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    {t("sidebar.menu.apiDocs", "API Signatures")}
                </a>
            ),
            icon: <ApiOutlined />,
        },
        {
            key: "__integration_guide__",
            label: (
                <a href="/api-integration-guide" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    {t("sidebar.menu.integrationGuide", "Integration Guide")}
                </a>
            ),
            icon: <ApiOutlined />,
        },
    ];
    return (
        <Routes>
            <Route index path={`${APP_BASE_PATH}/`} element={<Home />} />
            <Route path={`${APP_BASE_PATH}/f/:token`} element={<PublicFormPage />} />

            <Route index path={`${APP_BASE_PATH}/profile`} element={
                    <PageLayout> <Profile /></PageLayout>
            } />
            
            <Route path={`${APP_BASE_PATH}/auth`}>
                <Route index element={<LoginPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordForm />} />
                <Route path="first-time/login" element={<ForgotPasswordForm />} />
            </Route>

            <Route path={`${APP_BASE_PATH}/identities`} element={
                <GuardedRoute roles={["superadmin", "admin"]}>
                    <MainLayout menuItems={IdentitiesMenuItems} />
                 </GuardedRoute>
            }>
                <Route index  element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["identities.dashboard.view"]}>
                       <PersonnelDashboard />
                     </GuardedRoute>
                } />
                
                <Route path="groups" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["groups.view"]}>
                        <GroupsList />
                     </GuardedRoute>
                } />
                <Route path="groups/:id" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["groups.view"]}>
                        <GroupViewPage />
                     </GuardedRoute>
                } />

                <Route path="users/technicians" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["users.view"]}>
                        <UserList role={'technicians'} />
                     </GuardedRoute>
                } />
                <Route path="users/requesters" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["users.view"]}>
                        <UserList role={'requesters'} />
                     </GuardedRoute>
                } />
                <Route path="users/admins" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["users.view"]}>
                        <UserList role={'admins'} />
                     </GuardedRoute>
                } />
                <Route path="users/:role/:id" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["users.view"]}>
                        <UserViewPage />
                     </GuardedRoute>
                } />
            </Route>

            <Route path={`${APP_BASE_PATH}/settings`} element={
                 <GuardedRoute roles={["superadmin", "admin"]}>
                    <MainLayout menuItems={SettingsMenuItems} />
                 </GuardedRoute>
                }>

                <Route path="universities" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["universities.view"]}>
                    <UniversitiesPage />
                     </GuardedRoute>
                } />
                
                <Route path="domains" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["domains.view"]}>
                        <DomainsPage />
                     </GuardedRoute>
                } />
                <Route path="departments" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["departments.view"]}>
                        <DepartmentsPage />
                     </GuardedRoute>
                } />
                <Route path="specializations" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["specializations.view"]}>
                        <SpecializationsPage />
                     </GuardedRoute>
                } />
                <Route path="problems" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["problems.view"]}>
                        <ProblemsPage />
                     </GuardedRoute>
                } />
                
                <Route path="trusted-devices" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["trusted_devices.view"]}>
                        <TrustedDevicesPage />
                     </GuardedRoute>
                } />
                <Route path="system-info" element={
                     <GuardedRoute roles={["superadmin", "admin"]} permissions={["settings.system_info.view"]}>
                        <SystemInfoTab />
                     </GuardedRoute>
                } />
                <Route path="permissions" element={
                    <GuardedRoute roles={["superadmin", "admin"]} permissions={["permissions.view", "permission_profiles.view"]}>
                        <PermissionsPage />
                    </GuardedRoute>
                } />
                <Route path="site-settings" element={
                    <GuardedRoute roles={["superadmin", "admin"]} permissions={["site_settings.view"]}>
                        <SiteSettingsPage />
                    </GuardedRoute>
                } />
                <Route path="api-integrations" element={
                    <GuardedRoute roles={["superadmin", "admin"]} permissions={["site_settings.view"]}>
                        <ApiIntegrationsPage />
                    </GuardedRoute>
                } />
                <Route path="sla" element={
                    <GuardedRoute roles={["superadmin", "admin"]} permissions={["sla.view"]}>
                        <SlaManagementPage />
                    </GuardedRoute>
                } />
                <Route path="recycle-bin" element={
                    <GuardedRoute roles={["superadmin", "admin"]} permissions={["recycle_bin.view"]}>
                        <RecycleBinPage />
                    </GuardedRoute>
                } />
                <Route path="logs" element={
                    <GuardedRoute roles={["superadmin", "admin"]} permissions={["audit_logs.view"]}>
                        <AuditLogList />
                    </GuardedRoute>
                } />
                <Route path="logs/:id" element={
                    <GuardedRoute roles={["superadmin", "admin"]} permissions={["audit_logs.view"]}>
                        <AuditLogView />
                    </GuardedRoute>
                } />
            </Route>
            <Route path={`${APP_BASE_PATH}/:role/tickets`}>
                <Route index element={

                    <GuardedRoute roles={["*"]}>
                        <PageLayout ><TicketList /></PageLayout>
                    </GuardedRoute>} />
                <Route path="new-ticket" element={

                    <GuardedRoute roles={["*"]}>
                        <PageLayout><TicketForm /></PageLayout>
                    </GuardedRoute>
                } />
                <Route path=":id/*" element={
                    <GuardedRoute roles={["*"]}>
                        <PageLayout><TicketView /></PageLayout>
                    </GuardedRoute>
                } />
                <Route path=":id/edit" element={
                    <GuardedRoute roles={["*"]}>
                        <PageLayout><TicketForm /></PageLayout>
                    </GuardedRoute>
                    } />
            </Route>

            {/* Admin/SuperAdmin all-tickets shortcut */}
            <Route path="/tickets" element={
                <GuardedRoute roles={["admin", "superadmin"]}>
                    <PageLayout><TicketList /></PageLayout>
                </GuardedRoute>
            } />

            <Route path="/dashboard" element={
                <GuardedRoute roles={["superadmin", "admin"]} permissions={["dashboard.view"]}>
                <PageLayout>
                    <DashboardPage />
                    </PageLayout>
                </GuardedRoute>
            } />
            
            <Route path="/reports/:id" element={
                <GuardedRoute roles={["superadmin", "admin"]} permissions={["reports.view"]}>
                <PageLayout>
                    <ReportViewPage />
                    </PageLayout>
                </GuardedRoute>
            } />

            <Route path="/ai-assistant" element={
                <GuardedRoute roles={["requester"]} allowNavigation={false}>
                    <PageLayout>
                        <AiAssistant />
                    </PageLayout>
                </GuardedRoute>
            } />

            <Route path="knowledge-base" element={<PageLayout><KnowledgeBasePage /> </PageLayout>} />
            <Route
                path="chat"
                element={
                    <GuardedRoute roles={["admin", "superadmin", "technician"]} >
                        <PageLayout><ChatCenterPage /></PageLayout>
                    </GuardedRoute>
                }
            />
            <Route
                path="knowledge-base/generator"
                element={
                    <GuardedRoute roles={["admin", "superadmin", "technician"]} permissions={["knowledge_generator.view"]}>
                        <PageLayout><KnowledgeGeneratorPage /></PageLayout>
                    </GuardedRoute>
                }
            />
            <Route
                path="knowledge-base/generator/:reportId"
                element={
                    <GuardedRoute roles={["admin", "superadmin", "technician"]} permissions={["knowledge_generator.view"]}>
                        <PageLayout><KnowledgeGeneratorDetailPage /></PageLayout>
                    </GuardedRoute>
                }
            />
            {/* LIST */}
            <Route
                path={`${APP_BASE_PATH}/forms`}
                element={
                        <PageLayout>
                            <CustomFormManager embedded={false} />
                        </PageLayout>
                }
            />

            {/* CREATE (isolated page) */}
            <Route
                path={`${APP_BASE_PATH}/forms/new`}
                element={
                        <PageLayout>
                            <FormEditPage />
                        </PageLayout>
                }
            />

            {/* EDIT (isolated page) */}
            <Route
                path={`${APP_BASE_PATH}/forms/:id/edit`}
                element={
                    <PageLayout>
                            <FormEditPage />
                        </PageLayout>
                }
            />

            {/* PREVIEW */}
            <Route
                path={`${APP_BASE_PATH}/forms/:id/preview`}
                element={
                     <PageLayout>
                            <FormPreviewPage />
                        </PageLayout>
                }
            />

            {/* RESPONSES */}
            <Route
                path={`${APP_BASE_PATH}/forms/:id/responses`}
                element={
                    <PageLayout>
                            <ResponsesPage />
                        </PageLayout>
                }
            />

            <Route path={`${APP_BASE_PATH}/server-error`} element={<PageLayout><ServerError /> </PageLayout>} />
            <Route path={`${APP_BASE_PATH}/not-allowed`} element={<PageLayout><NotAllowed /> </PageLayout>} />

            {/* Public integration guide — no auth required */}
            <Route path="/api-integration-guide" element={<IntegrationGuidePage />} />
            <Route path="/api-integration-guide/:docId" element={<IntegrationGuidePage />} />

            {/* API signatures — public, but linked only from admin sidebar */}
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/api-docs/:docId" element={<ApiDocsPage />} />

            <Route path={`${APP_BASE_PATH}/*`} element={<PageLayout><NotFound /> </PageLayout>} />
        </Routes>
    );
};
