import axios from 'axios';
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
      const response = await axios.post('http://localhost:5000/api/timeline');
  
      // You can return whatever you get from backend
      return response.data; 
    } catch (error) {
      console.error('Error adding instance:', error);
      throw error; // Rethrow to handle it in the caller
    }
  }
  export async function createMigration(formData) {
    try {
      const response = await axios.post('http://localhost:5000/api/migrations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure the request is treated as multipart/form-data
        },
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