/**
 * Utility functions for rainwater harvesting calculations
 */

// Calculate inflow based on rainfall, roof area, and efficiency factor
export const calculateInflow = (rainfall, roofArea) => {
  // Inflow = Rainfall (mm) × Roof Area (m²) × 0.9
  const efficiency = 0.9; // 90% efficiency factor
  return rainfall * roofArea * efficiency;
};

// Check for potential leaks by comparing expected and actual outflow
export const detectLeak = (inflow, outflow, threshold = 0.2) => {
  // If actual outflow significantly exceeds expected outflow, suspect a leak
  const difference = outflow - inflow;
  const ratio = difference / inflow;
  
  return {
    isLeaking: ratio > threshold,
    difference: difference > 0 ? difference : 0,
    severity: ratio > 0.5 ? 'high' : ratio > 0.3 ? 'medium' : 'low'
  };
};

// Calculate ROI based on water saved and costs
export const calculateROI = (waterSaved, waterCostPerLiter, setupCost, maintenanceCost) => {
  // ROI = (Water Saved in Liters × Local Water Cost per Liter) - (Setup + Maintenance Costs)
  const savings = waterSaved * waterCostPerLiter;
  const costs = setupCost + maintenanceCost;
  const roi = savings - costs;
  
  return {
    roi,
    savings,
    costs,
    paybackPeriod: costs > 0 ? costs / (savings / 365) : 0 // in days
  };
};

// Recommend optimal water usage based on rainfall predictions and tank capacity
export const optimizeWaterUsage = (rainfallPrediction, tankCapacity, currentLevel) => {
  // Calculate tank fill percentage
  const fillPercentage = (currentLevel / tankCapacity) * 100;
  
  // Define allocation strategies based on conditions
  let allocation = {
    drinking: 0,
    cleaning: 0,
    gardening: 0
  };
  
  // High rainfall prediction
  if (rainfallPrediction > 50) {
    allocation = {
      drinking: 20,
      cleaning: 30,
      gardening: 50
    };
  } 
  // Low rainfall prediction
  else if (rainfallPrediction < 20) {
    allocation = {
      drinking: 40,
      cleaning: 40,
      gardening: 20
    };
  }
  // Moderate rainfall prediction
  else {
    allocation = {
      drinking: 30,
      cleaning: 40,
      gardening: 30
    };
  }
  
  // Adjust based on tank level
  if (fillPercentage > 80) {
    // Tank near full - increase usage
    allocation.gardening += 10;
    allocation.cleaning += 5;
    allocation.drinking -= 15;
  } else if (fillPercentage < 20) {
    // Tank near empty - reduce non-essential usage
    allocation.gardening -= 15;
    allocation.cleaning -= 5;
    allocation.drinking += 20;
  }
  
  // Ensure no negative values and total is 100%
  Object.keys(allocation).forEach(key => {
    allocation[key] = Math.max(0, allocation[key]);
  });
  
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  
  Object.keys(allocation).forEach(key => {
    allocation[key] = Math.round((allocation[key] / total) * 100);
  });
  
  return allocation;
};

// Recommend optimal tank size based on rainfall, roof area, and consumption
export const recommendTankSize = (averageRainfall, roofArea, dailyConsumption) => {
  // Calculate monthly inflow
  const monthlyInflow = calculateInflow(averageRainfall * 30, roofArea); // 30 days
  
  // Calculate monthly consumption
  const monthlyConsumption = dailyConsumption * 30;
  
  // Base recommendation on 2 months of storage
  let recommendedSize = Math.max(monthlyInflow, monthlyConsumption) * 2;
  
  // Round up to nearest standard size
  const standardSizes = [500, 1000, 2000, 3000, 5000, 7500, 10000];
  
  for (const size of standardSizes) {
    if (size >= recommendedSize) {
      recommendedSize = size;
      break;
    }
  }
  
  // If larger than biggest standard size, round to nearest 5000
  if (recommendedSize > standardSizes[standardSizes.length - 1]) {
    recommendedSize = Math.ceil(recommendedSize / 5000) * 5000;
  }
  
  return recommendedSize;
};

// Generate maintenance schedule
export const generateMaintenanceSchedule = (currentDate = new Date()) => {
  const schedule = [];
  
  // Generate cleaning reminders for the next year (every 3 months)
  for (let i = 0; i < 4; i++) {
    const reminderDate = new Date(currentDate);
    reminderDate.setMonth(currentDate.getMonth() + (i + 1) * 3);
    
    schedule.push({
      type: 'cleaning',
      date: reminderDate.toISOString().split('T')[0],
      description: 'Regular tank cleaning'
    });
  }
  
  // Generate inspection reminders (every 2 months)
  for (let i = 0; i < 6; i++) {
    const reminderDate = new Date(currentDate);
    reminderDate.setMonth(currentDate.getMonth() + (i + 1) * 2);
    
    schedule.push({
      type: 'inspection',
      date: reminderDate.toISOString().split('T')[0],
      description: 'Leak inspection and system check'
    });
  }
  
  return schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
};
