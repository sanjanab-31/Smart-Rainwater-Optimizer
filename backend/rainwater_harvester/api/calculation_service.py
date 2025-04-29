"""
Calculation service for rainwater harvesting optimization.
"""
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from sklearn.linear_model import LinearRegression
from .weather_service import get_weather_forecast
import logging

# Set up logging
logger = logging.getLogger(__name__)

def calculate_inflow(rainfall, roof_area):
    """
    Calculate inflow based on rainfall, roof area, and efficiency factor.
    
    Formula: Inflow = Rainfall (mm) × Roof Area (m²) × 0.9
    """
    try:
        efficiency = 0.9  # 90% efficiency factor
        return rainfall * roof_area * efficiency
    except Exception as e:
        logger.error(f"Error calculating inflow: {str(e)}")
        # Fallback to a safe calculation
        return max(0, rainfall) * max(0, roof_area) * 0.9

def detect_leak(inflow, outflow, threshold=0.2):
    """
    Check for potential leaks by comparing expected and actual outflow.
    
    If actual outflow significantly exceeds expected outflow, suspect a leak.
    """
    try:
        # Ensure we're working with positive values
        inflow = max(0.1, inflow)  # Avoid division by zero
        outflow = max(0, outflow)
        
        difference = outflow - inflow
        ratio = difference / inflow
        
        return {
            'isLeaking': ratio > threshold,
            'difference': difference if difference > 0 else 0,
            'severity': 'high' if ratio > 0.5 else 'medium' if ratio > 0.3 else 'low'
        }
    except Exception as e:
        logger.error(f"Error detecting leak: {str(e)}")
        # Fallback to a safe default
        return {
            'isLeaking': False,
            'difference': 0,
            'severity': 'low'
        }

def calculate_roi(water_saved, water_cost_per_liter, setup_cost, maintenance_cost):
    """
    Calculate ROI based on water saved and costs.
    
    Formula: ROI = (Water Saved in Liters × Local Water Cost per Liter) - (Setup + Maintenance Costs)
    """
    try:
        # Ensure we're working with positive values
        water_saved = max(0, water_saved)
        water_cost_per_liter = max(0, water_cost_per_liter)
        setup_cost = max(0, setup_cost)
        maintenance_cost = max(0, maintenance_cost)
        
        savings = water_saved * water_cost_per_liter
        costs = setup_cost + maintenance_cost
        roi = savings - costs
        
        # Calculate payback period (in days)
        if savings > 0:
            payback_period = costs / (savings / 365)
        else:
            payback_period = 0
        
        return {
            'roi': roi,
            'savings': savings,
            'costs': costs,
            'paybackPeriod': payback_period
        }
    except Exception as e:
        logger.error(f"Error calculating ROI: {str(e)}")
        # Fallback to a safe default
        return {
            'roi': 0,
            'savings': 0,
            'costs': setup_cost + maintenance_cost,
            'paybackPeriod': 0
        }

def optimize_water_usage(rainfall_prediction, tank_capacity, current_level):
    """
    Recommend optimal water usage based on rainfall predictions and tank capacity.
    
    Uses AI-based optimization to allocate water for drinking, cleaning, and gardening.
    """
    try:
        # Calculate tank fill percentage
        tank_capacity = max(1, tank_capacity)  # Avoid division by zero
        current_level = max(0, min(current_level, tank_capacity))  # Ensure valid level
        fill_percentage = (current_level / tank_capacity) * 100
        
        # Define allocation strategies based on conditions
        allocation = {
            'drinking': 0,
            'cleaning': 0,
            'gardening': 0
        }
        
        # High rainfall prediction
        if rainfall_prediction > 50:
            allocation = {
                'drinking': 20,
                'cleaning': 30,
                'gardening': 50
            }
        # Low rainfall prediction
        elif rainfall_prediction < 20:
            allocation = {
                'drinking': 40,
                'cleaning': 40,
                'gardening': 20
            }
        # Moderate rainfall prediction
        else:
            allocation = {
                'drinking': 30,
                'cleaning': 40,
                'gardening': 30
            }
        
        # Adjust based on tank level
        if fill_percentage > 80:
            # Tank near full - increase usage
            allocation['gardening'] += 10
            allocation['cleaning'] += 5
            allocation['drinking'] -= 15
        elif fill_percentage < 20:
            # Tank near empty - reduce non-essential usage
            allocation['gardening'] -= 15
            allocation['cleaning'] -= 5
            allocation['drinking'] += 20
        
        # Ensure no negative values and total is 100%
        for key in allocation:
            allocation[key] = max(0, allocation[key])
        
        total = sum(allocation.values())
        
        if total > 0:
            for key in allocation:
                allocation[key] = round((allocation[key] / total) * 100)
        else:
            # Fallback to default allocation
            allocation = {
                'drinking': 33,
                'cleaning': 33,
                'gardening': 34
            }
        
        return allocation
    except Exception as e:
        logger.error(f"Error optimizing water usage: {str(e)}")
        # Fallback to a safe default allocation
        return {
            'drinking': 33,
            'cleaning': 33,
            'gardening': 34
        }

