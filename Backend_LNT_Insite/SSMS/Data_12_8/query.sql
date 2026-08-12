SELECT CompanyID, CompanyCode,CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation]
Where CompanyTypeCode='MUF' and ActiveFlag=1
 
 
SELECT SiteID,SiteCode,SiteName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteInformation]
Where CompanyID='COM01' and ManufacturingSiteFlag=1 and ActiveFlag=1
 
 
SELECT SectionName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection]
Where CompanyID='COM01' and SiteID='Site1' and DepartmentID='DEP05' and ActiveFlag=1


exec [dbo].[USP_ProductionVsPlan] @CompanyID = 'COM01', @SiteID = 'Site1'