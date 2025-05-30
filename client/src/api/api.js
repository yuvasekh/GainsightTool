import axios from 'axios';
let instanceUrl="https://demo-wigmore.gainsightcloud.com"
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..HkOArMtb5plonQZr.utMIGPmzbbRttzf9ebCmqCi3xaIgLH5Q3Zm_l4yosGVXuxKqkkcAn9J9ntmv2-yYW6bDrON-nPXKS549ewjOCSvhoUc7RZLCJqGzoKSuwMq9czw_HG2Iox4xtTEvL_aoZ5UAjosV8GoF5eODhwWiO0_HJzzU7B63UOLz7CYW8Zi65b2-bMSRx9QYkpXSTxzMa7YIC4qyq0t68BuJjREhS-YCdMS3zr7ZyY-Hu3DVBRwsH--MCrFCxt4QfTxGtVIw3IWVpdlcj1JqZH6rKP9EA7eFLrp4LZEPtC6rguVkCBnu4FK1wBd3n7nc06jpF3eLmHt8dFB9XTErEky_UhUmLhcPzYDmZLxy-s_EI0gahg7psY6z_W5HStOOL0BlS8XIQKAz17g6bxbHHmXz0IBSQ0d7_aI0keSDKzspMToV461ORm03LXFuFVnZu-7fWcdzLJa_Hppf0Qi9aet1WdPv7QfvSp2fvmfbSjddKH0FZMMtnxwRXmHxglGLsA84a4SuHtrlVyfCPE0YIqh6-FCLzwqg2CPMuzQpIrw7Gtxcy_jKOwgvxBni1hbVufZ7Myi5q3l8mOfG6p5N_ixj_jrFYYP6wRVzGcNKzyVaYDQXyhsovEYfVZKoQNREazzSOvS3BtRA5pYEd3viac-YN31k5-Caso2brqPqJqANvT2Yx5IFAuRn7PoJAvuWhVaz_FpfQ7QYnfcFxOEyTshcb5iivolTap8yOClDAEtiEH0JENw1jMECbWJJ1SqFFsDPps6gfX2kgFywToWZ2PFne64pvVsixvJnCuigeDdrCDiGrxUxOOHr8ViXXGE40gMYJGhUc7_NsJ56gb_xnfTFjBDER4v87e8UxRm72ISI8LyySBJKArvX-S3V4P4CHQnQ08rgSfiFLYzpG4PddgURQSnuaRfNviNkRfS-cBMkadDV21yrmv2W5fH4evASXDhaUKb4MLxW73zN9Iu9gLc4SAxz8w5N0IO8ZZMfZ_WZracO-dQi8L94C5RZZxKm-Rw1eAINyQ8U4NKLMpiXvSJXqZ5ulwng-ta0ccYPpI77tUi3VVIJNF2oQdaDtBp_QcEZ6OJgA1TM7l8bkmcgzNmv2sSX5m-CO6HJtObvjwODOyAWUo7182m41_fclqtAdNKvBs4lZMFoWjveRUqjs8hZ1YAlOHA8XfRCh16Y6MOQXTs8zTEEOxax_P-PEZhq9O6Rp13Wfa7RBduxEnGCNH8pXIQ3gd0zj15869JHhzDMZiy2NvKa3-BDe4JZNHq2ipr1j7UGgnsvB8lQkbz-WvlmllCHwSCV8IU56p2dqaIp-tXQsdi8gfKnYJBndOrHka3k0-k4PD-FJMPd71yB1CKSCYEs_iAWgbmYAhDt2JoKg8pXhXPDtAa-oIo18h_-kBw00DRBFHU2nhv_ArLTArwOwWDDMvDCNy2CpBZl-l9Bc5nSfOd8dRkIZqVaelthgOF5hudI24vM7vKyGn293tV94apyZW7a9nz3cxCoXoi4iu3BRLTI6P1QoTCUkL9Q5Iq5MtgiDMdO6YtCaYoP1xFjqW2GM2bBRIE1ngmdj243NYBOgFmMh19rrFid1HDQkMkT1ByNdxRpFaKDvlxU3FFBoFbR5jyISSQd0cz6yCxMCalYmZgmtBrPH3TXzr6rxQFAbanSm9iZ1WwLdA-PBqaUdEJOtIUIuKuDUYg6yXjI2cBTGw7D4RFzOL5QJLqWWKSaqlZceOVrdh6K4nVBeazw7Nl-7fWrz0p092oO-9Gba7DbSMuuYQDMbYBp3Krr8CQx8ILpcB9uXhkltTeKvSYLHKZJ-B3m9qfjpY9xBg0NzScIx5fQzETrD4lN13H8095Gmzf72bAUNtgED6bgCnTLFE8OVyTRWTaDPh2X4pHywPA1pY3TBqpMh4L-GKbP-NdgndH9wGP6jvvWEvT-V6T28V2oye3SmNvYEXyerA8GzUBVf3VpaVJyqB7eFTgqErdZ5vYJd5Mm1M2VF_sUj0RPiXXD6MJaUUuOdPnIWX5-eEvZl_S5qDRkcWHO4X9CB-RhGoxhtQhmDuiRC89MzPzO8DkQ2ZerCsa7ygMpc9hsRBWYeynfnLxWWfJ1xA6qIbiF_LaustYjL4kt1A1Zm9rsIBj_ORwoUAkuwPL9wv99cyVcUXdG1UP-_FMPCF74IIr2jwgHG9UQ1vjme04MpMUZELn6euPq4m6VX0_t.WfFgnp3v9LpZB9r4bYDf9w"
export async function fetchObjects(instanceUrl, instanceToken) {
  let instance={instanceToken:instanceToken,instanceUrl:instanceUrl}
  try {
    const response = await axios.post('https://gainsighttool-1.onrender.com/api/objects/fetch',instance); 
    console.log(response,"response")
    return response.data;  // Assuming backend sends array like ['Object1', 'Object2']
  } catch (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }
}

