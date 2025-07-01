const axios = require('axios');

exports.fetchTimeLine = async (req, res) => {
  try {
    const { instanceUrl, instanceToken } = req.body;

    if (!instanceUrl || !instanceToken) {
      return res.status(400).json({ message: "Missing instance information" });
    }

    let allContent = [];
    let page = 0;
    const size = 20;

    while (true) {
      const url = `${instanceUrl}/v1/ant/timeline/search/activity?page=${page}&size=${size}`;

      const payload = {
        quickSearch: {},
        contextFilter: {},
        filterContext: "GLOBAL_TIMELINE"
      };

      const config = {
        method: 'post',
        url,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': instanceToken
        },
        data: JSON.stringify(payload),
        maxBodyLength: Infinity
      };

      const response = await axios(config);

      const content = response?.data?.data?.content || [];
      allContent = [...allContent, ...content];

      const totalPages = response?.data?.data?.page?.totalPages;
      const currentPage = response?.data?.data?.page?.number;

      if (content.length === 0 || currentPage + 1 >= totalPages) {
        // Last page reached
        const fullResponse = {
          ...response.data,
          data: {
            ...response.data.data,
            content: allContent,
            page: {
              ...response.data.data.page,
              number: 0, // Reset to 0 if you want
              totalPages: 1, // Mark single combined response
              size: allContent.length,
              totalElements: allContent.length
            }
          }
        };
        return res.json(fullResponse);
      }

      page++;
    }

  } catch (error) {
    console.error("Error fetching timeline:", error.message);
    res.status(500).json({
      message: "Error fetching timeline",
      error: error.message
    });
  }
};


exports.CompanyTimeLine = async (req, res) => {
  try {
    // console.log(req.body, "req.body");
    const { instanceUrl, instanceToken, companyId, page = 0, size = 20 } = req.body;

    if (!instanceUrl || !instanceToken || !companyId) {
      return res.status(400).json({ message: "Missing instance information" });
    }

    const url = `${instanceUrl}/v1/ant/timeline/search/gsactivities?page=${page}&size=${size}&companyId=${companyId}`;

    const payload = {
      quickSearch: {},
      contextFilter: {},
      filterContext: "GLOBAL_TIMELINE",
    };

    const config = {
      method: 'post',
      url,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': instanceToken, // assuming token is a cookie string like "JSESSIONID=..."
      },
      data: JSON.stringify(payload),
      maxBodyLength: Infinity,
    };

    const response = await axios(config);

    // Optional: derive company name if needed here
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching timeline:", error.message);
    res.status(500).json({
      message: "Error fetching timeline",
      error: error.message,
    });
  }
};

const fs = require('fs').promises;
const path = require('path');

