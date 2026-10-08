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
    public class MD3SMD2Controller : ControllerBase
    {
        private readonly string _connectionString;
        private readonly bool _useLocalMockData;
        private readonly IWebHostEnvironment _env;

        public MD3SMD2Controller(IConfiguration configuration, IWebHostEnvironment env)
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

        // // function for get list company
        // [HttpGet("com")]
        // public async Task<IActionResult> GetCompanies()
        // {
        //     if (_useLocalMockData)
        //     {
        //         return GetMockData("GetCompanies.json");
        //     }
        //     using var db = CreateConnection();
        //     // string sql = "SELECT CompanyID, CompanyCode, CompanyName FROM [lntdev-db01].[FXPRO].[dbo].[tblCompanyInformation]";
        //     string sql = "USP_FXPRO_Insight_GetCompanies";
        //     var result = (await db.QueryAsync<dynamic>(sql)).ToList();
        //     return Ok(result);
        // }

        // function for get all site of company
        [HttpGet("com/{comID}/si")]
        public async Task<IActionResult> GetSites(string comID)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetSites.json");
            }

            using var db = CreateConnection();
            string sql = "USP_FXPRO_Insight_GetSitesByCompany";
            var result = (await db.QueryAsync<dynamic>(sql, new { CompanyID = comID }, commandType: CommandType.StoredProcedure)).ToList();
            return Ok(result);
        }

        // function for get all section of company and site
        [HttpGet("com/{comID}/si/{siID}/se")]
        public async Task<IActionResult> GetSections(string comID, string siID, [FromQuery] string departmentID = "DEP05")
        {
            if(_useLocalMockData)
            {
                return GetMockData("GetSections.json");
            }
            using var db = CreateConnection();
            string sql = "USP_FXPRO_Insight_GetSectionsByCompanyAndSite";
            var result = (await db.QueryAsync<dynamic>(sql, new {CompanyID = comID, SiteID = siID, DepartmentID = departmentID})).ToList();
            return Ok(result);
        }

        // data for 5 statcard:
        [HttpGet("com/{comID}/si/{siID}/se/{seID}/date/{dateDay}/sewing_summary")]
        public async Task<IActionResult> GetSewingTeamPerformanceSummary(string comID, string siID, int seID, DateTime dateDay){
            if(_useLocalMockData){
                return GetMockData("GetSewingSummary.json");
            }
            using var db = CreateConnection();
            var result = (
                            await db.QueryAsync<dynamic>(
                                "USP_FXPRO_Insight_SewingTeamPerformance_Summary",
                                new {CompanyID = comID, SiteID = siID, SectionID = seID, Date = dateDay.Date},
                                commandType: CommandType.StoredProcedure)
                        ).ToList();
            return Ok(result);
        }

        // data for click Defect GMT open popup table column
        [HttpGet("com/{comID}/si/{siID}/se/{seID}/date/{dateDay}/overall_sewing_defect_nalysis")]
        public async Task<IActionResult> GetDataOverallSewingDefectAnalysis(string comID, string siID, string seID, DateTime dateDay, [FromQuery] int teamID = 0)
        {
            if(_useLocalMockData){
                return GetMockData("GetOverallDefectAnalysis.json");
            }
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_SewingTeamPerformance_DefectDetail",
                                                        new {CompanyID = comID, SiteID = siID, SectionID = seID, Date = dateDay.Date, TeamID = teamID},
                                                        commandType: CommandType.StoredProcedure
                                                        )).ToList();
            return Ok(result);
        }

        // data for bellow popup when click bar on table chart
        [HttpGet("com/{comID}/si/{siID}/se/{seID}/date/{dateDay}/team/{teamID}/team_sewing_defect_analysis")]
        public async Task<IActionResult> GetDataTeamSewingDefectAnalysis(string comID, string siID, string seID, DateTime dateDay, int teamID )
        {
            if(_useLocalMockData){
                return GetMockData("GetTeamDefectAnalysis.json");
            }
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_SewingTeamPerformance_DefectDetail",
                                                        new {CompanyID = comID, SiteID = siID, SectionID = seID, Date = dateDay.Date, TeamID = teamID},
                                                        commandType: CommandType.StoredProcedure
                                                        )).ToList();
            return Ok(result);
        }

        // data for detail table chart
        // PRODUCTION OUTPUT STATUS Function:
        [HttpGet("com/{comID}/si/{siID}/se/{seID}/date/{dateDay}/team_sewing_detail")]
        public async Task<IActionResult> GetSewingTeamPerformanceDetails(string comID, string siID, int seID, DateTime dateDay)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetSewingDetail.json");
            }

            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_SewingTeamPerformance_Detail", 
                                                        new { CompanyID = comID, SiteID = siID, SectionID = seID, Date = dateDay.Date }, 
                                                        commandType: CommandType.StoredProcedure
                                                      )).ToList();
            return Ok(result);
        }

        // get list workshiftID
        [HttpGet("com/{comID}/si/{siID}/se/{seID}/date/{dateDay}/workshift")]
        public async Task<IActionResult> GetWorkshiftList(string comID, string siID, int seID, DateTime dateDay)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetWorkshiftList.json");
            }
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_Dashboard_WorkShift_GetList", 
                                                        new{CompanyID = comID, SiteID = siID, WorkDate = dateDay.Date, SectionID = seID}, 
                                                        commandType: CommandType.StoredProcedure
                                                      )).ToList();
            return Ok(result);
        }

        // Get Analysis data by shiftwork for show on popup when click bar on chart table
        [HttpGet("com/{comID}/si/{siID}/date/{dateDay}/team/{teamID}/shiftwork/{shiftworkID}/sewing_analysis")]
        public async Task<IActionResult> GetDataSewingTeamAnalysis (string comID, string siID, DateTime dateDay, int teamID, int shiftworkID)
        {
            if (_useLocalMockData)
            {
                return GetMockData("GetDataSewingTeamAnalysis.json");
            }
            using var db = CreateConnection();
            var result = (await db.QueryAsync<dynamic>("USP_FXPRO_Insight_Dashboard_SewingTeamOutputAnalysis_GetData", 
                                                        new{CompanyID = comID, SiteID = siID, Date = dateDay.Date, TeamID = teamID, ShiftWorkID = shiftworkID}, 
                                                        commandType: CommandType.StoredProcedure
                                                      )).ToList();

            return Ok(result);
        }
    }
}