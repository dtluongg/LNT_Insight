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
    [Authorize]
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

        [HttpGet("{companyId}/sites")]
        public async Task<IActionResult> GetSites(string companyId)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetSites.json");
            }

            using var db = CreateConnection();
            string sql = "SELECT SiteID, SiteCode, SiteName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteInformation] WHERE CompanyID = @CompanyID AND ManufacturingSiteFlag = 1 AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = companyId })).ToList();
            return Ok(result);
        }

        [HttpGet("{companyId}/sites/{siteId}/sections")]
        public async Task<IActionResult> GetSections(string companyId, string siteId, [FromQuery] string departmentId = "DEP05")
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetSections.json");
            }

            using var db = CreateConnection();
            string sql = "SELECT SectionID, SectionNo, SectionName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanySiteDepartmentSection] WHERE CompanyID = @CompanyID AND SiteID = @SiteID AND DepartmentID = @DepartmentID AND ActiveFlag = 1";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = companyId, SiteID = siteId, DepartmentID = departmentId })).ToList();
            return Ok(result);
        }

        [HttpGet("{companyId}/sites/{siteId}/sections/{sectionId}/date/{dateDay}/production-vs-plan")]
        public async Task<IActionResult> GetProductionVsPlan(string companyId, string siteId, int sectionId, DateTime dateDay)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetProductionVsPlan.json");
            }

            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_ProductionVsPlan", new { CompanyID = companyId, SiteID = siteId, SectionID = sectionId, Date = dateDay.Date }, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }
    }
}
