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
  { "Old Verizon Activity Type Name": "Test", "Activity Type": "Update", "Sub-Activity Type": "" },
  { "Old Verizon Activity Type Name": "Update", "Activity Type": "Update", "Sub-Activity Type": "" }
];

// 📋 EXACT Milestone Type Mapping JSON (Your Business Logic - 22 mappings)
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

// 🔍 Global Cache Variables
let userDataCache = null;
let companyDataCache = null;
let sourceActivityTypesCache = null;
let targetActivityTypesCache = null;
let subActivityTypesCache = null;
let meetingSubTypesCache = null;
let sourceMilestoneTypesCache = null;
let targetMilestoneTypesCache = null;
function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().trim().replace(/\s+/g, ' ');
}
const USERS_JSON_FILE = path.join(__dirname, 'users.json');

async function getAllUsers(instanceUrl, sessionCookie) {
  // First check in-memory cache
  if (userDataCache) return userDataCache;

  try {
    // Try to read from JSON file
    const usersFromFile = await readUsersFromFile();
    if (usersFromFile && usersFromFile.length > 0) {
      console.log(`Loaded ${usersFromFile.length} users from JSON file`);
      userDataCache = usersFromFile;
      return usersFromFile;
    }

    // If no file or empty file, fetch from API
    console.log('JSON file not found or empty, fetching from API...');
    let allUsers = [];
    let pageNumber = 1;

    while (true) {
      const response = await axios.post(
        `${instanceUrl}/v1/dataops/gdm/list?object=GsUser`,
        {
          limit: 25,
          pageNumber: pageNumber,
          searchString: "",
          clause: null,
          fields: ["Email", "Gsid"]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
          }
        }
      );

      const users = response.data?.data?.data || [];
      console.log(`Page ${pageNumber} fetched with ${users.length} users.`);

      if (users.length === 0) {
        break; // Exit loop if no more users
      }

      allUsers = [...allUsers, ...users];
      pageNumber++;
    }

    console.log(`Total users fetched: ${allUsers.length}`);

    // Save to JSON file
    await saveUsersToFile(allUsers);

    // Cache in memory
    userDataCache = allUsers;
    return allUsers;

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

async function saveUsersToFile(users) {
  try {
    const jsonData = JSON.stringify(users, null, 2);
    await fs.writeFile(USERS_JSON_FILE, jsonData, 'utf8');
    console.log(`Successfully saved ${users.length} users to ${USERS_JSON_FILE}`);
  } catch (error) {
    console.error('Error saving users to file:', error.message);
  }
}

// Optional: Function to clear the JSON cache
async function clearUsersCache() {
  try {
    await fs.unlink(USERS_JSON_FILE);
    userDataCache = null;
    console.log('Users cache cleared');
  } catch (error) {
    console.error('Error clearing users cache:', error.message);
  }
}

const COMPANIES_JSON_FILE = path.join(__dirname, 'companies.json');

async function getAllCompanies(instanceUrl, sessionCookie) {
  // First check in-memory cache
  if (companyDataCache) return companyDataCache;

  try {
    // Try to read from JSON file
    const companiesFromFile = await readCompaniesFromFile();
    if (companiesFromFile && companiesFromFile.length > 0) {
      console.log(`Loaded ${companiesFromFile.length} companies from JSON file`);
      companyDataCache = companiesFromFile;
      return companiesFromFile;
    }

    // If no file or empty file, fetch from API
    console.log('JSON file not found or empty, fetching from API...');
    let allCompanies = [];
    let pageNumber = 1;

    while (true) {
      const response = await axios.post(
        `${instanceUrl}/v1/dataops/gdm/list?object=Company`,
        {
          limit: 200,
          pageNumber: pageNumber,
          searchString: "",
          clause: null,
          fields: ["Name", "Gsid"]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
          }
        }
      );

      const companies = response.data?.data?.data || [];
      console.log(`Page ${pageNumber} fetched with ${companies.length} companies.`);

      if (companies.length === 0) {
        break; // Exit loop if no more companies
      }

      allCompanies = [...allCompanies, ...companies];
      pageNumber++;
    }

    console.log(`Total companies fetched: ${allCompanies.length}`);

    // Save to JSON file
    await saveCompaniesToFile(allCompanies);

    // Cache in memory
    companyDataCache = allCompanies;
    return allCompanies;

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

// Optional: Function to clear the JSON cache
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

// 🏁 MILESTONE TYPE FUNCTIONS

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
    const users = await getAllUsers(instanceUrl, sessionCookie);
    const user = users.find(u => u.Email?.toLowerCase() === email.toLowerCase());
    return user ? user.Gsid : "1P01E316G9DAPFOLE6SOOUG71XRMN5F3PLER";
  } catch (error) {
    console.error(`Error getting user ID by email (${email}):`, error.message);
    return "1P01E316G9DAPFOLE6SOOUG71XRMN5F3PLER"; // Return default instead of null
  }
}

