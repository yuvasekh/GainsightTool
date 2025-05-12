import axios from 'axios';
export async function fetchObjects() {
  try {
    const response = await axios.get('http://localhost:5000/api/objects'); 
    console.log(response,"response")
    return response.data;  // Assuming backend sends array like ['Object1', 'Object2']
  } catch (error) {
    console.error('Error fetching objects:', error);
    throw error;
  }
}

// Fetch fields for a specific object
export async function fetchFieldNames(objectName) {
  try {
    const response = await axios.get(`http://localhost:5000/api/fields?objectName=${encodeURIComponent(objectName)}`);
    return response.data;  // Assuming backend sends array like ['Field1', 'Field2']
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