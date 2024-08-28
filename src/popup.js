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
  }

  // Handle user selection
  const dropdown = document.getElementById("businessDropdown");
  let quoteObject = null;
  if (dropdown) {
    dropdown.addEventListener("change", (event) => {
      const selectedQuoteId = event.target.value;
      chrome.runtime.sendMessage({action:"getQuoteByID", data:selectedQuoteId},(response =>{
        console.log('quote fecthed',response);
        quoteObject = response.data;
        localStorage.setItem('formData', JSON.stringify(quoteObject))
        fillFormData(quoteObject);
      }))
     
    });
  }

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

 // Function to handle DOM changes
function handleDomChange() {
  console.log('inside ddom handle change func');
  
  const storedFormData = localStorage.getItem('formData');
  if (storedFormData) {
    const formData = JSON.parse(storedFormData);
    fillFormData(formData);
  }
}

// Use MutationObserver to detect changes in the DOM
const observer = new MutationObserver(handleDomChange);
observer.observe(document.body, { childList: true, subtree: true });

// Initial check for existing form data in local storage when the page loads
document.addEventListener("DOMContentLoaded", handleDomChange);


});

