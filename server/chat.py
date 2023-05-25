import openai
import time
from flask import Response
import urllib.parse

openai.api_key = "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"

max_response_length = 400

initial_conversation = [{
            "role": "system", 
            "content": "You are a helpful assistant that help others to read and understand content of any documents and papers."
        }]

class ChatSystem():
    def __init__(self):
        self.conversation_list = initial_conversation
        self.max_conversation = 5

    def stream_events(self, completion):
        delay_time = 0.05
        final_answer = ''
        for event in completion:
            event_text = event['choices'][0]['delta']
            answer = event_text.get('content', '')
            print(answer, end='')
            yield f"data:{urllib.parse.quote(answer)}\n\n"
            final_answer = final_answer + answer
            # 异步延迟
            time.sleep(delay_time)

        print()
        self.conversation_list.append({"role":"assistant","content":final_answer})
        if len(self.conversation_list) >= self.max_conversation * 2 + 1:
            del self.conversation_list[1:2]

    def stream_response(self, prompt):
        self.conversation_list.append({"role":"user","content":prompt})
        print(self.conversation_list)

        completion = openai.ChatCompletion.create(
            model='gpt-3.5-turbo',
            messages=self.conversation_list,
            max_tokens=max_response_length,
            temperature=1,
            stream=True
        )

        response = Response(self.stream_events(completion), mimetype="text/event-stream")
        response.headers["Cache-Control"] = "no-cache"
        response.headers["X-Accel-Buffering"] = "no"
        
        return response
    
    def reset(self):
        self.conversation_list = initial_conversation

        return 'reset conversation!'