def recommend_tank_size(average_rainfall, roof_area, daily_consumption):
    """
    Recommend optimal tank size based on rainfall, roof area, and consumption.
    """
    try:
        # Ensure we're working with positive values
        average_rainfall = max(0, average_rainfall)
        roof_area = max(0, roof_area)
        daily_consumption = max(0, daily_consumption)
        
        # Calculate monthly inflow
        monthly_inflow = calculate_inflow(average_rainfall * 30, roof_area)  # 30 days
        
        # Calculate monthly consumption
        monthly_consumption = daily_consumption * 30
        
        # Base recommendation on 2 months of storage
        recommended_size = max(monthly_inflow, monthly_consumption) * 2
        
        # Round up to nearest standard size
        standard_sizes = [500, 1000, 2000, 3000, 5000, 7500, 10000]
        
        for size in standard_sizes:
            if size >= recommended_size:
                recommended_size = size
                break
        
        # If larger than biggest standard size, round to nearest 5000
        if recommended_size > standard_sizes[-1]:
            recommended_size = np.ceil(recommended_size / 5000) * 5000
        
        return {
            'recommendedSize': int(recommended_size),
            'monthlyInflow': monthly_inflow,
            'monthlyConsumption': monthly_consumption
        }
    except Exception as e:
        logger.error(f"Error recommending tank size: {str(e)}")
        # Fallback to a safe default
        return {
            'recommendedSize': 5000,  # Default 5000 liter tank
            'monthlyInflow': 0,
            'monthlyConsumption': 0
        }

def generate_maintenance_schedule(current_date=None):
    """
    Generate maintenance schedule for tank cleaning and system inspection.
    """
    try:
        if current_date is None:
            current_date = datetime.now()
        
        schedule = []
        
        # Generate cleaning reminders for the next year (every 3 months)
        for i in range(4):
            reminder_date = current_date + timedelta(days=(i + 1) * 90)
            
            schedule.append({
                'type': 'cleaning',
                'date': reminder_date.strftime('%Y-%m-%d'),
                'description': 'Regular tank cleaning'
            })
        
        # Generate inspection reminders (every 2 months)
        for i in range(6):
            reminder_date = current_date + timedelta(days=(i + 1) * 60)
            
            schedule.append({
                'type': 'inspection',
                'date': reminder_date.strftime('%Y-%m-%d'),
                'description': 'Leak inspection and system check'
            })
        
        # Sort by date
        schedule.sort(key=lambda x: x['date'])
        
        return schedule
    except Exception as e:
        logger.error(f"Error generating maintenance schedule: {str(e)}")
        # Fallback to a safe default
        current_date = datetime.now()
        return [
            {
                'type': 'cleaning',
                'date': (current_date + timedelta(days=90)).strftime('%Y-%m-%d'),
                'description': 'Regular tank cleaning'
            },
            {
                'type': 'inspection',
                'date': (current_date + timedelta(days=60)).strftime('%Y-%m-%d'),
                'description': 'Leak inspection and system check'
            }
        ]

