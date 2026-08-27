SELECT CompanyID, CompanyCode,CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation]
Where CompanyTypeCode='MUF' and ActiveFlag=1
 
 
SELECT SiteID,SiteCode,SiteName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteInformation]
Where CompanyID='COM01' and ManufacturingSiteFlag=1 and ActiveFlag=1
 
 
SELECT SectionID, SectionNo, SectionName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection]
Where CompanyID='COM01' and SiteID='Site1' and DepartmentID='DEP05' and ActiveFlag=1



exec [dbo].[USP_ProductionVsPlan] @CompanyID = 'COM01', @SiteID = 'Site1', @SectionID = 1, @Date = '2026-08-13'
GO


use FXPROInsight
Go

SELECT 
    Parameter_name = name,
    Type   = TYPE_NAME(user_type_id),
    Length = max_length,
    Param_order = parameter_id,
    Is_Output = is_output
FROM sys.parameters
WHERE object_id = OBJECT_ID('USP_Dashboard_SewingTeamOutputAnalysis_GetData');
GO


use FXPROInsight





exec [dbo].[USP_Dashboard_SewingTeamOutputAnalysis_GetData]@CompanyID = 'COM01', @SiteID = 'site1',  @Date = '2026-08-24', @TeamID = 1
GO

select name, max_length, TYPE_NAME(user_type_id) from sys.parameters where object_id = OBJECT_ID('USP_Dashboard_SewingTeamOutputAnalysis_GetData'); 
go

exec [dbo].[USP_Dashboard_SewingTeamOutputAnalysis_GetData]@CompanyID = 'COM01', @SiteID = 'site1',  @Date = '2026-08-13', @TeamID = 1, @ShiftWorkID = 1
GO

exec[dbo].[USP_Dashboard_WorkShift_GetList] @CompanyID = 'com01',@SiteID = 'site1', @WorkDate = '2026-08-25', @SectionID = 1;
GO

SELECT ShiftWorkID, ShiftWorkName FROM [lntdev-db01].[FXPRO].[dbo].[tblProductionSiteShiftWorkInformation]
Where CompanyID='COM01' and SiteID='Site1' and ProductionProcessCode='SEW' and DepartmentID='DEP05' and SectionID=1
and ActiveFlag=1