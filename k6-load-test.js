/**
 * K6 Load Testing Script for Local Power
 * Advanced performance testing with multiple scenarios
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');
const responseTime = new Trend('response_time');
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },
    
    // Load test - normal traffic
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },   // Ramp up
        { duration: '60s', target: 10 },   // Stay at 10 users
        { duration: '30s', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'load' },
    },
    
    // Stress test - high traffic
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '60s', target: 20 },   // Ramp up to 20 users
        { duration: '120s', target: 20 },  // Stay at 20 users
        { duration: '60s', target: 50 },   // Ramp up to 50 users
        { duration: '120s', target: 50 },  // Stay at 50 users
        { duration: '60s', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'stress' },
    },
    
    // Spike test - sudden traffic increases
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 5 },    // Normal load
        { duration: '10s', target: 100 },  // Spike to 100 users
        { duration: '30s', target: 100 },  // Stay at spike
        { duration: '10s', target: 5 },    // Back to normal
        { duration: '10s', target: 0 },    // End
      ],
      tags: { test_type: 'spike' },
    }
  },
  
  thresholds: {
    // Overall thresholds
    http_req_duration: ['p(95)<3000'], // 95% of requests under 3s
    http_req_failed: ['rate<0.01'],    // Error rate under 1%
    
    // Custom metric thresholds
    error_rate: ['rate<0.01'],
    response_time: ['p(95)<3000'],
    
    // Scenario-specific thresholds
    'http_req_duration{test_type:smoke}': ['p(95)<2000'],
    'http_req_duration{test_type:load}': ['p(95)<3000'],
    'http_req_duration{test_type:stress}': ['p(95)<5000'],
    'http_req_duration{test_type:spike}': ['p(95)<8000'],
  }
};

// Base URL - update for your environment
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test data
const testData = {
  contactForms: [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+353-1-234-5678',
      address: '123 Main Street, Dublin',
      message: 'Interested in solar panels for my home'
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+353-1-987-6543',
      address: '456 Oak Avenue, Cork',
      message: 'Looking for battery storage solutions'
    }
  ],
  
  calculations: [
    {
      monthlyBill: 150,
      roofSize: 50,
      location: 'Dublin',
      orientation: 'South'
    },
    {
      monthlyBill: 200,
      roofSize: 75,
      location: 'Cork',
      orientation: 'South-West'
    }
  ]
};

// Helper function to get random test data
function getRandomContactForm() {
  return testData.contactForms[Math.floor(Math.random() * testData.contactForms.length)];
}

function getRandomCalculation() {
  return testData.calculations[Math.floor(Math.random() * testData.calculations.length)];
}

// Main test function
export default function() {
  const testType = __ENV.TEST_TYPE || 'mixed';
  
  // Homepage test
  testHomepage();
  
  // Random test selection based on weights
  const rand = Math.random();
  
  if (rand < 0.4) {
    // 40% - Browse pages
    testPageBrowsing();
  } else if (rand < 0.7) {
    // 30% - Use calculator
    testCalculator();
  } else if (rand < 0.9) {
    // 20% - Submit contact form
    testContactForm();
  } else {
    // 10% - API tests
    testAPIEndpoints();
  }
  
  // Think time between actions
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

function testHomepage() {
  const response = http.get(`${BASE_URL}/`);
  
  const success = check(response, {
    'homepage loads': (r) => r.status === 200,
    'homepage response time < 3s': (r) => r.timings.duration < 3000,
    'homepage contains title': (r) => r.body.includes('Local Power'),
    'homepage has navigation': (r) => r.body.includes('nav'),
  });
  
  // Record metrics
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  if (!success) {
    failedRequests.add(1);
  }
}

function testPageBrowsing() {
  const pages = ['/about', '/services', '/contact'];
  const page = pages[Math.floor(Math.random() * pages.length)];
  
  const response = http.get(`${BASE_URL}${page}`);
  
  const success = check(response, {
    [`${page} loads`]: (r) => r.status === 200,
    [`${page} response time < 3s`]: (r) => r.timings.duration < 3000,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  
  if (!success) {
    failedRequests.add(1);
  }
}

function testCalculator() {
  const calculation = getRandomCalculation();
  
  // First load the calculator page
  const pageResponse = http.get(`${BASE_URL}/`);
  
  check(pageResponse, {
    'calculator page loads': (r) => r.status === 200,
  });
  
  // Then submit calculation
  const calcResponse = http.post(
    `${BASE_URL}/api/calculations`,
    JSON.stringify(calculation),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  const success = check(calcResponse, {
    'calculation API works': (r) => r.status === 200 || r.status === 201,
    'calculation response time < 2s': (r) => r.timings.duration < 2000,
    'calculation returns data': (r) => {
      try {
        const data = JSON.parse(r.body);
        return data && typeof data === 'object';
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(!success);
  responseTime.add(calcResponse.timings.duration);
  
  if (!success) {
    failedRequests.add(1);
  }
}

function testContactForm() {
  const contactData = getRandomContactForm();
  
  // Load contact page first
  const pageResponse = http.get(`${BASE_URL}/contact`);
  
  check(pageResponse, {
    'contact page loads': (r) => r.status === 200,
  });
  
  // Submit contact form
  const formResponse = http.post(
    `${BASE_URL}/api/contacts`,
    JSON.stringify(contactData),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  const success = check(formResponse, {
    'contact form submits': (r) => r.status === 200 || r.status === 201,
    'contact form response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  errorRate.add(!success);
  responseTime.add(formResponse.timings.duration);
  
  if (!success) {
    failedRequests.add(1);
  }
}

function testAPIEndpoints() {
  const endpoints = [
    '/api/database/health',
    '/api/contacts',
  ];
  
  endpoints.forEach(endpoint => {
    const response = http.get(`${BASE_URL}${endpoint}`);
    
    const success = check(response, {
      [`${endpoint} API works`]: (r) => r.status === 200,
      [`${endpoint} response time < 2s`]: (r) => r.timings.duration < 2000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    
    if (!success) {
      failedRequests.add(1);
    }
  });
}

// Setup function - runs once before test
export function setup() {
  console.log('🚀 Starting Local Power Load Test');
  console.log(`Target URL: ${BASE_URL}`);
  
  // Warm up the application
  const warmupResponse = http.get(`${BASE_URL}/`);
  if (warmupResponse.status !== 200) {
    console.error('❌ Application not accessible for testing');
    return null;
  }
  
  console.log('✅ Application is accessible');
  return { baseUrl: BASE_URL };
}

// Teardown function - runs once after test
export function teardown(data) {
  console.log('📊 Load test completed');
  console.log('Check the detailed results above for performance metrics');
}

// Handle different test types
export function handleSummary(data) {
  const timestamp = new Date().toISOString();
  
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'load-test-results.json': JSON.stringify({
      timestamp,
      metrics: data.metrics,
      thresholds: data.thresholds,
      test_config: options
    }, null, 2),
  };
}

// Text summary helper
function textSummary(data, options = {}) {
  const indent = options.indent || '';
  const colors = options.enableColors !== false;
  
  let summary = '\n';
  summary += `${indent}📊 Load Test Results Summary\n`;
  summary += `${indent}================================\n\n`;
  
  // Test duration
  const duration = data.state.testRunDurationMs / 1000;
  summary += `${indent}⏱️  Duration: ${duration.toFixed(1)}s\n`;
  
  // Requests
  const httpReqs = data.metrics.http_reqs;
  if (httpReqs) {
    summary += `${indent}📈 Total Requests: ${httpReqs.values.count}\n`;
    summary += `${indent}📊 Requests/sec: ${httpReqs.values.rate.toFixed(2)}\n`;
  }
  
  // Response times
  const httpDuration = data.metrics.http_req_duration;
  if (httpDuration) {
    summary += `${indent}⚡ Avg Response Time: ${httpDuration.values.avg.toFixed(2)}ms\n`;
    summary += `${indent}📊 95th Percentile: ${httpDuration.values['p(95)'].toFixed(2)}ms\n`;
  }
  
  // Error rate
  const httpFailed = data.metrics.http_req_failed;
  if (httpFailed) {
    const errorPercent = (httpFailed.values.rate * 100).toFixed(2);
    summary += `${indent}❌ Error Rate: ${errorPercent}%\n`;
  }
  
  // Thresholds
  summary += `\n${indent}🎯 Threshold Results:\n`;
  for (const [name, threshold] of Object.entries(data.thresholds)) {
    const symbol = threshold.ok ? '✅' : '❌';
    summary += `${indent}${symbol} ${name}\n`;
  }
  
  return summary;
}