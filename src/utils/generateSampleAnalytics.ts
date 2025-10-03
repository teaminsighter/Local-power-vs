// Generate Sample Analytics Data for Testing
import { analyticsService } from '@/services/analyticsService';

export const generateSampleAnalyticsData = () => {
  // Clear existing data first
  analyticsService.clearAnalytics();
  
  const currentTime = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Generate sample sessions over the last 7 days
  for (let day = 0; day < 7; day++) {
    const dayStart = currentTime - (day * dayMs);
    
    // Generate 10-20 sessions per day
    const sessionsPerDay = Math.floor(Math.random() * 10) + 10;
    
    for (let session = 0; session < sessionsPerDay; session++) {
      const sessionTime = dayStart + (Math.random() * dayMs);
      
      // Create a mock session
      const sessionId = 'sample_session_' + sessionTime + '_' + session;
      const userId = 'sample_user_' + Math.floor(Math.random() * 100);
      
      // Simulate user progressing through steps
      const maxStepReached = Math.floor(Math.random() * 7) + 1;
      const converted = maxStepReached === 7 && Math.random() > 0.7; // 30% conversion rate on step 7
      
      for (let step = 1; step <= maxStepReached; step++) {
        const stepStartTime = new Date(sessionTime + (step - 1) * 30000); // 30 seconds per step
        const stepEndTime = new Date(stepStartTime.getTime() + Math.random() * 60000); // 0-60 seconds duration
        
        // Generate realistic data based on step
        let stepData = {};
        switch (step) {
          case 2: // State selection
            stepData = {
              selectedState: ['NSW', 'QLD', 'VIC', 'SA', 'WA'][Math.floor(Math.random() * 5)]
            };
            break;
          case 3: // Solution selection
            stepData = {
              selectedSolution: ['residential', 'commercial', 'agricultural'][Math.floor(Math.random() * 3)]
            };
            break;
          case 4: // Address input
            const addresses = [
              '123 Main Street, Sydney, NSW 2000',
              '456 Collins Street, Melbourne, VIC 3000',
              '789 Queen Street, Brisbane, QLD 4000',
              '321 King William Street, Adelaide, SA 5000',
              '654 St Georges Terrace, Perth, WA 6000',
              '987 Murray Street, Hobart, TAS 7000',
              '147 Mitchell Street, Darwin, NT 0800',
              '258 Northbourne Avenue, Canberra, ACT 2600'
            ];
            const searchQueries = [
              'sydney solar installation',
              'melbourne rooftop solar',
              'brisbane solar panels',
              'adelaide solar system',
              'perth solar energy',
              'hobart renewable energy',
              'darwin solar power',
              'canberra solar installation'
            ];
            const selectedAddress = addresses[Math.floor(Math.random() * addresses.length)];
            const searchQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
            
            stepData = {
              selectedAddress,
              searchQuery
            };
            
            // Track address search separately
            analyticsService.trackAddressSearch(
              searchQuery,
              selectedAddress,
              {
                lat: -25.2744 + (Math.random() - 0.5) * 20, // Random coordinates around Australia
                lng: 133.7751 + (Math.random() - 0.5) * 30
              }
            );
            break;
          case 6: // Panel configuration
            stepData = {
              panelCount: Math.floor(Math.random() * 30) + 10
            };
            break;
        }
        
        // Add to analytics history manually (simulating past events)
        const history = JSON.parse(localStorage.getItem('analytics_history') || '[]');
        
        // Step entry event
        history.push({
          id: `entry_${sessionTime}_${step}`,
          type: 'step_entry',
          timestamp: stepStartTime.toISOString(),
          data: {
            stepNumber: step,
            stepName: ['Welcome', 'State Selection', 'Solution Selection', 'Address Input', 'Map Analysis', 'Panel Configuration', 'Lead Capture'][step - 1],
            entryTime: stepStartTime.toISOString(),
            completed: false,
            data: stepData,
            userId,
            sessionId
          }
        });
        
        // Step completion event (if not dropped off)
        const dropOffRate = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.7][step - 1]; // Increasing drop-off rates
        if (Math.random() > dropOffRate) {
          const duration = Math.floor((stepEndTime.getTime() - stepStartTime.getTime()) / 1000);
          
          history.push({
            id: `completion_${sessionTime}_${step}`,
            type: 'step_completion',
            timestamp: stepEndTime.toISOString(),
            data: {
              stepNumber: step,
              stepName: ['Welcome', 'State Selection', 'Solution Selection', 'Address Input', 'Map Analysis', 'Panel Configuration', 'Lead Capture'][step - 1],
              entryTime: stepStartTime.toISOString(),
              exitTime: stepEndTime.toISOString(),
              completed: true,
              duration,
              data: stepData,
              userId,
              sessionId
            }
          });
        } else {
          // User dropped off at this step
          break;
        }
      }
      
      // Add conversion if user completed all steps and converted
      if (converted) {
        const conversionTime = new Date(sessionTime + (maxStepReached * 30000));
        const totalDuration = Math.floor((conversionTime.getTime() - sessionTime) / 1000);
        
        history.push({
          id: `conversion_${sessionTime}`,
          type: 'conversion',
          timestamp: conversionTime.toISOString(),
          data: {
            sessionId,
            userId,
            startTime: new Date(sessionTime).toISOString(),
            endTime: conversionTime.toISOString(),
            totalDuration,
            stepsCompleted: maxStepReached,
            finalStep: maxStepReached,
            converted: true,
            leadGenerated: true,
            userAgent: 'Sample User Agent',
            referrer: 'https://google.com',
            device: ['mobile', 'tablet', 'desktop'][Math.floor(Math.random() * 3)],
            leadData: {
              firstName: 'Sample',
              lastName: 'User',
              email: `user${Math.floor(Math.random() * 1000)}@example.com`,
              systemSize: Math.floor(Math.random() * 20) + 5
            }
          }
        });
      }
      
      // Save updated history
      localStorage.setItem('analytics_history', JSON.stringify(history));
    }
  }
  
  console.log('Sample analytics data generated successfully!');
  return true;
};

export const clearAnalyticsData = () => {
  analyticsService.clearAnalytics();
  console.log('Analytics data cleared!');
};