def process_inputs(input_data):
    """
    Process user inputs and generate results.
    """
    try:
        logger.info("Starting process_inputs with data")
        
        # Extract input values
        roof_area = input_data.get('roofArea', 0)
        outflow = input_data.get('outflow', 0)
        location = input_data.get('location', '')
        tank_capacity = input_data.get('tankCapacity', 0)
        water_cost_per_liter = input_data.get('waterCostPerLiter', 0.002)
        setup_cost = input_data.get('setupCost', 5000)
        maintenance_cost = input_data.get('maintenanceCost', 500)
        
        logger.info(f"Extracted input values - roof_area: {roof_area}, outflow: {outflow}, location: {location}, tank_capacity: {tank_capacity}")
        
        # Get weather forecast
        logger.info(f"Getting weather forecast for location: {location}")
        weather_data = get_weather_forecast(location)
        logger.info(f"Weather data received with average rainfall: {weather_data.get('averageRainfall', 0)}")
        average_rainfall = weather_data.get('averageRainfall', 0)
        
        # Calculate daily inflow
        logger.info(f"Calculating inflow with rainfall: {average_rainfall}, roof area: {roof_area}")
        daily_inflow = calculate_inflow(average_rainfall, roof_area)
        logger.info(f"Daily inflow calculated: {daily_inflow}")
        
        # Calculate monthly inflow
        monthly_inflow = daily_inflow * 30
        
        # Calculate yearly inflow
        yearly_inflow = daily_inflow * 365
        
        # Detect potential leaks
        logger.info(f"Detecting leaks with inflow: {daily_inflow}, outflow: {outflow}")
        leak_detection = detect_leak(daily_inflow, outflow)
        logger.info(f"Leak detection result: {leak_detection}")
        
        # Calculate ROI
        logger.info(f"Calculating ROI with yearly inflow: {yearly_inflow}")
        roi = calculate_roi(yearly_inflow, water_cost_per_liter, setup_cost, maintenance_cost)
        logger.info(f"ROI calculation result: {roi}")
        
        # Optimize water usage
        # Assume current level is 50% of capacity for initial calculation
        current_level = tank_capacity * 0.5
        logger.info(f"Optimizing water usage with rainfall: {average_rainfall}, tank capacity: {tank_capacity}")
        water_usage = optimize_water_usage(average_rainfall, tank_capacity, current_level)
        logger.info(f"Water usage optimization result: {water_usage}")
        
        # Recommend tank size
        logger.info(f"Recommending tank size with rainfall: {average_rainfall}, roof area: {roof_area}, outflow: {outflow}")
        tank_recommendation = recommend_tank_size(average_rainfall, roof_area, outflow)
        logger.info(f"Tank recommendation result: {tank_recommendation}")
        
        # Generate maintenance schedule
        maintenance_schedule = generate_maintenance_schedule()
        
        # Prepare results
        logger.info("Preparing final results")
        results = {
            'inputs': input_data,
            'timestamp': datetime.now().isoformat(),
            'inflow': {
                'dailyInflow': daily_inflow,
                'monthlyInflow': monthly_inflow,
                'yearlyInflow': yearly_inflow
            },
            'leakDetection': leak_detection,
            'roi': roi,
            'waterUsage': water_usage,
            'tankRecommendation': tank_recommendation,
            'maintenanceSchedule': maintenance_schedule,
            'weatherData': weather_data
        }
        
        logger.info("Process inputs completed successfully")
        return results
    except Exception as e:
        logger.error(f"Error in process_inputs: {str(e)}", exc_info=True)
        # Create a fallback result with default values
        default_results = {
            'inputs': input_data,
            'timestamp': datetime.now().isoformat(),
            'inflow': {
                'dailyInflow': 0,
                'monthlyInflow': 0,
                'yearlyInflow': 0
            },
            'leakDetection': {
                'isLeaking': False,
                'difference': 0,
                'severity': 'low'
            },
            'roi': {
                'roi': 0,
                'savings': 0,
                'costs': 0,
                'paybackPeriod': 0
            },
            'waterUsage': {
                'drinking': 33,
                'cleaning': 33,
                'gardening': 34
            },
            'tankRecommendation': {
                'recommendedSize': 5000,
                'monthlyInflow': 0,
                'monthlyConsumption': 0
            },
            'maintenanceSchedule': [
                {
                    'type': 'cleaning',
                    'date': (datetime.now() + timedelta(days=90)).strftime('%Y-%m-%d'),
                    'description': 'Regular tank cleaning'
                },
                {
                    'type': 'inspection',
                    'date': (datetime.now() + timedelta(days=60)).strftime('%Y-%m-%d'),
                    'description': 'Leak inspection and system check'
                }
            ],
            'weatherData': {
                'forecast': [
                    {
                        'date': datetime.now().strftime('%Y-%m-%d'),
                        'rainfall': 2.0
                    }
                ],
                'averageRainfall': 2.0,
                'note': 'Using default values due to calculation error'
            },
            'error': str(e)
        }
        logger.info("Returning fallback results due to error")
        return default_results
