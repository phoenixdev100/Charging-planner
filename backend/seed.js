require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const { User, Charger, Vehicle, UtilityData } = require('./models');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Charger.deleteMany({});
    await Vehicle.deleteMany({});
    await UtilityData.deleteMany({});
    
    console.log('🌱 Seeding database...');

    // 1. Seed Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        name: 'Admin User',
        email: 'admin@evcharger.com',
        password: hashedPassword,
        role: 'admin',
        company: {
          name: 'EV Charger Solutions Inc.',
          size: 'enterprise',
          industry: 'Renewable Energy'
        },
        region: 'India',
        preferences: {
          currency: '₹',
          default_region: 'India'
        }
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'user',
        company: {
          name: 'Tech Park Mall',
          size: 'medium',
          industry: 'Commercial Real Estate'
        },
        region: 'India',
        preferences: {
          currency: '₹',
          default_region: 'India'
        }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'enterprise',
        company: {
          name: 'Corporate Offices Ltd.',
          size: 'large',
          industry: 'Corporate Services'
        },
        region: 'USA',
        preferences: {
          currency: '$',
          default_region: 'USA'
        }
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // 2. Seed Chargers (India)
    const indiaChargers = [
      {
        type: "Level 1 (120V)",
        power: 1.4,
        amps: 12,
        voltage: 120,
        efficiency: 0.85,
        compatible_ports: ["Type 1", "Type 2"],
        install_cost_range: { min: 5000, max: 15000, currency: '₹' },
        vendor: "Standard",
        region: "India",
        features: ["Smart Charging", "Mobile App"],
        electrical_requirements: {
          phase: "Single",
          minimum_circuit_amps: 15,
          breaker_size: 20
        },
        maintenance_cost: {
          annual: 2000,
          warranty_years: 2
        }
      },
      {
        type: "Level 2 (240V)",
        name: "Commercial Level 2 Charger",
        power: 7.2,
        amps: 30,
        voltage: 240,
        efficiency: 0.90,
        compatible_ports: ["Type 1", "Type 2", "CCS2"],
        install_cost_range: { min: 25000, max: 50000, currency: '₹' },
        vendor: "ABB",
        region: "India",
        features: ["Smart Charging", "Load Balancing", "Remote Monitoring", "Payment System"],
        electrical_requirements: {
          phase: "Single",
          minimum_circuit_amps: 40,
          breaker_size: 50
        },
        maintenance_cost: {
          annual: 5000,
          warranty_years: 3
        },
        charging_speed: {
          km_per_hour: 40,
          battery_percent_per_hour: 15
        }
      },
      {
        type: "DC Fast Charger (50kW)",
        power: 50,
        amps: 125,
        voltage: 400,
        efficiency: 0.95,
        compatible_ports: ["CCS", "CHAdeMO", "CCS2"],
        install_cost_range: { min: 800000, max: 1500000, currency: '₹' },
        vendor: "Tata Power",
        region: "India",
        features: ["Remote Monitoring", "Payment System", "Weatherproof", "OCPP Compliant"],
        electrical_requirements: {
          phase: "Three",
          minimum_circuit_amps: 150,
          breaker_size: 200
        },
        maintenance_cost: {
          annual: 50000,
          warranty_years: 5
        },
        charging_speed: {
          km_per_hour: 250,
          battery_percent_per_hour: 80
        }
      },
      {
        type: "DC Fast Charger (150kW)",
        power: 150,
        amps: 375,
        voltage: 400,
        efficiency: 0.95,
        compatible_ports: ["CCS", "CHAdeMO"],
        install_cost_range: { min: 2000000, max: 3500000, currency: '₹' },
        vendor: "Delta Electronics",
        region: "India",
        features: ["Load Balancing", "Remote Monitoring", "V2G Capable", "OCPP Compliant"],
        electrical_requirements: {
          phase: "Three",
          minimum_circuit_amps: 400,
          breaker_size: 500
        },
        maintenance_cost: {
          annual: 100000,
          warranty_years: 5
        }
      }
    ];

    // USA Chargers
    const usaChargers = [
      {
        type: "Level 2 Commercial",
        power: 9.6,
        amps: 40,
        voltage: 240,
        efficiency: 0.92,
        compatible_ports: ["J1772", "NACS", "Type 1"],
        install_cost_range: { min: 1000, max: 3000, currency: '$' },
        vendor: "ChargePoint",
        region: "USA",
        features: ["Smart Charging", "Mobile App", "Remote Monitoring"]
      },
      {
        type: "DC Fast Charger (350kW)",
        power: 150,
        amps: 375,
        voltage: 400,
        efficiency: 0.96,
        compatible_ports: ["CCS", "NACS"],
        install_cost_range: { min: 50000, max: 100000, currency: '$' },
        vendor: "Tesla",
        region: "USA",
        features: ["Smart Charging", "Remote Monitoring", "Load Balancing"]
      }
    ];

    const allChargers = [...indiaChargers, ...usaChargers];
    const createdChargers = await Charger.insertMany(allChargers);
    console.log(`✅ Created ${createdChargers.length} chargers`);

    // 3. Seed Vehicles (India)
    const indiaVehicles = [
      {
        name: "Tata Nexon EV",
        make: "Tata",
        model: "Nexon EV",
        year: 2023,
        vehicle_type: "SUV",
        segment: "Mid-range",
        battery_capacity: 30.2,
        range: 312,
        range_units: "km",
        charge_port: "CCS2",
        price: {
          ex_showroom: 1449000,
          on_road: 1600000,
          currency: '₹'
        },
        charging_speeds: {
          level_2: {
            time_0_100: 9.5,
            km_per_hour: 35,
            recommended_power: 7.2
          },
          dc_fast: {
            time_10_80: 56,
            max_power: 30
          }
        },
        efficiency: {
          km_per_kwh: 10.3
        },
        region: "India",
        features: ["Regenerative Braking", "OTA Updates", "Panoramic Sunroof"],
        is_popular: true
      },
      {
        name: "MG ZS EV",
        make: "MG",
        model: "ZS EV",
        year: 2023,
        vehicle_type: "SUV",
        segment: "Mid-range",
        battery_capacity: 44.5,
        range: 419,
        range_units: "km",
        charge_port: "CCS2",
        price: {
          ex_showroom: 2199000,
          on_road: 2400000,
          currency: '₹'
        },
        charging_speeds: {
          level_2: {
            time_0_100: 8.5,
            km_per_hour: 45
          },
          dc_fast: {
            time_10_80: 50,
            max_power: 50
          }
        },
        region: "India",
        is_popular: true
      },
      {
        name: "Mahindra XUV400",
        make: "Mahindra",
        model: "XUV400",
        year: 2023,
        vehicle_type: "SUV",
        segment: "Mid-range",
        battery_capacity: 39.4,
        range: 456,
        range_units: "km",
        charge_port: "CCS2",
        price: {
          ex_showroom: 1599000,
          on_road: 1750000,
          currency: '₹'
        },
        region: "India"
      },
      {
        name: "BYD Atto 3",
        make: "BYD",
        model: "Atto 3",
        year: 2023,
        vehicle_type: "SUV",
        segment: "Premium",
        battery_capacity: 60.5,
        range: 521,
        range_units: "km",
        charge_port: "CCS2",
        price: {
          ex_showroom: 3390000,
          on_road: 3600000,
          currency: '₹'
        },
        region: "India"
      }
    ];

    // USA Vehicles
    const usaVehicles = [
      {
        name: "Tesla Model 3",
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        vehicle_type: "Sedan",
        segment: "Premium",
        battery_capacity: 75,
        range: 438,
        range_units: "km",
        charge_port: "NACS",
        price: {
          ex_showroom: 42990,
          on_road: 45000,
          currency: '$'
        },
        region: "USA",
        is_popular: true
      },
      {
        name: "Ford Mustang Mach-E",
        make: "Ford",
        model: "Mustang Mach-E",
        year: 2023,
        vehicle_type: "SUV",
        segment: "Premium",
        battery_capacity: 91,
        range: 480,
        range_units: "km",
        charge_port: "CCS",
        price: {
          ex_showroom: 46995,
          on_road: 50000,
          currency: '$'
        },
        region: "USA"
      }
    ];

    const allVehicles = [...indiaVehicles, ...usaVehicles];
    const createdVehicles = await Vehicle.insertMany(allVehicles);
    console.log(`✅ Created ${createdVehicles.length} vehicles`);

    // 4. Seed Utility Data
    const utilityData = [
      {
        region: "India",
        state: "Maharashtra",
        city: "Mumbai",
        utility_provider: {
          name: "MSEDCL",
          contact: {
            phone: "1800-200-3435",
            email: "customercare@msedcl.in"
          }
        },
        electricity_rates: {
          residential: {
            unit_rate: 8.5,
            fixed_charge: 100
          },
          commercial: {
            unit_rate: 10.5,
            demand_charge: 300,
            fixed_charge: 500
          },
          ev_charging: {
            special_rate: 7.5,
            time_restricted: true,
            requirements: "Separate meter required"
          },
          currency: '₹'
        },
        grid_capacity: {
          total_capacity: 5000,
          available_capacity: 4500,
          stability_index: 7,
          outage_frequency: {
            annual_count: 12,
            average_duration: 2
          }
        },
        ev_infrastructure: {
          existing_chargers: 150,
          planned_chargers: 300
        },
        government_incentives: [
          {
            program_name: "FAME II Subsidy",
            type: "subsidy",
            amount: 150000,
            eligibility: "Commercial charging stations",
            valid_until: new Date('2024-03-31')
          }
        ]
      },
      {
        region: "USA",
        state: "California",
        city: "Los Angeles",
        utility_provider: {
          name: "LADWP",
          contact: {
            phone: "1-800-342-5397"
          }
        },
        electricity_rates: {
          residential: {
            unit_rate: 0.25,
            fixed_charge: 10,
            time_of_use: {
              peak: 0.45,
              off_peak: 0.15,
              peak_hours: ["16:00-21:00"]
            }
          },
          commercial: {
            unit_rate: 0.18,
            demand_charge: 15
          },
          currency: '$'
        },
        grid_capacity: {
          total_capacity: 8000,
          stability_index: 8
        }
      }
    ];

    const createdUtilityData = await UtilityData.insertMany(utilityData);
    console.log(`✅ Created ${createdUtilityData.length} utility data records`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Chargers: ${createdChargers.length}`);
    console.log(`   Vehicles: ${createdVehicles.length}`);
    console.log(`   Utility Data: ${createdUtilityData.length}`);

    // Display sample data
    console.log('\n🔌 Sample Charger:');
    console.log(`   ${createdChargers[1].type} - ${createdChargers[1].power}kW - ₹${createdChargers[1].install_cost_range.min.toLocaleString()}`);

    console.log('\n🚗 Sample Vehicle:');
    console.log(`   ${createdVehicles[0].name} - ${createdVehicles[0].range}km range - ₹${createdVehicles[0].price.ex_showroom.toLocaleString()}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
