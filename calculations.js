// Global variable to store the chart instance
let pensionChart = null;

document.getElementById('pension-form').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevents form submission and reload

  console.log("Form submitted"); // Debugging log

  // User inputs
  const ageToday = parseInt(document.getElementById('age-today').value);
  const ageRetirement = parseInt(document.getElementById('age-retirement').value);
  const pensionValueToday = parseFloat(document.getElementById('pension-value').value);
  const annualPensionContributions = parseFloat(document.getElementById('annual-pension-contributions').value);
  const isaStartValue = parseFloat(document.getElementById('isa-start-value').value);
  const annualIsaContributions = parseFloat(document.getElementById('annual-isa-contributions').value);
  const desiredPostTaxIncome = parseFloat(document.getElementById('post-tax-income').value);
  const dbIncome = parseFloat(document.getElementById('db-income').value) || 0;
  const dbStartAge = parseInt(document.getElementById('db-start-age').value) || 0;

  // Constants
  const growthRate = 0.07; // 7% annual growth rate
  const taxRate = 0.2; // 20% tax on pension withdrawals
  const statePensionIncome = 8800; // Initial annual state pension income
  const inflationRate = 0.02; // 2% annual inflation rate
  const maxAge = 100;

  // Calculate State Pension Age
  const birthYear = new Date().getFullYear() - ageToday;
  let statePensionAge = 67;

  if (birthYear >= 1961 && birthYear < 1977) {
    statePensionAge = 67;
  } else if (birthYear >= 1977) {
    statePensionAge = 68;
  } else if (birthYear < 1961) {
    statePensionAge = 66;
  }

  // Derived variables
  const yearsToModel = maxAge - ageToday;
  let pensionBalance = pensionValueToday;
  let isaBalance = isaStartValue;
  const combinedBalances = [];
  const ages = [];
  let savingsRunOutAge = null;

  for (let i = 0; i <= yearsToModel; i++) {
    const currentAge = ageToday + i;

    if (currentAge < ageRetirement) {
      // Pre-retirement: Apply contributions and growth
      pensionBalance = pensionBalance * (1 + growthRate) + annualPensionContributions;
      isaBalance = isaBalance * (1 + growthRate) + annualIsaContributions;
    } else {
      // Post-retirement: Apply withdrawals and growth

      // Adjust the State Pension income for inflation
      const adjustedStatePensionIncome =
        currentAge >= statePensionAge
          ? statePensionIncome * Math.pow(1 + inflationRate, currentAge - statePensionAge)
          : 0;

      const inflationAdjustedIncome = desiredPostTaxIncome * Math.pow(1 + inflationRate, currentAge - ageRetirement);
      const dbPension = currentAge >= dbStartAge ? dbIncome : 0;
      const guaranteedIncome = adjustedStatePensionIncome + dbPension;

      let incomeGap = inflationAdjustedIncome - guaranteedIncome;
      if (incomeGap < 0) incomeGap = 0;

      let pensionWithdrawal = Math.min(incomeGap / (1 - taxRate), pensionBalance);
      let netPensionWithdrawal = pensionWithdrawal * (1 - taxRate);
      pensionBalance -= pensionWithdrawal;

      let isaWithdrawal = incomeGap - netPensionWithdrawal;
      if (isaWithdrawal < 0) isaWithdrawal = 0;
      isaBalance -= isaWithdrawal;

      pensionBalance = Math.max(0, pensionBalance) * (1 + growthRate);
      isaBalance = Math.max(0, isaBalance) * (1 + growthRate);

      // Check for savings run-out
      if (pensionBalance + isaBalance <= 0 && savingsRunOutAge === null) {
        savingsRunOutAge = currentAge;
      }
    }

    combinedBalances.push(pensionBalance + isaBalance);
    ages.push(currentAge);
  }

  // Calculate required annual contributions to sustain savings until age 100
  let requiredAnnualContribution = annualPensionContributions;
  if (savingsRunOutAge !== null) {
    let isSufficient = false;
    while (!isSufficient) {
      let testPensionBalance = pensionValueToday;
      let testIsaBalance = isaStartValue;
      isSufficient = true;

      for (let i = 0; i <= yearsToModel; i++) {
        const currentAge = ageToday + i;

        if (currentAge < ageRetirement) {
          testPensionBalance = testPensionBalance * (1 + growthRate) + requiredAnnualContribution;
          testIsaBalance = testIsaBalance * (1 + growthRate) + annualIsaContributions;
        } else {
          const adjustedStatePensionIncome =
            currentAge >= statePensionAge
              ? statePensionIncome * Math.pow(1 + inflationRate, currentAge - statePensionAge)
              : 0;

          const inflationAdjustedIncome = desiredPostTaxIncome * Math.pow(1 + inflationRate, currentAge - ageRetirement);
          const dbPension = currentAge >= dbStartAge ? dbIncome : 0;
          const guaranteedIncome = adjustedStatePensionIncome + dbPension;

          let incomeGap = inflationAdjustedIncome - guaranteedIncome;
          if (incomeGap < 0) incomeGap = 0;

          let pensionWithdrawal = Math.min(incomeGap / (1 - taxRate), testPensionBalance);
          let netPensionWithdrawal = pensionWithdrawal * (1 - taxRate);
          testPensionBalance -= pensionWithdrawal;

          let isaWithdrawal = incomeGap - netPensionWithdrawal;
          if (isaWithdrawal < 0) isaWithdrawal = 0;
          testIsaBalance -= isaWithdrawal;

          testPensionBalance = Math.max(0, testPensionBalance) * (1 + growthRate);
          testIsaBalance = Math.max(0, testIsaBalance) * (1 + growthRate);

          if (testPensionBalance + testIsaBalance <= 0) {
            isSufficient = false;
            requiredAnnualContribution += 100; // Increment contribution in steps of £100
            break;
          }
        }
      }
    }
  }

  // Calculate the maximum sustainable desired post-tax income
  let maxSustainableIncome = desiredPostTaxIncome;
  if (savingsRunOutAge !== null) {
    let isIncomeSufficient = false;
    while (!isIncomeSufficient) {
      let testPensionBalance = pensionValueToday;
      let testIsaBalance = isaStartValue;
      isIncomeSufficient = true;

      for (let i = 0; i <= yearsToModel; i++) {
        const currentAge = ageToday + i;

        if (currentAge < ageRetirement) {
          testPensionBalance = testPensionBalance * (1 + growthRate) + annualPensionContributions;
          testIsaBalance = testIsaBalance * (1 + growthRate) + annualIsaContributions;
        } else {
          const adjustedStatePensionIncome =
            currentAge >= statePensionAge
              ? statePensionIncome * Math.pow(1 + inflationRate, currentAge - statePensionAge)
              : 0;

          const inflationAdjustedIncome = maxSustainableIncome * Math.pow(1 + inflationRate, currentAge - ageRetirement);
          const dbPension = currentAge >= dbStartAge ? dbIncome : 0;
          const guaranteedIncome = adjustedStatePensionIncome + dbPension;

          let incomeGap = inflationAdjustedIncome - guaranteedIncome;
          if (incomeGap < 0) incomeGap = 0;

          let pensionWithdrawal = Math.min(incomeGap / (1 - taxRate), testPensionBalance);
          let netPensionWithdrawal = pensionWithdrawal * (1 - taxRate);
          testPensionBalance -= pensionWithdrawal;

          let isaWithdrawal = incomeGap - netPensionWithdrawal;
          if (isaWithdrawal < 0) isaWithdrawal = 0;
          testIsaBalance -= isaWithdrawal;

          testPensionBalance = Math.max(0, testPensionBalance) * (1 + growthRate);
          testIsaBalance = Math.max(0, testIsaBalance) * (1 + growthRate);

          if (testPensionBalance + testIsaBalance <= 0) {
            isIncomeSufficient = false;
            maxSustainableIncome -= 100; // Decrement income in steps of £100
            break;
          }
        }
      }
    }
  }

  // Display result statement
  const resultStatement = document.getElementById('result-statement');
  if (savingsRunOutAge === null) {
    resultStatement.textContent = "Your pension savings will support you for the rest of your life.";
  } else {
    resultStatement.textContent = `Your pension savings will run out by age ${savingsRunOutAge}. To ensure your savings last until age 100, either increase your annual contributions to £${requiredAnnualContribution.toLocaleString()} or reduce your Desired Post-Tax Income at Retirement to £${maxSustainableIncome.toLocaleString()}.`;
  }

  // Destroy previous chart instance if it exists
  if (pensionChart !== null) {
    pensionChart.destroy();
    console.log("Old chart destroyed"); // Debugging log
  }

  // Create and render the chart
  const ctx = document.getElementById('pensionChart').getContext('2d');
  pensionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ages,
      datasets: [
        {
          label: 'Combined Pension and ISA Balance (£)',
          data: combinedBalances,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Age (Years)',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Combined Balance (£)',
          },
        },
      },
    },
  });

  console.log("Chart created successfully"); // Debugging log
});
