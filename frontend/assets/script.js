document.addEventListener("DOMContentLoaded", function () {
   const currencySelect = document.getElementById("currency-select");
   const mainWrapper = document.querySelector(".main_wrapper");
   const defaultCurrency = "BGN"; // Default currency
   const defaultSecondaryCurrency = "EUR"; // Default secondary currency
   let exchangeRates = {}; // Store exchange rates for quick lookup
 
   // Fetch currencies from the database and populate the dropdown
   fetch("http://localhost:5001/api/currencies")
     .then((response) => response.json())
     .then((data) => {
       // Populate the select dropdown with currencies from the fetched data
       data.forEach((currency) => {
         // Skip adding currency if it's already in the select dropdown
         if (!currencySelect.querySelector(`option[value="${currency.code}"]`)) {
           const option = document.createElement("option");
           option.value = currency.code;
           option.textContent = `${currency.name} (${currency.code})`;
           currencySelect.appendChild(option);
         }
       });
 
       // Add default currencies (BGN and EUR) if not present
       if (!currencySelect.querySelector(`option[value="${defaultCurrency}"]`)) {
         addCurrencyRow(defaultCurrency);
         fetchExchangeRates(defaultCurrency); // Fetch exchange rates for BGN
       }
       if (!currencySelect.querySelector(`option[value="${defaultSecondaryCurrency}"]`)) {
         addCurrencyRow(defaultSecondaryCurrency);
         fetchExchangeRates(defaultSecondaryCurrency); // Fetch exchange rates for EUR
       }
 
       // Select the default currency
       currencySelect.value = defaultCurrency;
 
       // Trigger change event to ensure exchange rates are loaded and calculations happen
       currencySelect.dispatchEvent(new Event('change'));
     })
     .catch((error) => console.error("Error fetching currencies:", error));
 
   // Add event listener to the select element for adding new currencies
   currencySelect.addEventListener("change", function () {
     const selectedCurrency = currencySelect.value;
     if (selectedCurrency && !currencyAlreadyAdded(selectedCurrency)) {
       addCurrencyRow(selectedCurrency);
       fetchExchangeRates(selectedCurrency); // Fetch exchange rates for the selected currency
     }
   });
 
   // Function to check if a currency is already added to the rows
   function currencyAlreadyAdded(currencyCode) {
     const existingCurrencies = document.querySelectorAll('.currency_row');
     for (let row of existingCurrencies) {
       const existingCurrency = row.querySelector('.currency').textContent;
       if (existingCurrency === currencyCode) {
         return true; // Currency already exists
       }
     }
     return false;
   }
 
   // Function to fetch exchange rates for a selected currency
   function fetchExchangeRates(currencyCode) {
     fetch(`http://localhost:5001/api/exchange_rates`)
       .then((response) => response.json())
       .then((data) => {
         // Clear previous exchange rates and store the new rates
         exchangeRates = data.reduce((rates, rate) => {
           rates[rate.currency_to] = rate.rate;
           return rates;
         }, {});
         triggerCalculations(); // Trigger calculation after fetching exchange rates
       })
       .catch((error) => console.error("Error fetching exchange rates:", error));
   }
 
   // Function to add a new currency row above the select dropdown
   function addCurrencyRow(currencyCode) {
     const newRow = document.createElement('div');
     newRow.classList.add('currency_wrapper');
 
     const currencyContainer = document.createElement('div');
     currencyContainer.classList.add('container');
 
     const currencyRow = document.createElement('div');
     currencyRow.classList.add('currency_row');
 
     const currencySpan = document.createElement('span');
     currencySpan.classList.add('currency');
     currencySpan.textContent = currencyCode;
 
     const amountInput = document.createElement('input');
     amountInput.type = 'text';
     amountInput.classList.add('currency_number');
     amountInput.placeholder = 'Enter Amount';
     amountInput.addEventListener('input', handleAmountChange);
 
     const currencyName = document.createElement('span');
     currencyName.classList.add('currency_name');
     currencyName.textContent = currencyCode;
 
     const deleteButton = document.createElement('button');
     deleteButton.classList.add('delete_row');
     deleteButton.addEventListener('click', () => {
       newRow.remove();
       triggerCalculations(); // Recalculate after a row is removed
     });
 
     currencyRow.appendChild(currencySpan);
     currencyRow.appendChild(amountInput);
     currencyRow.appendChild(currencyName);
     currencyContainer.appendChild(currencyRow);
     newRow.appendChild(currencyContainer);
     newRow.appendChild(deleteButton);
 
     // Prepend the new row above the select dropdown
     mainWrapper.insertBefore(newRow, currencySelect.parentElement);
   }
 
   // Function to trigger calculations for all the rows
   function triggerCalculations() {
     document.querySelectorAll('.currency_row').forEach((row) => {
       const amountInput = row.querySelector('.currency_number');
       handleAmountChange({ target: amountInput }); // Recalculate the amounts
     });
   }
 
   // Function to handle the amount change and calculate conversion
   function handleAmountChange(event) {
     const amountInput = event.target;
     let amount = parseFloat(amountInput.value); // Convert input to float
 
     if (isNaN(amount) || amount <= 0) {
       return; // Ignore invalid amounts
     }
 
     const currencyFrom = amountInput.parentElement.querySelector('.currency').textContent;
 
     // Loop through all rows to update the converted amount
     document.querySelectorAll('.currency_row').forEach((row) => {
       const currencyTo = row.querySelector('.currency').textContent;
       const outputInput = row.querySelector('.currency_number');
       const rate = exchangeRates[currencyTo];
 
      if (rate && currencyFrom !== currencyTo) {
        const convertedAmount = amount * rate;
        outputInput.value = convertedAmount; // No formatting
      } else if (currencyFrom === currencyTo) {
        outputInput.value = amount; // Same amount, no conversion
      }

      // Ensure only numbers and a single decimal point are allowed
      outputInput.value = outputInput.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
     });
   }
 });
 