async function getCompanyIdByName(companyName, instanceUrl, sessionCookie) {
  try {
    const companies = await getAllCompanies(instanceUrl, sessionCookie);
    // console.log(companies,"companies")
    const company = companies.find(c => c.Name?.toLowerCase() === companyName.toLowerCase());
    return company ? company.Gsid : "";
  } catch (error) {
    console.error(`Error getting company ID by name (${companyName}):`, error.message);
    return "";
  }
}


const activityTypeMappings = require('./activityTypeMapping.json'); // your JSON mapping file

async function getActivityId(
  activityid,
  targetInstanceUrl,
  targetInstanceToken,
  sourceInstanceUrl,
  sourceInstanceToken
) {
  try {
    const [sourceActivityTypes, targetActivityTypes] = await Promise.all([
      getAllActivityTypes(sourceInstanceUrl, sourceInstanceToken, 'source'),
      getAllActivityTypes(targetInstanceUrl, targetInstanceToken, 'target')
    ]);

    console.log(sourceActivityTypes, "sourceActivityTypes");
    console.log(targetActivityTypes, "targetActivityTypes");

    await saveActivityTypesToJson(sourceActivityTypes, targetActivityTypes);

    const sourceActivity = sourceActivityTypes.find(type => type.id === activityid);
    if (!sourceActivity) return null;

    let foundInSubCategory = false;
    let targetActivity = targetActivityTypes.find(type => type.name === sourceActivity.name);

    let subCategoryId = null;
    let mainCategoryName = null;

    // If not found in regular activity types, check subcategory
    if (!targetActivity) {
      const subCategoryItem = await getSubCategoryByName(sourceActivity.name, targetInstanceUrl, targetInstanceToken);
      if (subCategoryItem) {
        foundInSubCategory = true;
        subCategoryId = subCategoryItem.id;

        // Find main category name from mapping
        const match = activityTypeMappings.find(
          item => item["Sub-Activity Type"] === sourceActivity.name
        );
        mainCategoryName = match?.MainCategory || null;
        targetActivity = targetActivityTypes.find(type => type.name === mainCategoryName);
      }
    }

    return {
      id: targetActivity?.id || null,
      subCategoryId: subCategoryId,
      mainCategoryName: mainCategoryName
    };
  } catch (error) {
    console.error(`Error getting activity ID:`, error.message);
    return null;
  }
}

async function getSubCategoryByName(name, instanceUrl, token) {
  try {
    const categoryId = '1I00127ZUZQS288U7Q0I0OI65NMXCF5KYKH2'; // Replace with dynamic if needed
    const url = `${instanceUrl}/v1/ant/picklist/items/category/?ct=&id=${categoryId}&ref=`;

    const response = await axios.get(url, {
      headers: {
        Cookie: `sid=${token}`
      }
    });

    const item = response.data?.data?.find(entry => entry.label === name || entry.system_name === name);
    return item || null;

  } catch (err) {
    console.error('Error fetching subcategory:', err.message);
    return null;
  }
}


