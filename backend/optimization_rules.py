"""
Rule-Based Optimization Engine Module

This module loads the smart home energy ontology and generates
optimization suggestions based on current usage patterns and time-of-use pricing.
"""

from rdflib import Graph, Namespace, Literal
from rdflib.plugins.sparql import prepareQuery
from datetime import datetime
import os

# Global ontology graph
KNOWLEDGE_GRAPH = None

# Define the smart energy namespace
SMART_ENERGY = Namespace("http://smartenergy.org/ontology#")

# Appliances to monitor (can be extended based on household_id)
MONITORED_APPLIANCES = ['household_1', 'household_2', 'household_3', 'household_4', 'household_5']

# Energy consumption thresholds (in kWh converted to Watts for comparison)
THRESHOLD_HIGH = 0.150  # 150 Wh per 5-min reading
THRESHOLD_MEDIUM = 0.100  # 100 Wh per 5-min reading


def load_ontology_graph():
    """
    Load the RDF ontology file into an rdflib Graph.
    This should be called once during Flask app initialization.
    
    Returns:
        Graph: The loaded RDF graph, or None if loading fails
    """
    global KNOWLEDGE_GRAPH
    
    ontology_path = os.path.join(os.path.dirname(__file__), 'smart_home_ontology.ttl')
    
    try:
        KNOWLEDGE_GRAPH = Graph()
        KNOWLEDGE_GRAPH.parse(ontology_path, format='turtle')
        print(f"✓ Ontology loaded successfully: {len(KNOWLEDGE_GRAPH)} triples")
        return KNOWLEDGE_GRAPH
    except FileNotFoundError:
        print(f"✗ Ontology file not found at {ontology_path}")
        return None
    except Exception as e:
        print(f"✗ Error loading ontology: {e}")
        return None


def get_current_time_slot():
    """
    Determine the current time slot based on ontology definitions.
    
    Time slots:
    - PeakHours: 17:00 - 21:00 (5 PM - 9 PM)
    - ShoulderHours: 07:00 - 17:00 (7 AM - 5 PM)
    - OffPeakHours: 21:00 - 07:00 (9 PM - 7 AM)
    
    Returns:
        tuple: (slot_name, cost_multiplier)
    """
    current_hour = datetime.now().hour
    
    if 17 <= current_hour < 21:
        return ('PeakHours', 1.5)
    elif 7 <= current_hour < 17:
        return ('ShoulderHours', 1.2)
    else:
        return ('OffPeakHours', 1.0)


def query_optimization_rules(time_slot_name):
    """
    Query the ontology for optimization rules applicable to the current time slot.
    
    Args:
        time_slot_name (str): Name of the current time slot (e.g., 'PeakHours')
    
    Returns:
        list: Query results containing rule descriptions, impacts, and categories
    """
    if KNOWLEDGE_GRAPH is None:
        print("⚠ Warning: Ontology graph not loaded")
        return []
    
    # SPARQL query to retrieve optimization rules for the current time slot
    query_string = f"""
    PREFIX : <http://smartenergy.org/ontology#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?rule ?description ?impact ?category ?threshold
    WHERE {{
        ?rule a :OptimizationRule ;
              :appliesTo :{time_slot_name} ;
              :ruleDescription ?description ;
              :impact ?impact ;
              :category ?category ;
              :threshold ?threshold .
    }}
    """
    
    try:
        results = KNOWLEDGE_GRAPH.query(query_string)
        return list(results)
    except Exception as e:
        print(f"✗ SPARQL query error: {e}")
        return []


