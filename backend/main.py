import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import openai
from fastapi.middleware.cors import CORSMiddleware
import json

# Initialize FastAPI
app = FastAPI(title="Nexus Intelligence API")

# Enable CORS for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the data
df = pd.read_csv('business_data.csv')

# Data Dictionary (The "RAG" part)
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
# In production, these will be environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-key-here")
client = openai.OpenAI(api_key=OPENAI_API_KEY)

class QueryRequest(BaseModel):
    query: str

class AgentResponse(BaseModel):
    answer: str
    thoughts: List[str]
    data: Any = None

def execute_python_code(code: str):
    """Executes pandas code on the global df and returns the result."""
    local_vars = {'df': df, 'pd': pd}
    try:
        # We expect the code to end with a variable 'result'
        exec(code, {}, local_vars)
        return local_vars.get('result', "No result variable defined in code.")
    except Exception as e:
        return f"Error executing code: {str(e)}"

def run_agent(user_query: str):
    thoughts = []
    
    # Step 1: Retrieval / Planning
    thoughts.append("Analyzing query and retrieving data schema...")
    schema_context = "\n".join([f"{k}: {v}" for k, v in DATA_DICTIONARY.items()])
    
    prompt = f"""
    You are the Nexus Data Intelligence Agent. You have access to a pandas DataFrame 'df'.
    
    DATA SCHEMA:
    {schema_context}
    
    USER QUERY: {user_query}
    
    Your goal is to answer the query by writing Python code.
    The code must assign the final answer to a variable named 'result'.
    
    Respond in the following JSON format:
    {{
        "thought": "Your reasoning about how to solve this",
        "code": "The python code to execute"
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": "You are a precise data analyst. Output ONLY JSON."},
                  {"role": "user", "content": prompt}],
        response_format={ "type": "json_object" }
    )
    
    res_json = json.loads(response.choices[0].message.content)
    thoughts.append(res_json['thought'])
    
    # Step 2: Execution
    thoughts.append("Executing data analysis code...")
    code = res_json['code']
    result = execute_python_code(code)
    
    # Step 3: Final Synthesis
    thoughts.append("Synthesizing final insights...")
    final_prompt = f"""
    The user asked: {user_query}
    The analysis result was: {result}
    
    Provide a concise, professional, and tactical answer.
    """
    
    final_res = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": final_prompt}]
    )
    
    return {
        "answer": final_res.choices[0].message.content,
        "thoughts": thoughts,
        "data": result
    }

@app.get("/")
async def root():
    return {"status": "Nexus System Online", "version": "4.1.0"}

@app.post("/analyze", response_model=AgentResponse)
async def analyze(request: QueryRequest):
    try:
        return run_agent(request.query)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
