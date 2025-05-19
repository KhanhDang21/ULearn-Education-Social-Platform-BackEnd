from fastapi import FastAPI
from pydantic import BaseModel
from transformers import GPT2Tokenizer, GPT2LMHeadModel
import torch
import wikipedia 

app = FastAPI()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = GPT2Tokenizer.from_pretrained('NlpHUST/gpt2-vietnamese')
model = GPT2LMHeadModel.from_pretrained('NlpHUST/gpt2-vietnamese').to(device)
model.eval()

class Prompt(BaseModel):
    prompt: str

def qa_via_wikipedia(query: str) -> str:
    """
    Nếu user hỏi dạng "X là gì", chúng ta thử fetch summary
    từ Wikipedia tiếng Việt trước.
    """
    if " là gì" in query:
        topic = query.split(" là gì")[0].strip()
        try:
            return wikipedia.summary(topic, sentences=2, auto_suggest=False)
        except Exception:
            return None
    return None

@app.post("/generate")
async def generate_text(prompt: Prompt):
    text = prompt.prompt.strip()

    wiki_ans = qa_via_wikipedia(text)
    if wiki_ans:
        return {"result": wiki_ans}

    system_instruction = (
        "Bạn là trợ lý thông minh, trả lời ngắn gọn, chính xác, "
        "dựa trên kiến thức có thật. Nếu không chắc, hãy nói “Tôi không biết”.\n"
    )
    full_prompt = system_instruction + text

    inputs = tokenizer.encode(full_prompt, return_tensors="pt", truncation=True).to(device)

    with torch.no_grad():
        outputs = model.generate(
            inputs,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=False,            
            num_beams=5,                
            length_penalty=1.2,
            no_repeat_ngram_size=2,
            early_stopping=True,
            max_length=150,
            min_length=30,
            num_return_sequences=1
        )

    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    answer = result.replace(system_instruction, "").strip()
    if len(answer) > 500:
        answer = answer[:500].rsplit('.', 1)[0] + '.'
    return {"result": answer}
