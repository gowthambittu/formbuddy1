document.addEventListener("DOMContentLoaded", () => {
  console.log('popjs file');
  

  

  chrome.runtime.sendMessage({ action: "getAvailableBusinessObjects" }, (response) => {
    console.log("available quotes:", response);
    const businessObjects = response.data;
    populateDropdown(businessObjects);
  });



  // Populate the dropdown with fetched data
  function populateDropdown(businessObjects) {
    const dropdown = document.getElementById("businessDropdown");
    businessObjects.forEach((business) => {
      const option = document.createElement("option");
      option.value = business.quote_id;
      option.text = business.business_name;
      dropdown.appendChild(option);
    });

    chrome.storage.local.get('formDatatobeFilled', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error retrieving stored data:', chrome.runtime.lastError);
      } else {
        const storedFormData = result.formDatatobeFilled;
        console.log(storedFormData);
    
        if (storedFormData) {
          const targetObject = storedFormData.find(item => item.field_name === 'quote_id');
    
          if (targetObject) {
            const quoteId = targetObject.field_value;
            console.log('dropdown value set to');
            console.log(quoteId);
    
            // Find the option element with the matching value
            const optionElement = document.getElementById('businessDropdown').querySelector(`option[value="${quoteId}"]`);
    
            if (optionElement) {
              // Set the selected attribute of the option element
              optionElement.selected = true;
            } else {
              console.error('Option with quoteId not found.');
            }
          } else {
            console.log('No matching object found for quote_id or regBusinessName.');
          }
        } else {
          console.log('No stored form data found.');
        }
      }
    });
  
     
  }

  

  // Handle user selection
  const dropdown = document.getElementById("businessDropdown");
  let quoteObject = null;
  if (dropdown) {
    dropdown.addEventListener("change", (event) => {
      const selectedQuoteId = event.target.value;
      chrome.runtime.sendMessage({action:"getQuoteByID", data:selectedQuoteId},(response =>{
        console.log('quote fecthed',response);
        showStatusMessage("Data fetched successfully!");
        quoteObject = response.data;
        chrome.storage.local.set({'formDatatobeFilled': quoteObject}, () => {
          console.log('quoteObject saved to Chrome local storage');
        });
        fillFormData(quoteObject);
      }))
     
    });
  }

  // Clear local storage when the clear button is clicked
document.getElementById('clearButton').addEventListener('click', () => {
  chrome.storage.local.remove('formDatatobeFilled', () => {
    console.log('formData removed from Chrome local storage');
    showStatusMessage("Data cleared.");
  });
   // Clear the current selection of the dropdown
   const businessDropdown = document.getElementById('businessDropdown');
   if (businessDropdown) {
     businessDropdown.value = '';
   }
});

 // Function to simulate typing into an input element
// Function to simulate typing into an input element
function simulateTyping(input, value) {
  input.focus();
   // Check if the value is numeric
   const isNumericValue = !isNaN(value) && !isNaN(parseFloat(value));

   if (isNumericValue) {
     console.log('setting value for numeric value');
     input.value = value;
     const event = new Event('input', { bubbles: true });
     input.dispatchEvent(event);
  } else {
    console.log('setting value for text input type ',input.type);
    value.split('').forEach(char => {
      
      const keydownEvent = new KeyboardEvent('keydown', { key: char });
      const keypressEvent = new KeyboardEvent('keypress', { key: char });
      const inputEvent = new Event('input', { bubbles: true });
      const keyupEvent = new KeyboardEvent('keyup', { key: char });

      input.dispatchEvent(keydownEvent);
      input.value += char;
      input.dispatchEvent(keypressEvent);
      input.dispatchEvent(inputEvent);
      input.dispatchEvent(keyupEvent);
    });
  } 
}

// Function to fill form data
function fillFormData(data) {
  if (data && Array.isArray(data)) {
    console.log('filling form data', data);
    data.forEach(item => {
      const input = document.getElementById(item.field_name);
      if (input) {
        // console.log('input id ', item.field_name, 'value', item.field_value);
        simulateTyping(input, item.field_value);
      }
    });
  }
}

// Function to display a status message temporarily
function showStatusMessage(message) {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = message;
  statusMessage.style.display = "block";
  
  // Hide the message after 2 seconds
  setTimeout(() => {
      statusMessage.style.display = "none";
  }, 2000);
}

  // Ensure the element with id 'copyButton' exists before adding the event listener
  const copyButton = document.getElementById("copyButton");
if (copyButton) {
  copyButton.addEventListener("click", () => {
    if (quoteObject) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: fillFormData,
          args: [quoteObject] // Pass quoteObject to the executed script
        });
      });
      
    } else {
      console.error("No quote object available. Please select a quote from the dropdown first.");
    }
  });
 }





});

