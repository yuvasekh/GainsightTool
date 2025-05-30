const axios = require('axios');
// Optimized helper functions with caching
exports.getActivityTypes = async (req, res) => {
  const { url, cookie } = req.body;

  if (!url || !cookie) {
    return res.status(400).json({ error: 'URL and cookie are required' });
  }

  try {
    const response = await axios.get(url+"/t01/mend/api/v3/activity-types", {
      headers: {
        'Cookie': cookie,
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Totango API error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch data from Totango', details: error?.response?.data || error.message });
  }
};
let userDataCache = null;
let companyDataCache = null;
let sourceActivityTypesCache = null;
let targetActivityTypesCache = null;
let sourceTouchpointTypesCache = null;
let targetTouchpointTypesCache = null;
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

    while (true) {
      const response = await axios.post(
        `${instanceUrl}/v1/dataops/gdm/list?object=Company`,
        {
          limit: 25,
          pageNumber,
          searchString: "",
          clause: null,
          fields: [
            "Name",
            "Industry",
            "Stage",
            "Status",
            "Employees",
            "Users",
            "OriginalContractDate",
            "Csm",
            "Gsid"
          ],
          resolveGsids: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
          }
        }
      );

      const companies = response.data?.data?.data || [];

      // Stop when no more companies
      if (companies.length === 0) break;

      allCompanies.push(...companies);
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
      url: `${instanceUrl}/v1/ant/forms?context=Company&&contextId=${companyId}&showHidden=false`,
      headers: {
        'Cookie': sessionToken
      }
    };
    // console.log(config,"yuva12233config");  
    const response = await axios(config);
    // console.log(response.data.data.activityTypes,"yuva12233");
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
    // console.log(users,"users");
    const user = users.find(u => u.Email?.toLowerCase() === email.toLowerCase());
    return user ? user.Gsid : "1P01E316G9DAPFOLE6SOOUG71XRMN5F3PLER";
  } catch (error) {
    console.error(`Error getting user ID by email (${email}):`, error.message);
    return null;
  }
}
async function getCompanyIdByName(companyName, instanceUrl, sessionCookie) {
  try {
    const companies = await getAllCompanies(instanceUrl, sessionCookie);
    const company = companies.find(c => c.Name?.toLowerCase() === companyName.toLowerCase());
    return company ? company.Gsid : "";
  } catch (error) {
    console.error(`Error getting company ID by name (${companyName}):`, error.message);
    return null;
  }
}
async function getDisplayNameById(instanceUrl, sessionToken, cacheKey, id, sourceInstanceUrl,
  sourceInstanceToken) {
  try {
    // Check cache first
    const cache = sourceTouchpointTypesCache

    let touchpointTypes;

    if (cache) {
      touchpointTypes = cache;
    } else {
      // Fetch touchpoint types if not cached
      const config = {
        method: 'get',
        url: `${sourceInstanceUrl}/api/v3/touchpoint-types`,
        headers: {
          'Cookie': sourceInstanceToken
        }
      };

      const response = await axios(config);
      touchpointTypes = response?.data || [];

      // Cache the response
      sourceTouchpointTypesCache = touchpointTypes;
    }
    // console.log(touchpointTypes, "touchpointTypes");
    // Find and return display_name by id
    const touchpointType = touchpointTypes.find(type => type.id === id);
    // console.log(touchpointType, "touchpointType");
    return touchpointType ? touchpointType.display_name : null;

  } catch (error) {
    console.error(`Error fetching display name for ${cacheKey}:`, error.message);
    return null;
  }
}

async function createDraft(draftPayload, targetInstanceUrl, targetInstanceToken) {
  try {
    console.log(JSON.stringify(draftPayload));
    console.log("draftPayload");
    const response = await axios({
      method: 'post',
      maxContentLength: Infinity,
      url: `${targetInstanceUrl}/v1/ant/v2/activity/drafts`,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': targetInstanceToken
      },
      data: JSON.stringify(draftPayload),
      maxBodyLength: Infinity
    });

    console.log(response?.data, "yuva899")
    return response?.data?.data?.id || null;
  } catch (err) {
    console.error("Failed to create draft:", err.message);
    return null;
  }
}
async function getActivityTypeIdByType(type, instanceUrl, sessionToken, cacheKey, companyId) {
  const allActivityTypes = await getAllActivityTypes(instanceUrl, sessionToken, cacheKey, companyId);
  // console.log(allActivityTypes, "allActivityTypes");
  // console.log(type, "type");
  const matched = allActivityTypes.find(
    activityType => activityType.name?.toLowerCase() === type.toLowerCase()
  );
  console.log(matched?.id, "matched");

  return matched ? matched.id : null;
}
async function getActivityTypeIdFromTouchpointId(
  touchpointId,
  instanceUrl,
  sessionToken,
  cacheKey,
  companyId,
  sourceInstanceUrl,
  sourceInstanceToken
) {
  // Get display_name from touchpoint id
  const displayName = await getDisplayNameById(
    instanceUrl,
    sessionToken,
    cacheKey,
    touchpointId,
    sourceInstanceUrl,
    sourceInstanceToken
  );
  console.log(displayName, "displayName");
  if (!displayName) {
    console.log(`No display name found for touchpoint id ${touchpointId}`);
    return null;
  }

  // Use display_name as type to get activity type id
  const activityTypeId = await getActivityTypeIdByType(
    displayName,
    instanceUrl,
    sessionToken,
    cacheKey,
    companyId
  );
  // console.log(activityTypeId, "activityTypeId");

  return activityTypeId;
}