export async function downloadAttachments(instanceUrl, instanceToken) {
  let instance={instanceToken:instanceToken,instanceUrl:instanceUrl}
  try {
    const response = await axios.post('https://gainsighttool-1.onrender.com/api/objects/fetch',instance); 
    console.log(response,"response")
    return response.data;  // Assuming backend sends array like ['Object1', 'Object2']
  } catch (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }
}


export async function fetchFieldNames(instanceUrl, instanceToken, sourceObjectSelection) {
  try {
    const response = await axios.post('https://gainsighttool-1.onrender.com/api/fields', {
      objectName: sourceObjectSelection,
      instanceUrl,
      instanceToken
    });
    return response.data;  // e.g., ['Field1', 'Field2']
  } catch (error) {
    console.error('Error fetching fields:', error);
    throw error;
  }
}

  export async function addInstance( instanceUrl, accessKey ) {
    try {
      const response = await axios.post('https://gainsighttool-1.onrender.com/api/instances', {
        instanceUrl,
        accesskey: accessKey
      });
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  export async function createField( fieldName, displayName,objectName ) {
    try {
      const response = await axios.put('https://gainsighttool-1.onrender.com/api/add/fields', {
        fieldName, displayName ,objectName
      });
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  export async function createObject( fieldName, displayName ) {
    try {
      const response = await axios.post('https://gainsighttool-1.onrender.com/api/object', {
        fieldName, displayName
      });
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  export async function fetchTimelineData(instanceUrl, instanceToken) {
  try {
    const response = await fetch("https://gainsighttool-1.onrender.com/api/timeline", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instanceUrl,
        instanceToken,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching timeline data:", error)
    throw error
  }
}
  export async function createMigration(formData) {
    try {
      const response = await axios.post('https://gainsighttool-1.onrender.com/api/migrations', formData, {
        // headers: {
        //   'Content-Type': 'multipart/form-data', // Ensure the request is treated as multipart/form-data
        // },
      });
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  export async function message(message,messages) {
    try {
      const response = await axios.post('https://gainsighttool-1.onrender.com/api/message', {
        message,messages
      });
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
 

export async function totangoapitest(url, token) {
  try {
    const response = await axios.post('https://gainsighttool-1.onrender.com/api/timeline/getActivityTypes', {
      url,
      cookie: token,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching activity types:', error?.response?.data || error.message);
    throw error;
  }
}


export async function fetchCompanyTimeline(instanceUrl, instanceToken, pageSize, companyId, page) {
  try {
    const response = await fetch("https://gainsighttool-1.onrender.com/api/timeline/companyTimeLine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instanceUrl,
        instanceToken,
        pageSize,
        companyId,
        page,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching company timeline:", error)
    throw error
  }
}

export async function fetchTimelineObjects(instanceUrl, instanceToken,pageSize,companyId,page) {
  try {
     let instanceUrl="https://demo-wigmore.gainsightcloud.com"
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..xPgDeNVw9zbGlOW-.TD8QjBSID1nVkj-tyDY1JQa2BxbVsYYpryWyVkxYhuXBJLnkes0ExHgXVKquU_qK2nYuDr4bgP4AkpN8I8WSVerlTe8h37xUmfIRbV5mRou5XQMU8kAKBzzztUQ0DUAMBxrvfjQ2_i2KAecz4WsxMpT55an9H13QgPJsZtNT-Fb-43r60AUzQMIA7ZJe8Jfu9zCufqbuBoc0u-Y7brbAJetkLtyms9PQIlncbeGddAhANih16PRXkEfRct-e_ZvDbrWvNvzBOWWRj1YcgeJ6yLI5bGf4gCAo4ftaOZ7s41DHCagf_D-bZi1HxT89mF4JTm3aJ-JDwd_pQy78hA-y4_YplaXgWLJ_-NFOA_yahLThRPjJeIi1PtBu1OHbvGLNkCe9lEUEVQZINxJC-4Za8lX0wQiMKJxemM1qbx8flSUXVE2h8xzJ52PivaPoh47x3JWQUqziqLcQKfOAE5a87hflUFt7Jpuh3oM4hZUfFa97BdQWy-Zar7fx0wjdz65NrI4jq9_BP-xu4kxq_iJQavsImdW4EQGzH5dM2oaN9UNC2GFcM40B6yltlqYZ7quBaaipOGYqZEzW2rVv2xLD3Ut93GVHqMgqIiWX0iTrpEuWCIQvvz-6BZTTcjn4Zxk3s1M4QT7SjG2TdcyIan-ZeAVcVzysC0Ff94E8b9GCVjkQehp5lhuq_EbjfTDWNBoOrXqk5-iU2ZWP9tTK4p1PVBYJMDslWBJI2zPnzTgH88elXROMx1PJf4_ZcDBuJot8tPiVlR8qwcEDgRW8yS-M4pUWRLqXHhjbZqUCWXcoGJILWZYAh4K1wcBkUuLtk9d9Xnviuv4ZXYEbUJhZod-ax-vaqfcUb3zPrk_mlXUpU4ukD_thJGlWh5LaiTtuaXBDJviKaipL808tYk81NOmEA5dSmBj1YGO_R4mgapCgUAnNqffQBcgBbMi1SBa7azNbgTU28m2tZZBdcGpxcHAZep_xfsxLI7DfoO_dy6OWryGVF404JoFmv3uuNNroaT5Nkl9kB6Scozfo82OZUcPHCDbaL3GEEQxstARFZ4-Q-u4KmKGJwi6QFjDGdcQx_mFVg9ZTi9BP4_EG5F1qn_fiW5GDa73RXvfB6sAKQvSoTnucJ5caBBFpfz6f3ADfnaC34qu_rVK6XXO1dHk9VQLlVbox7KsXXj4rSVuop-nE5MM9vfutRFyjcC0tqW1XFFwmJLG-15aO7nkEzlMM1gBN9EoQ6nvA8J0D7lI9hcpPToDyLyrga-MBMXIMS0g64DiSckhCx_F4S8BmjnYtmxaNWDTLcZbLdf4aAyhi42zApOld5U-9mi8ZSb_iQHSJZx1oiwFjXTd0j5_wVlUZvl0mJjtAXrE7vB8a-Ir6U8c-v9aythnFBxtIrKa5sqCHJ4Nfo9oJ0jefIXBS-EETuTwbh84Xm3fNjoUU0b9KAC5vwk0hDS0BqYVtORKuAyy18_I_xwN4mzBiYSyZPbxV4X42ngI1fCZpXqBWlWM9P22GIKwyNtdULYRzYDNem5F6sRSlkYae7_fQTLVG9NEU0TswpsmaCu4ixhqYlQN3P3l6fDizNgaBG-Y1aRwT_td0-kVBNs-PkesvpifnZRP80A1afwyiriSKvVExB3VeXKk_20YlDYC1nSt6SejsnAJH40mWFB2xjKsLNwSPJ0JbIaxoD9HORVRQdNP4_-Dd-HuTzwbpmbHPpB3S-opD-aeHN01zR-kITtB5jgE-PajLPNjr-MMqQWxZlH23jH0HGldVOmyC_LO150kUniGrhwYHao8Poc41c39wwrx8VkXOIwQAouu5I4Rkm4qQuGS-U5O0nApnlQT_drLCNzkmHeGGVusRiBr-ZJcPK0LVOMESwKgfzrC5ekB92jONj6viO1DInKD0T53O57x-w0iDH7j97NBQ624BPnkFLYcEzfqQgC3ICcifihIitvv5_fjVi4b7bnf_oTHlWVpQifNdgEfCIsRDJgCP8wXa35231GPm5XSa0VCAtA0EofTSgtCw42cPHuMzzIsHkw3GZO1D__YicBn7QmDX6sRy9010NoEOmNIcpRQA3xOyvoaQ4NrmlPOYH2APADFBJV0HSte4JDEUiSQac3peQGYXiEmQOSwDaYX-9m5yBUdUxWK8Vj7YRbdvh8xQIkoJVMg7BoajFV60uadBIWKN9bA8M6oThenXPq1XRkkZRSfbGP-SasgnM8ab9i8yQA._5dAlgchBnodxfPvAfaVvw"
  const response = await axios.post(
      'https://gainsighttool-1.onrender.com/api/timeline/companyTimeLine',
      {
        instanceUrl,
        instanceToken,
        companyId,
        page,
        size: pageSize,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching company timeline:', error);
    throw error;
  }
}