import { createClient } from '@supabase/supabase-js';


// Initialize Supabase client
const supabaseUrl = 'https://hqxcujnaoxtvmeuwyqfh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxeGN1am5hb3h0dm1ldXd5cWZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI4ODI5ODAsImV4cCI6MjAzODQ1ODk4MH0.ZEKpklcEs1vI-gK3fQcjjSd4KkT619RpG1f2Vi3dUQw';
const supabase = createClient(supabaseUrl, supabaseKey);



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveFormData") {
	  let formData = request.data;
    let quote_id = formData.quote_id;
    let upsertData = Object.keys(formData).map(key => {
      if (key !== 'quote_id') {
        return {
          quote_id: quote_id,
          field_name: key,
          field_value: formData[key],
          created_at: new Date().toISOString()
        };
      }
    }).filter(item => item !== undefined); // Filter out undefined values

    console.log('data to be inserted',upsertData);
    
    supabase
    .from('form_data')
    .upsert(upsertData,{onConflict: ['quote_id', 'field_name']})
    .then(response=>{
      console.log('inserted data into form_data',response);
      sendResponse({status: "success", data: response.data});
    })
    .catch(error=>{
      console.error('Error upserting data:', error);
    })
  } else if (request.action === "getFormData") {
	chrome.storage.local.get(null, (items) => {
	  console.log('All stored data:', items);
	  sendResponse({data: formData});
	});
  }
  else if(request.action === "getQuoteIdByBusinessName"){
    console.log('request getQuoteIdByBusinessName',request.data);
    
    let business_name = request.data;
    supabase
      .from('quote_mappings')
      .select('quote_id')
      .eq('business_name',business_name)
      .then((response) => {
        console.log('fecthed quote_id storeQuoteMapping',response);  
        sendResponse({data:response.data})
        
      })
      .catch((error) => {
        console.error('Error fecthing data:', error);
      });

  }
  else if(request.action === "storeQuoteMapping"){
    console.log('request storeQuoteMapping',request.data);
    let quote_id = request.data[0]
    let business_name= request.data[1]
    // Supabase insert operation
    supabase
      .from('quote_mappings')
      .insert([
        { quote_id: quote_id, business_name: business_name }])
      .then(response =>{
        console.log('inserted data storeQuoteMapping',response);  
        sendResponse({status: "success", data: response});
      })  
      .catch(error=>{
        console.error('Error inserting data:', error);
      })
      
   }
   else if(request.action ==='getAvailableBusinessObjects'){
    let business_objects ;
    supabase
    .from('quote_mappings')
    .select('*')
    .then(response =>{
      console.log('business objetes from supabase',response);
      business_objects = response.data
      sendResponse({status:"success" ,data:business_objects})
    })
    .catch(error => {
      console.log('error while feteching getAvailableBusinessObjects from db');
      
    })    
   }
   else if(request.action==='getQuoteByID'){
      console.log('fecthing quote_id',request.data);      
      const quote_id = request.data;
      supabase
      .from('form_data')
      .select('field_name, field_value')
      .eq('quote_id',quote_id)
      .then(response=>{
        console.log('db results for quote_id',response);
        sendResponse({status:'success',data:response.data})
      })
      .catch(error=>{
        console.log('error while fecthing quote_id',quote_id); 
      })
   }
  return true;
});