def get_optimization_suggestions(current_usage_data):
    """
    Generate energy optimization suggestions based on current usage patterns
    and ontology rules.
    
    Args:
        current_usage_data (list): List of recent energy readings from database
                                   Format: [{'household_id': 1, 'energy_kwh': 0.2, 'timestamp': ...}]
    
    Returns:
        list: List of suggestion dictionaries with structure:
              [{'id': 1, 'text': '...', 'impact': 'High', 'category': 'Cost-Saving', 
                'household_id': 1, 'current_usage_kwh': 0.2, 'time_slot': 'PeakHours'}]
    """
    suggestions = []
    
    if KNOWLEDGE_GRAPH is None:
        print("⚠ Warning: Cannot generate suggestions - ontology not loaded")
        return [{
            'id': 0,
            'text': 'Optimization engine unavailable. Please restart the server to load ontology.',
            'impact': 'Info',
            'category': 'System',
            'household_id': None,
            'current_usage_kwh': 0,
            'time_slot': 'Unknown'
        }]
    
    # Determine current time slot
    time_slot_name, cost_multiplier = get_current_time_slot()
    
    # Query ontology for applicable rules
    rule_results = query_optimization_rules(time_slot_name)
    
    if not rule_results:
        return [{
            'id': 0,
            'text': f'No optimization rules found for current time slot: {time_slot_name}',
            'impact': 'Info',
            'category': 'System',
            'household_id': None,
            'current_usage_kwh': 0,
            'time_slot': time_slot_name
        }]
    
    # Generate suggestions based on current usage and rules
    suggestion_id = 1
    
    for usage_record in current_usage_data:
        household_id = usage_record.get('household_id')
        energy_kwh = usage_record.get('energy_kwh', 0)
        timestamp = usage_record.get('timestamp', datetime.now())
        
        # Check each rule against current usage
        for rule_result in rule_results:
            description = str(rule_result.description)
            impact = str(rule_result.impact)
            category = str(rule_result.category)
            threshold_kwh = float(rule_result.threshold) / 1000  # Convert Wh to kWh
            
            # Only suggest if usage exceeds threshold
            if energy_kwh > threshold_kwh:
                # Calculate potential savings
                potential_savings_kwh = energy_kwh * (cost_multiplier - 1.0)
                savings_percentage = ((cost_multiplier - 1.0) / cost_multiplier) * 100
                
                # Enhance description with specific data
                enhanced_description = (
                    f"{description} "
                    f"Current usage: {energy_kwh:.3f} kWh. "
                    f"Potential savings: {potential_savings_kwh:.3f} kWh ({savings_percentage:.1f}% cost reduction)."
                )
                
                suggestions.append({
                    'id': suggestion_id,
                    'text': enhanced_description,
                    'impact': impact,
                    'category': category,
                    'household_id': household_id,
                    'current_usage_kwh': round(energy_kwh, 4),
                    'threshold_kwh': round(threshold_kwh, 4),
                    'time_slot': time_slot_name,
                    'cost_multiplier': cost_multiplier,
                    'potential_savings_kwh': round(potential_savings_kwh, 4),
                    'timestamp': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp)
                })
                
                suggestion_id += 1
    
    # If no high-usage detected, provide general efficiency tips
    if not suggestions:
        suggestions.append({
            'id': 1,
            'text': f'Current time slot: {time_slot_name} (cost multiplier: {cost_multiplier}x). '
                    f'Energy usage is within normal ranges. Continue monitoring for optimization opportunities.',
            'impact': 'Low',
            'category': 'Efficiency',
            'household_id': None,
            'current_usage_kwh': 0,
            'time_slot': time_slot_name,
            'cost_multiplier': cost_multiplier
        })
    
    return suggestions


def get_time_slot_info():
    """
    Get detailed information about the current time slot.
    
    Returns:
        dict: Time slot information including name, cost multiplier, and recommendations
    """
    time_slot_name, cost_multiplier = get_current_time_slot()
    current_hour = datetime.now().hour
    
    # Determine next time slot transition
    if time_slot_name == 'PeakHours':
        next_transition = "9 PM (Off-Peak begins)"
        recommendation = "Avoid running high-power appliances. Delay usage until off-peak hours."
    elif time_slot_name == 'ShoulderHours':
        next_transition = "5 PM (Peak Hours begin)"
        recommendation = "Complete heavy usage tasks before peak hours or wait until off-peak."
    else:
        next_transition = "7 AM (Shoulder Hours begin)"
        recommendation = "Optimal time for running high-power appliances and charging batteries."
    
    return {
        'current_slot': time_slot_name,
        'cost_multiplier': cost_multiplier,
        'current_hour': current_hour,
        'next_transition': next_transition,
        'recommendation': recommendation
    }
