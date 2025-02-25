document.addEventListener("DOMContentLoaded", function () {
   const currencySelect = document.getElementById("currency-select");
   const mainWrapper = document.querySelector(".main_wrapper");
   const defaultCurrency = "BGN";
   const defaultSecondaryCurrency = "EUR";
   let exchangeRates = {};

   fetch("http://localhost:5001/api/currencies")
     .then((response) => response.json())
     .then((data) => {
       data.forEach((currency) => {
         if (!currencySelect.querySelector(`option[value="${currency.code}"]`)) {
           const option = document.createElement("option");
           option.value = currency.code;
           option.textContent = `${currency.name} (${currency.code})`;
           currencySelect.appendChild(option);
         }
       });

       if (!currencySelect.querySelector(`option[value="${defaultSecondaryCurrency}"]`)) {
         addCurrencyRow(defaultCurrency);
         fetchExchangeRates(defaultCurrency);
       }
       if (!currencySelect.querySelector(`option[value="${defaultSecondaryCurrency}"]`)) {
         addCurrencyRow(defaultSecondaryCurrency);
         fetchExchangeRates(defaultSecondaryCurrency);
       }

       currencySelect.value = defaultCurrency;
       currencySelect.dispatchEvent(new Event('change'));
     })
     .catch((error) => console.error("Error fetching currencies:", error));

   currencySelect.addEventListener("change", function () {
     const selectedCurrency = currencySelect.value;
     if (selectedCurrency && !currencyAlreadyAdded(selectedCurrency)) {
       addCurrencyRow(selectedCurrency);
       fetchExchangeRates(selectedCurrency);
     }
   });

   function currencyAlreadyAdded(currencyCode) {
     const existingCurrencies = document.querySelectorAll('.currency_row');
     for (let row of existingCurrencies) {
       const existingCurrency = row.querySelector('.currency').textContent;
       if (existingCurrency === currencyCode) {
         return true;
       }
     }
     return false;
   }

   function fetchExchangeRates(currencyCode) {
     fetch(`http://localhost:5001/api/exchange_rates`)
       .then((response) => response.json())
       .then((data) => {
         exchangeRates = data.reduce((rates, rate) => {
           rates[rate.currency_to] = rate.rate;
           return rates;
         }, {});
         triggerCalculations();
       })
       .catch((error) => console.error("Error fetching exchange rates:", error));
   }

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
       triggerCalculations();
     });

     currencyRow.appendChild(currencySpan);
     currencyRow.appendChild(amountInput);
     currencyRow.appendChild(currencyName);
     currencyContainer.appendChild(currencyRow);
     newRow.appendChild(currencyContainer);
     newRow.appendChild(deleteButton);

     mainWrapper.insertBefore(newRow, currencySelect.parentElement);
   }

   function triggerCalculations() {
     document.querySelectorAll('.currency_row').forEach((row) => {
       const amountInput = row.querySelector('.currency_number');
       handleAmountChange({ target: amountInput });
     });
   }

   function handleAmountChange(event) {
     const amountInput = event.target;
     let amount = parseFloat(amountInput.value);

     if (isNaN(amount) || amount <= 0) {
       return;
     }

     const currencyFrom = amountInput.parentElement.querySelector('.currency').textContent;

     document.querySelectorAll('.currency_row').forEach((row) => {
       const currencyTo = row.querySelector('.currency').textContent;
       const outputInput = row.querySelector('.currency_number');
       const rate = exchangeRates[currencyTo];

      if (rate && currencyFrom !== currencyTo) {
        const convertedAmount = amount * rate;
        outputInput.value = convertedAmount;
      } else if (currencyFrom === currencyTo) {
        outputInput.value = amount;
      }

      outputInput.value = outputInput.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
     });
   }
 });
