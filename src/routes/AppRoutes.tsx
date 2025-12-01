import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/login/pages/LoginPage";
import HomePage from "../components/Home";
import MainLayout from "../components/MainLayout";

import UniversitiesPage from "../features/universities/components/Universities";
import DomainsPage from "../features/domains/components/Domains";
import DepartmentsPage from "../features/departments/components/Departments";
import SpecializationsPage from "../features/specializations/components/Specializations";
import WorkHoursPage from "../features/work-hours/components/WorkHours";
import PermissionsPage from "../features/permissions/components/Permissions";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<HomePage />} />

                {/* Routes that use MainLayout */}
                <Route element={<MainLayout />}>

                    <Route path="/work-hours" element={<WorkHoursPage />} />

                    <Route path="/universities" element={<UniversitiesPage />} />

                    <Route path="/domains" element={<DomainsPage />} />

                    <Route path="/departments" element={<DepartmentsPage />} />

                    <Route path="/specializations" element={<SpecializationsPage />} />

                    <Route path="/permissions" element={<PermissionsPage />} />

                </Route>

                {/* Fallback Route */}
                <Route 
                    path="*" 
                    element={
                        <div style={{ padding: 20, textAlign: 'center' }}>
                            <h1>404 Not Found</h1>
                        </div>
                    } 
                />

            </Routes>
        </BrowserRouter>
    );
};
