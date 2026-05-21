import { lazy, Suspense } from "react";
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
    RestOutlined
} from '@ant-design/icons';
import GuardedRoute from "./GuardedRoute.tsx";
import PageLayout from "../components/PageLayout.tsx";
import { useTranslation } from "react-i18next";

const LoginPage = lazy(() => import("../features/login/pages/LoginPage").then((module) => ({ default: module.LoginPage })));
const GroupsList = lazy(() => import("../features/Groups/GroupsList.tsx"));
const UserList = lazy(() => import("../features/Users/Components/UsersList.tsx"));
const ForgotPasswordForm = lazy(() => import("../features/ForgotPasswordForm/ForgotPasswordForm.tsx"));
const GroupViewPage = lazy(() => import("../features/Groups/GroupViewPage.tsx"));
const UserViewPage = lazy(() => import("../features/Users/Components/UsersViewPage.tsx"));
const UniversitiesPage = lazy(() => import("../features/universities/components/Universities"));
const DomainsPage = lazy(() => import("../features/domains/components/Domains"));
const DepartmentsPage = lazy(() => import("../features/departments/components/Departments"));
const SpecializationsPage = lazy(() => import("../features/specializations/components/Specializations"));
const PermissionsPage = lazy(() => import("../features/permissions/components/Permissions"));
const KnowledgeBasePage = lazy(() => import("../features/knowledge-base/components/KnowledgeBasePage.tsx"));
const KnowledgeGeneratorPage = lazy(() => import("../features/knowledge-base/components/KnowledgeGeneratorPage.tsx"));
const KnowledgeGeneratorDetailPage = lazy(() => import("../features/knowledge-base/components/KnowledgeGeneratorDetailPage.tsx"));
const ChatCenterPage = lazy(() => import("../features/communications/components/ChatCenterPage.tsx"));
const SystemInfoTab = lazy(() => import("../features/profile/components/SystemInfo.component.tsx"));
const PersonnelDashboard = lazy(() => import("../features/Users/Components/PersonnelDashboard.tsx"));
const PublicFormPage = lazy(() => import("../features/CustomForms/pages/PublicFormPage.tsx"));
const CustomFormManager = lazy(() => import("../features/CustomForms/components/CustomFormManager"));
const FormEditPage = lazy(() => import("../features/CustomForms/components/FormEditPage"));
const FormPreviewPage = lazy(() => import("../features/CustomForms/components/FormPreviewPage"));
const ResponsesPage = lazy(() => import("../features/CustomForms/components/ResponsesPage"));
const SiteSettingsPage = lazy(() => import("../features/site-settings/components/SiteSettingsPage"));
const SlaManagementPage = lazy(() => import("../features/sla/components/SlaManagementPage"));
const RecycleBinPage = lazy(() => import("../features/recycle-bin/components/RecycleBinPage"));
const TicketList = lazy(() => import("../features/tickets/Components/ticketsList.tsx"));
const TicketForm = lazy(() => import("../features/tickets/Components/ticketForm.tsx"));
const TicketView = lazy(() => import("../features/tickets/Components/ticketDetails.tsx"));
const Profile = lazy(() => import("./../features/profile/Profile.page"));
const ProblemsPage = lazy(() => import("../features/Problems/components/ProblemsPage.tsx"));
const TrustedDevicesPage = lazy(() => import("../features/trusted-devices/pages/TrustedDevicesPage.tsx"));
const AuditLogList = lazy(() => import("../features/AuditLogs/Components/AuditLogsList.tsx"));
const AuditLogView = lazy(() => import("../features/AuditLogs/Components/AuditLogView.tsx"));
const DashboardPage = lazy(() => import("../features/Reports/Components/DashboardPage.tsx"));
const ReportViewPage = lazy(() => import("../features/Reports/Components/ReportPage.tsx"));
const AiAssistant = lazy(() => import("../features/ai-assistant/AiAssistant.tsx"));

const withBasePath = (path: string) => `${APP_BASE_PATH}${path}`;
const routeFallback = (
    <div style={{ minHeight: 320, display: "grid", placeItems: "center", color: "#6b7280" }}>
        Loading...
    </div>
);

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
        { key: withBasePath("/settings/sla"), label: t("sidebar.menu.slaManagement"), icon: <AlertOutlined /> },
        { key: withBasePath("/settings/recycle-bin"), label: t("sidebar.menu.recycleBin"), icon: <RestOutlined /> },
        { key: withBasePath("/settings/logs"), label: t("sidebar.menu.auditLogs"), icon: <ClockCircleOutlined /> },
    ];
    return (
        <Suspense fallback={routeFallback}>
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
                <Route index element={<PageLayout ><TicketList /></PageLayout>} />
                <Route path="new-ticket" element={<PageLayout><TicketForm /></PageLayout>} />
                <Route path=":id/*" element={<PageLayout><TicketView /></PageLayout>} />
                <Route path=":id/edit" element={<PageLayout><TicketForm /></PageLayout>} />
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
                    <GuardedRoute roles={["admin", "superadmin", "technician"]} permissions={["chat.view"]}>
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
            <Route path={`${APP_BASE_PATH}/*`} element={<PageLayout><NotFound /> </PageLayout>} />
        </Routes>
        </Suspense>
    );
};
