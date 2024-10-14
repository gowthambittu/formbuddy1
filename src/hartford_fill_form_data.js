if (window.location.href.includes('thehartford.com')) {

  (function () {


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