async function saveActivityTypesToJson(sourceActivityTypes, targetActivityTypes) {
  try {
    // Create a directory for the JSON files if it doesn't exist
    const outputDir = './activity-types';
    await fs.mkdir(outputDir, { recursive: true });

    // Save source activity types
    const sourceFilePath = path.join(outputDir, 'sourceActivityTypes.json');
    await fs.writeFile(sourceFilePath, JSON.stringify(sourceActivityTypes, null, 2));
    console.log(`Source activity types saved to: ${sourceFilePath}`);

    // Save target activity types
    const targetFilePath = path.join(outputDir, 'targetActivityTypes.json');
    await fs.writeFile(targetFilePath, JSON.stringify(targetActivityTypes, null, 2));
    console.log(`Target activity types saved to: ${targetFilePath}`);

    // Optionally, save both in a single file with metadata
    const combinedData = {
      timestamp: new Date().toISOString(),
      sourceActivityTypes,
      targetActivityTypes,
      counts: {
        source: sourceActivityTypes.length,
        target: targetActivityTypes.length
      }
    };

    const combinedFilePath = path.join(outputDir, 'combinedActivityTypes.json');
    await fs.writeFile(combinedFilePath, JSON.stringify(combinedData, null, 2));
    console.log(`Combined activity types saved to: ${combinedFilePath}`);

  } catch (error) {
    console.error('Error saving activity types to JSON:', error.message);
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
    // Add the file buffer
    form.append('file', attachmentData.buffer, {
      filename: attachmentData.name,
      contentType: attachmentData.contentType
    });

    // Prepare the request string payload
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
    // console.log(response.data,"yuva")
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

      // Download attachment from source
      const attachmentData = await downloadAttachment(attachment.url, attachment.name);

      // Upload to target instance
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
      // Transform the upload result to match the expected format
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

      // Small delay between attachment uploads
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Failed to process attachment ${attachment.name}:`, error.message);
      // Continue with other attachments even if one fails
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

// Helper function to process a single timeline entry with better error handling
async function processTimelineEntry(
  entry,
  userCache,
  companyCache,
  activityCache,
  milestoneCache,
  targetInstanceUrl,
  targetInstanceToken,
  sourceInstanceUrl,
  sourceInstanceToken, sourceCompanyId,
          targetCompanyId
) {
  try {
    console.log('Processing entry:', entry.id || 'unknown');

    // Handle user cache
    let userId;
    const authorEmail = entry.author?.email;
    if (authorEmail) {
      if (userCache[authorEmail]) {
        userId = userCache[authorEmail];
      } else {
        userId = await getUserIdByEmail(authorEmail, targetInstanceUrl, targetInstanceToken);
        userCache[authorEmail] = userId;
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
        const sourceActivityTypes = await getAllActivityTypes(sourceInstanceUrl, sourceInstanceToken, 'source', sourceCompanyId);
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

    // 🏁 Handle milestone type mapping (only for Milestone activities)
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
          sourceCompanyId,
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
    return { success: true, entryId: entry.id };

  } catch (error) {
    console.error('Error processing timeline entry:', error.message);
    return { success: false, reason: error.message, entryId: entry.id };
  }
}


// Improved batch processing function
async function processBatch(batch, userCache, companyCache, activityCache,milestoneCache, targetInstanceUrl, targetInstanceToken, sourceInstanceUrl, sourceInstanceToken, sourceCompanyId,
          targetCompanyId) {
  const results = [];

  // Process items in batch sequentially to avoid overwhelming the API
  for (const entry of batch) {
    try {
      console.log(entry, "entry")
      const result = await processTimelineEntry(
        entry,
        userCache,
        companyCache,
        activityCache,
        milestoneCache,
        targetInstanceUrl,
        targetInstanceToken,
        sourceInstanceUrl,
        sourceInstanceToken, sourceCompanyId,
          targetCompanyId
      );
      results.push(result);

      // Small delay between each entry to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.log(error)
      console.error(`Failed to process entry ${entry.id}:`, error.message);
      results.push({
        success: false,
        reason: error.message,
        entryId: entry.id
      });
    }
  }

  return results;
}

exports.migrateTimelines = async (req, res) => {
  try {
    const { sourceInstanceUrl, sourceInstanceToken, targetInstanceUrl, targetInstanceToken } = req.body;

    if (!sourceInstanceUrl || !sourceInstanceToken || !targetInstanceUrl || !targetInstanceToken) {
      return res.status(400).json({ message: "Missing source or target instance information" });
    }

    console.log('Starting timeline migration...');

    let allContent = [];
    let page = 0;
    const size = 7; // Reduced batch size for more stable fetching

    // Fetch all timelines with error handling
    console.log('Fetching timeline data...');
    // while (true) {
    try {
      const url = `${sourceInstanceUrl}/v1/ant/timeline/search/activity?page=${page}&size=${size}`;
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
        timeout: 30000 // Add timeout to prevent hanging
      };

      const response = await axios(config);
      const content = response?.data?.data?.content || [];

      allContent = [...allContent, ...content];

      const totalPages = response?.data?.data?.page?.totalPages;
      const currentPage = response?.data?.data?.page?.number;

      console.log(`Fetched page ${currentPage + 1}/${totalPages}, items: ${content.length}`);

      // if (content.length === 0 || currentPage + 1 >= totalPages) break;
      page++;

      // Add delay between page fetches
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error fetching page ${page}:`, error.message);
      // break; // Stop fetching on error
    }
    // }

    console.log(`Total timeline entries to migrate: ${allContent.length}`);

    if (allContent.length === 0) {
      return res.status(200).json({
        message: "No timeline entries found to migrate",
        totalProcessed: 0,
        successful: 0,
        failed: 0
      });
    }

    // Pre-load all reference data
    console.log('Pre-loading reference data...');
    let sourceCompanyId, targetCompanyId;
    
    try {
      const [sourceCompanies, targetCompanies] = await Promise.all([
        getAllCompanies(sourceInstanceUrl, sourceInstanceToken),
        getAllCompanies(targetInstanceUrl, targetInstanceToken)
      ]);

      sourceCompanyId = sourceCompanies?.[0]?.Gsid;
      targetCompanyId = targetCompanies?.[0]?.Gsid;

      if (!sourceCompanyId || !targetCompanyId) {
        return res.status(500).json({ message: "Could not get company IDs for API calls" });
      }

      console.log(`Using source company ID: ${sourceCompanyId}`);
      console.log(`Using target company ID: ${targetCompanyId}`);
    } catch (error) {
      console.error('Error pre-loading reference data:', error.message);
      return res.status(500).json({
        message: "Failed to load reference data",
        error: error.message
      });
    }

    // Initialize caches
    const userCache = {};
    const companyCache = {};
    const activityCache = {};
    const milestoneCache = {};
    
    // Process with improved batch handling
    const BATCH_SIZE = 3; // Smaller batch size for better stability
    const batches = [];

    for (let i = 0; i < allContent.length; i += BATCH_SIZE) {
      batches.push(allContent.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    let failureCount = 0;
    let processedCount = 0;
    const failedEntries = [];

    console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE} items each...`);

    // Process batches sequentially for better control
    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}...`);

      try {
        // Process the batch
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
          targetCompanyId
        );

        // Count results
        batchResults.forEach(result => {
          processedCount++;
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            failedEntries.push({
              entryId: result.entryId,
              reason: result.reason
            });
          }
        });

        console.log(`Batch ${batchIndex + 1} completed. Progress: ${processedCount}/${allContent.length} (${successCount} successful, ${failureCount} failed)`);

        // Longer delay between batches to be gentle on the API
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error) {
        console.error(`Error processing batch ${batchIndex + 1}:`, error.message);
        // Mark all items in this batch as failed
        batch.forEach(() => {
          processedCount++;
          failureCount++;
          failedEntries.push({
            entryId: 'unknown',
            reason: `Batch processing error: ${error.message}`
          });
        });
      }
    }

    // Clear caches to free memory - Fixed variable names
    Object.keys(userCache).forEach(key => delete userCache[key]);
    Object.keys(companyCache).forEach(key => delete companyCache[key]);
    Object.keys(activityCache).forEach(key => delete activityCache[key]);
    Object.keys(milestoneCache).forEach(key => delete milestoneCache[key]);

    console.log('Migration completed!');

    const response = {
      message: "Migration completed",
      totalProcessed: allContent.length,
      successful: successCount,
      failed: failureCount,
      details: {
        userCacheSize: Object.keys(userCache).length,
        companyCacheSize: Object.keys(companyCache).length,
        activityCacheSize: Object.keys(activityCache).length
      }
    };

    // Include failed entries if there are any (but limit to first 50 to avoid large responses)
    if (failedEntries.length > 0) {
      response.failedEntries = failedEntries.slice(0, 50);
      if (failedEntries.length > 50) {
        response.note = `Showing first 50 of ${failedEntries.length} failed entries`;
      }
    }

    res.status(200).json(response);

  } catch (error) {
    console.error("Migration error:", error.message);

    res.status(500).json({
      message: "Error during migration",
      error: error.message
    });
  }
};