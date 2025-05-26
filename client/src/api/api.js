import axios from 'axios';
let instanceUrl="https://demo-wigmore.gainsightcloud.com"
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..HkOArMtb5plonQZr.utMIGPmzbbRttzf9ebCmqCi3xaIgLH5Q3Zm_l4yosGVXuxKqkkcAn9J9ntmv2-yYW6bDrON-nPXKS549ewjOCSvhoUc7RZLCJqGzoKSuwMq9czw_HG2Iox4xtTEvL_aoZ5UAjosV8GoF5eODhwWiO0_HJzzU7B63UOLz7CYW8Zi65b2-bMSRx9QYkpXSTxzMa7YIC4qyq0t68BuJjREhS-YCdMS3zr7ZyY-Hu3DVBRwsH--MCrFCxt4QfTxGtVIw3IWVpdlcj1JqZH6rKP9EA7eFLrp4LZEPtC6rguVkCBnu4FK1wBd3n7nc06jpF3eLmHt8dFB9XTErEky_UhUmLhcPzYDmZLxy-s_EI0gahg7psY6z_W5HStOOL0BlS8XIQKAz17g6bxbHHmXz0IBSQ0d7_aI0keSDKzspMToV461ORm03LXFuFVnZu-7fWcdzLJa_Hppf0Qi9aet1WdPv7QfvSp2fvmfbSjddKH0FZMMtnxwRXmHxglGLsA84a4SuHtrlVyfCPE0YIqh6-FCLzwqg2CPMuzQpIrw7Gtxcy_jKOwgvxBni1hbVufZ7Myi5q3l8mOfG6p5N_ixj_jrFYYP6wRVzGcNKzyVaYDQXyhsovEYfVZKoQNREazzSOvS3BtRA5pYEd3viac-YN31k5-Caso2brqPqJqANvT2Yx5IFAuRn7PoJAvuWhVaz_FpfQ7QYnfcFxOEyTshcb5iivolTap8yOClDAEtiEH0JENw1jMECbWJJ1SqFFsDPps6gfX2kgFywToWZ2PFne64pvVsixvJnCuigeDdrCDiGrxUxOOHr8ViXXGE40gMYJGhUc7_NsJ56gb_xnfTFjBDER4v87e8UxRm72ISI8LyySBJKArvX-S3V4P4CHQnQ08rgSfiFLYzpG4PddgURQSnuaRfNviNkRfS-cBMkadDV21yrmv2W5fH4evASXDhaUKb4MLxW73zN9Iu9gLc4SAxz8w5N0IO8ZZMfZ_WZracO-dQi8L94C5RZZxKm-Rw1eAINyQ8U4NKLMpiXvSJXqZ5ulwng-ta0ccYPpI77tUi3VVIJNF2oQdaDtBp_QcEZ6OJgA1TM7l8bkmcgzNmv2sSX5m-CO6HJtObvjwODOyAWUo7182m41_fclqtAdNKvBs4lZMFoWjveRUqjs8hZ1YAlOHA8XfRCh16Y6MOQXTs8zTEEOxax_P-PEZhq9O6Rp13Wfa7RBduxEnGCNH8pXIQ3gd0zj15869JHhzDMZiy2NvKa3-BDe4JZNHq2ipr1j7UGgnsvB8lQkbz-WvlmllCHwSCV8IU56p2dqaIp-tXQsdi8gfKnYJBndOrHka3k0-k4PD-FJMPd71yB1CKSCYEs_iAWgbmYAhDt2JoKg8pXhXPDtAa-oIo18h_-kBw00DRBFHU2nhv_ArLTArwOwWDDMvDCNy2CpBZl-l9Bc5nSfOd8dRkIZqVaelthgOF5hudI24vM7vKyGn293tV94apyZW7a9nz3cxCoXoi4iu3BRLTI6P1QoTCUkL9Q5Iq5MtgiDMdO6YtCaYoP1xFjqW2GM2bBRIE1ngmdj243NYBOgFmMh19rrFid1HDQkMkT1ByNdxRpFaKDvlxU3FFBoFbR5jyISSQd0cz6yCxMCalYmZgmtBrPH3TXzr6rxQFAbanSm9iZ1WwLdA-PBqaUdEJOtIUIuKuDUYg6yXjI2cBTGw7D4RFzOL5QJLqWWKSaqlZceOVrdh6K4nVBeazw7Nl-7fWrz0p092oO-9Gba7DbSMuuYQDMbYBp3Krr8CQx8ILpcB9uXhkltTeKvSYLHKZJ-B3m9qfjpY9xBg0NzScIx5fQzETrD4lN13H8095Gmzf72bAUNtgED6bgCnTLFE8OVyTRWTaDPh2X4pHywPA1pY3TBqpMh4L-GKbP-NdgndH9wGP6jvvWEvT-V6T28V2oye3SmNvYEXyerA8GzUBVf3VpaVJyqB7eFTgqErdZ5vYJd5Mm1M2VF_sUj0RPiXXD6MJaUUuOdPnIWX5-eEvZl_S5qDRkcWHO4X9CB-RhGoxhtQhmDuiRC89MzPzO8DkQ2ZerCsa7ygMpc9hsRBWYeynfnLxWWfJ1xA6qIbiF_LaustYjL4kt1A1Zm9rsIBj_ORwoUAkuwPL9wv99cyVcUXdG1UP-_FMPCF74IIr2jwgHG9UQ1vjme04MpMUZELn6euPq4m6VX0_t.WfFgnp3v9LpZB9r4bYDf9w"
export async function fetchObjects(instanceUrl, instanceToken) {
  let instance={instanceToken:instanceToken,instanceUrl:instanceUrl}
  try {
    const response = await axios.post('http://localhost:5000/api/objects/fetch',instance); 
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
    const response = await axios.post('http://localhost:5000/api/objects/fetch',instance); 
    console.log(response,"response")
    return response.data;  // Assuming backend sends array like ['Object1', 'Object2']
  } catch (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }
}


