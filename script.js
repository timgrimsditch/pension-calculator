{\rtf1\ansi\ansicpg1252\cocoartf2761
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww30040\viewh17760\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 document.getElementById('pension-form').addEventListener('submit', function(event) \{\
  event.preventDefault();\
  \
  // Get user inputs\
  const ageToday = parseInt(document.getElementById('age-today').value);\
  const ageRetirement = parseInt(document.getElementById('age-retirement').value);\
  const pensionValue = parseFloat(document.getElementById('pension-value').value);\
  const annualPensionContributions = parseFloat(document.getElementById('annual-pension-contributions').value);\
  const isaStartValue = parseFloat(document.getElementById('isa-start-value').value);\
  const annualIsaContributions = parseFloat(document.getElementById('annual-isa-contributions').value);\
  const postTaxIncome = parseFloat(document.getElementById('post-tax-income').value);\
\
  // Example calculation (replace with your actual logic)\
  const yearsToRetirement = ageRetirement - ageToday;\
  const projectedPensionValue = pensionValue + (annualPensionContributions * yearsToRetirement);\
  const projectedIsaValue = isaStartValue + (annualIsaContributions * yearsToRetirement);\
\
  // Display results (can be enhanced with a chart)\
  alert(`Projected Pension Value at Retirement: \'a3$\{projectedPensionValue.toFixed(2)\}\
Projected ISA Value at Retirement: \'a3$\{projectedIsaValue.toFixed(2)\}`);\
\});\
}