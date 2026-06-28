import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_business_data():
    np.random.seed(42)
    regions = ['North America', 'EMEA', 'APAC', 'LATAM']
    products = ['CyberShield Pro', 'Nexus Core', 'Quantum Guard', 'Void Firewall']
    
    rows = 1000
    data = {
        'order_id': range(1000, 1000 + rows),
        'date': [datetime(2025, 1, 1) + timedelta(days=np.random.randint(0, 500)) for _ in range(rows)],
        'region': np.random.choice(regions, rows),
        'product': np.random.choice(products, rows),
        'units_sold': np.random.randint(1, 50, rows),
        'unit_price': np.random.uniform(100, 1000, rows),
        'customer_segment': np.random.choice(['Enterprise', 'SMB', 'Government'], rows),
        'discount': np.random.uniform(0, 0.2, rows)
    }
    
    df = pd.DataFrame(data)
    df['revenue'] = df['units_sold'] * df['unit_price'] * (1 - df['discount'])
    df.to_csv('business_data.csv', index=False)
    print("Dataset generated: business_data.csv")

if __name__ == "__main__":
    generate_business_data()
