import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "../features/login/pages/LoginPage";
import HomePage from "../components/Home";
import MainLayout from "../components/MainLayout";

import UniversitiesPage from "../features/profile/pages/Universities";
import DomainsPage from "../features/profile/pages/Domains";
import DepartmentsPage from "../features/profile/pages//Departments";
import SpecializationsPage from "../features/profile/pages/Specializations";
import WorkHoursPage from "../features/profile/pages/WorkHours";
import PermissionsPage from "../features/profile/pages/Permissions";

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
