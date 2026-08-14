import type { ComponentType } from "react";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { BlankPage } from "../features/blankPage/pages/BlankPage";

export interface ModuleRouteConfig {
    moduleMasterID: string,
    path: string,
    component: ComponentType;
}
export interface SubModuleRouteConfig {
    moduleMasterID: string;
    subModuleMasterID: number;
    path: string;
    component: ComponentType;
}

export const moduleRoutes: ModuleRouteConfig[] = [
    // {
    //     moduleMasterID: 'MD003',
    //     path: '/management',
    //     component: BlankPage,
    // },
];

export const subModuleRoutes: SubModuleRouteConfig[] = [
    {
        moduleMasterID: 'MD003',
        subModuleMasterID: 2,
        path: '/sewing/team-performance',
        component: DashboardPage,
    },
];

export const getModuleRoute = (moduleMasterID: string) => {
    return moduleRoutes.find(
        route => route.moduleMasterID === moduleMasterID
    );
};

export const getSubModuleRoute = (
    moduleMasterID: string,
    subModuleMasterID: number
) => {
    return subModuleRoutes.find(
        route =>
            route.moduleMasterID === moduleMasterID &&
            route.subModuleMasterID === subModuleMasterID
    );
};