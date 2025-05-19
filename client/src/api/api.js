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
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..1lmsnurEvejT0UUq.vejuHHkYX9xJHTmo0Px36hD-Qe-AhKyazA-d42Qk-Rr9dV1Ktmi9mvw3I29E9Z8JnIdbhFztj5FPYzPlM-fslsfV9JDGlSRqzjJAr2EN-xpMug6Hhy88DXO7kJ2Sz37ToHrfeuywLAOi8eYFDyYDl-oIaWGiUYxgfPMTPDYgSa2ERspW8tJrgMx7MAQiO29g7ekBOcdBPUSEMDD0PFhfKNwZssFobwX7TX_Ht6aObAYZ3XzcZec1hcUqMqjx6vHSVBwnRNB7BfFvXO_do4tinvFNEkZaX0Tt8rRnrobQDG9cJcSLQtXCbhfQAuushjT8SF2dYAA6SMK73E3l34ARROZWddcFffp9xif-TLGiHdNASunfKGJXswcRTr1TSVVuOgc6X0vkFQ1ZhkVY1PL3jb_VA1fDU3soS6Atzhkotdf9EEQQZxubo0331QVzemX4YHTJDQyRdMEx20pWP21A4IXlx3ezSedIhbZ0oo844uWq_u_5oG7Xzao5w72V_Fu4QU4-BvlGXrf9oy80cNfNahp1gOwhcfDTzEPyt2izNlBXEZgQNRetvhSalNEf99DSidqe9gaQIDl3Dr2J9uyLuMXrL8i9qfSzIIKNHgevsW9JAVoDI2SPITlyq_PXQefsfoBZzef6ovs5WtLSX_W6nsIS0bmu438xQ783ZvG7OLD50ivamQz8YC9zQdqZZU4T8sgN9TW2T4sd-bQX7b9QheXn4L4NKVdH1nvxsv_QGvcBLT8u6ywDbENxT9o_YKKCaqe139q2f835CFczU7eK-I9YhEOIxQTcY9KPb1dUPCt5HgZBcDFGMoXAyTrgfszYAOr6LvTH-uEXOxlY09IuzXxP7QKLyrVPUpxRowwamlkUgZo49JtP54lZwG6BdkB0y3iua3bqq0BflJFrJt6JpfYrYs6jlObRR1fMGFK68BDsVCaB1lSxf7E3y-VM7J7WhJv07weMQfbOLmmfw9E4HG4GWlqDTWyLRBqlKCsu00iId-gHxb-x-yg23u8HN55JW6g9WfT1TbUS_OwFCm7xVyt3a2uh2w_v4pQK4-064E25NyhS7-mKyasoQP08n3hAgvbqYJ7rH-d5fWU9RmaBpEL_9ogv-7P5u8J1gW2S6RiNvnrFBk-ur4U4wA6QX4IdxwqM0puZepb7XQg-l6DBqKHMGBGHP-s8kk2gSFafLU74Thdw04lKb5J30RF6yT4tFECI_46K3_eGdxR1L2aRZCE4Gs8SL_dxPi33x7u1bBW3_INlwKXmI3_DecmXIaoR1-xQ4BfY0qllquq8axlFpUApSN1okmFK3f8ozwk_YKSNOp5tcAiC3yHyleoYTFmO9AP8QwMtmI-O8Rj60nQ9lAVu75YxrnPJK32dQDxw9ly1DgVnQEQXKn4pzX7Cv9AchxHOoF4Sj-rV6YfZokoQ4NRV_GbMGCkuL0v_0Tf6YdbZmnf00jjIel3ETpSI_PY7BtquwTf0qdmxWPbsZ5euDBZWPHLlLojweWIwkGEi7-UNBG3c_60FJKCQISVoSZqViNhRL8DMwXD5L1rtr9xAv87c6CoVGKII_6YGCfzrHvXBXVFfxhuMoT8qto8WepT8kguYlfNyqv-Qd1vYq1jeVOkxxZhD9G5jjYWyZAZgDMtPwn57mqkDtpkCFfN-cbXLsCO2ONtTgM0K7dhvfctKpgb4bPIhfJRXRYgZDB7uk4Y3mh4-KxIZPjx82cM0-9VfNVqz2Rp4jmdL0oKDJxC0Ed4i2qzhSsnbVGLbVkWP_2QiAQfNhrpUhByQ92qQDJtvg3Sz6vkFJ6mVx9wwN8QaNkKylt4qWDlwdrLclLB0GwRHe28-5PG00ZOhyai8-_QWsgeyhEtpXO9EfA7hl-aqcZl42mvQCC8UED734LUEpUkyRQUC5mGW-fEFRhhUH-rzas6wqna6Ga3BEBv3Z7uSaNoVvmPhZ8Dp4Iy5IFHVSPbOw8iOmJNWHyONckMU6_xv18b9FKAe7OM9CLtDQKTOcm733Qm5uZoqOIdNg_ejNHoYq0lYyOLsLim_3Ip8TUOxT5eYRdyZ16KyAc4_uwQEqeJ0AWMxmaTUUNzwtK7E0nIaPg-Fx7Mm7hGxkS-l6M0N-ajU_qrmgca_mZoqrqJwkmLL75qAIwYqMNX0NdD68BrwlAyi5j5_vtRWSIFf0C3gSHMSf11hZHfwzGuMOwuRdfN6nBIzAf51k-J9CLmkleacuJcq.RpFkUzYaTqU7oOzrffxZSg"
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
let instanceToken="sid=eyJlbmMiOiJBMTI4R0NNIiwiYWxnIjoiZGlyIn0..1lmsnurEvejT0UUq.vejuHHkYX9xJHTmo0Px36hD-Qe-AhKyazA-d42Qk-Rr9dV1Ktmi9mvw3I29E9Z8JnIdbhFztj5FPYzPlM-fslsfV9JDGlSRqzjJAr2EN-xpMug6Hhy88DXO7kJ2Sz37ToHrfeuywLAOi8eYFDyYDl-oIaWGiUYxgfPMTPDYgSa2ERspW8tJrgMx7MAQiO29g7ekBOcdBPUSEMDD0PFhfKNwZssFobwX7TX_Ht6aObAYZ3XzcZec1hcUqMqjx6vHSVBwnRNB7BfFvXO_do4tinvFNEkZaX0Tt8rRnrobQDG9cJcSLQtXCbhfQAuushjT8SF2dYAA6SMK73E3l34ARROZWddcFffp9xif-TLGiHdNASunfKGJXswcRTr1TSVVuOgc6X0vkFQ1ZhkVY1PL3jb_VA1fDU3soS6Atzhkotdf9EEQQZxubo0331QVzemX4YHTJDQyRdMEx20pWP21A4IXlx3ezSedIhbZ0oo844uWq_u_5oG7Xzao5w72V_Fu4QU4-BvlGXrf9oy80cNfNahp1gOwhcfDTzEPyt2izNlBXEZgQNRetvhSalNEf99DSidqe9gaQIDl3Dr2J9uyLuMXrL8i9qfSzIIKNHgevsW9JAVoDI2SPITlyq_PXQefsfoBZzef6ovs5WtLSX_W6nsIS0bmu438xQ783ZvG7OLD50ivamQz8YC9zQdqZZU4T8sgN9TW2T4sd-bQX7b9QheXn4L4NKVdH1nvxsv_QGvcBLT8u6ywDbENxT9o_YKKCaqe139q2f835CFczU7eK-I9YhEOIxQTcY9KPb1dUPCt5HgZBcDFGMoXAyTrgfszYAOr6LvTH-uEXOxlY09IuzXxP7QKLyrVPUpxRowwamlkUgZo49JtP54lZwG6BdkB0y3iua3bqq0BflJFrJt6JpfYrYs6jlObRR1fMGFK68BDsVCaB1lSxf7E3y-VM7J7WhJv07weMQfbOLmmfw9E4HG4GWlqDTWyLRBqlKCsu00iId-gHxb-x-yg23u8HN55JW6g9WfT1TbUS_OwFCm7xVyt3a2uh2w_v4pQK4-064E25NyhS7-mKyasoQP08n3hAgvbqYJ7rH-d5fWU9RmaBpEL_9ogv-7P5u8J1gW2S6RiNvnrFBk-ur4U4wA6QX4IdxwqM0puZepb7XQg-l6DBqKHMGBGHP-s8kk2gSFafLU74Thdw04lKb5J30RF6yT4tFECI_46K3_eGdxR1L2aRZCE4Gs8SL_dxPi33x7u1bBW3_INlwKXmI3_DecmXIaoR1-xQ4BfY0qllquq8axlFpUApSN1okmFK3f8ozwk_YKSNOp5tcAiC3yHyleoYTFmO9AP8QwMtmI-O8Rj60nQ9lAVu75YxrnPJK32dQDxw9ly1DgVnQEQXKn4pzX7Cv9AchxHOoF4Sj-rV6YfZokoQ4NRV_GbMGCkuL0v_0Tf6YdbZmnf00jjIel3ETpSI_PY7BtquwTf0qdmxWPbsZ5euDBZWPHLlLojweWIwkGEi7-UNBG3c_60FJKCQISVoSZqViNhRL8DMwXD5L1rtr9xAv87c6CoVGKII_6YGCfzrHvXBXVFfxhuMoT8qto8WepT8kguYlfNyqv-Qd1vYq1jeVOkxxZhD9G5jjYWyZAZgDMtPwn57mqkDtpkCFfN-cbXLsCO2ONtTgM0K7dhvfctKpgb4bPIhfJRXRYgZDB7uk4Y3mh4-KxIZPjx82cM0-9VfNVqz2Rp4jmdL0oKDJxC0Ed4i2qzhSsnbVGLbVkWP_2QiAQfNhrpUhByQ92qQDJtvg3Sz6vkFJ6mVx9wwN8QaNkKylt4qWDlwdrLclLB0GwRHe28-5PG00ZOhyai8-_QWsgeyhEtpXO9EfA7hl-aqcZl42mvQCC8UED734LUEpUkyRQUC5mGW-fEFRhhUH-rzas6wqna6Ga3BEBv3Z7uSaNoVvmPhZ8Dp4Iy5IFHVSPbOw8iOmJNWHyONckMU6_xv18b9FKAe7OM9CLtDQKTOcm733Qm5uZoqOIdNg_ejNHoYq0lYyOLsLim_3Ip8TUOxT5eYRdyZ16KyAc4_uwQEqeJ0AWMxmaTUUNzwtK7E0nIaPg-Fx7Mm7hGxkS-l6M0N-ajU_qrmgca_mZoqrqJwkmLL75qAIwYqMNX0NdD68BrwlAyi5j5_vtRWSIFf0C3gSHMSf11hZHfwzGuMOwuRdfN6nBIzAf51k-J9CLmkleacuJcq.RpFkUzYaTqU7oOzrffxZSg"
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
