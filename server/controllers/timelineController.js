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


// Optimized helper functions with caching
let userDataCache = null;
let companyDataCache = null;
let sourceActivityTypesCache = null;
let targetActivityTypesCache = null;

async function getAllUsers(instanceUrl, sessionCookie) {
  if (userDataCache) return userDataCache;

  try {
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

    userDataCache = allUsers;
    return allUsers;
  } catch (error) {
    console.error('Error fetching all users:', error.message);
    return [];
  }
}

async function getAllCompanies(instanceUrl, sessionCookie) {
  if (companyDataCache) return companyDataCache;
  
  try {
    let allCompanies = [];
    let pageNumber = 1;
    let hasMore = true;

    while (hasMore) {
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

      const companies = response.data.data.data || [];
      allCompanies = [...allCompanies, ...companies];
      
      // Check if there are more pages
      const totalRecords = response.data.data.totalRecords;
      hasMore = (pageNumber * 200) < totalRecords;
      pageNumber++;
    }

    companyDataCache = allCompanies;
    return allCompanies;
  } catch (error) {
    console.error('Error fetching all companies:', error.message);
    return [];
  }
}

async function getAllActivityTypes(instanceUrl, sessionToken, cacheKey, companyId) {
  const cache = cacheKey === 'source' ? sourceActivityTypesCache : targetActivityTypesCache;
  if (cache) return cache;

  try {
    const config = {
      method: 'get',
      url: `${instanceUrl}/v1/ant/forms?context=Company&contextId=${companyId}&showHidden=false`,
      headers: {
        'Cookie': sessionToken
      }
    };

    const response = await axios(config);
    const activityTypes = response?.data?.data?.activityTypes || [];
    
    if (cacheKey === 'source') {
      sourceActivityTypesCache = activityTypes;
    } else {
      targetActivityTypesCache = activityTypes;
    }
    
    return activityTypes;
  } catch (error) {
    console.error(`Error fetching activity types for ${cacheKey}:`, error.message);
    return [];
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
    const company = companies.find(c => c.Name?.toLowerCase() === companyName.toLowerCase());
    return company ? company.Gsid : "";
  } catch (error) {
    console.error(`Error getting company ID by name (${companyName}):`, error.message);
    return "";
  }
}

