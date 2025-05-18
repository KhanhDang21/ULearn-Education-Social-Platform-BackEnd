from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

app = FastAPI()

tokenizer = AutoTokenizer.from_pretrained("gpt2")
model = AutoModelForCausalLM.from_pretrained("gpt2")

class Prompt(BaseModel):
    prompt: str

@app.post("/generate")
def generate_text(prompt: Prompt):
    input_ids = tokenizer.encode(prompt.prompt, return_tensors="pt")
    output = model.generate(
        input_ids,
        max_length=100,
        do_sample=True,
        temperature=0.8,
        top_k=50,
        top_p=0.95,
        no_repeat_ngram_size=3,
        num_return_sequences=1
    )
    result = tokenizer.decode(output[0], skip_special_tokens=True)
    return {"result": result}