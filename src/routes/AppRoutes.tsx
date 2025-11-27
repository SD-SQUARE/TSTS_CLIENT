import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../features/login/pages/LoginPage";
import HomePage from "../components/Home";
import { PAGES_ROUTES_PATHS, PATH_NAMES } from "../app/route.helper";
import MainLayout from "../components/MainLayout";
import UniversitiesPage from "../pages/Universities";
import DomainsPage from "../pages/Domains";
import DepartmentsPage from "../pages/Departments";
import SpecializationsPage from "../pages/Specializations";
import WorkHoursPage from "../pages/WorkHours";
import PermissionsPage from "../pages/Permissions";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                
                <Route path={PAGES_ROUTES_PATHS[PATH_NAMES.LOGIN]} element={<LoginPage />} />
                
                <Route path={PAGES_ROUTES_PATHS[PATH_NAMES.HOME]} element={<HomePage />} />
                
                {/* Forget Password routes would go here... */}


                <Route element={<MainLayout />}>
                    
                    <Route 
                        path={PAGES_ROUTES_PATHS[PATH_NAMES.WORK_HOURS]} 
                        element={<WorkHoursPage />} 
                    />

                    <Route 
                        path={PAGES_ROUTES_PATHS[PATH_NAMES.UNIVERSITIES]} 
                        element={<UniversitiesPage />} 
                    />

                    <Route 
                        path={PAGES_ROUTES_PATHS[PATH_NAMES.DOMAINS]} 
                        element={<DomainsPage />} 
                    />

                    <Route 
                        path={PAGES_ROUTES_PATHS[PATH_NAMES.DEPARTMENTS]} 
                        element={<DepartmentsPage />} 
                    />

                    <Route 
                        path={PAGES_ROUTES_PATHS[PATH_NAMES.SPECIALIZATIONS]} 
                        element={<SpecializationsPage />} 
                    />

                    <Route 
                        path={PAGES_ROUTES_PATHS[PATH_NAMES.PERMISSIONS]} 
                        element={<PermissionsPage />} 
                    />

                </Route>


                <Route path="*" element={<div style={{ padding: 20, textAlign: 'center' }}><h1>404 Not Found</h1></div>} />

            </Routes>
        </BrowserRouter>
    );
};