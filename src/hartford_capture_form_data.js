if (window.location.href.includes('thehartford.com')) {

  (function () {
    console.log('capturing script injected.');

    function generateUniqueQuoteId() {
      return crypto.randomUUID();
    }

    async function captureFormData() {
      let formData = {};
      const inputs = document.querySelectorAll('input, textarea, select');

      try {
        // Find the regBusinessName input
        let formDataKey;
        const regBusinessNameInput = document.getElementById('regBusinessName');

        if (regBusinessNameInput) {
          formDataKey = regBusinessNameInput.value;
          await chrome.storage.local.set({ 'formDataKey': formDataKey });
        } else {
          // Retrieve stored formDataKey
          const storedData = await chrome.storage.local.get('formDataKey');

          formDataKey = storedData?.formDataKey;
        }

        // Retrieve existing form data for the specific quote
        const storedFormData = await chrome.storage.local.get(formDataKey);

        formData = storedFormData[formDataKey] || {}; // Use default if not found

      
        // Capture form data (excluding g-recaptcha-response)
        inputs.forEach(input => {
          if (input.id === 'g-recaptcha-response') {
            return; // Skip this input
          }

          if (input.type === 'radio') {
            if (input.checked) {
              formData[input.id] = input.value;
            }
          } else if (input.tagName.toLowerCase() === 'select') {
            formData[input.id] = input.value;
          } else {
            formData[input.id] = input.value;
          }
        });

        // Add default insurance_carrier if not present
        if (!formData.hasOwnProperty('insurance_carrier')) {
          formData['insurance_carrier'] = 'hartford';
        }
        if (!formData.hasOwnProperty('quote_id')){
          let existingQuoteId;
           chrome.runtime.sendMessage({action:"getQuoteIdByBusinessName",data: formDataKey},response=>{
            console.log(response);
            existingQuoteId=response.quote_id;
           }) 
          let quoteId;
          if (!existingQuoteId) {
            quoteId = generateUniqueQuoteId(); // Implement your logic for generating unique IDs
            chrome.runtime.sendMessage({ action: "storeQuoteMapping", data: [quoteId,formDataKey] }, response => {
              console.log('quote id saved succesfully:', response);
            });
    
          } else {
            quoteId = existingQuoteId;
          }
          formData['quote_id'] = quoteId;
      }
        console.log(`saved ${JSON.stringify(formData)} from content js captureFormData func`);

        // Store updated formData in Chrome storage with the key
        await chrome.storage.local.set({ [formDataKey]: formData });
        chrome.runtime.sendMessage({ action: "saveFormData", data: formData }, response => {
          console.log('Data saved:', response);
        });
      } catch (error) {
        console.error('Error capturing form data:', error);
        // Handle error, e.g., display a user-friendly message, retry, etc.
      }
    }




    document.body.addEventListener('click', (event) => {
      const target = event.target;
      if (target.id === 'gw-subflow-next' || target.id === 'gw-subflow-previous') {
        captureFormData();
      } else {
        console.log('Not clicked on next button');
      }
    });



  })();

}