const companyCache = {
  isFetched: false,
  companies: []
};

async function getCompanyIdByTotangoAccountId(
  totangoAccountId,
  companyAccountMapping,
  sourceInstanceUrl,
  sourceInstanceToken,
  targetInstanceUrl,
  targetInstanceToken
) {

  // 1. Fetch and cache Totango company data
  if (!companyCache.isFetched) {
    console.log('📥 Fetching company data from Totango API...');
    const pageSize = 100;
    const totalHits = 910; // Optional: replace with dynamic total count if needed

    for (let offset = 0; offset < totalHits; offset += pageSize) {
      const query = {
        offset,
        count: pageSize,
        scope: "all",
        terms: [{ type: "owner", is_one_of: [] }],
        withDependencies: [],
        fields: [
          { type: "string_attribute", attribute: "Account Type", field_display_name: "Account Type" },
          { type: "string_attribute", attribute: "Status", field_display_name: "Status" },
          { type: "string", term: "health", field_display_name: "Health rank" },
          { type: "number_attribute", attribute: "Contract Value", field_display_name: "Contract Value", desc: true }
        ]
      };

      try {
        const response = await axios.post(
          `${sourceInstanceUrl}/t01/mend/api/v1/search/accounts`,
          new URLSearchParams({
            query: JSON.stringify(query),
            fetchAccountDisplayName: 'true'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': sourceInstanceToken
            }
          }
        );
        // console.log(response.data.response.accounts.hits, "response.data.response.accounts.hits") 

        const hits = response.data.response.accounts.hits;
        companyCache.companies.push(...hits);
      } catch (err) {
        console.error(`❌ Error fetching Totango companies at offset ${offset}:`, err.message);
        throw err;
      }
    }

    companyCache.isFetched = true;
    console.log(`✅ Cached ${companyCache.companies.length} Totango companies.`);
  }
  // console.log( companyCache.companies," companyCache.companies")
  // 2. Get the Totango company's display name by account ID
  const totangoCompany = companyCache.companies.find(c => c.name === totangoAccountId);
  // console.log(totangoCompany, "totangoCompany")
  const displayName = totangoCompany?.display_name || totangoCompany?.name;

  if (!displayName) {
    console.warn(`⚠️ No display name found for Totango account ID: ${totangoAccountId}`);
    return null;
  }
  console.log(displayName, "displayName")

  // 3. Look up Gainsight company ID by display name
  const companyId = await getCompanyIdByName(displayName, targetInstanceUrl, targetInstanceToken);
  if (!companyId) {
    console.warn(`⚠️ No Gainsight company found for display name: ${displayName}`);
  }

  return companyId;
}
async function processTotangoTimelineEntry(
  entry,
  userCache,
  companyCache,
  activityCache,
  targetInstanceUrl,
  targetInstanceToken,
  companyAccountMapping = null,
  sourceInstanceUrl,
  sourceInstanceToken,gainsightUserId
) {
  try {
    // console.log(`Processing Totango entry for account: ${entry.sourceAccountId}`);

    // 1. User Handling with Cache
    let userId;
    const authorEmail = entry.enrichedUsers?.[0]?.email || entry.author?.email;
    const authorName = entry.enrichedUsers?.[0]?.fullName || entry.author?.name || 'Unknown User';

    if (authorEmail) {
      userId = userCache[authorEmail] || await getUserIdByEmail(authorEmail, targetInstanceUrl, targetInstanceToken);
      userCache[authorEmail] = userId;
    } else {
      userId = "1P01E316G9DAPFOLE6SOOUG71XRMN5F3PLER"; // Fallback user
    }

    // 2. Company Handling with Cache
    const totangoAccountId = entry.sourceAccountId;
    let companyId, companyLabel = '';

    if (companyCache[totangoAccountId]?.id) {
      companyId = companyCache[totangoAccountId].id;
      companyLabel = companyCache[totangoAccountId].label || '';
    } else {
      companyId = await getCompanyIdByTotangoAccountId(
        totangoAccountId,
        companyAccountMapping,
        sourceInstanceUrl,
        sourceInstanceToken,
        targetInstanceUrl,
        targetInstanceToken,


      );
      if (!companyId) {
        return { success: false, reason: `No company mapping found for Totango account ID: ${totangoAccountId}` };
      }

      const companies = await getAllCompanies(targetInstanceUrl, targetInstanceToken);
      const company = companies.find(c => c.Gsid === companyId);
      companyLabel = company?.Name || '';

      companyCache[totangoAccountId] = { id: companyId, label: companyLabel };
    }

    // 3. Activity Type Handling with Cache
    const meetingType = entry.properties?.meeting_type;
    let activityTypeId;

    if (meetingType && activityCache[meetingType]) {
      activityTypeId = activityCache[meetingType];
    } else {
      activityTypeId = await getActivityTypeIdFromTouchpointId(
        meetingType,
        targetInstanceUrl,
        targetInstanceToken,
        'target',
        companyId,
        sourceInstanceUrl,
        sourceInstanceToken,
        
      );
      if (activityTypeId) {
        activityCache[meetingType] = activityTypeId;
      }
    }

    if (!activityTypeId) {
      return { success: false, reason: `No activity type mapping found for meeting type: ${meetingType}` };
    }

    // 4. Attendee Parsing
    const internalAttendees = [];
    const externalAttendees = [];

    if (authorEmail) {
      internalAttendees.push({
        id: userId,
        name: authorName,
        email: authorEmail,
        userType: "USER"
      });
    }

    const attendees = Array.isArray(entry.properties?.attendees)
      ? entry.properties.attendees
      : entry.properties?.attendees ? [entry.properties.attendees] : [];

    for (const attendee of attendees) {
      const email = attendee.email || (typeof attendee === 'string' ? attendee : '');
      const name = attendee.name || email || '';
      const isInternal = email.includes('@yourcompany.com') || email.includes('@internal.com');

      const attendeeObj = { name, email, userType: "USER" };
      if (isInternal) {
        internalAttendees.push({ ...attendeeObj, id: userId });
      } else {
        externalAttendees.push(attendeeObj);
      }
    }
    // console.log('entry',  entry);
    // console.log('External Attendees:', externalAttendees);

    // 5. Build Draft Payload
    const draftPayload = {
      lastModifiedByUser: {
        gsId: userId,
        name: authorName,
        eid: null,
        esys: null,
        pp: ""
      },
      note: {
        customFields: {
          internalAttendees,
          externalAttendees
        },
        type: meetingType || 'Meeting',
        subject: entry.properties?.subject || 'Totango Meeting',
        activityDate: entry.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString(),
        content: entry.note_content?.text || '',
        plainText: entry.note_content?.text.replace(/<[^>]*>/g, '') || '',
        trackers: null
      },
      mentions: [],
      relatedRecords: null,
      meta: {
        activityTypeId,
        ctaId: null,
        source: "C360",
        hasTask: entry.properties?.has_tasks || false,
        emailSent: entry.properties?.email_sent || false,
        systemType: "GAINSIGHT",
        notesTemplateId: null
      },
      author: {
        id: gainsightUserId,
        obj: "User",
        name: authorName,
        email: authorEmail,
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
          lbl: companyLabel,
          eid: null,
          eobj: "Account",
          eurl: null,
          esys: "SALESFORCE",
          dsp: true
        }
      ]
    };

    // 6. Create Draft and Post Timeline Entry
    const draftId = await createDraft(draftPayload, targetInstanceUrl, targetInstanceToken);
    if (!draftId) {
      return { success: false, reason: 'Draft creation failed' };
    }

    const timelinePayload = { ...draftPayload, id: draftId };

    const result = await axios.post(`${targetInstanceUrl}/v1/ant/v2/activity`, timelinePayload, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': targetInstanceToken
      },
      maxBodyLength: Infinity
    });

    console.log(`✅ Migrated Totango entry for account ${totangoAccountId}`);
    return { success: true, gainsightId: result?.data?.data?.id };

  } catch (error) {
    console.error(`❌ Error processing Totango entry for account ${entry.sourceAccountId}:`, error.message);
    return { success: false, reason: error.message };
  }
}
exports.TotangoMigrateTimelines = async (req, res) => {
  try {
    const {
      sourceInstanceUrl, // Totango URL: https://app.totango.com/t01/mend/api/v2/events/
      sourceInstanceToken, // Cookie string from your curl
      targetInstanceUrl, // Gainsight URL
      targetInstanceToken, // Gainsight auth token
      accountIds = [], // Array of account IDs to migrate
      gainsightUserId,
      companyAccountMapping = null // Optional mapping object: { totangoAccountId: gainsightCompanyId }
    } = req.body;

    if (!sourceInstanceUrl || !sourceInstanceToken || !targetInstanceUrl || !targetInstanceToken) {
      return res.status(400).json({ message: "Missing source or target instance information" });
    }

    console.log('Starting Totango to Gainsight timeline migration...');

    let allContent = [];

    // Process each account ID
    for (const accountId of accountIds) {
      console.log(`Fetching timeline data for Totango account: ${accountId}...`);
      try {
        const url = `${sourceInstanceUrl}/t01/mend/api/v2/events/?account_id=${accountId}&include_formatting=true`;
        console.log(url, "url");
        const config = {
          method: 'get',
          url,
          headers: {
            'Cookie': sourceInstanceToken
          },
          maxBodyLength: Infinity
        };

        const response = await axios(config);
        const events = response?.data || [];
        console.log(response?.data, "events");
        console.log(`Fetched ${events.length} events for account ${accountId}`);

        // Filter for events with meeting_type property
        const meetingEvents = events.filter(item =>
          item.properties && item.properties.hasOwnProperty('meeting_type')
        );

        console.log(`Found ${meetingEvents.length} meeting events for account ${accountId}`);

        // Add account context to each event
        const eventsWithContext = meetingEvents.map(event => ({
          ...event,
          sourceAccountId: accountId
        }));

        allContent = [...allContent, ...eventsWithContext];
        console.log(allContent.length, "allContent");
      } catch (error) {
        console.error(`Error fetching data for account ${accountId}:`, error.message);
        continue; // Continue with next account
      }
    }

    console.log(`Total filtered timeline entries to migrate: ${allContent.length}`);

    if (allContent.length === 0) {
      return res.status(200).json({
        message: "No meeting events found to migrate",
        totalProcessed: 0,
        successful: 0,
        failed: 0
      });
    }

    // Pre-load all reference data for Gainsight
    console.log('Pre-loading Gainsight reference data...');
    await Promise.all([
      getAllUsers(targetInstanceUrl, targetInstanceToken),
      getAllCompanies(targetInstanceUrl, targetInstanceToken)
    ]);

    // Initialize caches
    const userCache = {};
    const companyCache = {};
    const activityCache = {};

    // Process in parallel batches
    const BATCH_SIZE = 5; // Reduced to avoid overwhelming the API
    const batches = [];

    for (let i = 0; i < allContent.length; i += BATCH_SIZE) {
      batches.push(allContent.slice(i, i + BATCH_SIZE));
    }

    let successCount = 0;
    let failureCount = 0;
    let processedCount = 0;

    console.log(`Processing ${batches.length} batches of ${BATCH_SIZE} items each...`);

    for (const [batchIndex, batch] of batches.entries()) {
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}...`);

      const batchPromises = batch.map(entry =>
        processTotangoTimelineEntry(
          entry,
          userCache,
          companyCache,
          activityCache,
          targetInstanceUrl,
          targetInstanceToken,
          companyAccountMapping,
          sourceInstanceUrl,
          sourceInstanceToken,gainsightUserId
        )
      );

      // Wait for current batch to complete
      const batchResults = await Promise.allSettled(batchPromises);

      // Count successes and failures
      batchResults.forEach(result => {
        processedCount++;
        if (result.status === 'fulfilled' && result.value.success) {
          successCount++;
        } else {
          failureCount++;
          if (result.status === 'rejected') {
            console.error('Batch promise rejected:', result.reason);
          } else if (result.value.reason) {
            console.warn('Entry failed:', result.value.reason);
          }
        }
      });

      console.log(`Batch ${batchIndex + 1} completed. Progress: ${processedCount}/${allContent.length} (${successCount} successful, ${failureCount} failed)`);

      // Small delay between batches to be gentle on the API
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Clear caches to free memory
    userDataCache = null;
    companyDataCache = null;
    sourceActivityTypesCache = null;
    targetActivityTypesCache = null;

    console.log('Totango migration completed successfully!');

    res.status(200).json({
      message: "Totango migration completed",
      totalProcessed: allContent.length,
      successful: successCount,
      failed: failureCount,
      details: {
        userCacheSize: Object.keys(userCache).length,
        companyCacheSize: Object.keys(companyCache).length,
        activityCacheSize: Object.keys(activityCache).length
      }
    });

  } catch (error) {
    console.error("Totango migration error:", error.message);

    // Clear caches on error
    userDataCache = null;
    companyDataCache = null;
    sourceActivityTypesCache = null;
    targetActivityTypesCache = null;

    res.status(500).json({ message: "Error during Totango migration", error: error.message });
  }
};
