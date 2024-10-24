if (window.location.href.includes('https://www.chubbsmallbusiness.com') || window.location.href.includes('https://www.chubb.com')) {
  chrome.storage.local.remove('temp_data', () => {
    console.log('temp_data removed');
  });
  (function () {
    console.log('capturing script injected into chubb quote process');
    
    function generateUniqueQuoteId() {
      return crypto.randomUUID();
    }

    function inputCapture(formData,inputs){
     
      inputs.forEach(input => {
        // const formDataValue = {
        //   value: input.value, // Existing value storage
        //   type: input.type
        // };
        const formDataValue = input.value;

        if (input.type === 'radio') {
          if (input.checked) {
            formData[input.name] = formDataValue;
          }
        } else {
          formData[input.name] = formDataValue;
        }
      });

      return formData;

    }

   

    async function captureFormData() {
      try {
        console.log('capturing chubbs forms data');
        let formData = {};
        console.log('url', window.location.href);
        const inputs = document.querySelectorAll('input, textarea, select, [id^="mat-input"]');
        if (window.location.href.split('/')[3].startsWith('get-a-quote')) {
          console.log('Im in first page of quote process');
          await chrome.storage.local.remove('chubbFormData');
          let quote_id = generateUniqueQuoteId(); // Implement your logic for generating unique IDs
          if (!formData.hasOwnProperty('insurance_carrier')) {
            // console.log('setting insurance carrier');
            formData['insurance_carrier'] = 'chubb';
          }
          if (!formData.hasOwnProperty('quote_id')) {
            // console.log('setting quote id');
            formData['quote_id'] = quote_id;
          }
        }
        let regBusinessNameInput;
        const regBusinessNameElements = document.getElementsByName('qid_1');
        if (regBusinessNameElements.length > 0) {
          regBusinessNameInput = regBusinessNameElements[0].value;
          console.log('business name captured', regBusinessNameInput);
        } else {
          console.log('No element found with the name qid_1');
        }

        // console.log('formData before chrome storage fetch', formData);
        const storedFormData = await chrome.storage.local.get('chubbFormData');
        // console.log('fetched storedFormData', storedFormData);
        formData = (storedFormData && Object.keys(storedFormData).length > 0) ? storedFormData['chubbFormData'] : formData; // Use default if not found
        // console.log('formData after fetch', formData);

        if (regBusinessNameInput) {
          // Check if this regBusiness is already in db and update it
          chrome.runtime.sendMessage({ action: "getQuoteIdByBusinessName", data: regBusinessNameInput }, response => {
            const data = response.data;
            if (data && data.length > 0) {
              console.log('this regBusiness is already in db with quote id =', data[0].quote_id);
              const current_quote_id = formData['quote_id'];

              // Delete the previous quote_id
              chrome.runtime.sendMessage({ action: "deleteQuoteByID", data: current_quote_id }, deleteResponse => {
                console.log('previous quote_id deleted', current_quote_id);
              });
              // Set the existing quote id
              formData['quote_id'] = data[0].quote_id;
              console.log('setting existing quote id', formData['quote_id']);

              // Log the updated quote_id
              // console.log('after set', formData['quote_id']);
            }
            else {
              chrome.runtime.sendMessage({ action: "storeQuoteMapping", data: [formData['quote_id'], regBusinessNameInput] }, response => {
                console.log('quote id =',formData['quote_id'], 'with  business name :', regBusinessNameInput);
              });
            }
          });
          // Capture form data
          inputs.forEach(input => {
            // const formDataValue = {
            //   value: input.value, // Existing value storage
            //   type: input.type
            // };
            const formDataValue = input.value;
    
            if (input.type === 'radio') {
              if (input.checked) {
                formData[input.name] = formDataValue;
              }
            } else {
              formData[input.name] = formDataValue;
            }
          });

          let temp_data = await chrome.storage.local.get('temp_data') || {};
          temp_data = temp_data['temp_data'] || {};
          const mergedData = { ...temp_data, ...formData }; // Use a different variable name
          chrome.runtime.sendMessage({ action: "getFormRules", data: "chubb" }, async response => {
            if (response.status === 'success') {
              const formRules = response.data;
      
              // Transform mergedData keys based on formRules
              const transformedData = {};
              for (const key in mergedData) {
                const rule = formRules.find(rule => rule.input_id === key);
                if (rule) {
                  transformedData[rule.standardized_field_name] = mergedData[key];
                } else {
                  transformedData[key] = mergedData[key]; // Keep the original key if no rule is found
                }
              }
      
              console.log(`Transformed data: ${JSON.stringify(transformedData)}`);
      
              // Save transformed data to chrome storage
              await chrome.storage.local.set({ ['chubbFormData']: transformedData });
              chrome.runtime.sendMessage({ action: "saveFormData", data: transformedData }, response => {
                console.log('Data saved:', response);
              });
            } else {
              console.error('Error fetching form rules:', response);
            }
          });

        }
        else {
          inputs.forEach(input => {
            // const formDataValue = {
            //   value: input.value, // Existing value storage
            //   type: input.type
            // };
            const formDataValue = input.value;
    
            if (input.type === 'radio') {
              if (input.checked) {
                formData[input.name] = formDataValue;
              }
            } else {
              formData[input.name] = formDataValue;
            }
          });
         
          let temp_data = await chrome.storage.local.get('temp_data') || {};
          temp_data = temp_data['temp_data'] || {};
          const mergedData = { ...temp_data, ...formData }; // Use a different variable name
          chrome.runtime.sendMessage({ action: "getFormRules", data: "chubb" }, async response => {
            if (response.status === 'success') {
              const formRules = response.data;
      
              // Transform mergedData keys based on formRules
              const transformedData = {};
              for (const key in mergedData) {
                const rule = formRules.find(rule => rule.input_id === key);
                if (rule) {
                  transformedData[rule.standardized_field_name] = mergedData[key];
                } else {
                  transformedData[key] = mergedData[key]; // Keep the original key if no rule is found
                }
              }
      
              console.log(`Transformed data: ${JSON.stringify(transformedData)}`);
      
              // Save transformed data to chrome storage
              await chrome.storage.local.set({ ['chubbFormData']: transformedData });
              chrome.runtime.sendMessage({ action: "saveFormData", data: transformedData }, response => {
                console.log('Data saved:', response);
              });
            } else {
              console.error('Error fetching form rules:', response);
            }
          });
       
        }


      } catch (error) {
        console.error('Error capturing form data:', error);
        // Handle error, e.g., display a user-friendly message, retry, etc.
      }

    }
    

    
    document.body.addEventListener('click', async (event) => {
      const target = event.target;
      if (target.tagName.toLowerCase() === 'button' && target.textContent.trim() === 'Continue') {
        await captureFormData();
        chrome.storage.local.remove('temp_data',()=>{
          console.log('temp_data removed after submit capture form data');
        });
      } else {
        console.log('Not clicked on "Continue" button');
      }
    });

    function debounce(func, wait) {
      let timeout;
      return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    }

    document.addEventListener('input', debounce(async function(event) {
      const target = event.target;
      console.log('input element name/id:', target.id, 'input element value:', target.value);

      // Retrieve temp_data from chrome local storage or assign an empty object
      let temp_data = await chrome.storage.local.get('temp_data');
      temp_data = temp_data['temp_data'] || {};

      // Store key values as event.target.id and event.target.value respectively
      temp_data[target.name || target.placeholder||target.id] = target.value;

      // Set the updated temp_data back into chrome storage
      await chrome.storage.local.set({ 'temp_data': temp_data });

      console.log('temp_data updated:', temp_data);
    }, 1000));



  })();

}

