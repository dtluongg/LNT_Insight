import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './providers/AuthProvider';

interface PermissionGuardProps {
    moduleMasterID: string;
    moduleMasterSubID: number;
    children: React.ReactElement;
    redirectTo?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    moduleMasterID, 
    moduleMasterSubID,
    children,
    redirectTo = '/blankPage'
}) => {
    const {authorizedPermissionSubModule, authorizedPermissionMasterModule} = useAuth();
    // Kiểm tra quyền SubModule (nếu có subID) hoặc MasterModule
    const hasPermission = moduleMasterSubID !== undefined
    ? authorizedPermissionSubModule(moduleMasterID, moduleMasterSubID)
    : authorizedPermissionMasterModule(moduleMasterID);
    if (!hasPermission) {
        return <Navigate to={redirectTo} replace />;
    }
    // Có quyền -> Render nội dung trang
    return children;
}