USE [FXPROInsight]
GO

-- =========================================================================
-- Create AUTHENTICATION STORED PROCEDURES
-- =========================================================================

-- 1. Find user by Username
CREATE OR ALTER PROCEDURE USP_Auth_GetUserByUsername
    @Username NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Username, FullName, [Password], Email, Phone, Authorized, Admin, DefaultCompanyID, CreatedTime, LastUpdatePW, IsNewUser, VPN_UserName, VPN_DomainName, RefreshToken, RefreshTokenExpiryTime
    FROM tblMastUser
    WHERE Username = @Username;
END;
GO

-- 2. Update refresh Token:
CREATE OR ALTER PROCEDURE USP_Auth_UpdateRefreshToken
    @Username NVARCHAR(20),
    @RefreshToken NVARCHAR(100),
    @RefreshTokenExpiryTime NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE tblMastUser 
    SET RefreshToken = @RefreshToken, 
        RefreshTokenExpiryTime = @RefreshTokenExpiryTime
    WHERE Username = @Username;
END;
GO

USE [FXPROInsight]
GO

create or alter procedure USP_MD_GetModules
AS
Begin
	Select * from [dbo].[tblModuleMaster]
End;
GO

create or alter procedure USP_MD_GetUsers
AS
Begin
	Select * from [dbo].[tblMastUser]
End;
GO

create or alter procedure USP_MD_GetModuleSubMaster
AS
Begin
	Select * from [dbo].[tblModuleSubMaster]
End;
GO

EXEC [dbo].USP_MD_GetModuleSubMaster
GO

create or alter procedure USP_MD_GetSubModule
@ModuleMasterID nvarchar(5)
AS
Begin
	Select ModuleMasterSubID, ModuleMasterName
	From [dbo].[tblModuleSubMaster]
	Where ModuleMasterID = @ModuleMasterID
End;
GO

EXEC [dbo].[USP_MD_GetSubModule] @moduleMasterID = 'MD003'
GO