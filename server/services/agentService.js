// This is a placeholder for your agent service
// You'll need to implement this based on your actual agent implementation

async function startAgent(input,messages) {
    console.dir(messages,"yuva")

    return new Promise(async(resolve,reject)=>
    {
        const data = {
            contents: messages,
            tools: [
              {
                functionDeclarations: [
                  {
                    name: "create_object_with_field",
                    description: "Aks the user for Creates an field by collecting object name, field name, and data type from the user.",
                    parameters: {
                      type: "object",
                      properties: {
                        objectName: {
                          type: "string",
                          description: "The name of the object to create."
                        },
                        fieldName: {
                          type: "string",
                          description: "The field to add to the object."
                        },
                        dataType: {
                          type: "string",
                          description: "The data type of the field.",
                          enum: ["string", "number", "boolean", "date"]
                        }
                      },
                      required: ["objectName", "fieldName", "dataType"]
                    }
                  }
                ]
              }
            ],
            toolConfig: {
              functionCallingConfig: {
                mode: "AUTO"
              }
            }
          };
        
          const config = {
            method: "post",
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBYR6gyhmJ5nqmEGUdit8Z3X1TXtQZFg6g',
                headers: {
              "Content-Type": "application/json"
            },
            data: JSON.stringify(data)
          };
        
          try {
            const response = await axios.request(config);
            console.log(response.data.candidates[0].content.parts[0])
            resolve(response.data.candidates[0].content?.parts[0])
            // console.log(JSON.stringify(response.data.candidates[0], null, 2));
          } catch (error) {
            console.error("Error calling Gemini agent:", error);
            reject(error)
          }
    })

}
module.exports.startAgent=startAgent