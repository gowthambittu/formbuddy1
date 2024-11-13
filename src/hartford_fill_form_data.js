if (window.location.href.includes('thehartford.com')) {

  (function () {

    function simulateTyping(input, value) {
      input.focus();
    
      const isNumericValue = !isNaN(value) && !isNaN(parseFloat(value));
    
      if (isNumericValue) {
        console.log('Setting value for numeric input');
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        console.log('Setting value for text input type:', input.type);
        value.split('').forEach(char => {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
          input.value += char;
          input.dispatchEvent(new KeyboardEvent('keypress', { key: char }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new KeyboardEvent('keyup', { key: char }));
        });
      }
    }
    
    function fillFormData(data) {
      if (data && Array.isArray(data)) {
        console.log('Filling form data:', data);
        data.forEach(item => {
          const input = document.getElementById(item.field_name);
          if (input) {
            console.log('Input ID:', item.field_name, 'Value:', item.field_value);
            simulateTyping(input, item.field_value);
          }
        });
      }
    }

    function transformDataWithRules(data, rules) {
      const transformedData = [];

      rules.forEach(rule => {
        data.forEach(item => {
          if (rule.standardized_field_name === item.field_name) {
            transformedData.push({
              field_name: rule.input_id,
              field_value: item.field_value
            });
          }
        });
      });

      return transformedData;
    }
    
    function getStoredFormData() {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get('formDatatobeFilled', (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            const storedFormData = result.formDatatobeFilled;
            if (storedFormData) {
              chrome.runtime.sendMessage({ action: "getFormRules", data: "hartford" }, async response => {
                if (response.status === 'success') {
                  const formRules = response.data;
                  // Transform stored form data based on form rules
                  const transformedData = transformDataWithRules(storedFormData, formRules);
                  // Fill form with transformed data
                  fillFormData(transformedData);
                } else {
                  console.error('Error fetching form rules:', response);
                }
              });
              
            } else {
              console.log('No form data found in Chrome storage.');
            }
            resolve(storedFormData);
          }
        });
      });
    }

    document.addEventListener("click", () => {
      // ... (rest of your code)
    
      chrome.storage.local.get('formDatatobeFilled', (result) => {
        if (chrome.runtime.lastError) {
          console.error('Error retrieving stored data:', chrome.runtime.lastError);
        } else {
          const storedFormData = result.formDatatobeFilled;
    
          if (storedFormData) {
            // Form data exists, create and insert button
            const heading = document.querySelector("h1");
            if (heading) {
              const button = document.createElement("button");
              button.id = "fillFormDataButton";
              button.textContent = "Auto Fill Form Data";
    
              const existingButton = document.querySelector("#fillFormDataButton");
    
              if (!existingButton) {
                heading.parentNode.insertBefore(button, heading.nextSibling);
              }
    
              button.addEventListener("click", () => {
                getStoredFormData();
              });
            }
          } else {
            console.log('No form data found in Chrome storage.');
          }
        }
      });
    });


  })();

}

