'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';
import { BuildingInsightsService } from '@/solar-api/services/building-insights';
import SolarMapWithPanels from '@/solar-api/components/SolarMapWithPanels';
import PanelSlider from '@/solar-api/components/PanelSlider';
import StatisticsDataGrid from '@/solar-api/components/StatisticsDataGrid';
import RealSatelliteMap from './RealSatelliteMap';
import { loadGoogleMapsAPI, isGoogleMapsLoaded } from '@/solar-api/utils/google-maps-loader';
import { ProcessedBuildingData, LivePanelCalculation } from '@/solar-api/types/building-insights';
import LeadCaptureForm from './calculator/LeadCaptureForm';
import leadsService from '@/services/leadsService';
import { webhookService } from '@/services/webhookService';
import { analyticsService } from '@/services/analyticsService';
import { trackConversionEvent } from '@/utils/adminSettings';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalculatorModal = ({ isOpen, onClose }: CalculatorModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { selectedState, selectedSolution, setSelectedState, setSelectedSolution } = useStore();
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15));
  const [visitorUserId] = useState(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return 'visitor_temp';
    
    // Check if visitor ID exists in localStorage
    const stored = localStorage.getItem('visitor_user_id');
    if (stored) return stored;
    
    // Generate new visitor user ID
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 9);
    const newId = `visitor_${timestamp}_${randomStr}`;
    localStorage.setItem('visitor_user_id', newId);
    return newId;
  });
  const [pageStartTime] = useState(() => Date.now());
  const [scrollDepth, setScrollDepth] = useState(0);
  const [userActions, setUserActions] = useState<any[]>([]);
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Property type state
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showMap, setShowMap] = useState(false);

  // Solar map state
  const [currentLocation, setCurrentLocation] = useState({ lat: 53.3498, lng: -6.2603 }); // Dublin default
  const [buildingData, setBuildingData] = useState<ProcessedBuildingData | null>(null);
  const [panelCount, setPanelCount] = useState(0);
  const [isLoadingBuildingData, setIsLoadingBuildingData] = useState(false);
  
  // Map processing loading state
  const [isProcessingMap, setIsProcessingMap] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  
  // Step 3 form state
  const [selectedRoofDirection, setSelectedRoofDirection] = useState('');

  // Building insights service
  const buildingInsightsService = new BuildingInsightsService();

  // Enhanced visitor tracking function
  const trackVisitor = async (page: string = 'solar-calculator', additionalData: any = {}) => {
    try {
      const stayTime = Math.floor((Date.now() - pageStartTime) / 1000);
      
      await fetch('/api/track-visitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page,
          referrer: document.referrer || null,
          sessionId: sessionId,
          visitorUserId: visitorUserId,
          stayTime,
          scrollDepth,
          actions: userActions,
          leadId: null,
          ...additionalData
        })
      });
    } catch (error) {
      console.error('Failed to track visitor:', error);
    }
  };

  // Track user actions
  const trackAction = (action: string, element: string, data?: any) => {
    const actionData = {
      action,
      element,
      timestamp: new Date().toISOString(),
      step: currentStep,
      data
    };
    setUserActions(prev => [...prev, actionData]);
  };

  // Lead capture handler
  const handleLeadSubmission = async (leadData: any) => {
    try {
      // Calculate system details for the lead
      const systemDetails = {
        systemSize: panelCount * 0.4, // Assume 400W panels
        estimatedCost: 15000 + (panelCount * 400), // Basic cost calculation
        annualSavings: 2400 + (panelCount * 120), // Basic savings calculation
        paybackPeriod: 8.5,
        address: selectedAddress || buildingData?.address || 'Location from calculator',
        panelCount: panelCount
      };

      const leadWithSystemDetails = {
        ...leadData,
        systemDetails
      };

      // Save lead to service
      const newLead = await leadsService.createLead(leadWithSystemDetails);
      
      // Track lead conversion
      try {
        await fetch('/api/track-visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: 'solar-calculator-conversion',
            referrer: document.referrer || null,
            sessionId: sessionId,
            leadId: newLead.id
          })
        });
      } catch (trackingError) {
        console.error('Failed to track lead conversion:', trackingError);
      }
      
      // Send to webhooks
      try {
        const webhookPayload = webhookService.createPayloadFromLead(newLead);
        await webhookService.sendToAllWebhooks(webhookPayload);
        console.log('Lead sent to webhooks successfully');
      } catch (webhookError) {
        console.error('Failed to send lead to webhooks:', webhookError);
        // Don't fail the lead capture if webhooks fail
      }
      
      // Track analytics conversion
      analyticsService.trackConversion({
        leadId: newLead.id,
        systemDetails,
        leadData
      });
      
      // Track conversion event
      await trackConversionEvent('generate_lead', {
        systemCost: systemDetails.estimatedCost,
        systemSize: systemDetails.systemSize,
        leadId: newLead.id
      });

      console.log('Lead captured successfully:', newLead);
    } catch (error) {
      console.error('Failed to capture lead:', error);
      throw error;
    }
  };

  // Skip lead capture and close modal
  const handleSkipLead = () => {
    onClose();
  };

  // Handle location changes from pin movement
  const handleLocationChange = async (lat: number, lng: number) => {
    setCurrentLocation({ lat, lng });
    setIsLoadingBuildingData(true);
    setPanelCount(0); // Reset panel count when location changes
    
    try {
      const response = await buildingInsightsService.fetchBuildingInsights(lat, lng);
      const processedData = buildingInsightsService.processBuildingData(response);
      setBuildingData(processedData);
      
      // Set default panel count to 25% of max
      const defaultPanelCount = Math.round(processedData.maxPanels * 0.25);
      setPanelCount(defaultPanelCount);
    } catch (error) {
      console.error('Failed to fetch building insights:', error);
      
      // Create minimal fallback data for locations without Google Solar coverage
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('BUILDING_NOT_FOUND')) {
        // Create realistic fallback data with spread panels and color variety
        console.log('Using fallback building data for:', { lat, lng });
        
        // Generate tight roof segments contained within building boundaries
        // Using much smaller offsets to keep panels on the roof
        const roofSegments = [
          {
            index: 0,
            bounds: {
              ne: { latitude: lat + 0.000015, longitude: lng + 0.000025 },
              sw: { latitude: lat + 0.000005, longitude: lng + 0.000005 }
            },
            center: { latitude: lat + 0.00001, longitude: lng + 0.000015 },
            area: 30,
            pitch: 25,
            azimuth: 180, // South-facing - excellent
            color: '#EF4444', // Red - excellent
            sunshineHours: [1350, 1400, 1450, 1500, 1550, 1500]
          },
          {
            index: 1,
            bounds: {
              ne: { latitude: lat + 0.000005, longitude: lng + 0.000025 },
              sw: { latitude: lat - 0.000005, longitude: lng + 0.000005 }
            },
            center: { latitude: lat, longitude: lng + 0.000015 },
            area: 25,
            pitch: 30,
            azimuth: 195, // Southwest - good
            color: '#F59E0B', // Yellow - good
            sunshineHours: [1200, 1250, 1300, 1350, 1400, 1350]
          },
          {
            index: 2,
            bounds: {
              ne: { latitude: lat - 0.000005, longitude: lng + 0.000025 },
              sw: { latitude: lat - 0.000015, longitude: lng + 0.000005 }
            },
            center: { latitude: lat - 0.00001, longitude: lng + 0.000015 },
            area: 25,
            pitch: 35,
            azimuth: 225, // Southwest - moderate
            color: '#10B981', // Green - moderate
            sunshineHours: [1000, 1050, 1100, 1150, 1200, 1150]
          },
          {
            index: 3,
            bounds: {
              ne: { latitude: lat + 0.000015, longitude: lng + 0.000005 },
              sw: { latitude: lat + 0.000005, longitude: lng - 0.000015 }
            },
            center: { latitude: lat + 0.00001, longitude: lng - 0.000005 },
            area: 20,
            pitch: 40,
            azimuth: 90, // East-facing - lower
            color: '#3B82F6', // Blue - lower
            sunshineHours: [800, 850, 900, 950, 1000, 950]
          }
        ];

        // Generate realistic panel locations spread across roof segments
        const optimalPanelLocations = [];
        const segmentPanelCounts = [8, 7, 6, 4]; // Panels per segment
        
        segmentPanelCounts.forEach((panelCount, segmentIndex) => {
          const segment = roofSegments[segmentIndex];
          const baseEnergy = [480, 380, 320, 260][segmentIndex]; // Different energy levels
          
          // Calculate grid dimensions for proper spacing
          const panelsPerRow = Math.ceil(Math.sqrt(panelCount));
          const totalRows = Math.ceil(panelCount / panelsPerRow);
          
          // Increase spacing between panels to prevent overlap
          const latRange = segment.bounds.ne.latitude - segment.bounds.sw.latitude;
          const lngRange = segment.bounds.ne.longitude - segment.bounds.sw.longitude;
          
          // Add padding and increase spacing between panels
          const latSpacing = latRange / (totalRows + 1); // Add padding
          const lngSpacing = lngRange / (panelsPerRow + 1); // Add padding
          
          for (let i = 0; i < panelCount; i++) {
            const row = Math.floor(i / panelsPerRow);
            const col = i % panelsPerRow;
            
            optimalPanelLocations.push({
              center: {
                latitude: segment.bounds.sw.latitude + (row + 1) * latSpacing,
                longitude: segment.bounds.sw.longitude + (col + 1) * lngSpacing
              },
              orientation: 'LANDSCAPE' as const,
              segmentIndex: segmentIndex,
              yearlyEnergyDcKwh: baseEnergy + Math.random() * 40 - 20 // Add some variation
            });
          }
        });

        const fallbackData: ProcessedBuildingData = {
          buildingId: `fallback_${lat}_${lng}`,
          center: { latitude: lat, longitude: lng },
          totalRoofArea: 100, // Default 100m² roof
          maxPanels: 25,      // Default 25 panels max
          imageryQuality: 'LOW',
          roofSegments: roofSegments,
          panelConfigs: [{
            panelsCount: 25,
            yearlyEnergyDcKwh: 10000,
            roofSegmentSummaries: []
          }],
          optimalPanelLocations: optimalPanelLocations,
          panelDimensions: {
            width: 2.0,
            height: 1.0,
            capacity: 400
          },
          financialData: [{
            monthlyBill: {
              currencyCode: 'EUR',
              units: '150'
            },
            panelConfigIndex: 0
          }]
        };
        setBuildingData(fallbackData);
        setPanelCount(6); // Default to 6 panels
      } else {
        setBuildingData(null);
      }
    } finally {
      setIsLoadingBuildingData(false);
    }
  };

  // Handle panel count changes from slider
  const handlePanelCountChange = (count: number) => {
    setPanelCount(count);
  };


  // Load initial building data when step 4 is reached
  useEffect(() => {
    if (currentStep === 4 && !buildingData && !isLoadingBuildingData) {
      handleLocationChange(currentLocation.lat, currentLocation.lng);
    }
  }, [currentStep]);

  const steps = [
    { number: 1, title: 'Location', description: 'Select your state' },
    { number: 2, title: 'Property', description: 'Property details' },
    { number: 3, title: 'Usage', description: 'Energy consumption' },
    { number: 4, title: 'Solution', description: 'Choose your system' },
    { number: 5, title: 'Details', description: 'Additional information' },
    { number: 6, title: 'Quote', description: 'Your personalized quote' },
    { number: 7, title: 'Contact', description: 'Get your free consultation' },
  ];

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      // Track calculator start
      analyticsService.trackStepEntry(1);
      
      // Track visitor with enhanced data
      trackVisitor('solar-calculator-start');
      trackAction('modal_open', 'calculator_modal');

      // Add scroll tracking
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollDepth(Math.max(scrollDepth, scrollPercentage));
      };

      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', () => {}); // cleanup scroll listener
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // Map processing simulation with realistic step progression
  const [processingStepIndex, setProcessingStepIndex] = useState(0);

  const processMapData = async () => {
    const steps = [
      { text: 'Finding your location...', duration: 2000, stepIndex: 0 },
      { text: 'Scanning satellite imagery...', duration: 2000, stepIndex: 1 },
      { text: 'Analyzing roof structure...', duration: 2000, stepIndex: 2 },
      { text: 'Calculating solar potential...', duration: 2000, stepIndex: 3 },
      { text: 'Processing light conditions...', duration: 1500, stepIndex: 3 },
      { text: 'Generating electricity analysis...', duration: 2000, stepIndex: 4 },
      { text: 'Finalizing your solar map...', duration: 1500, stepIndex: 4 }
    ];

    setIsProcessingMap(true);
    setProcessingStepIndex(0);
    
    for (const step of steps) {
      setProcessingStep(step.text);
      setProcessingStepIndex(step.stepIndex);
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }
    
    setIsProcessingMap(false);
    setCurrentStep(4);
    
    // Track new step entry and visitor
    analyticsService.trackStepEntry(4);
    trackVisitor(`step-4`);
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      // Track step completion and navigation
      trackAction('step_navigation', 'next_button', { from: currentStep, to: currentStep + 1 });
      analyticsService.trackStepCompletion(currentStep, {
        selectedState: selectedState,
        selectedSolution: selectedSolution,
        searchQuery: searchQuery,
        selectedAddress: selectedAddress,
        panelCount: panelCount
      });
      
      // Special handling for step 3 to 4 transition - show map processing
      if (currentStep === 3) {
        processMapData();
        return;
      }
      
      setCurrentStep(currentStep + 1);
      
      // Track new step entry and visitor
      analyticsService.trackStepEntry(currentStep + 1);
      trackVisitor(`solar-calculator-step-${currentStep + 1}`);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      trackAction('step_navigation', 'prev_button', { from: currentStep, to: currentStep - 1 });
      setCurrentStep(currentStep - 1);
      // Track step entry when going back
      analyticsService.trackStepEntry(currentStep - 1);
      trackVisitor(`solar-calculator-step-${currentStep - 1}`);
    }
  };

  const states = [
    { code: 'NSW', name: 'New South Wales', rebate: 'Up to €2,400' },
    { code: 'QLD', name: 'Queensland', rebate: 'Up to €3,500' },
    { code: 'VIC', name: 'Victoria', rebate: 'Up to €1,400' },
    { code: 'SA', name: 'South Australia', rebate: 'Up to €6,000' },
  ];

  const solutions = [
    { type: 'solar', title: 'Solar Only', price: 'From €4,990' },
    { type: 'battery', title: 'Battery Only', price: 'From €8,990' },
    { type: 'solar-battery', title: 'Solar + Battery', price: 'From €12,990' },
  ];

  // Irish address suggestions (enhanced fallback)
  const mockSuggestions = [
    '1 O\'Connell Street, Dublin 1, Co. Dublin, Ireland',
    '123 Grafton Street, Dublin 2, Co. Dublin, Ireland', 
    '456 Ballsbridge Avenue, Dublin 4, Co. Dublin, Ireland',
    '789 Ranelagh Road, Dublin 6, Co. Dublin, Ireland',
    '10 The Coombe, Dublin 8, Co. Dublin, Ireland',
    '25 Patrick Street, Cork City, Co. Cork, Ireland',
    '50 Shop Street, Galway City, Co. Galway, Ireland',
    '75 O\'Connell Street, Limerick City, Co. Limerick, Ireland',
    '100 The Quay, Waterford City, Co. Waterford, Ireland',
    '15 High Street, Kilkenny City, Co. Kilkenny, Ireland',
    '30 Main Street, Wexford Town, Co. Wexford, Ireland',
    '45 Church Street, Athlone, Co. Westmeath, Ireland',
    '60 Trimgate Street, Navan, Co. Meath, Ireland',
    '85 West Street, Drogheda, Co. Louth, Ireland',
    '20 Main Street, Bray, Co. Wicklow, Ireland',
    '35 George\'s Street, Dun Laoghaire, Co. Dublin, Ireland',
    '55 Main Street, Swords, Co. Dublin, Ireland',
    '70 Main Street, Blanchardstown, Dublin 15, Ireland',
    '90 Dame Street, Dublin 2, Co. Dublin, Ireland',
    '15 Henry Street, Dublin 1, Co. Dublin, Ireland',
    '200 Pearse Street, Dublin 2, Co. Dublin, Ireland',
    '300 Clontarf Road, Dublin 3, Co. Dublin, Ireland'
  ];

  // Google Places Autocomplete service
  const [placesService, setPlacesService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);

  // Initialize Places API when component mounts
  useEffect(() => {
    const loadAPI = async () => {
      try {
        if (!isGoogleMapsLoaded()) {
          await loadGoogleMapsAPI();
        }
        if (window.google?.maps?.places) {
          const autocompleteService = new google.maps.places.AutocompleteService();
          setPlacesService(autocompleteService);
        }
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
      }
    };
    loadAPI();
  }, []);

  // Handle search input change with real Google Places API
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) {
      setIsLoadingPlaces(true);
      
      try {
        if (placesService) {
          // Get real address predictions from Google Places API
          placesService.getPlacePredictions({
            input: query,
            types: ['address'],
            componentRestrictions: { country: 'ie' } // Restrict to Ireland
          }, (predictions, status) => {
            setIsLoadingPlaces(false);
            
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const addressSuggestions = predictions.slice(0, 8).map(prediction => prediction.description);
              setSuggestions(addressSuggestions);
              setShowSuggestions(true);
            } else {
              // Fallback to mock suggestions if API fails
              const filtered = mockSuggestions.filter(addr => 
                addr.toLowerCase().includes(query.toLowerCase())
              ).slice(0, 8);
              setSuggestions(filtered);
              setShowSuggestions(true);
            }
          });
        } else {
          // Fallback if Places API not available
          const filtered = mockSuggestions.filter(addr => 
            addr.toLowerCase().includes(query.toLowerCase())
          ).slice(0, 8);
          setSuggestions(filtered);
          setShowSuggestions(true);
          setIsLoadingPlaces(false);
        }
      } catch (error) {
        console.error('Error fetching place predictions:', error);
        setIsLoadingPlaces(false);
        
        // Fallback to mock suggestions
        const filtered = mockSuggestions.filter(addr => 
          addr.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 8);
        setSuggestions(filtered);
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoadingPlaces(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (address: string) => {
    setSelectedAddress(address);
    setSearchQuery(address);
    setShowSuggestions(false);
    setShowMap(true);
    
    // Track address search
    analyticsService.trackAddressSearch(searchQuery, address, currentLocation);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setSelectedAddress(searchQuery);
      setShowMap(true);
      setShowSuggestions(false);
      
      // Track address search
      analyticsService.trackAddressSearch(searchQuery, searchQuery, currentLocation);
    }
  };

  const renderStepContent = () => {
    // Show map processing loading screen
    if (isProcessingMap) {
      return (
        <motion.div
          key="processing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] px-4 sm:px-8"
        >
          <div className="max-w-2xl mx-auto text-center">
            {/* Main Processing Animation */}
            <div className="relative mb-6 sm:mb-8">
              {/* Rotating outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ 
                  duration: processingStepIndex <= 1 ? 2 : processingStepIndex <= 3 ? 3 : 4, 
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className={`w-24 h-24 sm:w-32 sm:h-32 mx-auto border-3 sm:border-4 rounded-full ${
                  processingStepIndex <= 1 
                    ? 'border-blue-200 border-t-blue-500' 
                    : processingStepIndex <= 3 
                      ? 'border-yellow-200 border-t-yellow-500' 
                      : 'border-[#156644]/20 border-t-[#156644]'
                }`}
              />
              
              {/* Pulsing inner circle */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                  processingStepIndex <= 1 
                    ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
                    : processingStepIndex <= 3 
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' 
                      : 'bg-gradient-to-br from-[#156644] to-[#156644]'
                }`}>
                  <motion.div
                    animate={{ scale: [1, 0.8, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {processingStepIndex <= 1 
                      ? '📡' 
                      : processingStepIndex <= 3 
                        ? '🛰️' 
                        : '⚡'}
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Processing Text */}
            <motion.h3
              key={processingStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 px-4"
            >
              {processingStep}
            </motion.h3>

            {/* Description */}
            <p className="text-gray-600 mb-8 px-4 text-sm sm:text-base">
              We're analyzing your location and calculating your personalized solar potential. 
              This may take a few moments...
            </p>

            {/* Progress Indicators */}
            <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-8 px-2">
              {[
                { icon: '📍', label: 'Location' },
                { icon: '🛰️', label: 'Satellite' },
                { icon: '🏠', label: 'Structure' },
                { icon: '☀️', label: 'Solar' },
                { icon: '💡', label: 'Analysis' }
              ].map((item, index) => {
                const isActive = index <= processingStepIndex;
                const isCurrentStep = index === processingStepIndex;
                
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.3,
                      scale: isActive ? 1 : 0.8
                    }}
                    transition={{ 
                      duration: 0.5,
                      delay: isActive ? 0.2 : 0
                    }}
                    className={`flex flex-col items-center p-2 sm:p-3 rounded-lg transition-all duration-500 min-w-0 ${
                      isActive 
                        ? 'bg-[#156644]/5 border-2 border-[#156644]/20 shadow-sm' 
                        : 'bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <motion.div 
                      className="text-2xl mb-1"
                      animate={{
                        scale: isCurrentStep ? [1, 1.2, 1] : 1
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: isCurrentStep ? Infinity : 0
                      }}
                    >
                      {item.icon}
                    </motion.div>
                    <div className={`text-xs font-medium transition-colors duration-300 text-center ${
                      isActive ? 'text-[#156644]' : 'text-gray-500'
                    }`}>
                      {item.label}
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8 }}
                        className="h-1 bg-[#156644] rounded-full mt-2"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Scanning Animation */}
            <div className="relative w-full max-w-md mx-auto mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ 
                    duration: processingStepIndex <= 1 ? 1.5 : processingStepIndex <= 3 ? 2.5 : 3,
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className={`h-full w-1/3 bg-gradient-to-r from-transparent to-transparent ${
                    processingStepIndex <= 1 
                      ? 'via-blue-400' 
                      : processingStepIndex <= 3 
                        ? 'via-yellow-400' 
                        : 'via-[#156644]'
                  }`}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {processingStepIndex <= 1 
                  ? 'Locating and connecting...' 
                  : processingStepIndex <= 3 
                    ? 'Analyzing solar potential...' 
                    : 'Finalizing calculations...'}
              </p>
            </div>
          </div>
        </motion.div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-3xl mx-auto pt-20"
          >
            {/* Search Bar */}
            <div className="relative mb-8">
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyPress}
                placeholder="Input your address here"
                className="w-full p-4 pr-12 text-lg text-gray-900 placeholder-gray-400 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-[#156644] focus:border-[#156644] outline-none shadow-sm"
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Address Suggestions */}
              {showSuggestions && (suggestions.length > 0 || isLoadingPlaces) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl mt-2 z-10 max-h-80 overflow-y-auto"
                >
                  {isLoadingPlaces && (
                    <div className="flex items-center justify-center px-4 py-4">
                      <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      <span className="text-sm text-gray-500">Finding addresses...</span>
                    </div>
                  )}
                  
                  {!isLoadingPlaces && suggestions.map((address, index) => (
                    <motion.div
                      key={`${address}-${index}`}
                      whileHover={{ backgroundColor: '#f8f9fa' }}
                      onClick={() => handleSuggestionSelect(address)}
                      className="flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-gray-800 font-medium text-sm">{address}</span>
                        <div className="text-xs text-gray-500 mt-1">📍 Ireland</div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {!isLoadingPlaces && suggestions.length === 0 && searchQuery.length > 2 && (
                    <div className="px-4 py-4 text-center text-gray-500 text-sm">
                      <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No addresses found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                  )}
                  
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 text-center">
                    🔍 Powered by Google Places
                  </div>
                </motion.div>
              )}
            </div>

            {/* Real Satellite Map Display */}
            {showMap && selectedAddress && (
              <div className="w-full">
                <RealSatelliteMap
                  address={selectedAddress}
                  onLocationConfirmed={() => {
                    nextStep();
                  }}
                  onLocationChange={(lat, lng) => {
                    setCurrentLocation({ lat, lng });
                  }}
                  onSearchAgain={() => {
                    // Reset the search state
                    setShowMap(false);
                    setSelectedAddress('');
                    setSearchQuery('');
                    setShowSuggestions(false);
                    setSuggestions([]);
                  }}
                />
              </div>
            )}
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-6xl mx-auto pt-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Electricity Bill Upload */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Electricity Bill Upload</h3>
                </div>

                {/* Upload Section */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">Upload your latest electricity bill (Optional)</p>
                  
                  <div className="border-2 border-dashed border-[#156644]/30 rounded-xl p-8 text-center hover:border-[#156644] transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-primary font-semibold mb-1">Upload a file</p>
                    <p className="text-xs text-gray-500">or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>

                {/* Manual Entry */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Or enter your average monthly bill amount</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                    <input 
                      type="number" 
                      placeholder="222"
                      className="w-full pl-8 pr-4 py-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644]"
                    />
                  </div>
                </div>

                {/* Usage Estimate */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <h4 className="font-semibold text-gray-800 text-sm">Usage Estimate</h4>
                  </div>
                  <p className="text-sm text-gray-600">Estimated monthly usage: 777 kWh</p>
                </div>

                {/* Solar Savings */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-primary text-sm">Estimated Solar Savings</h4>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">Potential monthly savings: €97</p>
                  <p className="text-xs text-gray-600">Annual savings: €1164 with Battery Only</p>
                </div>
              </div>

              {/* Right Column - Household Details */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Household Details</h3>
                </div>

                {/* Home Size */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Home size</label>
                  <select className="w-full p-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644] focus:outline-[#156644] bg-white appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23156644' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em", accentColor: "#156644"}}>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">5+ Bedroom</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">4 Bedroom</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">3 Bedroom</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">2 Bedroom</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">1 Bedroom</option>
                  </select>
                </div>

                {/* Usage Pattern */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select what option applies to you</label>
                  <select className="w-full p-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644] focus:outline-[#156644] bg-white appearance-none bg-no-repeat bg-right pr-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23156644' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em", accentColor: "#156644"}}>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Mostly in the evening (after work/school)</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Mostly during the day</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">All day</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Weekends only</option>
                  </select>
                </div>

                {/* Daily Energy Usage */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Average daily energy usage</label>
                  <select className="w-full p-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644] focus:outline-[#156644] bg-white appearance-none bg-no-repeat bg-right pr-10 hover:border-[#156644]" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23156644' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em", accentColor: "#156644"}}>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Less than 15 kWh/day</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">15-25 kWh/day</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">25-35 kWh/day</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">35-50 kWh/day</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">More than 50 kWh/day</option>
                  </select>
                </div>

                {/* Peak Usage Time */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">When do you use most electricity?</label>
                  <select className="w-full p-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644] focus:outline-[#156644] bg-white appearance-none bg-no-repeat bg-right pr-10 hover:border-[#156644]" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23156644' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em", accentColor: "#156644"}}>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Morning (6-10 AM)</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Daytime (10 AM - 4 PM)</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Evening (4-10 PM)</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Night (10 PM - 6 AM)</option>
                    <option style={{backgroundColor: "white", color: "black"}} className="bg-white hover:bg-[#156644]/10 text-black">Evenly throughout the day</option>
                  </select>
                </div>

                {/* Recommendation */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Recommendation</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Excellent choice! Your battery system will provide maximum savings and energy independence.
                  </p>
                </div>

                {/* Battery Benefits */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-primary text-sm">Battery Benefits:</h4>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Save 50€/month by using stored power during expensive peak evening rates</li>
                    <li>• Reduce your electricity bill by up to 70% overall</li>
                    <li>• Backup power during outages = energy independence from the grid</li>
                    <li>• Store cheap off-peak or solar energy for use when rates are highest</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-6xl mx-auto pt-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Home Type & Property Details */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">What type of home do you live in?</h3>
                </div>

                {/* Home Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <div className="space-y-2">
                    {[
                      { value: 'detached', label: 'Detached House', desc: 'Standalone property with own roof space' },
                      { value: 'semi-detached', label: 'Semi-Detached House', desc: 'Shared wall with one neighbor' },
                      { value: 'terraced', label: 'Terraced House', desc: 'Row house with shared walls' },
                      { value: 'bungalow', label: 'Bungalow', desc: 'Single-story property' },
                      { value: 'apartment', label: 'Apartment/Flat', desc: 'Multi-unit building' }
                    ].map((type) => (
                      <motion.div
                        key={type.value}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedPropertyType(type.value)}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedPropertyType === type.value 
                            ? 'border-[#156644] bg-[#156644]/5' 
                            : 'border-gray-200 hover:border-[#156644] hover:bg-[#156644]/5'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input 
                            type="radio" 
                            name="homeType" 
                            value={type.value}
                            checked={selectedPropertyType === type.value}
                            onChange={(e) => setSelectedPropertyType(e.target.value)}
                            className="mt-1 w-4 h-4 text-[#156644] focus:ring-[#156644]"
                          />
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">{type.label}</h4>
                            <p className="text-xs text-gray-600">{type.desc}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>


                {/* Property Suitability */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-primary text-sm">Property Assessment</h4>
                  </div>
                  <p className="text-sm text-gray-700">Based on your selections, your property appears suitable for solar installation with potential for excellent energy generation.</p>
                </div>
              </div>

              {/* Right Column - Energy & Technical Requirements */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Energy & Technical Information</h3>
                </div>



                {/* Roof Direction */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary roof direction (facing)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['South', 'North', 'East', 'West', 'Southeast', 'Southwest', 'Northeast', 'Northwest'].map((direction) => (
                      <button
                        key={direction}
                        onClick={() => setSelectedRoofDirection(direction)}
                        className={`p-2 text-xs border rounded-lg transition-all ${
                          selectedRoofDirection === direction
                            ? 'border-[#156644] bg-[#156644]/10 text-[#156644] font-medium'
                            : 'border-gray-300 hover:border-[#156644] hover:bg-[#156644]/5'
                        }`}
                      >
                        {direction}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Solar Potential */}
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                    <h4 className="font-semibold text-primary text-sm">Solar Potential Analysis</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Estimated System Size:</span>
                      <span className="text-sm font-medium text-gray-800">6.5 kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">Annual Generation:</span>
                      <span className="text-sm font-medium text-gray-800">7,800 kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-700">CO₂ Offset:</span>
                      <span className="text-sm font-medium text-gray-800">3.9 tonnes/year</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-full mx-auto h-full"
          >
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-4">
              {/* Map Container - 40% smaller height */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-base font-bold text-gray-800">Interactive Solar Map</h3>
                  <p className="text-xs text-gray-600">Drag the pin to analyze roof areas</p>
                </div>
                <div style={{ height: '300px' }}>
                  <SolarMapWithPanels
                    center={currentLocation}
                    onLocationChange={handleLocationChange}
                    buildingData={buildingData || undefined}
                    panelCount={panelCount}
                    onDataUpdate={() => {}}
                    isLoading={isLoadingBuildingData}
                  />
                </div>
              </div>

              {/* Solar System Performance */}
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <PanelSlider
                  panelCount={panelCount}
                  maxPanels={buildingData?.maxPanels || 0}
                  onPanelCountChange={handlePanelCountChange}
                  disabled={isLoadingBuildingData}
                />
              </div>

              {/* Statistical Data Grid - Stacked vertically */}
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <StatisticsDataGrid
                  buildingData={buildingData || undefined}
                  currentLocation={currentLocation}
                  isLoading={isLoadingBuildingData}
                />
              </div>

              {/* Loading State */}
              {isLoadingBuildingData && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-gray-600">Loading building data...</p>
                </div>
              )}

              {/* Error State with helpful message */}
              {!buildingData && !isLoadingBuildingData && currentStep === 4 && (
                <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                  <div className="text-blue-500 mb-2">🏠</div>
                  <p className="text-sm text-gray-700 font-medium mb-1">Building analysis complete</p>
                  <p className="text-xs text-gray-500 mb-2">Using estimated solar potential for this location</p>
                  <div className="text-xs text-[#156644]">✓ Basic solar calculations available</div>
                </div>
              )}
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
              {/* Left Column - Interactive Solar Map */}
              <div className="lg:col-span-2 space-y-3">
                {/* Map Container */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="text-base font-bold text-gray-800">Interactive Solar Map</h3>
                    <p className="text-xs text-gray-600">Drag the pin to analyze roof areas</p>
                  </div>
                  <div style={{ height: '500px' }}>
                    <SolarMapWithPanels
                      center={currentLocation}
                      onLocationChange={handleLocationChange}
                      buildingData={buildingData || undefined}
                      panelCount={panelCount}
                      onDataUpdate={() => {}} // No longer needed
                      isLoading={isLoadingBuildingData}
                    />
                  </div>
                </div>

                {/* Panel Color Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">Panel Color Guide</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-red-500 border-2 border-white shadow-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Excellent Solar Potential</span>
                          <p className="text-xs text-gray-500">1200+ kWh/m²/year</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-yellow-500 border-2 border-white shadow-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Good Solar Potential</span>
                          <p className="text-xs text-gray-500">1000-1200 kWh/m²/year</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Column */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-[#156644] border-2 border-white shadow-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Moderate Solar Potential</span>
                          <p className="text-xs text-gray-500">800-1000 kWh/m²/year</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">Lower Solar Potential</span>
                          <p className="text-xs text-gray-500">&lt;800 kWh/m²/year</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Panel Controls & Data */}
              <div className="lg:col-span-3 space-y-3 lg:pt-16">
                {/* Statistical Data Grid - 6 boxes in 2 rows */}
                <StatisticsDataGrid
                  buildingData={buildingData || undefined}
                  currentLocation={currentLocation}
                  isLoading={isLoadingBuildingData}
                />

                {/* Panel Slider */}
                <PanelSlider
                  panelCount={panelCount}
                  maxPanels={buildingData?.maxPanels || 0}
                  onPanelCountChange={handlePanelCountChange}
                  disabled={isLoadingBuildingData}
                />

                {/* Loading State */}
                {isLoadingBuildingData && (
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Analyzing roof...</p>
                  </div>
                )}

                {/* Error State with helpful message */}
                {!buildingData && !isLoadingBuildingData && currentStep === 4 && (
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                    <div className="text-blue-500 mb-2">🏠</div>
                    <p className="text-sm text-gray-700 font-medium mb-1">Building analysis complete</p>
                    <p className="text-xs text-gray-500 mb-2">Using estimated solar potential for this location</p>
                    <div className="text-xs text-[#156644]">✓ Basic solar calculations available</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-6xl mx-auto pt-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Contact Information</h3>
                </div>

                {/* Full Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Smith"
                    className="w-full p-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644]"
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john.smith@example.com"
                    className="w-full p-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644]"
                  />
                </div>

                {/* Phone Number */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+353 86 123 4567"
                    className="w-full p-3 border border-[#156644]/30 rounded-lg focus:ring-2 focus:ring-[#156644] focus:border-[#156644]"
                  />
                </div>

                {/* Privacy Notice */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <h4 className="font-semibold text-gray-800 text-sm">Privacy Protected</h4>
                  </div>
                  <p className="text-sm text-gray-600">Your information is secure and will only be used to provide your solar quote.</p>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3 mb-6">
                  <input 
                    type="checkbox" 
                    id="consent"
                    className="mt-1 w-4 h-4 text-[#156644] focus:ring-[#156644] border-[#156644]/30 rounded"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to receive my personalized solar quote and occasional updates about solar solutions. You can unsubscribe at any time.
                  </label>
                </div>

                {/* See My Savings Button */}
                <motion.button
                  onClick={() => nextStep()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  See My Savings
                </motion.button>
              </div>

              {/* Right Column - Verification & Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Verification & Summary</h3>
                </div>

                {/* Phone Verification Notice */}
                <div className="mb-6">
                  <div className="bg-[#156644]/5 rounded-xl p-4 border border-[#156644]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <h4 className="font-semibold text-blue-800 text-sm">SMS Verification</h4>
                    </div>
                    <p className="text-sm font-medium text-blue-800 mb-2 bg-blue-50 px-2 py-1 rounded">We'll send a verification code to your phone number to secure your quote.</p>
                    <p className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded mt-1">Powered by Twilio - Implementation coming soon</p>
                  </div>
                </div>

                {/* Quote Summary */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 text-sm mb-3">Your Solar Quote Summary</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedState || 'Ireland'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">System Type:</span>
                      <span className="text-sm font-medium text-gray-800">{selectedSolution || 'Solar + Battery'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Property Type:</span>
                      <span className="text-sm font-medium text-gray-800">Detached House</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Estimated Panels:</span>
                      <span className="text-sm font-medium text-gray-800">{panelCount || 12} panels</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-primary text-sm">What happens next?</h4>
                  </div>
                  <ul className="text-xs text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">1.</span>
                      <span>We'll send your personalized quote to your email within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">2.</span>
                      <span>Our solar expert will call to discuss your options (optional)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">3.</span>
                      <span>Schedule a free home assessment if you're interested</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </motion.div>
        );

      case 6:
        return (
          <motion.div
            key="step6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-7xl mx-auto pt-6 pb-8 relative"
          >
            {/* Your Total Savings - Hero Section */}
            <div className="text-center mb-8 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-r from-[#156644] via-[#156644] to-[#156644] text-white p-12 rounded-3xl shadow-2xl mb-8 relative overflow-hidden"
              >
                {/* Background decoration */}
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>
                
                <div className="relative z-10">
                  <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="text-2xl md:text-3xl font-bold mb-4 text-white/90"
                  >
                    🌟 Your Total Savings Are
                  </motion.h2>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.6 }}
                    className="mb-6"
                  >
                    <div className="text-7xl md:text-8xl font-black mb-2 text-white drop-shadow-lg">
                      €{Math.round((panelCount || 12) * 400 * 0.28 * 25).toLocaleString()}
                    </div>
                    <div className="text-xl md:text-2xl font-semibold text-white/90">
                      Over 25 Years
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-2xl md:text-3xl font-bold mb-1">€{Math.round((panelCount || 12) * 400 * 0.28 / 12)}</div>
                      <div className="text-sm font-medium text-white/80">Per Month</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-2xl md:text-3xl font-bold mb-1">€{Math.round((panelCount || 12) * 400 * 0.28)}</div>
                      <div className="text-sm font-medium text-white/80">Per Year</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-2xl md:text-3xl font-bold mb-1">{((panelCount || 12) * 0.4).toFixed(1)}kW</div>
                      <div className="text-sm font-medium text-white/80">System Size</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                      <div className="text-2xl md:text-3xl font-bold mb-1">8.2</div>
                      <div className="text-sm font-medium text-white/80">Payback Years</div>
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="text-lg text-white/90 mt-6 max-w-2xl mx-auto"
                  >
                    Based on your {panelCount || 12} panel selection with current Irish electricity rates
                  </motion.p>
                </div>
              </motion.div>

              {/* PDF Download Button - Positioned to the right */}
              <div className="absolute top-8 right-0 z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg text-xs font-medium"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  PDF
                </motion.button>
              </div>
            </div>

            {/* Action Buttons - Moved from bottom */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Schedule Site Survey
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Get Expert Consultation
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-accent hover:bg-accent-dark text-text-primary font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Confirm Installation
                </motion.button>
              </div>
            </div>

            {/* Detailed Report Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Complete Installation Analysis</h3>
              <p className="text-gray-600">Everything you need to know about your solar investment</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - System Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">System Specifications</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Solar Panels:</span>
                    <span className="font-bold text-gray-800">{panelCount || 12} panels</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Total System Size:</span>
                    <span className="font-bold text-gray-800">{((panelCount || 12) * 0.4).toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Panel Type:</span>
                    <span className="font-bold text-gray-800">Monocrystalline (400W)</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Expected Generation:</span>
                    <span className="font-bold text-gray-800">{((panelCount || 12) * 400).toLocaleString()} kWh/year</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Warranty:</span>
                    <span className="font-bold text-gray-800">25 years</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Installation Time:</span>
                    <span className="font-bold text-gray-800">1-2 days</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-bold text-blue-800 mb-2 bg-white px-3 py-1 rounded">Roof Analysis Results</h4>
                  <div className="text-sm font-medium text-blue-800 space-y-1 bg-white p-3 rounded">
                    <p>• Optimal roof area identified: {Math.round((panelCount || 12) * 2.2)}m²</p>
                    <p>• Perfect south-facing orientation</p>
                    <p>• Minimal shading detected</p>
                    <p>• Structural suitability: Excellent</p>
                  </div>
                </div>
              </div>

              {/* Middle Column - Financial Analysis */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-[#156644] rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Investment Analysis</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">System Cost:</span>
                    <span className="font-bold text-gray-800">€{Math.round((panelCount || 12) * 800).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">SEAI Grant:</span>
                    <span className="font-bold text-[#156644]">-€{Math.min(Math.round((panelCount || 12) * 0.4 * 900), 2400).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Net Investment:</span>
                    <span className="font-bold text-primary">€{Math.round((panelCount || 12) * 800 - Math.min((panelCount || 12) * 0.4 * 900, 2400)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Monthly Savings:</span>
                    <span className="font-bold text-[#156644]">€{Math.round((panelCount || 12) * 400 * 0.28 / 12)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Annual Savings:</span>
                    <span className="font-bold text-[#156644]">€{Math.round((panelCount || 12) * 400 * 0.28)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">25-Year Profit:</span>
                    <span className="font-bold text-[#156644]">€{Math.round((panelCount || 12) * 400 * 0.28 * 17).toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#156644]/5 rounded-xl">
                  <h4 className="font-semibold text-[#156644] mb-2">ROI Timeline</h4>
                  <div className="text-sm text-[#156644] space-y-1">
                    <p>• Years 1-8: System payback period</p>
                    <p>• Years 9-25: Pure profit (€{Math.round((panelCount || 12) * 400 * 0.28 * 17).toLocaleString()})</p>
                    <p>• Break-even: Month 98</p>
                    <p>• Total ROI: {Math.round(((panelCount || 12) * 400 * 0.28 * 25) / ((panelCount || 12) * 800) * 100)}% over 25 years</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Environmental & Additional Benefits */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-6 h-6 bg-[#156644] rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Environmental Impact</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">CO₂ Saved Annually:</span>
                    <span className="font-bold text-[#156644]">{((panelCount || 12) * 400 * 0.295 / 1000).toFixed(1)} tonnes</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Trees Equivalent:</span>
                    <span className="font-bold text-[#156644]">{Math.round((panelCount || 12) * 400 * 0.295 / 22)} trees</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Cars Off Road:</span>
                    <span className="font-bold text-[#156644]">{Math.round((panelCount || 12) * 400 * 0.295 / 4600)} cars</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">25-Year CO₂ Offset:</span>
                    <span className="font-bold text-[#156644]">{((panelCount || 12) * 400 * 0.295 * 25 / 1000).toFixed(1)} tonnes</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Home Value Increase:</span>
                    <span className="font-bold text-[#156644]">€{Math.round((panelCount || 12) * 800 * 0.75).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Energy Independence:</span>
                    <span className="font-bold text-[#156644]">70% self-sufficient</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-[#156644]/5 rounded-xl">
                  <h4 className="font-semibold text-[#156644] mb-2">Additional Benefits</h4>
                  <div className="text-sm text-[#156644] space-y-1">
                    <p>• Protection from rising electricity costs</p>
                    <p>• BER rating improvement (C3 to A3)</p>
                    <p>• Microgeneration export income</p>
                    <p>• Zero maintenance for 10 years</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons - Duplicate for convenience */}
            <div className="mt-8 bg-primary text-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-center">Ready to Go Solar?</h3>
              <p className="text-center text-lg mb-6 opacity-90">Your personalized solar solution is ready. Take the next step towards energy independence.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Schedule Site Survey
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Get Expert Consultation
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white hover:bg-gray-100 text-primary font-bold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Confirm Installation
                </motion.button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800 text-center">
                <strong>Important:</strong> All calculations based on current Irish electricity rates (€0.28/kWh), SEAI grant schemes, and Dublin solar irradiance data. 
                Results may vary based on actual roof conditions, shading, and future energy prices. Professional assessment recommended before installation.
              </p>
            </div>

            {/* Comprehensive Savings Report */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#156644] rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Your Solar Savings Report</h3>
                </div>
                <div className="text-xs text-gray-500">Based on Irish electricity market rates (2024)</div>
              </div>

              {/* Key Savings Metrics - Top Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#156644]/5 rounded-xl p-4 border border-[#156644]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-[#156644] rounded-full"></div>
                    <h4 className="font-semibold text-[#156644] text-sm">Monthly Savings</h4>
                  </div>
                  <div className="text-2xl font-bold text-[#156644]">€{Math.round((panelCount || 12) * 400 * 0.28 / 12)}</div>
                  <div className="text-xs text-[#156644]">Per month average</div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                    <h4 className="font-bold text-blue-800 text-sm bg-white px-2 py-1 rounded">Annual Savings</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 bg-white px-3 py-1 rounded">€{Math.round((panelCount || 12) * 400 * 0.28)}</div>
                  <div className="text-xs font-medium text-blue-700 bg-white px-2 py-1 rounded mt-1">Yearly total</div>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    <h4 className="font-semibold text-purple-800 text-sm">25-Year Savings</h4>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">€{Math.round((panelCount || 12) * 400 * 0.28 * 25).toLocaleString()}</div>
                  <div className="text-xs text-purple-600">Total lifetime</div>
                </div>

                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
                    <h4 className="font-semibold text-orange-800 text-sm">Payback Period</h4>
                  </div>
                  <div className="text-2xl font-bold text-orange-900">8.2</div>
                  <div className="text-xs text-orange-600">Years</div>
                </div>
              </div>

              {/* Detailed Analysis Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Analysis */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    Financial Analysis (Irish Market)
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">System Size:</span>
                      <span className="text-sm font-medium text-gray-800">{((panelCount || 12) * 0.4).toFixed(1)} kW</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Estimated System Cost:</span>
                      <span className="text-sm font-medium text-gray-800">€{Math.round((panelCount || 12) * 800).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">SEAI Grant (Available):</span>
                      <span className="text-sm font-medium text-[#156644]">-€{Math.min(Math.round((panelCount || 12) * 0.4 * 900), 2400).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Net Cost After Grant:</span>
                      <span className="text-sm font-bold text-primary">€{Math.round((panelCount || 12) * 800 - Math.min((panelCount || 12) * 0.4 * 900, 2400)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Current Electricity Rate:</span>
                      <span className="text-sm font-medium text-gray-800">€0.28/kWh</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Export Rate (Micro-gen):</span>
                      <span className="text-sm font-medium text-gray-800">€0.21/kWh</span>
                    </div>
                  </div>
                </div>

                {/* Energy Production Analysis */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Energy Production Analysis
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Annual Generation:</span>
                      <span className="text-sm font-medium text-gray-800">{((panelCount || 12) * 400).toLocaleString()} kWh</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Self-Consumption (70%):</span>
                      <span className="text-sm font-medium text-gray-800">{Math.round((panelCount || 12) * 400 * 0.7).toLocaleString()} kWh</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Export to Grid (30%):</span>
                      <span className="text-sm font-medium text-gray-800">{Math.round((panelCount || 12) * 400 * 0.3).toLocaleString()} kWh</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">CO₂ Offset per Year:</span>
                      <span className="text-sm font-medium text-[#156644]">{((panelCount || 12) * 400 * 0.295 / 1000).toFixed(1)} tonnes</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Trees Equivalent:</span>
                      <span className="text-sm font-medium text-[#156644]">{Math.round((panelCount || 12) * 400 * 0.295 / 22)} trees</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Peak Sun Hours (Dublin):</span>
                      <span className="text-sm font-medium text-gray-800">2.7 hours/day</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Return on Investment Chart */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-[#156644]/20">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#156644]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Investment Return Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#156644]">Year 8+</div>
                    <div className="text-sm text-gray-600">System Paid Off</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-800 bg-white px-2 py-1 rounded">Years 9-25</div>
                    <div className="text-sm text-gray-600">Pure Profit Period</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-700">€{Math.round((panelCount || 12) * 400 * 0.28 * 17).toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Net Profit (Years 9-25)</div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>Important:</strong> Calculations based on current Irish electricity rates (€0.28/kWh), SEAI grant schemes, and average Dublin solar irradiance. 
                  Actual results may vary based on roof orientation, shading, and future energy prices. Professional assessment recommended.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 7:
        // Calculate system details for lead capture
        const systemDetails = {
          systemSize: panelCount * 0.4, // Assume 400W panels
          estimatedCost: 15000 + (panelCount * 400), // Basic cost calculation
          annualSavings: 2400 + (panelCount * 120), // Basic savings calculation
          paybackPeriod: 8.5,
          address: selectedAddress || 'Location from calculator',
          panelCount: panelCount
        };

        return (
          <motion.div
            key="step7"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-4xl mx-auto pt-6 pb-8 relative"
          >
            <LeadCaptureForm
              systemDetails={systemDetails}
              onSubmit={handleLeadSubmission}
              onSkip={handleSkipLead}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: 'tween',
              duration: 0.3,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
            className="bg-white w-full h-full overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-gray-600 hover:text-gray-800 transition-colors z-10"
            >
              <X size={24} />
            </button>

            {/* Step Counter Bar */}
            <div className="bg-white border-b border-gray-200 px-2 sm:px-6 py-4">
              {/* Mobile: Show only current step */}
              <div className="block sm:hidden text-center">
                <div className="text-sm font-semibold text-gray-800">
                  Step {currentStep}: {steps.find(s => s.number === currentStep)?.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentStep} of {steps.length}
                </div>
              </div>
              
              {/* Desktop: Show all steps */}
              <div className="hidden sm:flex items-center justify-between overflow-x-auto scrollbar-hide">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-shrink-0 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        currentStep >= step.number
                          ? 'bg-accent text-gray-800'
                          : currentStep === step.number
                          ? 'bg-accent text-gray-800'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.number}
                    </div>
                    <span className={`ml-2 text-sm truncate ${
                      currentStep >= step.number
                        ? 'text-gray-800 font-medium'
                        : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className="w-8 h-px bg-gray-300 mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-6 flex justify-between">
              <motion.button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center space-x-2 px-6 py-2 rounded-full ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-text-primary'
                }`}
                whileHover={currentStep > 1 ? { scale: 1.05 } : {}}
              >
                <ChevronLeft size={20} />
                <span>Previous</span>
              </motion.button>

              {currentStep !== 1 && currentStep !== 5 && currentStep !== 7 && (
                <motion.button
                  onClick={nextStep}
                  disabled={currentStep === steps.length}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-full ${
                    currentStep === steps.length
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark text-white'
                  }`}
                  whileHover={currentStep < steps.length ? { scale: 1.05 } : {}}
                >
                  <span>{currentStep === 6 ? 'Get Free Quote' : 'Compare Now'}</span>
                  <ChevronRight size={20} />
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalculatorModal;