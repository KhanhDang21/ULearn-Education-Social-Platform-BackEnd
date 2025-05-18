from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from transformers import GPT2Tokenizer, GPT2LMHeadModel
import torch

app = FastAPI()

tokenizer = GPT2Tokenizer.from_pretrained('NlpHUST/gpt2-vietnamese')
model = GPT2LMHeadModel.from_pretrained('NlpHUST/gpt2-vietnamese')

class Prompt(BaseModel):
    prompt: str

@app.post("/generate")
def generate_text(prompt: Prompt):
    input_ids = tokenizer.encode(prompt.prompt, return_tensors="pt")
    output = model.generate(
        input_ids,pad_token_id=tokenizer.eos_token_id,
        do_sample=True,
        max_length=100,
        min_length=100,
        top_k=40,
        num_beams=5,
        early_stopping=True,
        no_repeat_ngram_size=2,
        num_return_sequences=3
    )
    result = tokenizer.decode(output[0], skip_special_tokens=True)
    return {"result": result}