// BASE URL FOR AXIOS 
import { API_HOST,API_PORT, API_PROTOCOL} from "./config";
const API_BASE_URL: string = `${API_PROTOCOL}://${API_HOST}:${API_PORT}/api`;

/**
 * Builds API URL based on the given path and version.
 *
 * If version is not provided, it defaults to `v1`.
 *
 * If language is not stored in local storage, it defaults to `en`.
 *
 * @param {string} path - API path
 * @param {string} [version] - API version
 * @returns {string} - API URL
 * @example
 *
 * const url = ApiUrlBuilder(`users`, `v2`);
 * // url will be `/v2/users`
 */
export const ApiUrlBuilder = (path: string, version: string | null = 'v1'): string => {
    const API_VERSION: string = version ?? 'v1';

    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    return `/${API_VERSION}/${cleanPath}`;
};

/**
 * Replaces placeholders of path parameters in a route with given parameters.
 *
 * This function is used to replace path parameters
 * in API routes with actual values.
 *
 * @example
 * const route = `/users/:id/view`;
 * const params = {
 *   id: `1234`
 * };
 * const finalRoute = ApiPathMutator(route, params);
 * // finalRoute will be `/users/1234/view`
 *
 * @param {string} route - API route
 * @param {Record<string, string | number>} [params] - Parameters to replace placeholders
 * @returns {string} - Final API route
 */
export const ApiPathMutator = (route: string, params?: Record<string, string | number>): string => {
    let finalRoute = route;

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            finalRoute = finalRoute.replace(`:${key}`, encodeURIComponent(String(value)));
        });
    }

    return finalRoute;
};



export enum PATH_NAMES {
    BASE_PATH = "", 
    HEALTH = `health`,
    NOTFOUND = `not-found`,
    NOTIMPELEMENTED = `not-implemented`,
    NOTAUTHORIZED = `not-authorized`,
    RECYCLE_BIN = `recycle-bin`,
    HOME = `home`,
    LOGIN = `login`,
    FORGOT_PASSWORD = `forgot-password`,
    REFRESH_TOKEN = `refresh-token`,
    FORGOT_PASSWORD_OTP = `forgot-password-otp`,
    FORGOT_PASSWORD_RESET = `forgot-password-reset`,
    PROFILE = `profile`,
    VIEW_USER_PROFILE = `view-user-profile`,
    VIEW_USER_GROUPS = `view-user-groups`,
    VIEW_USER_SPECIALIZATIONS = `view-user-specializations`,
    WORK_HOURS = `work-hours`, 
    SELECTED_WORK_HOURS = `selected-work-hours`,
    REQUESTERS = `requesters`,
    TECHNICIANS = `technicians`,
    ADMINS = `admins`,
    ADD_REQUESTERS = `add-requesters`,
    EDIT_REQUESTERS = `edit-requesters`,
    ADD_TECHNICIANS = `add-technicians`,
    EDIT_TECHNICIANS = `edit-technicians`,
    ADD_ADMINS = `add-admins`,
    EDIT_ADMINS = `edit-admins`,
    SELECTED_REQUESTERS = `selected-requesters`,
    SELECTED_ADMINS = `selected-admins`,
    SELECTED_TECHNICIANS = `selected-technicians`,
    SELECTED_ADMIN = `selected-admin`,
    SELECTED_USER = `selected-user`,
    USERS = `users`,
    ENTITIES = `entities`,
    GROUPS = `groups`,
    DOMAINS = `domains`,
    DEPARTMENTS = `departments`,
    UNIVERSITIES = `universities`,
    SELECTED_DOMAIN = `selected-domain`,
    SELECTED_DEPARTMENT = `selected-department`,
    SELECTED_UNIVERSITY = `selected-university`,
    SELECTED_GROUP = `selected-group`,
    ADD_GROUPS = `add-groups`,
    EDIT_GROUPS = `edit-groups`,
    GROUP_ASSIGNMENTS = `group-assignments`,
    SPECIALIZATIONS = `specializations`,
    SELECTED_SPECIALIZATION = `selected-specialization`,
    PERMISSIONS = `permissions`,
    SELECTED_PERMISSION = `selected-permission`,
    LOCKUPS = `lockups`,
    UNIVERSITIES_LOCKUPS = `universities-lockups`,
    DOMAINS_LOCKUPS = `domains-lockups`,
    DEPARTMENTS_LOCKUPS = `departments-lockups`,
    GROUPS_LOCKUPS = `groups-lockups`,
    PERMISSIONS_LOCKUPS = `permissions-lockups`,
    PERMISSIONS_PROFILE_LOCKUPS = `permissions-profile-lockups`,
    ADMINS_LOCKUPS = `admins-lockups`,
    TECHNICIANS_LOCKUPS = `technicians-lockups`,
    SPECIALIZATIONS_LOCKUPS = `specializations-lockups`,
    REQUESTERS_LOCKUPS = `requesters-lockups`,
    USERS_LOCKUPS = `users-lockups`,
    LOGOUT = `logout`,
    CSRF_TOKEN = `csrf-token`,
    GROUPS_USERS = `groups-users`,
    PERMISSIONS_USERS = `permissions-users`,
    SPECIALIZATION_USERS = `specializations-users`,
    DEPARTMENT_USERS = `departments-users`,
    DOMAIN_USERS = `domains-users`,
    UNIVERSITY_USERS = `universities-users`,

}


