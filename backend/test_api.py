import asyncio
import os
import anthropic

async def main():
    api_key = os.getenv("OPENROUTER_API_KEY")
    client = anthropic.AsyncAnthropic(api_key=api_key, base_url="https://openrouter.ai/api/v1")
    try:
        response = await client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=10,
            messages=[{"role": "user", "content": "hello"}],
            temperature=0.0,
        )
        print(response)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