// Migration Tracking and Logging Utility
const MigrationTracker = {
  // Initialize tracking data
  initializeTracking() {
    return {
      migrationId: this.generateMigrationId(),
      startTime: new Date(),
      endTime: null,
      totalDuration: null,
      totalProcessed: 0,
      successfulMigrations: [],
      failedMigrations: [],
      statistics: {
        totalCount: 0,
        successCount: 0,
        failureCount: 0,
        batchesProcessed: 0,
        averageTimePerActivity: null
      },
      batchTiming: [],
      errors: [],
      summary: null
    };
  },

  // Generate unique migration ID
  generateMigrationId() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomId = Math.random().toString(36).substring(2, 8);
    return `migration_${timestamp}_${randomId}`;
  },

  // Track successful migration
  trackSuccess(trackingData, sourceActivityId, targetActivityId, activityDetails = {}) {
    const successRecord = {
      sourceActivityId: sourceActivityId,
      targetActivityId: targetActivityId,
      migratedAt: new Date().toISOString(),
      activityType: activityDetails.activityType || null,
      companyName: activityDetails.companyName || null,
      authorEmail: activityDetails.authorEmail || null,
      subject: activityDetails.subject || null
    };

    trackingData.successfulMigrations.push(successRecord);
    trackingData.statistics.successCount++;
    console.log(`✅ SUCCESS: Activity ${sourceActivityId} → ${targetActivityId}`);
  },

  // Track failed migration
  trackFailure(trackingData, sourceActivityId, reason, activityDetails = {}) {
    const failureRecord = {
      sourceActivityId: sourceActivityId,
      reason: reason,
      failedAt: new Date().toISOString(),
      activityType: activityDetails.activityType || null,
      companyName: activityDetails.companyName || null,
      authorEmail: activityDetails.authorEmail || null,
      subject: activityDetails.subject || null,
      errorCode: this.categorizeError(reason)
    };

    trackingData.failedMigrations.push(failureRecord);
    trackingData.statistics.failureCount++;
    console.log(`❌ FAILURE: Activity ${sourceActivityId} - ${reason}`);
  },

  // Categorize errors for better analysis
  categorizeError(reason) {
    if (reason.includes('API')) return 'API_ERROR';
    if (reason.includes('validation')) return 'VALIDATION_ERROR';
    if (reason.includes('timeout')) return 'TIMEOUT_ERROR';
    if (reason.includes('authentication')) return 'AUTH_ERROR';
    if (reason.includes('company')) return 'COMPANY_MAPPING_ERROR';
    if (reason.includes('user')) return 'USER_MAPPING_ERROR';
    if (reason.includes('activity type')) return 'ACTIVITY_TYPE_ERROR';
    if (reason.includes('attachment')) return 'ATTACHMENT_ERROR';
    return 'UNKNOWN_ERROR';
  },

  // Track batch timing
  trackBatchTiming(trackingData, batchIndex, batchSize, startTime, endTime, successCount, failureCount) {
    const duration = endTime - startTime;
    const batchRecord = {
      batchIndex: batchIndex + 1,
      batchSize: batchSize,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: duration,
      durationFormatted: this.formatDuration(duration),
      successCount: successCount,
      failureCount: failureCount,
      averageTimePerActivity: batchSize > 0 ? Math.round(duration / batchSize) : 0
    };

    trackingData.batchTiming.push(batchRecord);
    trackingData.statistics.batchesProcessed++;
  },

  // Track unexpected errors
  trackError(trackingData, error, context = '') {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      context: context,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name
    };

    trackingData.errors.push(errorRecord);
    console.error(`🚨 ERROR [${context}]: ${error.message}`);
  },

  // Finalize tracking and generate summary
  finalizeTracking(trackingData) {
    trackingData.endTime = new Date();
    trackingData.totalDuration = trackingData.endTime - trackingData.startTime;
    trackingData.totalProcessed = trackingData.statistics.successCount + trackingData.statistics.failureCount;

    // Calculate average time per activity
    if (trackingData.totalProcessed > 0) {
      trackingData.statistics.averageTimePerActivity = Math.round(trackingData.totalDuration / trackingData.totalProcessed);
    }

    // Generate comprehensive summary
    trackingData.summary = this.generateSummary(trackingData);

    return trackingData;
  },

  // Generate detailed summary report
  generateSummary(trackingData) {
    const successRate = trackingData.totalProcessed > 0 
      ? ((trackingData.statistics.successCount / trackingData.totalProcessed) * 100).toFixed(2)
      : 0;

    const summary = {
      migrationOverview: {
        migrationId: trackingData.migrationId,
        startTime: trackingData.startTime.toISOString(),
        endTime: trackingData.endTime.toISOString(),
        totalDuration: this.formatDuration(trackingData.totalDuration),
        totalDurationMs: trackingData.totalDuration
      },
      statistics: {
        totalActivitiesProcessed: trackingData.totalProcessed,
        successfulMigrations: trackingData.statistics.successCount,
        failedMigrations: trackingData.statistics.failureCount,
        successRate: `${successRate}%`,
        batchesProcessed: trackingData.statistics.batchesProcessed,
        averageTimePerActivity: `${trackingData.statistics.averageTimePerActivity}ms`,
        unexpectedErrors: trackingData.errors.length
      },
      performance: {
        totalBatches: trackingData.batchTiming.length,
        fastestBatch: this.getFastestBatch(trackingData.batchTiming),
        slowestBatch: this.getSlowestBatch(trackingData.batchTiming),
        averageBatchTime: this.getAverageBatchTime(trackingData.batchTiming)
      },
      errorAnalysis: this.analyzeErrors(trackingData.failedMigrations)
    };

    return summary;
  },

  // Helper function to format duration
  formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s ${milliseconds % 1000}ms`;
    }
  },

  // Analyze batch performance
  getFastestBatch(batchTiming) {
    if (batchTiming.length === 0) return null;
    const fastest = batchTiming.reduce((prev, current) => 
      (prev.duration < current.duration) ? prev : current
    );
    return {
      batchIndex: fastest.batchIndex,
      duration: this.formatDuration(fastest.duration),
      activitiesProcessed: fastest.batchSize
    };
  },

  getSlowestBatch(batchTiming) {
    if (batchTiming.length === 0) return null;
    const slowest = batchTiming.reduce((prev, current) => 
      (prev.duration > current.duration) ? prev : current
    );
    return {
      batchIndex: slowest.batchIndex,
      duration: this.formatDuration(slowest.duration),
      activitiesProcessed: slowest.batchSize
    };
  },

  getAverageBatchTime(batchTiming) {
    if (batchTiming.length === 0) return '0ms';
    const totalTime = batchTiming.reduce((sum, batch) => sum + batch.duration, 0);
    const averageTime = totalTime / batchTiming.length;
    return this.formatDuration(averageTime);
  },

  // Analyze error patterns
  analyzeErrors(failedMigrations) {
    const errorCounts = {};
    failedMigrations.forEach(failure => {
      const errorCode = failure.errorCode;
      errorCounts[errorCode] = (errorCounts[errorCode] || 0) + 1;
    });

    const sortedErrors = Object.entries(errorCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([errorType, count]) => ({ errorType, count }));

    return {
      totalErrors: failedMigrations.length,
      errorBreakdown: sortedErrors,
      mostCommonError: sortedErrors[0] || null
    };
  },

  // Save tracking data to file
  async saveTrackingData(trackingData, outputDir = './migration-logs') {
    try {
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });

      const fileName = `migration_log_${trackingData.migrationId}.json`;
      const filePath = path.join(outputDir, fileName);

      // Save complete tracking data
      await fs.writeFile(filePath, JSON.stringify(trackingData, null, 2));
      console.log(`📊 Migration tracking data saved to: ${filePath}`);

      // Save summary report separately
      const summaryFileName = `migration_summary_${trackingData.migrationId}.json`;
      const summaryFilePath = path.join(outputDir, summaryFileName);
      await fs.writeFile(summaryFilePath, JSON.stringify(trackingData.summary, null, 2));
      console.log(`📋 Migration summary saved to: ${summaryFilePath}`);

      return { logFile: filePath, summaryFile: summaryFilePath };

    } catch (error) {
      console.error('Error saving tracking data:', error.message);
      return null;
    }
  },

  // Print console summary
  printConsoleSummary(trackingData) {
    const summary = trackingData.summary;
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 MIGRATION SUMMARY REPORT');
    console.log('='.repeat(80));
    console.log(`Migration ID: ${summary.migrationOverview.migrationId}`);
    console.log(`Duration: ${summary.migrationOverview.totalDuration}`);
    console.log(`Total Processed: ${summary.statistics.totalActivitiesProcessed}`);
    console.log(`✅ Successful: ${summary.statistics.successfulMigrations}`);
    console.log(`❌ Failed: ${summary.statistics.failedMigrations}`);
    console.log(`📈 Success Rate: ${summary.statistics.successRate}`);
    console.log(`⚡ Average Time per Activity: ${summary.statistics.averageTimePerActivity}`);
    
    if (summary.errorAnalysis.totalErrors > 0) {
      console.log('\n📋 Error Breakdown:');
      summary.errorAnalysis.errorBreakdown.forEach(error => {
        console.log(`  • ${error.errorType}: ${error.count} occurrences`);
      });
    }
    
    console.log('='.repeat(80) + '\n');
  }
};

// Your existing constants and mappings remain the same
const ACTIVITY_TYPE_MAPPING = [
  { "Old Verizon Activity Type Name": "3G At-Risk Migration Update", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "3G Migration Update", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Admin Agent Update", "Activity Type": "Update", "Sub-Activity Type": "Admin Agent Update" },
  { "Old Verizon Activity Type Name": "Admin Intake Form", "Activity Type": "Update", "Sub-Activity Type": "Admin Intake Form" },
  { "Old Verizon Activity Type Name": "Adoption Discussion", "Activity Type": "Update", "Sub-Activity Type": "Adoption Discussion" },
  { "Old Verizon Activity Type Name": "At-Risk Customer Update", "Activity Type": "Update", "Sub-Activity Type": "At-Risk Customer Update" },
  { "Old Verizon Activity Type Name": "Call", "Activity Type": "Call", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Cancellation Request", "Activity Type": "Cancellation Request", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "CRT/PRM Update", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "CST - Adoption", "Activity Type": "Update", "Sub-Activity Type": "CST - Adoption" },
  { "Old Verizon Activity Type Name": "CST - Revenue Generating", "Activity Type": "Update", "Sub-Activity Type": "CST - Revenue Generating" },
  { "Old Verizon Activity Type Name": "CST - RYG", "Activity Type": "Update", "Sub-Activity Type": "CST - RYG" },
  { "Old Verizon Activity Type Name": "Customer Note", "Activity Type": "Update", "Sub-Activity Type": "Customer Note" },
  { "Old Verizon Activity Type Name": "EBR", "Activity Type": "Meeting", "Sub-Activity Type": "EBR" },
  { "Old Verizon Activity Type Name": "Email", "Activity Type": "Email", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "EST Update", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Ex-Customer Update", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Gov Cancellation Request", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Internal", "Activity Type": "Update", "Sub-Activity Type": "Internal" },
  { "Old Verizon Activity Type Name": "Meeting", "Activity Type": "Meeting", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Milestone", "Activity Type": "Milestone", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Predictive Churn", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "QBR", "Activity Type": "Meeting", "Sub-Activity Type": "QBR" },
  { "Old Verizon Activity Type Name": "Renewal Update", "Activity Type": "Update", "Sub-Activity Type": "Renewal Update" },
  { "Old Verizon Activity Type Name": "Save-a-thon Campaign Activity", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "SSD Close Out", "Activity Type": "Update", "Sub-Activity Type": "SSD Close Out" },
  { "Old Verizon Activity Type Name": "Update", "Activity Type": "Update", "Sub-Activity Type": "" }
];

const MILESTONE_TYPE_MAPPING = [
  { "Old Milestone Type": "Adopting", "New Milestone Type": "Adopting" },
  { "Old Milestone Type": "CSM Assigned", "New Milestone Type": "CSM Transition" },
  { "Old Milestone Type": "CSM Transition", "New Milestone Type": "CSM Transition" },
  { "Old Milestone Type": "CSM Updates", "New Milestone Type": "CSM Updates" },
  { "Old Milestone Type": "Executive Business Review", "New Milestone Type": "Executive Business Review" },
  { "Old Milestone Type": "Expansion Opportunity Identified", "New Milestone Type": "Expansion Opportunity Identified" },
  { "Old Milestone Type": "Expansion Opportunity Won", "New Milestone Type": "Expansion Opportunity Won" },
  { "Old Milestone Type": "Health status -> Red", "New Milestone Type": "Risk Identified" },
  { "Old Milestone Type": "Launched", "New Milestone Type": "Launched" },
  { "Old Milestone Type": "Lifecycle Event Completed", "New Milestone Type": "Lifecycle Event Completed" },
  { "Old Milestone Type": "Objective Completed", "New Milestone Type": "Objective Completed" },
  { "Old Milestone Type": "Objective Created", "New Milestone Type": "Objective Created" },
  { "Old Milestone Type": "Onboarding Complete", "New Milestone Type": "Onboarding Complete" },
  { "Old Milestone Type": "Onboarding Kick-Off", "New Milestone Type": "Kicked Off" },
  { "Old Milestone Type": "Onboarding Started", "New Milestone Type": "Onboarding Started" },
  { "Old Milestone Type": "Predictive Churn Model", "New Milestone Type": "Will Churn" },
  { "Old Milestone Type": "Reference", "New Milestone Type": "Provided Reference" },
  { "Old Milestone Type": "Risk Identified", "New Milestone Type": "Risk Identified" },
  { "Old Milestone Type": "Risk Resolved", "New Milestone Type": "Risk Resolved" },
  { "Old Milestone Type": "Training", "New Milestone Type": "Training" },
  { "Old Milestone Type": "Upcoming Renewal", "New Milestone Type": "Lifecycle Event Created" },
  { "Old Milestone Type": "Will Churn", "New Milestone Type": "Will Churn" }
];

// Global Cache Variables (keeping your existing structure)
let userDataCache = null;
let companyDataCache = null;
let sourceActivityTypesCache = null;
let targetActivityTypesCache = null;
let subActivityTypesCache = null;
let meetingSubTypesCache = null;
let sourceMilestoneTypesCache = null;
let targetMilestoneTypesCache = null;

// All your existing functions remain unchanged
function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}

const USERS_JSON_FILE = path.join(__dirname, 'targetusers.json');

async function getAllTargetUsers(instanceUrl, sessionCookie) {
  // Return cached data if available
  if (userDataCache) return userDataCache;

  try {
    const usersFromFile = await readUsersFromFile();

    if (Array.isArray(usersFromFile) && usersFromFile.length > 0) {
      console.log(`Loaded ${usersFromFile.length} users from JSON file`);
      userDataCache = usersFromFile;
    } else {
      console.warn('No users found in JSON file');
    }

    return userDataCache || [];

  } catch (error) {
    console.error('Error fetching all users:', error.message);
    return [];
  }
}


async function readUsersFromFile() {
  try {
    const fileExists = await fs.access(USERS_JSON_FILE).then(() => true).catch(() => false);

    if (!fileExists) {
      console.log('Users JSON file does not exist');
      return null;
    }

    const fileContent = await fs.readFile(USERS_JSON_FILE, 'utf8');
    const users = JSON.parse(fileContent);

    return users;
  } catch (error) {
    console.error('Error reading users from file:', error.message);
    return null;
  }
}
async function clearUsersCache() {
  try {
    await fs.unlink(USERS_JSON_FILE);
    userDataCache = null;
    console.log('Users cache cleared');
  } catch (error) {
    console.error('Error clearing users cache:', error.message);
  }
}

const COMPANIES_JSON_FILE = path.join(__dirname, 'targetcompanies.json');

async function getAllCompanies(instanceUrl, sessionCookie) {
  if (companyDataCache) return companyDataCache;

  try {
    const companiesFromFile = await readCompaniesFromFile();
    if (companiesFromFile && companiesFromFile.length > 0) {
      console.log(`Loaded ${companiesFromFile.length} companies from JSON file`);
      companyDataCache = companiesFromFile;
      return companiesFromFile;
    }
  
    return companiesFromFile;

  } catch (error) {
    console.error('Error fetching all companies:', error.message);
    return [];
  }
}

async function readCompaniesFromFile() {
  try {
    const fileExists = await fs.access(COMPANIES_JSON_FILE).then(() => true).catch(() => false);

    if (!fileExists) {
      console.log('Companies JSON file does not exist');
      return null;
    }

    const fileContent = await fs.readFile(COMPANIES_JSON_FILE, 'utf8');
    const companies = JSON.parse(fileContent);

    return companies;
  } catch (error) {
    console.error('Error reading companies from file:', error.message);
    return null;
  }
}

async function saveCompaniesToFile(companies) {
  try {
    const jsonData = JSON.stringify(companies, null, 2);
    await fs.writeFile(COMPANIES_JSON_FILE, jsonData, 'utf8');
    console.log(`Successfully saved ${companies.length} companies to ${COMPANIES_JSON_FILE}`);
  } catch (error) {
    console.error('Error saving companies to file:', error.message);
  }
}

async function clearCompaniesCache() {
  try {
    await fs.unlink(COMPANIES_JSON_FILE);
    companyDataCache = null;
    console.log('Companies cache cleared');
  } catch (error) {
    console.error('Error clearing companies cache:', error.message);
  }
}

async function getAllActivityTypes(instanceUrl, sessionToken, cacheKey, companyId) {
  const cache = cacheKey === 'source' ? sourceActivityTypesCache : targetActivityTypesCache;
  if (cache) return cache;

  try {
    const config = {
      method: 'get',
      url: `${instanceUrl}/v1/ant/forms?context=Company&contextId=${companyId}&showHidden=false`,
      headers: { 'Cookie': sessionToken },
      timeout: 30000
    };

    const response = await axios(config);
    const activityTypes = response?.data?.data?.activityTypes || [];

    if (cacheKey === 'source') {
      sourceActivityTypesCache = activityTypes;
    } else {
      targetActivityTypesCache = activityTypes;
    }

    console.log(`Loaded ${activityTypes.length} activity types for ${cacheKey} system`);
    return activityTypes;
  } catch (error) {
    console.error(`Error fetching activity types for ${cacheKey}:`, error.message);
    return [];
  }
}

async function getSubActivityTypes(targetInstanceUrl, targetInstanceToken) {
  if (subActivityTypesCache) return subActivityTypesCache;

  try {
    const config = {
      method: 'get',
      url: `${targetInstanceUrl}/v1/ant/picklist/items/category/?ct=&id=1I00FBWECOTNM4VRRNBF3A8R43VMLERUJJFA&ref=`,
      headers: { 'Cookie': targetInstanceToken },
      timeout: 30000
    };

    const response = await axios(config);
    const subActivityTypes = response?.data?.data || [];

    subActivityTypesCache = subActivityTypes;
    console.log(`Loaded ${subActivityTypes.length} sub-activity types`);
    return subActivityTypes;
  } catch (error) {
    console.error('Error fetching sub-activity types:', error.message);
    return [];
  }
}

async function getMeetingSubTypes(targetInstanceUrl, targetInstanceToken) {
  if (meetingSubTypesCache) return meetingSubTypesCache;

  try {
    const config = {
      method: 'get',
      url: `${targetInstanceUrl}/v1/ant/picklist/items/category/?ct=&id=1I006DLKSIHRNJRYD2GHLL86BRHBL4WOY5U4&ref=`,
      headers: { 'Cookie': targetInstanceToken },
      timeout: 30000
    };

    const response = await axios(config);
    const meetingSubTypes = response?.data?.data || [];

    meetingSubTypesCache = meetingSubTypes;
    console.log(`Loaded ${meetingSubTypes.length} meeting sub-types`);
    return meetingSubTypes;
  } catch (error) {
    console.error('Error fetching meeting sub-types:', error.message);
    return [];
  }
}

async function getAdvancedActivityMapping(oldActivityTypeName, targetInstanceUrl, targetInstanceToken, sourceInstanceUrl, sourceInstanceToken, companyId) {
  try {
    console.log(`🔍 Mapping activity type: "${oldActivityTypeName}"`);

    const mapping = ACTIVITY_TYPE_MAPPING.find(m =>
      normalizeString(m["Old Verizon Activity Type Name"]) === normalizeString(oldActivityTypeName)
    );

    if (!mapping) {
      console.warn(`⚠️ No mapping found for "${oldActivityTypeName}"`);
      return { activityTypeId: null, subActivityTypeId: null };
    }

    console.log(`📋 Found mapping: ${oldActivityTypeName} → ${mapping["Activity Type"]} / ${mapping["Sub-Activity Type"] || 'None'}`);

    const [targetActivityTypes, subActivityTypes, meetingSubTypes] = await Promise.all([
      getAllActivityTypes(targetInstanceUrl, targetInstanceToken, 'target', companyId),
      getSubActivityTypes(targetInstanceUrl, targetInstanceToken),
      getMeetingSubTypes(targetInstanceUrl, targetInstanceToken)
    ]);

    const targetActivityType = targetActivityTypes.find(type =>
      normalizeString(type.name) === normalizeString(mapping["Activity Type"])
    );

    if (!targetActivityType) {
      console.error(`❌ Activity type "${mapping["Activity Type"]}" not found in target system`);
      return { activityTypeId: null, subActivityTypeId: null };
    }

    console.log(`✅ Found main activity type: ${targetActivityType.name} (ID: ${targetActivityType.id})`);

    let subActivityTypeId = null;

    if (mapping["Sub-Activity Type"] && mapping["Sub-Activity Type"].trim() !== "") {
      const subActivityName = mapping["Sub-Activity Type"];

      if (normalizeString(mapping["Activity Type"]) === "meeting") {
        console.log(`🔍 Looking for meeting sub-type: "${subActivityName}"`);
       
        const meetingSubType = meetingSubTypes.find(type =>
          normalizeString(type.label) === normalizeString(subActivityName)
        );

        if (meetingSubType) {
          subActivityTypeId = meetingSubType.id;
          console.log(`✅ Found meeting sub-type: ${meetingSubType.label} (ID: ${subActivityTypeId})`);
        } else {
          console.warn(`⚠️ Meeting sub-type "${subActivityName}" not found`);
        }
      } else {
        console.log(`🔍 Looking for sub-activity type: "${subActivityName}"`);
       
        const subActivityType = subActivityTypes.find(type =>
          normalizeString(type.label) === normalizeString(subActivityName)
        );

        if (subActivityType) {
          subActivityTypeId = subActivityType.id;
          console.log(`✅ Found sub-activity type: ${subActivityType.label} (ID: ${subActivityTypeId})`);
        } else {
          console.warn(`⚠️ Sub-activity type "${subActivityName}" not found`);
        }
      }
    }

    return {
      activityTypeId: targetActivityType.id,
      subActivityTypeId: subActivityTypeId,
      activityTypeName: targetActivityType.name,
      subActivityTypeName: mapping["Sub-Activity Type"] || null
    };

  } catch (error) {
    console.error('Error in advanced activity mapping:', error.message);
    return { activityTypeId: null, subActivityTypeId: null };
  }
}

async function getSourceMilestoneTypes(sourceInstanceUrl, sourceInstanceToken, companyId) {
  if (sourceMilestoneTypesCache) return sourceMilestoneTypesCache;

  try {
    const config = {
      method: 'get',
      url: `${sourceInstanceUrl}/v1/ant/picklist/items/by/Company?cid=${companyId}&ct=MILESTONE&id=&ref=SCRIBBLE`,
      headers: { 'Cookie': sourceInstanceToken },
      timeout: 30000
    };

    const response = await axios(config);
    const milestoneTypes = response?.data?.data || [];

    sourceMilestoneTypesCache = milestoneTypes;
    console.log(`Loaded ${milestoneTypes.length} milestone types from SOURCE system`);
    return milestoneTypes;
  } catch (error) {
    console.error('Error fetching source milestone types:', error.message);
    return [];
  }
}

async function getTargetMilestoneTypes(targetInstanceUrl, targetInstanceToken, companyId) {
  if (targetMilestoneTypesCache) return targetMilestoneTypesCache;

  try {
    const config = {
      method: 'get',
      url: `${targetInstanceUrl}/v1/ant/picklist/items/by/Company?cid=${companyId}&ct=MILESTONE&id=&ref=SCRIBBLE`,
      headers: { 'Cookie': targetInstanceToken },
      timeout: 30000
    };

    const response = await axios(config);
    const milestoneTypes = response?.data?.data || [];

    targetMilestoneTypesCache = milestoneTypes;
    console.log(`Loaded ${milestoneTypes.length} milestone types from TARGET system`);
    return milestoneTypes;
  } catch (error) {
    console.error('Error fetching target milestone types:', error.message);
    return [];
  }
}

async function getMilestoneTypeMapping(oldMilestoneTypeId, sourceInstanceUrl, sourceInstanceToken, targetInstanceUrl, targetInstanceToken, sourceCompanyId, targetCompanyId) {
  try {
    console.log(`🔍 Mapping milestone type ID: "${oldMilestoneTypeId}"`);

    if (!oldMilestoneTypeId || oldMilestoneTypeId.trim() === '') {
      console.warn('⚠️ No milestone type ID provided');
      return null;
    }

    const [sourceMilestoneTypes, targetMilestoneTypes] = await Promise.all([
      getSourceMilestoneTypes(sourceInstanceUrl, sourceInstanceToken, sourceCompanyId),
      getTargetMilestoneTypes(targetInstanceUrl, targetInstanceToken, targetCompanyId)
    ]);

    const sourceMilestoneType = sourceMilestoneTypes.find(type => type.id === oldMilestoneTypeId);
    if (!sourceMilestoneType) {
      console.error(`❌ Old milestone type ID not found: "${oldMilestoneTypeId}"`);
      return null;
    }

    const oldMilestoneLabel = sourceMilestoneType.label;
    console.log(`✅ Found old milestone type: "${oldMilestoneLabel}" (ID: ${oldMilestoneTypeId})`);

    const mapping = MILESTONE_TYPE_MAPPING.find(m =>
      normalizeString(m["Old Milestone Type"]) === normalizeString(oldMilestoneLabel)
    );

    if (!mapping) {
      console.error(`❌ No business logic mapping found for: "${oldMilestoneLabel}"`);
      return null;
    }

    const newMilestoneLabel = mapping["New Milestone Type"];
    console.log(`✅ Found business logic mapping: "${oldMilestoneLabel}" → "${newMilestoneLabel}"`);

    const targetMilestoneType = targetMilestoneTypes.find(type =>
      normalizeString(type.label) === normalizeString(newMilestoneLabel)
    );

    if (!targetMilestoneType) {
      console.error(`❌ New milestone type not found in target system: "${newMilestoneLabel}"`);
      return null;
    }

    const newMilestoneTypeId = targetMilestoneType.id;
    console.log(`✅ Found new milestone type: "${targetMilestoneType.label}" (ID: ${newMilestoneTypeId})`);

    return {
      oldMilestoneTypeId: oldMilestoneTypeId,
      oldMilestoneLabel: oldMilestoneLabel,
      newMilestoneLabel: targetMilestoneType.label,
      newMilestoneTypeId: newMilestoneTypeId,
      mappingRule: `"${oldMilestoneLabel}" → "${newMilestoneLabel}"`
    };

  } catch (error) {
    console.error('Error in milestone type mapping:', error.message);
    return null;
  }
}

async function getUserIdByEmail(email, instanceUrl, sessionCookie) {
  try {
    const users = await getAllTargetUsers(instanceUrl, sessionCookie);
    
    let user = users.find(u => u.Email?.toLowerCase() === email.toLowerCase());

    // If not found, fallback to no-reply@gainsightapp.com
    if (!user) {
      console.warn(`User with email ${email} not found. Falling back to no-reply@gainsightapp.com`);
      user = users.find(u => u.Email?.toLowerCase() === 'no-reply@gainsightapp.com');
    }

    return user;
  } catch (error) {
    console.error(`Error getting user ID by email (${email}):`, error.message);
    return "1P01E316G9DAPFOLE6SOOUG71XRMN5F3PLER";
  }
}


async function getCompanyIdByName(companyName, instanceUrl, sessionCookie) {
  try {
    const companies = await getAllCompanies(instanceUrl, sessionCookie);
    const company = companies.find(c => c.Name?.toLowerCase() === companyName.toLowerCase());
    return company ? company.GSID : null;
  } catch (error) {
    console.error(`Error getting company ID by name (${companyName}):`, error.message);
    return "";
  }
}

async function downloadAttachment(attachmentUrl, attachmentName) {
  try {
    const response = await axios({
      method: 'GET',
      url: attachmentUrl,
      responseType: 'arraybuffer'
    });

    return {
      buffer: response.data,
      name: attachmentName,
      contentType: response.headers['content-type'] || 'application/octet-stream'
    };
  } catch (error) {
    console.error(`Error downloading attachment ${attachmentName}:`, error.message);
    throw error;
  }
}

async function uploadAttachment(attachmentData, companyId, companyLabel, userId, userName, userEmail, targetInstanceUrl, targetInstanceToken) {
  try {
    const FormData = require('form-data');
    const form = new FormData();
    console.log(attachmentData, "attachmentData")

    form.append('file', attachmentData.buffer, {
      filename: attachmentData.name,
      contentType: attachmentData.contentType
    });

    const requestPayload = {
      entityId: null,
      contexts: [{
        id: companyId,
        obj: "Company",
        eobj: "Account",
        eid: null,
        esys: "SALESFORCE",
        lbl: companyLabel,
        dsp: true,
        base: true
      }],
      source: "C360",
      user: {
        id: userId,
        obj: "User",
        name: userName,
        email: userEmail,
        eid: null,
        eobj: "User",
        epp: null,
        esys: "SALESFORCE",
        sys: "GAINSIGHT",
        pp: ""
      },
      type: "DEFAULT"
    };

    form.append('requestString', JSON.stringify(requestPayload));

    const config = {
      method: 'post',
      url: `${targetInstanceUrl}/v1/ant/attachments`,
      headers: {
        'Cookie': targetInstanceToken,
        ...form.getHeaders()
      },
      data: form,
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    };

    const response = await axios(config);
    return response.data.data;

  } catch (error) {
    console.error(`Error uploading attachment ${attachmentData.name}:`, error.message);
    throw error;
  }
}

async function processAttachments(attachments, companyId, companyLabel, userId, userName, userEmail, targetInstanceUrl, targetInstanceToken) {
  const uploadedAttachments = [];

  for (const attachment of attachments) {
    try {
      console.log(`Processing attachment: ${attachment.name}`);

      const attachmentData = await downloadAttachment(attachment.url, attachment.name);

      const uploadResult = await uploadAttachment(
        attachmentData,
        companyId,
        companyLabel,
        userId,
        userName,
        userEmail,
        targetInstanceUrl,
        targetInstanceToken
      );
      console.log(uploadResult, "uploadResult")

      const processedAttachment = {
        id: uploadResult.id || uploadResult.attachmentId,
        seqId: uploadResult.seqId || attachment.seqId,
        name: attachment.name,
        url: uploadResult.url || attachment.url,
        size: attachment.size,
        removed: false,
        published: true,
        type: attachment.type,
        createdDate: uploadResult.createdDate || new Date().toISOString(),
        connectionId: null,
        syncedToExtSys: false,
        eid: null,
        esys: null
      };

      uploadedAttachments.push(processedAttachment);
      console.log(`Successfully uploaded attachment: ${attachment.name}`);

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Failed to process attachment ${attachment.name}:`, error.message);
    }
  }

  return uploadedAttachments;
}

