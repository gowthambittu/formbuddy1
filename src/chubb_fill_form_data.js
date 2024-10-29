if (window.location.href.includes('https://www.chubbsmallbusiness.com') || window.location.href.includes('https://www.chubb.com')) {

  
  
  function simulateTyping(input, value) {
    console.log('Simulating typing for input:', input.id);
    
    input.focus();
  
    const isNumericValue = !isNaN(value) && !isNaN(parseFloat(value));
  
    if (isNumericValue) {
      // console.log('Setting value for numeric input');
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // console.log('Setting value for text input type:', input.type);
      value.split('').forEach(char => {
        input.dispatchEvent(new KeyboardEvent('keydown', { key: char }));
        input.value += char;
        input.dispatchEvent(new KeyboardEvent('keypress', { key: char }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new KeyboardEvent('keyup', { key: char }));
      });
    }
  }


  
  function findNestedInput(element, query) {
    const nestedInput = element.querySelector(query);
    return nestedInput ? nestedInput : element;
  }
  
  function fillFormData(data) {
    if (data && Array.isArray(data)) {
      console.log('Filling form data:', data);
      data.forEach(item => {
        let input = document.querySelector(`[name="${item.field_name}"]`) ||
                    document.querySelector(`[placeholder="${item.field_name}"]`) ||
                    document.getElementById(item.field_name);
  
        // If input is found, check for nested input elements within the current selection
        if (input) {
          input = findNestedInput(input, `[name="${item.field_name}"]`) ||
                  findNestedInput(input, `[placeholder="${item.field_name}"]`) ||
                  findNestedInput(input, `#${item.field_name}`);
        }
  
        if (input) {
          if (input.value) {
            console.log('Input already has a value, skipping:', input, 'Existing Value:', input.value);
          } else {
            console.log('Input found:', input, 'Value:', item.field_value);
            simulateTyping(input, item.field_value);
          }
          
          // console.log('Input found:', input, 'Value:', item.field_value);
          // simulateTyping(input, item.field_value);
        } else {
          console.warn('Input not found for field_name:', item.field_name);
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
    console.log('Getting stored form data...');
    
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('formDatatobeFilled', (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          const storedFormData = result.formDatatobeFilled;
          if (storedFormData) {
            chrome.runtime.sendMessage({ action: "getFormRules", data: "chubb" }, async response => {
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
    // Create the banner element
    const storedFormData = result.formDatatobeFilled;
    
    if (storedFormData) {
      const banner = document.createElement('div');
      banner.id = 'AutoFillBanner';
      banner.style.position = 'fixed';
      banner.style.top = '55px';
      banner.style.left = '0';
      banner.style.width = '100%';
      banner.style.backgroundColor = '#f8d7da';
      banner.style.color = '#721c24';
      banner.style.padding = '10px';
      banner.style.zIndex = '1000';
      banner.style.textAlign = 'center';
      banner.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

      // Create the button element
      const button = document.createElement('button');
      button.textContent = 'Auto Fill Form Data';
      button.style.marginLeft = '20px';
      button.style.padding = '5px 10px';
      button.style.backgroundColor = '#721c24';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.cursor = 'pointer';

      // Add an event listener to the button
      button.addEventListener('click', () => {
       getStoredFormData();
      });

      // Append the button to the banner
      // banner.appendChild(document.createTextNode('This is a banner'));
      banner.appendChild(button);

      const existingBanner = document.querySelector("#AutoFillBanner");
      // Append the banner to the body
      if (!existingBanner) {
        document.body.appendChild(banner);
          // Add margin to the top of the body to move content below the banner
        document.body.style.marginTop = `${banner.offsetHeight}px`;
      }
      else{
        console.log('banner already exists');
        
      }
      // document.body.appendChild(banner);

    
     
    }
    }
  });
  });

}

