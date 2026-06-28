import os
import json
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import openai
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI
app = FastAPI(title="Nexus Intelligence API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the data
if not os.path.exists('business_data.csv'):
    print("Dataset not found. Generating fresh business data...")
    from generate_data import generate_business_data
    generate_business_data()

df = pd.read_csv('business_data.csv')

# Data Dictionary
DATA_DICTIONARY = {
    "order_id": "Unique identifier for each sale.",
    "date": "Date of the transaction. Format: YYYY-MM-DD.",
    "region": "Geographic region: North America, EMEA, APAC, LATAM.",
    "product": "Product name sold: CyberShield Pro, Nexus Core, Quantum Guard, Void Firewall.",
    "units_sold": "Quantity of units sold in the transaction.",
    "unit_price": "Price per single unit before discount.",
    "customer_segment": "Type of customer: Enterprise, SMB, or Government.",
    "discount": "Discount percentage applied (0 to 1).",
    "revenue": "Total money earned: units_sold * unit_price * (1 - discount)."
}

# LLM Configuration
API_KEY = os.getenv("OPENAI_API_KEY", "your-key-here")
BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4o")

client = openai.OpenAI(api_key=API_KEY, base_url=BASE_URL)

class QueryRequest(BaseModel):
    query: str

class AgentResponse(BaseModel):
    answer: str
    thoughts: List[str]
    data: Any = None

def extract_json(text: str):
    """Extracts JSON from text, removing markdown code blocks if present."""
    try:
        # Find content between ```json and ``` or just ``` and ```
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        return json.loads(text)
    except Exception as e:
        print(f"JSON Extraction Error: {str(e)} | Text: {text}")
        raise ValueError(f"Failed to parse LLM response as JSON: {text}")

def execute_python_code(code: str):
    """Executes pandas code on the global df and returns the result."""
    local_vars = {'df': df, 'pd': pd}
    try:
        exec(code, {}, local_vars)
        return local_vars.get('result', "No result variable defined in code.")
    except Exception as e:
        return f"Error executing code: {str(e)}"

def run_agent(user_query: str):
    thoughts = []
    
    # Step 1: Planning
    thoughts.append("Analyzing query and retrieving data schema...")
    schema_context = "\n".join([f"{k}: {v}" for k, v in DATA_DICTIONARY.items()])
    
    prompt = f"""
    You are the Nexus Data Intelligence Agent. You have access to a pandas DataFrame 'df'.
    
    DATA SCHEMA:
    {schema_context}
    
    USER QUERY: {user_query}
    
    Your goal is to answer the query by writing Python code.
    The code must assign the final answer to a variable named 'result'.
    
    Respond ONLY in the following JSON format:
    {{
        "thought": "Your reasoning about how to solve this",
        "code": "The python code to execute"
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "system", "content": "You are a precise data analyst. Output ONLY JSON."},
                      {"role": "user", "content": prompt}],
            response_format={ "type": "json_object" } if "gpt" in MODEL_NAME else None
        )
        
        content = response.choices[0].message.content
        res_json = extract_json(content)
        thoughts.append(res_json['thought'])
        
        # Step 2: Execution
        thoughts.append("Executing data analysis code...")
        code = res_json['code']
        result = execute_python_code(code)
        
        # Step 3: Synthesis
        thoughts.append("Synthesizing final insights...")
        final_prompt = f"The user asked: {user_query}\nThe analysis result was: {result}\nProvide a concise, professional, and tactical answer."
        
        final_res = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": final_prompt}]
        )
        
        return {
            "answer": final_res.choices[0].message.content,
            "thoughts": thoughts,
            "data": result
        }
    except Exception as e:
        print(f"AGENT ERROR: {str(e)}")
        raise e

@app.get("/")
async def root():
    return {"status": "Nexus System Online", "version": "4.1.0"}

@app.post("/analyze", response_model=AgentResponse)
async def analyze(request: QueryRequest):
    try:
        return run_agent(request.query)
    except Exception as e:
        print(f"ENDPOINT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
