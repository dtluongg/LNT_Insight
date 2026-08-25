using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.IO;

namespace Backend_LNT_Insight.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize]
    public class CompaniesController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly bool _useLocalMockData;
        private readonly IWebHostEnvironment _env;

        public CompaniesController(IConfiguration configuration, IWebHostEnvironment env)
        {
            _useLocalMockData = configuration.GetValue<bool>("UseLocalMockData", false);
            _env = env;
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new ArgumentNullException("Connection string 'DefaultConnection' is missing!");
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        private IActionResult GetMockData(string fileName)
        {
            var filePath = Path.Combine(_env.ContentRootPath, "SSMS", "Data", "DataCompaniesController", fileName);
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { Message = $"Mock data file '{fileName}' not found." });
            }
            var jsonString = System.IO.File.ReadAllText(filePath);
            return Content(jsonString, "application/json");
        }

        [HttpGet]
        public async Task<IActionResult> GetCompanies()
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetCompanies.json");
            }

            using var db = CreateConnection();
            string sql = "SELECT CompanyID, CompanyCode, CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation] WHERE CompanyTypeCode = 'MUF' AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql)).ToList();
            return Ok(result);
        }

        [HttpGet("{companyID}/sites")]
        public async Task<IActionResult> GetSites(string companyID)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetSites.json");
            }

            using var db = CreateConnection();
            string sql = "SELECT SiteID, SiteCode, SiteName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteInformation] WHERE CompanyID = @CompanyID AND ManufacturingSiteFlag = 1 AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = companyID })).ToList();
            return Ok(result);
        }

        [HttpGet("{companyID}/sites/{siteID}/sections")]
        public async Task<IActionResult> GetSections(string companyID, string siteID, [FromQuery] string departmentID = "DEP05")
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetSections.json");
            }

            using var db = CreateConnection();
            string sql = "SELECT SectionID, SectionNo, SectionName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection] WHERE CompanyID = @CompanyID AND SiteID = @SiteID AND DepartmentID = @DepartmentID AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = companyID, SiteID = siteID, DepartmentID = departmentID })).ToList();
            return Ok(result);
        }

        [HttpGet("{companyID}/sites/{siteID}/sections/{sectionID}/date/{dateDay}/production-vs-plan")]
        public async Task<IActionResult> GetProductionVsPlan(string companyID, string siteID, int sectionID, DateTime dateDay)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetProductionVsPlan.json");
            }

            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_ProductionVsPlan", new { CompanyID = companyID, SiteID = siteID, SectionID = sectionID, Date = dateDay.Date }, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }
        [HttpGet("{companyID}/sites/{siteID}/date/{dateDay}/section/{sectionID}/shift_work")]

        public async Task<IActionResult> GetShiftWorkList(string companyID, string siteID, DateTime dateDay, int sectionID)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetShiftWorkList.json");
            }

            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_Dashboard_WorkShift_GetList", new { CompanyID = companyID, SiteID = siteID, WorkDate = dateDay.Date, SectionID = sectionID }, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }
        [HttpGet("{companyID}/sites/{siteID}/date/{dateDay}/team/{teamID}/shift_work/{shiftWorkID}/sewing_output")]

         public async Task<IActionResult> GetDataSewingTeamOutputAnalysis(string companyID, string siteID, DateTime dateDay, int teamID, int shiftWorkID)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetDataSewingOutputAnalysis.json");
            }

            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_Dashboard_SewingTeamOutputAnalysis_GetData", new { CompanyID = companyID, SiteID = siteID, Date = dateDay.Date, TeamID = teamID, ShiftWorkID = shiftWorkID }, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }
    }
}