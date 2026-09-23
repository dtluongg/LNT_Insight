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
--------------------------------------------------------

select * from [lntdev-db01].[FXPRO].[dbo].[tblFXPROInsightUsers]
go

-- Create by Do Tien Luong
-- Create procedure for get all info of list user:
create or alter procedure USP_FXPRO_Insight_GetInfoAllUser
as
begin
select UserID, FullName, [Password], Email, Phone, Avatar, Signature, Checked, Authorized, Admin, CompanyID, SetByUser, CreatedTime, LastUpdatePW, IsNewUser, VPN_UserName, VPN_DomainName, DefaultCompanyID
from [lntdev-db01].[FXPRO].[dbo].[tblMastUser]
end;
go

exec [dbo].[USP_FXPRO_Insight_GetInfoAllUser]
go


-- Create by Do Tien Luong
-- Create procedure for get all info of 1 user:
create or alter procedure USP_FXPRO_Insight_GetInfoUser
@UserID nvarchar(20)
as
begin
select UserID, FullName, [Password], Email, Phone, Avatar, Signature, Checked, Authorized, Admin, CompanyID, SetByUser, CreatedTime, LastUpdatePW, IsNewUser, VPN_UserName, VPN_DomainName, DefaultCompanyID
from [lntdev-db01].[FXPRO].[dbo].[tblMastUser]
where UserID = @UserID
end;
go

exec [dbo].[USP_FXPRO_Insight_GetInfoUser] @UserID = 'lntsoft1'
go

-- Create by Do Tien Luong
-- Create procedure for check user available:
create or alter procedure USP_FXPRO_Insight_CheckUser
@UserID nvarchar(50)
AS
Begin
	SELECT u.*, p.Password FROM [lntdev-db01].[FXPRO].[dbo].[tblFXPROInsightUsers] u INNER JOIN [lntdev-db01].[FXPRO].[dbo].[tblMastUser] p ON u.UserID = p.UserID
	WHERE u.UserID = @UserID
End;
go

exec [dbo].[USP_FXPRO_Insight_CheckUser] @UserID = 'lntsoft3'
go



-- Create by Do Tien Luong
-- Create procedure for save refreshToken for auth:
create or alter procedure USP_FXPRO_Insight_SaveRefreshToken
@UserID nvarchar(20), @RefreshToken nvarchar(100), @RefreshTokenExpiryTime nvarchar(50)
AS
Begin
	SET NOCOUNT ON
	UPDATE [lntdev-db01].[FXPRO].[dbo].[tblFXPROInsightUsers]
	SET RefreshToken = @RefreshToken, RefreshTokenExpiryTime = @RefreshTokenExpiryTime
	WHERE UserID = @UserID
End;
go

-- test:
exec [dbo].[USP_FXPRO_Insight_SaveRefreshToken] @UserID = 'lntsoft1', @RefreshToken = 'asdfasdf', @RefreshTokenExpiryTime = 'asdadfasf'
go

-- Check user available:
select * from [lntdev-db01].[FXPRO].[dbo].[tblFXPROInsightUsers]
go


-- Check user mas company
select * from [lntdev-db01].[FXPRO].[dbo].[tblMastUserCompany]
Go


-- Create by Do Tien Luong
-- Create procedure for check list company of user:
CREATE or ALTER PROCEDURE USP_FXPRO_Insight_GetMastUserCompany
@UserID nvarchar(10)
AS
Begin 
	SELECT * from [lntdev-db01].[FXPRO].[dbo].[tblMastUserCompany] where UserID = @UserID
End;
GO

exec [dbo].[USP_FXPRO_Insight_GetMastUserCompany] @UserID ='lntsoft1'
GO


-- Create by Do Tien Luong
-- Create procedure for get list module:
CREATE or ALTER PROCEDURE USP_FXPRO_Insight_GetModules
AS
Begin
	Select * from [lntdev-db01].[FXPRO].[dbo].[tblFXPROInsightModuleMaster]
End;
GO

exec [dbo].[USP_FXPRO_Insight_GetModules]
GO

-- Create by Do Tien Luong
-- Create procedure for get list submodule of module:
CREATE or ALTER PROCEDURE USP_FXPRO_Insight_GetSubModules
@ModuleMasterID nvarchar(5)
AS
Begin
	Select * from [lntdev-db01].[FXPRO].[dbo].[tblFXPROInsightModuleSubMaster] WHERE ModuleMasterID = @ModuleMasterID
End;
GO

exec [dbo].[USP_FXPRO_Insight_GetSubModules] @ModuleMasterID = 'MD003'
GO


SELECT CompanyID, CompanyCode, CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation] WHERE CompanyTypeCode = 'MUF' AND ActiveFlag = 1
GO