async function getActivityId(activityid, targetInstanceUrl, targetInstanceToken, sourceInstanceUrl, sourceInstanceToken) {
  try {
    const [sourceActivityTypes, targetActivityTypes] = await Promise.all([
      getAllActivityTypes(sourceInstanceUrl, sourceInstanceToken, 'source'),
      getAllActivityTypes(targetInstanceUrl, targetInstanceToken, 'target')
    ]);

    console.log(activityid, "activityid");

    const sourceActivity = sourceActivityTypes.find(type => type.id === activityid);
    if (!sourceActivity) return null;

    const targetActivity = targetActivityTypes.find(type => type.name === sourceActivity.name);
    console.log(targetActivity, "targetActivity");
    return targetActivity ? targetActivity.id : null;
  } catch (error) {
    console.error(`Error getting activity ID:`, error.message);
    return null;
  }
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
async function processTimelineEntry(entry, userCache, companyCache, activityCache, targetInstanceUrl, targetInstanceToken, sourceInstanceUrl, sourceInstanceToken) {
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

    console.log(entry.note?.subject, "entry.note?.subject");

    // Handle activity type cache
    let activityTypeId;
    const sourceActivityTypeId = entry?.meta?.activityTypeId;
    if (sourceActivityTypeId) {
      if (activityCache[sourceActivityTypeId]) {
        activityTypeId = activityCache[sourceActivityTypeId];
      } else {
        console.log(entry?.meta?.activityTypeId, "entry?.meta?.activityTypeId");
        activityTypeId = await getActivityId(sourceActivityTypeId, targetInstanceUrl, targetInstanceToken, sourceInstanceUrl, sourceInstanceToken);
        console.log(activityTypeId, "activityTypeId");
        activityCache[sourceActivityTypeId] = activityTypeId;
      }
    }
console.log(entry.note?.customFields?.internalAttendees, "entry.note?.customFields?.internalAttendees");
    const ModifiedInternalId = (entry.note?.customFields?.internalAttendees || []).map(att => ({
      ...att,
      id: userId,
      name: att.name,
      email: att.email,
      userType: "USER"
    }));

    const draftPayload = {
      lastModifiedByUser: {
        gsId: userId,
        name: entry.author?.name,
        eid: null,
        esys: null,
        pp: ""
      },
      note: {
        customFields: {
          internalAttendees: ModifiedInternalId,
          externalAttendees: []
        },
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
        activityTypeId: activityTypeId,
        ctaId: null,
        source: "GLOBAL_TIMELINE",
        hasTask: false,
        emailSent: false,
        systemType: "GAINSIGHT",
        notesTemplateId: null
      },
      author: {
        id: '1P01E316G9DAPFOLE6V9Z586JRYFUW88XLGG',
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
      attachments: [],
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
console.dir(draftPayload, { depth: null });
    console.log("draftPayload");

    const draftId = await createDraft(draftPayload, targetInstanceUrl, targetInstanceToken);
    if (!draftId) {
      return { success: false, reason: 'Draft creation failed', entryId: entry.id };
    }

    const timelinePayload = { ...draftPayload, id: draftId };
    console.log(timelinePayload, "timelinePayload");

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

    await axios(postConfig);
    return { success: true, entryId: entry.id };

  } catch (error) {
    console.error('Error processing timeline entry:', error.message);
    return { success: false, reason: error.message, entryId: entry.id };
  }
}

// Improved batch processing function
async function processBatch(batch, userCache, companyCache, activityCache, targetInstanceUrl, targetInstanceToken, sourceInstanceUrl, sourceInstanceToken) {
  const results = [];
  
  // Process items in batch sequentially to avoid overwhelming the API
  for (const entry of batch) {
    try {
      const result = await processTimelineEntry(
        entry, 
        userCache, 
        companyCache, 
        activityCache,
        targetInstanceUrl, 
        targetInstanceToken, 
        sourceInstanceUrl, 
        sourceInstanceToken
      );
      results.push(result);
      
      // Small delay between each entry to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
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
    const size = 50; // Reduced batch size for more stable fetching

    // Fetch all timelines with error handling
    console.log('Fetching timeline data...');
    while (true) {
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
          maxBodyLength: Infinity
        };

        const response = await axios(config);
        const content = response?.data?.data?.content || [];

        allContent = [...allContent, ...content];

        const totalPages = response?.data?.data?.page?.totalPages;
        const currentPage = response?.data?.data?.page?.number;

        console.log(`Fetched page ${currentPage + 1}/${totalPages}, items: ${content.length}`);

        if (content.length === 0 || currentPage + 1 >= totalPages) break;
        page++;
        
        // Add delay between page fetches
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error.message);
        break; // Stop fetching on error
      }
    }

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
    try {
      await Promise.all([
        getAllUsers(targetInstanceUrl, targetInstanceToken),
        getAllCompanies(targetInstanceUrl, targetInstanceToken)
      ]);
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
          targetInstanceUrl, 
          targetInstanceToken, 
          sourceInstanceUrl, 
          sourceInstanceToken
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

    // Clear caches to free memory
    userDataCache = null;
    companyDataCache = null;
    sourceActivityTypesCache = null;
    targetActivityTypesCache = null;

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
    
    // Clear caches on error
    userDataCache = null;
    companyDataCache = null;
    sourceActivityTypesCache = null;
    targetActivityTypesCache = null;
    
    res.status(500).json({ 
      message: "Error during migration", 
      error: error.message 
    });
  }
};