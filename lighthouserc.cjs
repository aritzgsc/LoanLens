module.exports = {ci:{ collect:{
  staticDistDir:'./dist',
  url:['/','/calculator/','/deadlines/','/rap-payment-by-income/','/tools/married-rap-impact/'],
  numberOfRuns:3,
  settings:{formFactor:'mobile'}
}, assert:{assertions:{
  'categories:accessibility':['error',{minScore:.95}],
  'largest-contentful-paint':['error',{maxNumericValue:2000,aggregationMethod:'median'}],
  'cumulative-layout-shift':['error',{maxNumericValue:.05,aggregationMethod:'median'}],
  'total-blocking-time':['error',{maxNumericValue:150,aggregationMethod:'median'}]
}}}};
