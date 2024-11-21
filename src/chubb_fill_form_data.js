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
     
      const existingBanner = document.querySelector("#AutoFillBanner");
      if (existingBanner) {
        console.log('Banner already exists');
        return;
      }

      // Create the banner element
      const banner = document.createElement('div');
      banner.id = 'AutoFillBanner';
      banner.style.position = 'fixed';
      banner.style.top = '20%';
      banner.style.right = '20px';
      banner.style.width = '250px';
      banner.style.backgroundColor = '#ffffff';
      banner.style.color = '#333';
      banner.style.padding = '15px';
      banner.style.zIndex = '1000';
      banner.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      banner.style.borderRadius = '8px';
      banner.style.border = '1px solid #4CAF50';

      // Create the content wrapper for the banner
      const contentWrapper = document.createElement('div');
      contentWrapper.id = 'bannerContentWrapper';

      // Create the autofill button
      const button = document.createElement('button');
      button.textContent = 'Auto Fill Form Data';
      button.style.width = '100%';
      button.style.padding = '10px';
      button.style.marginTop = '20px';
      button.style.backgroundColor = '#721c24';
      button.style.color = '#fff';
      button.style.border = 'none';
      button.style.cursor = 'pointer';
      button.style.borderRadius = '5px';
      button.style.fontSize = '14px';

      // Add event listener for autofill button
      button.addEventListener('click', () => {
        getStoredFormData(); // Call the autofill function
      });

      // Placeholder text below the button
      const placeholderText = document.createElement('p');
      placeholderText.textContent = 'This is some additional information below the button.';
      placeholderText.style.fontSize = '14px';
      placeholderText.style.color = '#666';
      placeholderText.style.marginTop = '10px';

      // Append button and text to the content wrapper
      contentWrapper.appendChild(button);
      contentWrapper.appendChild(placeholderText);

      // Create the minimize button with a minus sign
      const minimizeButton = document.createElement('span');
      minimizeButton.textContent = '−'; // Simple minus symbol
      minimizeButton.style.position = 'absolute';
      minimizeButton.style.top = '1px';
      minimizeButton.style.right = '0px';
      minimizeButton.style.fontSize = '18px';
      minimizeButton.style.cursor = 'pointer';
      minimizeButton.style.color = '#888';
      minimizeButton.style.border = '1px solid #ccc';
      // minimizeButton.style.borderRadius = '50%';
      minimizeButton.style.padding = '2px 6px';
      minimizeButton.style.backgroundColor = '#f1f1f1';
      minimizeButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

      // Toggle content visibility on minimize
      minimizeButton.addEventListener('click', () => {
        if (contentWrapper.style.display === 'none') {
          contentWrapper.style.display = 'block';
          banner.style.width = '250px';
          banner.style.height = 'auto'; // Reset height to auto
          minimizeButton.textContent = '−'; // Minus sign when expanded
          minimizeButton.style.fontSize = '18px'; // Reset font size
          minimizeButton.style.width = 'auto'; // Reset width
          minimizeButton.style.height = 'auto'; // Reset height
          minimizeButton.style.display = 'inline-block'; // Reset display
          minimizeButton.style.alignItems = 'initial'; // Reset alignItems
          minimizeButton.style.justifyContent = 'initial'; // Reset justifyContent
        } else {
          contentWrapper.style.display = 'none';
        banner.style.position = 'fixed';
        banner.style.top = '20%';
        banner.style.right = '20px';
        banner.style.width = '50px';
        banner.style.height = '50px'; // Set height to 50px (1 inch)
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.justifyContent = 'center';
        minimizeButton.textContent = 'F-B'; // Display "F-B" when minimized
        minimizeButton.style.fontSize = '14px'; // Adjust font size to fit the box
        minimizeButton.style.fontWeight = 'bold'; // Make text thicker
        minimizeButton.style.width = '100%';
        minimizeButton.style.height = '100%';
        minimizeButton.style.display = 'flex';
        minimizeButton.style.alignItems = 'center';
        minimizeButton.style.justifyContent = 'center';
        minimizeButton.style.border = 'none'; // Remove border
        minimizeButton.style.backgroundColor = 'transparent'; // Remove background color
        minimizeButton.style.borderRadius = '0'; // Remove border radius
        }
      });

      // Append minimize button and content wrapper to the banner
      banner.appendChild(minimizeButton);
      banner.appendChild(contentWrapper);

      // Append the banner to the body
      document.body.appendChild(banner);
     
    }
    }
  });
  });

}