-- Create by Do Tien Luong
-- Create procedure for get company
CREATE or ALTER PROCEDURE USP_FXPRO_Insight_GetCompanies
AS
Begin
	SELECT CompanyID, CompanyCode, CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation] WHERE CompanyTypeCode = 'MUF' AND ActiveFlag = 1
End;
GO

exec [dbo].[USP_FXPRO_Insight_GetCompanies]
GO


-- get site
SELECT SiteID, SiteCode, SiteName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteInformation] WHERE CompanyID = @CompanyID AND ManufacturingSiteFlag = 1 AND ActiveFlag = 1
Go


-- Create by Do Tien Luong
-- Create procedure for get site by company
CREATE or ALTER PROCEDURE USP_FXPRO_Insight_GetSitesByCompany
@CompanyID nvarchar(10)
AS
Begin
	SELECT SiteID, SiteCode, SiteName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteInformation] WHERE CompanyID = @CompanyID AND ManufacturingSiteFlag = 1 AND ActiveFlag = 1
End;
GO

exec [dbo].[USP_FXPRO_Insight_GetSitesByCompany] @CompanyID = 'com01'
GO

-- get section
SELECT SectionID, SectionNo, SectionName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection] WHERE CompanyID = @CompanyID AND SiteID = @SiteID AND DepartmentID = @DepartmentID AND ActiveFlag = 1
Go


-- Create by Do Tien Luong
-- Create procedure for get section by company and site
CREATE or ALTER PROCEDURE USP_FXPRO_Insight_GetSectionsByCompanyAndSite
@CompanyID nvarchar(10),
@SiteID nvarchar(10),
@DepartmentID nvarchar(10)
AS
Begin
	SELECT SectionID, SectionNo, SectionName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection] WHERE CompanyID = @CompanyID AND SiteID = @SiteID AND DepartmentID = @DepartmentID AND ActiveFlag = 1
End;
GO

exec [dbo].[USP_FXPRO_Insight_GetSectionsByCompanyAndSite] @CompanyID = 'com01', @SiteID ='site1', @DepartmentID = 'dep05'
GO

SELECT * FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection] 
go


---Creator: Nguyen Son Tung
---Copy writer: Do Tien Luong
-- Create procedure for get workshift
Create or alter procedure USP_FXPRO_Insight_Dashboard_WorkShift_GetList
@CompanyID as nvarchar(10),
@SiteID as nvarchar(10),
@WorkDate as date = null,
@SectionID int =0
as
begin
		declare @tblReturn as table (
		ShiftWorkID int,
		ShiftWorkName nvarchar(50),
		ShiftWorkStartTime nvarchar(100),
		ShiftWorkCompleteTime nvarchar(100),
		ShiftWorkNameWithTime nvarchar(200))
		
		insert @tblReturn
		exec [lntdev-db01].[FXPRO].[dbo].[USP_PROD_SewingStation_WorkShift_GetList] @CompanyID,@SiteID,@WorkDate,@SectionID

		select  a.ShiftWorkID,a.ShiftWorkName,a.ShiftWorkStartTime,a.ShiftWorkCompleteTime,a.ShiftWorkNameWithTime
		from	@tblReturn a
end
go

-- Query for get workshift
exec[dbo].USP_FXPRO_Insight_Dashboard_WorkShift_GetList @CompanyID = 'com01',@SiteID = 'site1', @WorkDate = '2026-09-14', @SectionID = 2;
go



---Creator: Nguyen Son Tung
---Copy writer: Do Tien Luong
-- Create procedure for get data analysis by workshift
Create PROCEDURE [dbo].[USP_FXPRO_Insight_Dashboard_SewingTeamOutputAnalysis_GetData]
	@CompanyID as nvarchar(10),		
	@SiteID nvarchar(10)=null,	
	@TeamID as int=0,
	@Date as date=null,
	@ShiftWorkID int
AS
BEGIN
	declare @tblReturn as table (
	ShiftHourID nvarchar(10),
	ShiftHourWithTime nvarchar(100),
	OutputQty int,
	HourlyPlan int,
	Achievement numeric(18,4),
	RunningOutput int,
	CumulativeVariance int,
	CumulativePlan int,
	OutputVariance int)


	insert @tblReturn
	exec [lntdev-db01].[FXPRO].[dbo].[USP_Dashboard_SewingTeamOutputAnalysis_GetData_WithoutOrder] @CompanyID,@SiteID,@TeamID,@Date,@ShiftWorkID

	select *
	from	@tblReturn a
end
go

-- Query for click bar on main chart (new)
exec [dbo].[USP_FXPRO_Insight_Dashboard_SewingTeamOutputAnalysis_GetData] @CompanyID = 'com01', @SiteID = 'site1', @TeamID = 7 , @Date = '2026-09-21', @ShiftWorkID =  2
GO