async function createDraft(draftPayload, targetInstanceUrl, targetInstanceToken) {
  try {
    const response = await axios({
      method: 'post',
      url: `${targetInstanceUrl}/v1/ant/v2/activity/drafts`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': targetInstanceToken
      },
      data: JSON.stringify(draftPayload),
      maxBodyLength: Infinity
    });

    console.log(response?.data, "yuva899");
    return response?.data?.data?.id || null;
  } catch (err) {
    console.error("Failed to create draft:", err.message);
    return null;
  }
}

// Enhanced processTimelineEntry with tracking integration
async function processTimelineEntry(
  entry,
  userCache,
  companyCache,
  activityCache,
  milestoneCache,
  targetInstanceUrl,
  targetInstanceToken,
  sourceInstanceUrl,
  sourceInstanceToken,
  sourceCompanyId,
  targetCompanyId,
  trackingData
) {
  const entryStartTime = new Date();
  
  try {
    console.log('Processing entry:', entry.id || 'unknown');

    // Extract activity details for tracking
    const activityDetails = {
      activityType: entry?.meta?.activityTypeId || null,
      companyName: entry.contexts?.[0]?.lbl || null,
      authorEmail: entry.author?.email || null,
      subject: entry.note?.subject || null
    };

    // Handle user cache
    let userInfo;
    const authorEmail = entry.author?.email;
    if (authorEmail) {
      if (userCache[authorEmail]) {
        userInfo = userCache[authorEmail];
      } else {
        userInfo = await getUserIdByEmail(authorEmail, targetInstanceUrl, targetInstanceToken);
       //pLAYWRIGHT NEED TO write here
        userCache[authorEmail] = userInfo.GSID;
      }
    }

    // Handle company cache
    let companyId;
    const companyLabel = entry.contexts?.[0]?.lbl;
    if (companyLabel) {
      if (companyCache[companyLabel]) {
        companyId = companyCache[companyLabel];
      } else {
        companyId = await getCompanyIdByName(companyLabel, targetInstanceUrl, targetInstanceToken);
        companyCache[companyLabel] = companyId;
      }
    }

    if (!companyId) {
      MigrationTracker.trackFailure(trackingData, entry.id, 'No company ID found', activityDetails);
      return { success: false, reason: 'No company ID found', entryId: entry.id };
    }

    // Handle activity type and subcategory
    let activityTypeId = null;
    let subCategoryId = null;
    const sourceActivityTypeId = entry?.meta?.activityTypeId;
    let activityMapping = { activityTypeId: null, subActivityTypeId: null };

    if (sourceActivityTypeId) {
      const cacheKey = `advanced_${sourceActivityTypeId}`;
     
      if (activityCache[cacheKey]) {
        activityMapping = activityCache[cacheKey];
      } else {
        const sourceActivityTypes = await getAllActivityTypes(sourceInstanceUrl, sourceInstanceToken, 'source', entry.contexts?.[0]?.id);
        const sourceActivity = sourceActivityTypes.find(type => type.id === sourceActivityTypeId);
       
        if (sourceActivity) {
          console.log(`🔍 Source activity: ${sourceActivity.name} (ID: ${sourceActivityTypeId})`);
         
          activityMapping = await getAdvancedActivityMapping(
            sourceActivity.name,
            targetInstanceUrl,
            targetInstanceToken,
            sourceInstanceUrl,
            sourceInstanceToken,
            targetCompanyId
          );
         console.log(activityMapping,"activityMapping")
          activityCache[cacheKey] = activityMapping;
        } else {
          console.error(`❌ Source activity type not found: ${sourceActivityTypeId}`);
        }
      }
    }

    // Handle milestone type mapping (only for Milestone activities)
    let milestoneMapping = null;
    const oldMilestoneTypeId = entry?.note?.customFields?.milestoneType;

    if (oldMilestoneTypeId && normalizeString(activityMapping?.activityTypeName) === 'milestone') {
      console.log(`🏁 MILESTONE DETECTED: Processing milestone type mapping...`);
     
      const milestoneCacheKey = `milestone_${oldMilestoneTypeId}`;
     
      if (milestoneCache[milestoneCacheKey]) {
        milestoneMapping = milestoneCache[milestoneCacheKey];
      } else {
        milestoneMapping = await getMilestoneTypeMapping(
          oldMilestoneTypeId,
          sourceInstanceUrl,
          sourceInstanceToken,
          targetInstanceUrl,
          targetInstanceToken,
          entry.contexts?.[0]?.id,
          targetCompanyId
        );
       
        milestoneCache[milestoneCacheKey] = milestoneMapping;
       
        if (milestoneMapping) {
          console.log(`✅ Successfully mapped milestone: ${milestoneMapping.mappingRule}`);
        }
      }
    }

    // Process attachments
    let processedAttachments = [];
    if (entry.attachments && entry.attachments.length > 0) {
      try {
        processedAttachments = await processAttachments(
          entry.attachments,
          companyId,
          companyLabel,
          userId,
          entry.author?.name,
          entry.author?.email,
          targetInstanceUrl,
          targetInstanceToken
        );
      } catch (error) {
        console.error(`Error processing attachments for entry ${entry.id}:`, error.message);
        MigrationTracker.trackError(trackingData, error, `Attachment processing for entry ${entry.id}`);
      }
    }

    const ModifiedInternalId = (entry.note?.customFields?.internalAttendees || []).map(att => ({
      ...att,
      id: userId,
      name: att.name,
      email: att.email,
      userType: "USER"
    }));

    // Build custom fields
    const customFields = {
      internalAttendees: ModifiedInternalId,
      externalAttendees: []
    };

    if (activityMapping?.subActivityTypeId) {
      customFields.Ant__Activity_Subtype__c = activityMapping.subActivityTypeId;
      console.log(`✅ Added sub-activity type: ${activityMapping.subActivityTypeId}`);
    }

    // Add milestone type if properly mapped
    if (milestoneMapping?.newMilestoneTypeId) {
      customFields.milestoneType = milestoneMapping.newMilestoneTypeId;
      console.log(`✅ Added milestone type: ${milestoneMapping.newMilestoneTypeId} (${milestoneMapping.mappingRule})`);
    }
     customFields.Ant__externalid__c = entry.id;
     let externalSourceDetails={}
     //Need to  verify
if(entry?.meta?.externalSourceDetails?.externalSystems.length>0)
{
externalSourceDetails={externalSystems:entry?.meta?.externalSourceDetails?.externalSystems}
}
    const draftPayload = {
      lastModifiedByUser: {
        gsId: userId,
        name: entry.author?.name,
        eid: null,
        esys: null,
        pp: ""
      },
      note: {
        customFields,
        type: entry.note?.type,
        subject: entry.note?.subject,
        activityDate: entry.note?.activityDate,
        content: entry.note?.content,
        plainText: entry.note?.plainText,
        trackers: null
      },
      mentions: [],
      relatedRecords: null,
      meta: {
        externalSourceDetails:externalSourceDetails,
        activityTypeId: activityMapping?.activityTypeId,
        ctaId: null,
        source: "GLOBAL_TIMELINE",
        hasTask: false,
        emailSent: false,
        systemType: "GAINSIGHT",
        notesTemplateId: null
      },
      author: {
        id: '1P010RM8DTS76UHHN4XY38M7XP5JT5JZS7IV',
        obj: "User",
        name: entry.author?.name,
        email: entry.author?.email,
        eid: null,
        eobj: "User",
        epp: null,
        esys: "SALESFORCE",
        sys: "GAINSIGHT",
        pp: ""
      },
      syncedToSFDC: false,
      tasks: [],
      attachments: processedAttachments,
      contexts: [
        {
          id: companyId,
          base: true,
          obj: "Company",
          lbl: companyLabel || '',
          eid: null,
          eobj: "Account",
          eurl: null,
          esys: "SALESFORCE",
          dsp: true
        }
      ]
    };

    console.log(JSON.stringify(draftPayload),"draftPayload")

    const draftId = await createDraft(draftPayload, targetInstanceUrl, targetInstanceToken);
    if (!draftId) {
      MigrationTracker.trackFailure(trackingData, entry.id, 'Draft creation failed', activityDetails);
      return { success: false, reason: 'Draft creation failed', entryId: entry.id };
    }

    const timelinePayload = { ...draftPayload, id: draftId };

    const postConfig = {
      method: 'post',
      url: `${targetInstanceUrl}/v1/ant/v2/activity`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': targetInstanceToken
      },
      data: JSON.stringify(timelinePayload),
      maxBodyLength: Infinity
    };

    const final = await axios(postConfig);
    console.log(final.data, "timelinePostResult");
    
    // Track successful migration
    const targetActivityId = final.data?.data?.id || draftId;
    MigrationTracker.trackSuccess(trackingData, entry.id, targetActivityId, activityDetails);
    
    return { success: true, entryId: entry.id, targetId: targetActivityId };

  } catch (error) {
    console.error('Error processing timeline entry:', error.message);
    MigrationTracker.trackError(trackingData, error, `Processing entry ${entry.id}`);
    
    // Extract activity details for failure tracking
    const activityDetails = {
      activityType: entry?.meta?.activityTypeId || null,
      companyName: entry.contexts?.[0]?.lbl || null,
      authorEmail: entry.author?.email || null,
      subject: entry.note?.subject || null
    };
    
    MigrationTracker.trackFailure(trackingData, entry.id, error.message, activityDetails);
    return { success: false, reason: error.message, entryId: entry.id };
  }
}

