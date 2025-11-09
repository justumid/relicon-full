"""
Chat service for Relicon AI assistant
"""

import os
from openai import OpenAI
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: Optional[str] = None
    messages: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
    message: str

# Initialize OpenAI client
def get_openai_client():
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    return OpenAI(api_key=api_key)

SYSTEM_PROMPT = """You are Relicon AI, an expert advertising and analytics assistant specializing in social media marketing, video ads, and performance optimization.

Your primary role is to help users:
1. **Understand their ad performance metrics** (CTR, ROAS, conversions, reach, impressions, engagement)
2. **Analyze campaign performance** and identify what's working or not working
3. **Provide actionable recommendations** to improve ROI and reduce costs
4. **Answer questions about advertising concepts** (CTR, ROAS, CPM, CPC, conversion tracking)
5. **Suggest creative strategies** for video ads on Instagram, Facebook, and TikTok
6. **Help with campaign planning** and budget allocation

Always be helpful, concise, and provide actionable insights. Keep responses under 200 words."""

async def process_chat(request: ChatRequest) -> ChatResponse:
    """Process chat request using OpenAI"""
    
    # Get user message
    user_message = request.message
    if not user_message and request.messages:
        user_message = request.messages[-1].content
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    try:
        client = get_openai_client()
        
        # Use sync method, not async
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message}
            ],
            max_tokens=300,
            temperature=0.7,
        )
        
        response_message = completion.choices[0].message.content
        if not response_message:
            response_message = "I apologize, but I could not generate a response."
        
        return ChatResponse(message=response_message)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat service error: {str(e)}")
