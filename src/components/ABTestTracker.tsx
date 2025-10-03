'use client';

import { useEffect, useState } from 'react';
import { initializeABTesting, trackConversion, ABTestAssignment } from '@/lib/ab-testing-client';

interface ABTestTrackerProps {
  children?: React.ReactNode;
  currentUrl?: string;
  onAssignment?: (assignment: ABTestAssignment | null) => void;
  autoInitialize?: boolean;
}

export default function ABTestTracker({ 
  children, 
  currentUrl, 
  onAssignment,
  autoInitialize = true 
}: ABTestTrackerProps) {
  const [assignment, setAssignment] = useState<ABTestAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!autoInitialize) return;

    const initializeAB = async () => {
      try {
        setIsLoading(true);
        const client = initializeABTesting();
        const result = await client.initialize(currentUrl);
        
        setAssignment(result);
        onAssignment?.(result);
      } catch (error) {
        console.error('A/B testing initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAB();
  }, [currentUrl, onAssignment, autoInitialize]);

  // Don't render anything if loading or no assignment
  if (isLoading || !assignment) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

// Hook for A/B testing
export function useABTest(url?: string) {
  const [assignment, setAssignment] = useState<ABTestAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAB = async () => {
      try {
        setIsLoading(true);
        const client = initializeABTesting();
        const result = await client.initialize(url);
        setAssignment(result);
      } catch (error) {
        console.error('A/B testing initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAB();
  }, [url]);

  const trackConversionEvent = async (type: string, value?: number, metadata?: any) => {
    return await trackConversion(type, value, metadata);
  };

  return {
    assignment,
    isLoading,
    isVariantA: assignment?.variant === 'A',
    isVariantB: assignment?.variant === 'B',
    trackConversion: trackConversionEvent
  };
}

// Component for variant-specific content
interface VariantContentProps {
  variant: 'A' | 'B';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function VariantContent({ variant, children, fallback }: VariantContentProps) {
  const { assignment, isLoading } = useABTest();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!assignment || assignment.variant !== variant) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Component for conversion tracking on form submissions
interface ConversionFormProps {
  children: React.ReactNode;
  conversionType: string;
  conversionValue?: number;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function ConversionForm({ 
  children, 
  conversionType, 
  conversionValue, 
  onSubmit,
  className 
}: ConversionFormProps) {
  const { trackConversion } = useABTest();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track conversion
    await trackConversion(conversionType, conversionValue, {
      formSubmission: true,
      timestamp: new Date().toISOString()
    });

    // Call original onSubmit if provided
    onSubmit?.(e);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}

// Component for conversion tracking on button clicks
interface ConversionButtonProps {
  children: React.ReactNode;
  conversionType: string;
  conversionValue?: number;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ConversionButton({ 
  children, 
  conversionType, 
  conversionValue, 
  onClick,
  className,
  disabled 
}: ConversionButtonProps) {
  const { trackConversion } = useABTest();

  const handleClick = async () => {
    // Track conversion
    await trackConversion(conversionType, conversionValue, {
      buttonClick: true,
      timestamp: new Date().toISOString()
    });

    // Call original onClick if provided
    onClick?.();
  };

  return (
    <button 
      onClick={handleClick} 
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}