// Enhanced batch processing function with tracking
async function processBatch(
  batch, 
  userCache, 
  companyCache, 
  activityCache,
  milestoneCache, 
  targetInstanceUrl, 
  targetInstanceToken, 
  sourceInstanceUrl, 
  sourceInstanceToken, 
  sourceCompanyId,
  targetCompanyId,
  trackingData,
  batchIndex
) {
  const batchStartTime = new Date();
  const results = [];
  let batchSuccessCount = 0;
  let batchFailureCount = 0;

  console.log(`🚀 Starting batch ${batchIndex + 1} with ${batch.length} activities...`);

  // Process items in batch sequentially to avoid overwhelming the API
  for (const entry of batch) {
    try {
      const result = await processTimelineEntry(
        entry,
        userCache,
        companyCache,
        activityCache,
        milestoneCache,
        targetInstanceUrl,
        targetInstanceToken,
        sourceInstanceUrl,
        sourceInstanceToken,
        sourceCompanyId,
        targetCompanyId,
        trackingData
      );
      
      results.push(result);
      
      if (result.success) {
        batchSuccessCount++;
      } else {
        batchFailureCount++;
      }

      // Small delay between each entry to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(error)
      console.error(`Failed to process entry ${entry.id}:`, error.message);
      MigrationTracker.trackError(trackingData, error, `Batch ${batchIndex + 1} - Entry ${entry.id}`);
      
      const failureResult = {
        success: false,
        reason: error.message,
        entryId: entry.id
      };
      results.push(failureResult);
      batchFailureCount++;
    }
  }

  const batchEndTime = new Date();
  
  // Track batch timing
  MigrationTracker.trackBatchTiming(
    trackingData, 
    batchIndex, 
    batch.length, 
    batchStartTime, 
    batchEndTime, 
    batchSuccessCount, 
    batchFailureCount
  );

  console.log(`✅ Completed batch ${batchIndex + 1}: ${batchSuccessCount} successes, ${batchFailureCount} failures`);

  return results;
}