export async function fetchFieldNames(instanceUrl, instanceToken, sourceObjectSelection) {
  try {
    const response = await axios.post('http://localhost:5000/api/fields', {
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
      const response = await axios.post('http://localhost:5000/api/instances', {
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
      const response = await axios.put('http://localhost:5000/api/add/fields', {
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
      const response = await axios.post('http://localhost:5000/api/object', {
        fieldName, displayName
      });
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  export async function fetchTimelineData( fieldName, displayName ) {
    try {
      let instanceUrl="https://demo-wigmore.gainsightcloud.com"
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..UkW8BYYZnxI7jdVw.AK1kgV6FBuSQjefHiMlE-nbccaX2ZOQWCuc3dlZ8Z6ZqsjzhN16uU6uAd8fPZ3TBFdBLOCp31UTVrrFCGUGV2d2XpeC-oKUA_IG-za2x-iGwZRH2PbFuXDlmPXekT3-Axy11FEGMgqfJd4QN62DSk5qDYXnjOQbyfuwRaF1ay0VaP-sT7vXLzb3ciQ5Y09yvLA-4A9kKihemgmP6obGoFwNPWqPyVjwWMWzV2eutXUU73eJuJqCUn9H2-s6EvM5zURx4u9ktEwxUBtehRwB7LrlRbycJ6YRXamxHaaYRkxVKppQfvNspNZsERqLDMQI9brhpor8w8N1QmNaNhHEujom8Vm6W6KAo-QZDORNA1KaJraxwCa8P9pXxD2tcJKU_Q0cyMRCGs705RYXPV39jXFhDaMT51uuZ9soq8QpT7kT8yjC9n8YAKOqhg6PO5VGmowPwUlFp6mkD5S1YPTqUPLRgPR6xPQeoeW7gLbnAvL-g66s1734bT-pfs7wJDXx2LSuoIIM2xJ1lR9orv8tPYYpOOFFPpUq0d221mRmiT07uXuJBmBFt4YGMt7PUuufPaeI93jl0ZCkA15moi5LFdQpRrKVHfYIAJqYsgmHPUSy3Ut8NVKGQMKHgWarR4-t9noIgsn2CUR-Z7pbRtPtmfX5tgo4X3Ab71QH0qrYH3P_irqnU3711OGXLjfyG_kGmO-fgwS3FJyfxTEn7yLSOtFYz4nWpV0hOFe19Qmy0GvcBFoMhsJX4S_hX8f7JjUQf2dO1YpMQKiA8h6Tid97JB05x9MNI9Unz6WURuUp-x2VYDxAS-O0WzKkcDQK1Rt6M90SbcsyXMwdg8jCaZhy7RxubXTIlLUWr8HjRpPPyticiV5lhEAp3CTYqO21Fo5yVVlqqiH9BWYqvHJUt6mPKGNh2LvfTUekVwAsMueaBEcQUsrIBH5fRQbEfPwMMNFeppXKtk55xQbH2tufdSxXTDBPkug_n7m0Z3ad2SZC34YTpsYGHqv-m1hJG5Yxa-Hs94KjasWA6_aAp96YktmtglUZ1KxG7sEw9Y50AJaP339fWkjI710EjUdfq5L41V6IdlCyD5UmIzw_Ic4g7gZ5BuKKDtHvpXghNcM9IKOSoylTW0N8bOFH7qW66vIQp0oxuHPiXFQaJFb55gLB2INpBcvAAE-GSoWa-n2bzBfqxrsFUrcASROjlVgz84Hci5d59hVBE29I0A4UMj2tFxe5cqCALj0L4y9ichDDCqqr3NHnFZs4oWjQtX5v1hiNzkSOZ35oAQXwlouozxJJ-5GcN5jQpy-GotMqE2CwQGcKGUGymN3aHSH58z7EoUJvVEw_pPAD8iSJw4TXYFco4mcDqDkDEr4hgs2guWNfhuNiC5ax-b1uJJaJUEZmrUZRxTLIxs4aoRe78koQrjKln-9exi_YY_MDx-y-w9EjW9pV9pjeIvyu1qxuwKPfXSpqa7faFMYxf30PNsBF2DBC1dRS3icN4u4ZOynX-bA1lhXuiiept2dN7diMVEVyJvGkd02Mp1Osr5vnS9BSlb-R02TjJrcbddUG5No0-ptpTonp8zSzwaWMUqbq6JfWBMrJO-k6y8dxCL4TEzCxmQcvV9oe8gvHmdfDmKO7UMUINyWRJxcWf2Yc7KwhYuT-D-kamoZorbcj6NXAWvLav53BBUKcHN3O6hQMcsbll7wnZ9fnZ42cNcvqn3NW5k_eq3d6zh3ieoMnqDAV4XqIOzr-PXTqUCH-0f-dQrV165HDO6SEP2-jJRhT4BCyGutpicxHcjtH97SfGv38nLEq2H7oiYbImKcpUZUn1t3wzsIZJyOBlgCsefaQ3tvZPYK13-ywNe6S_jRSBCjZ2Jett-4SsfE1hd6rz3WUOuWQcvpDdqYjogkDIaQW6Uw5DtVVgfsoF2hoEFKk9sPltFqh_dRdzKniyBfbHpYm7VnI9ZLFKp52NX_RseR37-nsijcTwenG5fi7JlLpfpf-wLGucI6MqtR7ujiP_sKfYcP_QwRAkBZUNoGoUhaVBU23Pf6kseWgRoq_W7rwBz0ko7J5deLsL6bZ7p7JzffdbW_r83OP1hmNHP-b2L9XBFtwPMC6-AphbbhL86RQVydHdzoUJBZO-EpQEZCAq2Y8rga6Byr3B_m-dBxShp_uBXaiMZNEMvHuhhIlilE34wysJQsv2fhidh4Oy-RANsl16hNJ8AjHSnZvkV0UJDQ.gc6bbpsh474UHCJbi_bYpg"
      const response = await axios.post('http://localhost:5000/api/timeline', {
      instanceUrl,
      instanceToken,
    });
    return response.data
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  export async function createMigration(formData) {
    try {
      const response = await axios.post('http://localhost:5000/api/migrations', formData, {
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
      const response = await axios.post('http://localhost:5000/api/message', {
        message,messages
      });
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }

export async function fetchCompanyTimeline(instanceUrl, instanceToken,pageSize,companyId,page) {
  try {
     let instanceUrl="https://demo-wigmore.gainsightcloud.com"
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..UkW8BYYZnxI7jdVw.AK1kgV6FBuSQjefHiMlE-nbccaX2ZOQWCuc3dlZ8Z6ZqsjzhN16uU6uAd8fPZ3TBFdBLOCp31UTVrrFCGUGV2d2XpeC-oKUA_IG-za2x-iGwZRH2PbFuXDlmPXekT3-Axy11FEGMgqfJd4QN62DSk5qDYXnjOQbyfuwRaF1ay0VaP-sT7vXLzb3ciQ5Y09yvLA-4A9kKihemgmP6obGoFwNPWqPyVjwWMWzV2eutXUU73eJuJqCUn9H2-s6EvM5zURx4u9ktEwxUBtehRwB7LrlRbycJ6YRXamxHaaYRkxVKppQfvNspNZsERqLDMQI9brhpor8w8N1QmNaNhHEujom8Vm6W6KAo-QZDORNA1KaJraxwCa8P9pXxD2tcJKU_Q0cyMRCGs705RYXPV39jXFhDaMT51uuZ9soq8QpT7kT8yjC9n8YAKOqhg6PO5VGmowPwUlFp6mkD5S1YPTqUPLRgPR6xPQeoeW7gLbnAvL-g66s1734bT-pfs7wJDXx2LSuoIIM2xJ1lR9orv8tPYYpOOFFPpUq0d221mRmiT07uXuJBmBFt4YGMt7PUuufPaeI93jl0ZCkA15moi5LFdQpRrKVHfYIAJqYsgmHPUSy3Ut8NVKGQMKHgWarR4-t9noIgsn2CUR-Z7pbRtPtmfX5tgo4X3Ab71QH0qrYH3P_irqnU3711OGXLjfyG_kGmO-fgwS3FJyfxTEn7yLSOtFYz4nWpV0hOFe19Qmy0GvcBFoMhsJX4S_hX8f7JjUQf2dO1YpMQKiA8h6Tid97JB05x9MNI9Unz6WURuUp-x2VYDxAS-O0WzKkcDQK1Rt6M90SbcsyXMwdg8jCaZhy7RxubXTIlLUWr8HjRpPPyticiV5lhEAp3CTYqO21Fo5yVVlqqiH9BWYqvHJUt6mPKGNh2LvfTUekVwAsMueaBEcQUsrIBH5fRQbEfPwMMNFeppXKtk55xQbH2tufdSxXTDBPkug_n7m0Z3ad2SZC34YTpsYGHqv-m1hJG5Yxa-Hs94KjasWA6_aAp96YktmtglUZ1KxG7sEw9Y50AJaP339fWkjI710EjUdfq5L41V6IdlCyD5UmIzw_Ic4g7gZ5BuKKDtHvpXghNcM9IKOSoylTW0N8bOFH7qW66vIQp0oxuHPiXFQaJFb55gLB2INpBcvAAE-GSoWa-n2bzBfqxrsFUrcASROjlVgz84Hci5d59hVBE29I0A4UMj2tFxe5cqCALj0L4y9ichDDCqqr3NHnFZs4oWjQtX5v1hiNzkSOZ35oAQXwlouozxJJ-5GcN5jQpy-GotMqE2CwQGcKGUGymN3aHSH58z7EoUJvVEw_pPAD8iSJw4TXYFco4mcDqDkDEr4hgs2guWNfhuNiC5ax-b1uJJaJUEZmrUZRxTLIxs4aoRe78koQrjKln-9exi_YY_MDx-y-w9EjW9pV9pjeIvyu1qxuwKPfXSpqa7faFMYxf30PNsBF2DBC1dRS3icN4u4ZOynX-bA1lhXuiiept2dN7diMVEVyJvGkd02Mp1Osr5vnS9BSlb-R02TjJrcbddUG5No0-ptpTonp8zSzwaWMUqbq6JfWBMrJO-k6y8dxCL4TEzCxmQcvV9oe8gvHmdfDmKO7UMUINyWRJxcWf2Yc7KwhYuT-D-kamoZorbcj6NXAWvLav53BBUKcHN3O6hQMcsbll7wnZ9fnZ42cNcvqn3NW5k_eq3d6zh3ieoMnqDAV4XqIOzr-PXTqUCH-0f-dQrV165HDO6SEP2-jJRhT4BCyGutpicxHcjtH97SfGv38nLEq2H7oiYbImKcpUZUn1t3wzsIZJyOBlgCsefaQ3tvZPYK13-ywNe6S_jRSBCjZ2Jett-4SsfE1hd6rz3WUOuWQcvpDdqYjogkDIaQW6Uw5DtVVgfsoF2hoEFKk9sPltFqh_dRdzKniyBfbHpYm7VnI9ZLFKp52NX_RseR37-nsijcTwenG5fi7JlLpfpf-wLGucI6MqtR7ujiP_sKfYcP_QwRAkBZUNoGoUhaVBU23Pf6kseWgRoq_W7rwBz0ko7J5deLsL6bZ7p7JzffdbW_r83OP1hmNHP-b2L9XBFtwPMC6-AphbbhL86RQVydHdzoUJBZO-EpQEZCAq2Y8rga6Byr3B_m-dBxShp_uBXaiMZNEMvHuhhIlilE34wysJQsv2fhidh4Oy-RANsl16hNJ8AjHSnZvkV0UJDQ.gc6bbpsh474UHCJbi_bYpg"
  const response = await axios.post(
      'http://localhost:5000/api/timeline/companyTimeLine',
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

export async function fetchTimelineObjects(instanceUrl, instanceToken,pageSize,companyId,page) {
  try {
     let instanceUrl="https://demo-wigmore.gainsightcloud.com"
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..UkW8BYYZnxI7jdVw.AK1kgV6FBuSQjefHiMlE-nbccaX2ZOQWCuc3dlZ8Z6ZqsjzhN16uU6uAd8fPZ3TBFdBLOCp31UTVrrFCGUGV2d2XpeC-oKUA_IG-za2x-iGwZRH2PbFuXDlmPXekT3-Axy11FEGMgqfJd4QN62DSk5qDYXnjOQbyfuwRaF1ay0VaP-sT7vXLzb3ciQ5Y09yvLA-4A9kKihemgmP6obGoFwNPWqPyVjwWMWzV2eutXUU73eJuJqCUn9H2-s6EvM5zURx4u9ktEwxUBtehRwB7LrlRbycJ6YRXamxHaaYRkxVKppQfvNspNZsERqLDMQI9brhpor8w8N1QmNaNhHEujom8Vm6W6KAo-QZDORNA1KaJraxwCa8P9pXxD2tcJKU_Q0cyMRCGs705RYXPV39jXFhDaMT51uuZ9soq8QpT7kT8yjC9n8YAKOqhg6PO5VGmowPwUlFp6mkD5S1YPTqUPLRgPR6xPQeoeW7gLbnAvL-g66s1734bT-pfs7wJDXx2LSuoIIM2xJ1lR9orv8tPYYpOOFFPpUq0d221mRmiT07uXuJBmBFt4YGMt7PUuufPaeI93jl0ZCkA15moi5LFdQpRrKVHfYIAJqYsgmHPUSy3Ut8NVKGQMKHgWarR4-t9noIgsn2CUR-Z7pbRtPtmfX5tgo4X3Ab71QH0qrYH3P_irqnU3711OGXLjfyG_kGmO-fgwS3FJyfxTEn7yLSOtFYz4nWpV0hOFe19Qmy0GvcBFoMhsJX4S_hX8f7JjUQf2dO1YpMQKiA8h6Tid97JB05x9MNI9Unz6WURuUp-x2VYDxAS-O0WzKkcDQK1Rt6M90SbcsyXMwdg8jCaZhy7RxubXTIlLUWr8HjRpPPyticiV5lhEAp3CTYqO21Fo5yVVlqqiH9BWYqvHJUt6mPKGNh2LvfTUekVwAsMueaBEcQUsrIBH5fRQbEfPwMMNFeppXKtk55xQbH2tufdSxXTDBPkug_n7m0Z3ad2SZC34YTpsYGHqv-m1hJG5Yxa-Hs94KjasWA6_aAp96YktmtglUZ1KxG7sEw9Y50AJaP339fWkjI710EjUdfq5L41V6IdlCyD5UmIzw_Ic4g7gZ5BuKKDtHvpXghNcM9IKOSoylTW0N8bOFH7qW66vIQp0oxuHPiXFQaJFb55gLB2INpBcvAAE-GSoWa-n2bzBfqxrsFUrcASROjlVgz84Hci5d59hVBE29I0A4UMj2tFxe5cqCALj0L4y9ichDDCqqr3NHnFZs4oWjQtX5v1hiNzkSOZ35oAQXwlouozxJJ-5GcN5jQpy-GotMqE2CwQGcKGUGymN3aHSH58z7EoUJvVEw_pPAD8iSJw4TXYFco4mcDqDkDEr4hgs2guWNfhuNiC5ax-b1uJJaJUEZmrUZRxTLIxs4aoRe78koQrjKln-9exi_YY_MDx-y-w9EjW9pV9pjeIvyu1qxuwKPfXSpqa7faFMYxf30PNsBF2DBC1dRS3icN4u4ZOynX-bA1lhXuiiept2dN7diMVEVyJvGkd02Mp1Osr5vnS9BSlb-R02TjJrcbddUG5No0-ptpTonp8zSzwaWMUqbq6JfWBMrJO-k6y8dxCL4TEzCxmQcvV9oe8gvHmdfDmKO7UMUINyWRJxcWf2Yc7KwhYuT-D-kamoZorbcj6NXAWvLav53BBUKcHN3O6hQMcsbll7wnZ9fnZ42cNcvqn3NW5k_eq3d6zh3ieoMnqDAV4XqIOzr-PXTqUCH-0f-dQrV165HDO6SEP2-jJRhT4BCyGutpicxHcjtH97SfGv38nLEq2H7oiYbImKcpUZUn1t3wzsIZJyOBlgCsefaQ3tvZPYK13-ywNe6S_jRSBCjZ2Jett-4SsfE1hd6rz3WUOuWQcvpDdqYjogkDIaQW6Uw5DtVVgfsoF2hoEFKk9sPltFqh_dRdzKniyBfbHpYm7VnI9ZLFKp52NX_RseR37-nsijcTwenG5fi7JlLpfpf-wLGucI6MqtR7ujiP_sKfYcP_QwRAkBZUNoGoUhaVBU23Pf6kseWgRoq_W7rwBz0ko7J5deLsL6bZ7p7JzffdbW_r83OP1hmNHP-b2L9XBFtwPMC6-AphbbhL86RQVydHdzoUJBZO-EpQEZCAq2Y8rga6Byr3B_m-dBxShp_uBXaiMZNEMvHuhhIlilE34wysJQsv2fhidh4Oy-RANsl16hNJ8AjHSnZvkV0UJDQ.gc6bbpsh474UHCJbi_bYpg"
  const response = await axios.post(
      'http://localhost:5000/api/timeline/companyTimeLine',
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