/**
 * Example of how to use this object
 * <Route path={ PAGES_ROUTES_PATHS [ PATH_NAMES.LOGIN ] } element={<Profile />} />
 */
export const PAGES_ROUTES_PATHS = {
    [PATH_NAMES.RECYCLE_BIN]: `${PATH_NAMES.BASE_PATH}/profile/admin/recycle-bin`, // skip
    [PATH_NAMES.HOME]: `${PATH_NAMES.BASE_PATH}/`,
    [PATH_NAMES.HEALTH]: `${PATH_NAMES.BASE_PATH}/health`,
    [PATH_NAMES.NOTFOUND]: `${PATH_NAMES.BASE_PATH}/not-found`,
    [PATH_NAMES.NOTIMPELEMENTED]: `${PATH_NAMES.BASE_PATH}/not-implemented`,
    [PATH_NAMES.LOGIN]: `${PATH_NAMES.BASE_PATH}/login`,
    [PATH_NAMES.FORGOT_PASSWORD]: `${PATH_NAMES.BASE_PATH}/forget-password`,
    [PATH_NAMES.FORGOT_PASSWORD_OTP]: `${PATH_NAMES.BASE_PATH}/forget-password/otp/:oid`,
    [PATH_NAMES.FORGOT_PASSWORD_RESET]: `${PATH_NAMES.BASE_PATH}/forget-password/reset-password/:reset_token`,
    [PATH_NAMES.PROFILE]: `${PATH_NAMES.BASE_PATH}/profile/:id`,
    [PATH_NAMES.VIEW_USER_PROFILE]: `${PATH_NAMES.BASE_PATH}/profile/:id/view`,
    [PATH_NAMES.VIEW_USER_GROUPS]: `${PATH_NAMES.BASE_PATH}/profile/:id/view/groups`,
    [PATH_NAMES.VIEW_USER_SPECIALIZATIONS]: `${PATH_NAMES.BASE_PATH}/profile/:id/view/specializations`,
    [PATH_NAMES.WORK_HOURS]: `${PATH_NAMES.BASE_PATH}/system/configuration/work-hours`,
    [PATH_NAMES.USERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}`,
    [PATH_NAMES.REQUESTERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.REQUESTERS}`,
    [PATH_NAMES.TECHNICIANS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.TECHNICIANS}`,
    [PATH_NAMES.ADMINS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.ADMINS}`,
    [PATH_NAMES.ADD_REQUESTERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.REQUESTERS}/add`,
    [PATH_NAMES.ADD_TECHNICIANS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.TECHNICIANS}/add`,
    [PATH_NAMES.ADD_ADMINS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.ADMINS}/add}`,
    [PATH_NAMES.EDIT_REQUESTERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.REQUESTERS}/:id/edit`,
    [PATH_NAMES.EDIT_TECHNICIANS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.TECHNICIANS}/:id/edit`,
    [PATH_NAMES.EDIT_ADMINS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.ADMINS}/:id/edit`,
    [PATH_NAMES.SELECTED_REQUESTERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.REQUESTERS}/:id`,
    [PATH_NAMES.SELECTED_TECHNICIANS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.TECHNICIANS}/:id`,
    [PATH_NAMES.SELECTED_ADMINS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.USERS}/${PATH_NAMES.ADMINS}/:id`,
    [PATH_NAMES.UNIVERSITIES]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.UNIVERSITIES}`,
    [PATH_NAMES.SELECTED_UNIVERSITY]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.UNIVERSITIES}/:id`,
    [PATH_NAMES.DOMAINS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.DOMAINS}`,
    [PATH_NAMES.SELECTED_DOMAIN]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.DOMAINS}/:id`,
    [PATH_NAMES.GROUPS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.GROUPS}`,
    [PATH_NAMES.ADD_GROUPS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.GROUPS}/add`,
    [PATH_NAMES.EDIT_GROUPS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.GROUPS}/:id/edit`,
    [PATH_NAMES.GROUP_ASSIGNMENTS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.GROUPS}/:id/assign`,
    [PATH_NAMES.SELECTED_GROUP]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.GROUPS}/:id`,
    [PATH_NAMES.DEPARTMENTS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.DEPARTMENTS}`,
    [PATH_NAMES.SELECTED_DEPARTMENT]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.DEPARTMENTS}/:id`,
    [PATH_NAMES.SPECIALIZATIONS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.SPECIALIZATIONS}`,
    [PATH_NAMES.SELECTED_SPECIALIZATION]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.SPECIALIZATIONS}/:id`,
    [PATH_NAMES.PERMISSIONS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.PERMISSIONS}`,
    [PATH_NAMES.SELECTED_PERMISSION]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.PERMISSIONS}/:id`,
    [PATH_NAMES.GROUPS_USERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.GROUPS}/:id/users`,
    [PATH_NAMES.DEPARTMENT_USERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.DEPARTMENTS}/:id/users`,
    [PATH_NAMES.DOMAIN_USERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.DOMAINS}/:id/users`,
    [PATH_NAMES.UNIVERSITY_USERS]: `${PATH_NAMES.BASE_PATH}/${PATH_NAMES.ENTITIES}/${PATH_NAMES.UNIVERSITIES}/:id/users`,
};

/**
 * Example of how to use this object
 * 1. without params:
 *      ApiUrlBuilder(API_ROUTES_PATHS[PATH_NAMES.LOGIN]);
 * 
 * 2. with params:
 *      ApiUrlBuilder(
 *                      ApiPathMutator(
 *                                      API_ROUTES_PATHS[PATH_NAMES.SELETED_USER], 
 *                                      { id: 1 }
 *                                      )
 *                    );
 */
export const API_ROUTES_PATHS = {
    [PATH_NAMES.RECYCLE_BIN]: `/profile/admin/recycle-bin`, // skip
    [PATH_NAMES.HOME]: `/`,
    [PATH_NAMES.HEALTH]: `/health`,
    [PATH_NAMES.LOGIN]: `/auth/login`,
    [PATH_NAMES.REFRESH_TOKEN]: `/auth/refresh-token/:id`,
    [PATH_NAMES.CSRF_TOKEN]: `/auth/csrf-token`,
    [PATH_NAMES.LOGOUT]: `/auth/logout`,
    [PATH_NAMES.FORGOT_PASSWORD]: `/auth/forget-password`,
    [PATH_NAMES.FORGOT_PASSWORD_OTP]: `/auth/forget-password/verify-otp`,
    [PATH_NAMES.FORGOT_PASSWORD_RESET]: `/auth/forget-password/reset-password`,
    [PATH_NAMES.PROFILE]: `/profile/:id`,
    [PATH_NAMES.VIEW_USER_PROFILE]: `/profile/:id/view`,
    [PATH_NAMES.VIEW_USER_GROUPS]: `/profile/:id/view/groups`,
    [PATH_NAMES.VIEW_USER_SPECIALIZATIONS]: `/profile/:id/view/specializations`,
    [PATH_NAMES.WORK_HOURS]: `/system/configuration/work-hours`,// POST, GET
    [PATH_NAMES.SELECTED_WORK_HOURS]: `/system/configuration/work-hours/:id`,// DELETE, PUT, PATCH, GET SPECIFIC WORK HOURS
    [PATH_NAMES.USERS]: `/users`,
    [PATH_NAMES.REQUESTERS]: `/${PATH_NAMES.USERS}/${PATH_NAMES.REQUESTERS}`, // POST, GET
    [PATH_NAMES.TECHNICIANS]: `/${PATH_NAMES.USERS}/${PATH_NAMES.TECHNICIANS}`, // POST, GET
    [PATH_NAMES.ADMINS]: `/${PATH_NAMES.USERS}/${PATH_NAMES.ADMINS}`, // POST, GET
    [PATH_NAMES.SELECTED_REQUESTERS]: `/${PATH_NAMES.USERS}/${PATH_NAMES.REQUESTERS}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC USER
    [PATH_NAMES.SELECTED_TECHNICIANS]: `/${PATH_NAMES.USERS}/${PATH_NAMES.TECHNICIANS}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC USER
    [PATH_NAMES.SELECTED_ADMINS]: `/${PATH_NAMES.USERS}/${PATH_NAMES.ADMINS}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC USER
    [PATH_NAMES.UNIVERSITIES]: `/${PATH_NAMES.UNIVERSITIES}`, // POST, GET
    [PATH_NAMES.SELECTED_UNIVERSITY]: `/${PATH_NAMES.UNIVERSITIES}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC UNIVERSITY
    [PATH_NAMES.DOMAINS]: `/${PATH_NAMES.DOMAINS}`, // POST, GET
    [PATH_NAMES.SELECTED_DOMAIN]: `/${PATH_NAMES.DOMAINS}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC DOMAIN
    [PATH_NAMES.GROUPS]: `/${PATH_NAMES.GROUPS}`, // POST, GET
    [PATH_NAMES.SELECTED_GROUP]: `/${PATH_NAMES.GROUPS}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC GROUP
    [PATH_NAMES.DEPARTMENTS]: `/${PATH_NAMES.DEPARTMENTS}`, // POST, GET
    [PATH_NAMES.SELECTED_DEPARTMENT]: `/${PATH_NAMES.DEPARTMENTS}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC DEPARTMENT
    [PATH_NAMES.GROUP_ASSIGNMENTS]: `/${PATH_NAMES.GROUPS}/:id/assign`, // POST
    [PATH_NAMES.SPECIALIZATIONS]: `/${PATH_NAMES.SPECIALIZATIONS}`, // POST, GET
    [PATH_NAMES.SELECTED_SPECIALIZATION]: `/${PATH_NAMES.SPECIALIZATIONS}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC SPECIALIZATION
    [PATH_NAMES.PERMISSIONS]: `/${PATH_NAMES.PERMISSIONS}/${PATH_NAMES.PROFILE}`, // POST, GET
    [PATH_NAMES.SELECTED_PERMISSION]: `/${PATH_NAMES.PERMISSIONS}/${PATH_NAMES.PROFILE}/:id`, // DELETE, PUT, PATCH, GET SPECIFIC PERMISSION
    [PATH_NAMES.UNIVERSITIES_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.UNIVERSITIES}`, // GET
    [PATH_NAMES.DOMAINS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.DOMAINS}`, // GET
    [PATH_NAMES.GROUPS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.GROUPS}`, // GET
    [PATH_NAMES.DEPARTMENTS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.DEPARTMENTS}`, // GET
    [PATH_NAMES.SPECIALIZATIONS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.SPECIALIZATIONS}`, // GET
    [PATH_NAMES.PERMISSIONS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.PERMISSIONS}`, // GET
    [PATH_NAMES.TECHNICIANS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.TECHNICIANS}`, // GET
    [PATH_NAMES.ADMINS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.ADMINS}`, // GET
    [PATH_NAMES.PERMISSIONS_PROFILE_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.PERMISSIONS}/${PATH_NAMES.PROFILE}`, // GET
    [PATH_NAMES.REQUESTERS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.REQUESTERS}`, // GET
    [PATH_NAMES.USERS_LOCKUPS]: `/${PATH_NAMES.LOCKUPS}/${PATH_NAMES.USERS}`, // GET
    [PATH_NAMES.GROUPS_USERS]: `/${PATH_NAMES.GROUPS}/:id/users`, // GET
    [PATH_NAMES.DEPARTMENT_USERS]: `/${PATH_NAMES.DEPARTMENTS}/:id/users`,
    [PATH_NAMES.DOMAIN_USERS]: `/${PATH_NAMES.DOMAINS}/:id/users`,
    [PATH_NAMES.UNIVERSITY_USERS]: `/${PATH_NAMES.UNIVERSITIES}/:id/users`,
    [PATH_NAMES.SPECIALIZATION_USERS]: `/${PATH_NAMES.USERS}/:id/${PATH_NAMES.SPECIALIZATIONS}`,
    [PATH_NAMES.PERMISSIONS_USERS]: `/${PATH_NAMES.USERS}/:id/${PATH_NAMES.PERMISSIONS}`,
};