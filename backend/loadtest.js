import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  // Ramp users up in stages to find the breaking point
  stages: [
    { duration: '10s', target: 100 },    // Warm up to 100 users
    { duration: '20s', target: 500 },    // Ramp to 500 users
    { duration: '20s', target: 1000 },   // Ramp to 1,000 users
    { duration: '20s', target: 5000 },   // Ramp to 5,000 users
    { duration: '20s', target: 10000 },  // Push to 10,000 users
    { duration: '10s', target: 0 },      // Cool down
  ],

  // Pass/fail thresholds
  thresholds: {
    http_req_duration: ['p(95)<500'],   // 95% of requests must complete under 500ms
    http_req_failed: ['rate<0.10'],     // Less than 10% failure rate
  },
};

export default function () {
  // Test the root API endpoint
  const res = http.get('http://localhost:5000/');

  // Verify the response
  check(res, {
    'is status 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Short pause to simulate real user think-time
  sleep(1);
}
