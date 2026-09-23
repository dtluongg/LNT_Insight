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

-- test query:

use FXPROInsight
go

-- Check USP
Select name, TYPE_NAME(user_type_id), max_length FROM sys.parameters where object_id = OBJECT_ID('USP_FXPRO_Insight_SewingTeamPerformance_Summary');
GO

-- Query for 5 cartstat
exec [dbo].[USP_FXPRO_Insight_SewingTeamPerformance_Summary] @CompanyID = 'com01', @SiteID = 'site1', @SectionID = 0 , @Date = '2026-09-21'
GO

-- Query for main chart
exec [dbo].[USP_FXPRO_Insight_SewingTeamPerformance_Detail] @CompanyID = 'com01', @SiteID = 'site1', @SectionID = 0 , @Date = '2026-09-21'
GO

-- Query for get workshift
exec[dbo].USP_Dashboard_WorkShift_GetList @CompanyID = 'com01',@SiteID = 'site1', @WorkDate = '2026-09-14', @SectionID = 2;
go

-- Query for click bar on main chart (old)
exec [dbo].[USP_Dashboard_SewingTeamOutputAnalysis_GetData] @CompanyID = 'com01', @SiteID = 'site1', @TeamID = 7 , @Date = '2026-09-21', @ShiftWorkID =  2
GO

-- Query for click bar on main chart (new)
exec [dbo].[USP_FXPRO_Insight_Dashboard_SewingTeamOutputAnalysis_GetData] @CompanyID = 'com01', @SiteID = 'site1', @TeamID = 7 , @Date = '2026-09-21', @ShiftWorkID =  2
GO

-- Query for defect overrall => TeamID = 0
exec [dbo].[USP_FXPRO_Insight_SewingTeamPerformance_DefectDetail] @CompanyID = 'com01', @SiteID = 'site1', @SectionID = 0 , @Date = '2026-09-21', @TeamID = 0
GO

-- Query for defect overrall follow TeamID
exec [dbo].[USP_FXPRO_Insight_SewingTeamPerformance_DefectDetail] @CompanyID = 'com01', @SiteID = 'site1', @SectionID = 0 , @Date = '2026-09-21', @TeamID = 5
GO

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
-- check user 
exec dbo.USP_FXPRO_Insight_CheckUser @UserID = 'LNTSOFT1'
GO


