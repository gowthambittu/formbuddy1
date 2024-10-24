

import './hartford_capture_form_data'

import './hartford_fill_form_data'
import './chubb_capture_form_data'

console.log('content js loaded');


// function captureFormData(){
//   console.log('inside captureFormData fucntion');
  

// }

// // Periodic data synchronization
// // setInterval(() => {
// //     chrome.storage.local.get(['formData'], (result) => {
// //       const formData = result.formData;
// //       if (formData) {
// //         // Send data to Supabase
// //         chrome.runtime.sendMessage({ action: 'saveData', data: formData });
// //       }
// //     });
// //   }, 5000); // Adjust interval as needed

// function checkForButton() {
//   const nextButton = document.getElementById('gw-subflow-next');
//   if (nextButton) {
//     console.log('Button found! Adding event listener');
//     nextButton.addEventListener('click', captureFormData);
//   } else {
//     console.log('Button not found yet. Checking again in 1 second...');
//     setTimeout(checkForButton, 1000); // Check again in 1 second
//   }
// }

// if (window.location.href.includes('thehartford.com')) {
//   checkForButton();
// }


// (function() {

//   function captureFormData() {
//     let formData = {};
//     const inputs = document.querySelectorAll('input, textarea, select');
//     inputs.forEach(input => {
//       if (input.id === 'g-recaptcha-response') {
//         return; // Skip this input
//       }
//       if (input.type === 'radio') {
//         if (input.checked) {
//           formData[input.id] = input.value;
//         }
//       } else if (input.tagName.toLowerCase() === 'select') {
//         formData[input.id] = input.value;
//       } else {
//         formData[input.id] = input.value;
//       }
//       let attributes = Array.from(input.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', ');
//       console.log(`Attributes: ${attributes}`);
//     });
//     console.log(`saved ${JSON.stringify(formData)} from content js captureFormData func`);
//     // const {res} = await chrome.runtime.sendMessage({ action: "saveFormData", data: formData });
//     // console.log(res);
//     return formData;
//   }

//   if (window.location.href.includes('thehartford.com')) {
//     document.body.addEventListener('click', (event) => {
//       const target = event.target;
//       if (target.id === 'gw-subflow-next') {
//         captureFormData();
//       } else {
//         console.log('Not clicked on next button');
//       }
//     });
//   } else {
//     console.log('Not on thehartford.com. Click event listener not added.');
//   }

  
// })();