// Main migration function with enhanced tracking
exports.migrateTimelines = async (req, res) => {
  // Initialize tracking
  const trackingData = MigrationTracker.initializeTracking();
  try {
    const { sourceInstanceUrl, sourceInstanceToken, targetInstanceUrl, targetInstanceToken, maxActivities = 45000 } = req.body;

    if (!sourceInstanceUrl || !sourceInstanceToken || !targetInstanceUrl || !targetInstanceToken) {
      MigrationTracker.trackError(trackingData, new Error('Missing instance information'), 'Initialization');
      return res.status(400).json({ message: "Missing source or target instance information" });
    }

    console.log(`🎯 Starting timeline migration with ID: ${trackingData.migrationId}`);
    console.log(`📊 Target: ${maxActivities} activities`);

    let allContent = [];
    let page = 0;
    const PAGE_SIZE = 100; // Increased from 7 to 100 for better efficiency
    let totalFetched = 0;

    // Fetch all timelines with optimized pagination
    console.log('📥 Fetching timeline data...');
    
    while (totalFetched < maxActivities) {
      try {
        const remainingToFetch = maxActivities - totalFetched;
        const currentPageSize = Math.min(PAGE_SIZE, remainingToFetch);
      
        const url = `${sourceInstanceUrl}/v1/ant/timeline/search/activity?page=${page}&size=${currentPageSize}`;
        const payload = {
          quickSearch: {},
          contextFilter: {},
          filterContext: "GLOBAL_TIMELINE"
        };

        const config = {
          method: 'post',
          url,
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sourceInstanceToken
          },
          data: JSON.stringify(payload),
          maxBodyLength: Infinity,
          timeout: 60000 // Increased timeout for larger pages
        };

        const response = await axios(config);
        const content = response?.data?.data?.content || [];

        if (content.length === 0) {
          console.log('📄 No more content available, stopping fetch');
          break;
        }

        allContent = [...allContent, ...content];
        totalFetched += content.length;

        const totalPages = response?.data?.data?.page?.totalPages;
        const currentPage = response?.data?.data?.page?.number;

        console.log(`📄 Fetched page ${currentPage + 1}/${totalPages}, items: ${content.length}, total: ${totalFetched}/${maxActivities}`);

        // Stop if we've reached our target
        if (totalFetched >= maxActivities) {
          console.log(`🎯 Reached target of ${maxActivities} activities`);
          break;
        }

        page++;
        
        // Reduced delay for faster fetching
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Error fetching page ${page}:`, error.message);
        MigrationTracker.trackError(trackingData, error, `Fetching page ${page}`);
        
        // If we have some content, continue with what we have
        if (allContent.length > 0) {
          console.log(`⚠️ Continuing with ${allContent.length} activities already fetched`);
          break;
        } else {
          throw error; // If no content fetched, fail the migration
        }
      }
    }

    // Trim to exact count if we over-fetched
    if (allContent.length > maxActivities) {
      allContent = allContent.slice(0, maxActivities);
    }

    trackingData.statistics.totalCount = allContent.length;
    console.log(`📊 Total timeline entries to migrate: ${allContent.length}`);

    if (allContent.length === 0) {
      const finalTracking = MigrationTracker.finalizeTracking(trackingData);
      await MigrationTracker.saveTrackingData(finalTracking);
      
      return res.status(200).json({
        message: "No timeline entries found to migrate",
        migrationId: trackingData.migrationId,
        totalProcessed: 0,
        successful: 0,
        failed: 0
      });
    }

    // Pre-load all reference data
    console.log('🔄 Pre-loading reference data...');
    let sourceCompanyId, targetCompanyId;
    
    try {
      const [sourceCompanies, targetCompanies] = await Promise.all([
        getAllCompanies(sourceInstanceUrl, sourceInstanceToken),
        getAllCompanies(targetInstanceUrl, targetInstanceToken)
      ]);

      sourceCompanyId = sourceCompanies?.[0]?.Gsid;
      targetCompanyId = targetCompanies?.[0]?.Gsid;

      if (!sourceCompanyId || !targetCompanyId) {
        const error = new Error("Could not get company IDs for API calls");
        MigrationTracker.trackError(trackingData, error, 'Reference data loading');
        
        const finalTracking = MigrationTracker.finalizeTracking(trackingData);
        await MigrationTracker.saveTrackingData(finalTracking);
        
        return res.status(500).json({ 
          message: "Could not get company IDs for API calls",
          migrationId: trackingData.migrationId
        });
      }

      console.log(`🏢 Using source company ID: ${sourceCompanyId}`);
      console.log(`🏢 Using target company ID: ${targetCompanyId}`);
    } catch (error) {
      console.error('❌ Error pre-loading reference data:', error.message);
      MigrationTracker.trackError(trackingData, error, 'Reference data loading');
      
      const finalTracking = MigrationTracker.finalizeTracking(trackingData);
      await MigrationTracker.saveTrackingData(finalTracking);
      
      return res.status(500).json({
        message: "Failed to load reference data",
        migrationId: trackingData.migrationId,
        error: error.message
      });
    }

    // Initialize caches with estimated sizes for better memory management
    const userCache = new Map();
    const companyCache = new Map();
    const activityCache = new Map();
    const milestoneCache = new Map();
    
    // Optimized batch processing for large datasets
    const BATCH_SIZE = 20; // Increased from 3 to 20 for better throughput
    const batches = [];

    for (let i = 0; i < allContent.length; i += BATCH_SIZE) {
      batches.push(allContent.slice(i, i + BATCH_SIZE));
    }

    console.log(`⚙️ Processing ${batches.length} batches of up to ${BATCH_SIZE} items each...`);
    console.log(`⏱️ Estimated time: ${Math.ceil(batches.length * 2)} seconds (assuming 2s per batch)`);

    // Process batches with progress reporting
    const progressReportInterval = Math.max(1, Math.floor(batches.length / 20)); // Report every 5%
    
    for (const [batchIndex, batch] of batches.entries()) {
      const isProgressReport = (batchIndex + 1) % progressReportInterval === 0 || batchIndex === batches.length - 1;
      
      if (isProgressReport) {
        const progress = ((batchIndex + 1) / batches.length * 100).toFixed(1);
        console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length} (${progress}%)...`);
      }

      try {
        // Process the batch with tracking
        const batchResults = await processBatch(
          batch,
          userCache,
          companyCache,
          activityCache,
          milestoneCache,
          targetInstanceUrl,
          targetInstanceToken,
          sourceInstanceUrl,
          sourceInstanceToken,
          sourceCompanyId,
          targetCompanyId,
          trackingData,
          batchIndex
        );

        if (isProgressReport) {
          const processed = trackingData.statistics.successCount + trackingData.statistics.failureCount;
          const successRate = processed > 0 ? ((trackingData.statistics.successCount / processed) * 100).toFixed(1) : 0;
          console.log(`✅ Progress: ${processed}/${allContent.length} (${successRate}% success rate)`);
          
          // Memory management - clear caches periodically
          if ((batchIndex + 1) % 100 === 0) {
            console.log('🧹 Clearing caches to manage memory...');
            userCache.clear();
            companyCache.clear();
            activityCache.clear();
            milestoneCache.clear();
          }
        }

        // Reduced delay for better throughput
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error(`❌ Error processing batch ${batchIndex + 1}:`, error.message);
        MigrationTracker.trackError(trackingData, error, `Batch ${batchIndex + 1} processing`);
        
        // Mark all items in this batch as failed
        batch.forEach((entry) => {
          MigrationTracker.trackFailure(trackingData, entry.id, `Batch processing error: ${error.message}`, {
            activityType: entry?.meta?.activityTypeId || null,
            companyName: entry.contexts?.[0]?.lbl || null,
            authorEmail: entry.author?.email || null,
            subject: entry.note?.subject || null
          });
        });
      }
    }

    // Clear caches to free memory
    userCache.clear();
    companyCache.clear();
    activityCache.clear();
    milestoneCache.clear();

    // Finalize tracking and generate summary
    const finalTrackingData = MigrationTracker.finalizeTracking(trackingData);
    
    // Save tracking data to files
    const savedFiles = await MigrationTracker.saveTrackingData(finalTrackingData);
    
    // Print console summary
    MigrationTracker.printConsoleSummary(finalTrackingData);

    console.log('🎉 Migration completed!');

    const response = {
      message: "Migration completed successfully",
      migrationId: finalTrackingData.migrationId,
      totalProcessed: finalTrackingData.totalProcessed,
      successful: finalTrackingData.statistics.successCount,
      failed: finalTrackingData.statistics.failureCount,
      duration: finalTrackingData.summary.migrationOverview.totalDuration,
      successRate: finalTrackingData.summary.statistics.successRate,
      summary: finalTrackingData.summary,
      files: savedFiles,
      performance: {
        activitiesPerSecond: finalTrackingData.summary.statistics.activitiesPerSecond,
        averageTimePerBatch: finalTrackingData.summary.statistics.averageTimePerBatch,
        totalBatches: batches.length,
        batchSize: BATCH_SIZE,
        pageSize: PAGE_SIZE
      },
      nextSteps: {
        recommendedNextBatch: Math.min(50000, maxActivities + 10000),
        totalActivitiesProcessed: finalTrackingData.totalProcessed,
        readyForNextPhase: finalTrackingData.statistics.successCount > (finalTrackingData.totalProcessed * 0.8)
      }
    };

    // Include sample of failed entries if there are any (limit to first 20 for larger batches)
    if (finalTrackingData.failedMigrations.length > 0) {
      response.sampleFailedEntries = finalTrackingData.failedMigrations.slice(0, 20).map(failure => ({
        sourceActivityId: failure.sourceActivityId,
        reason: failure.reason,
        errorCode: failure.errorCode,
        companyName: failure.companyName,
        authorEmail: failure.authorEmail
      }));
      
      if (finalTrackingData.failedMigrations.length > 20) {
        response.note = `Showing first 20 of ${finalTrackingData.failedMigrations.length} failed entries. Check log files for complete details.`;
      }
    }

    res.status(200).json(response);

  } catch (error) {
    console.error("❌ Migration error:", error.message);
    MigrationTracker.trackError(trackingData, error, 'Main migration process');
    
    // Finalize tracking even in case of error
    const finalTrackingData = MigrationTracker.finalizeTracking(trackingData);
    await MigrationTracker.saveTrackingData(finalTrackingData);
    MigrationTracker.printConsoleSummary(finalTrackingData);

    res.status(500).json({
      message: "Error during migration",
      migrationId: finalTrackingData.migrationId,
      error: error.message,
      partialResults: {
        totalProcessed: finalTrackingData.totalProcessed,
        successful: finalTrackingData.statistics.successCount,
        failed: finalTrackingData.statistics.failureCount,
        duration: finalTrackingData.summary?.migrationOverview?.totalDuration || 'Unknown'
      },
      nextSteps: {
        canRetryFromBatch: Math.floor(finalTrackingData.totalProcessed / BATCH_SIZE),
        recommendRestart: finalTrackingData.statistics.successCount < (finalTrackingData.totalProcessed * 0.5)
      }
    });
  }
};