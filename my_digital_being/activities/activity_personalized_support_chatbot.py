import logging
from typing import Dict, Any
from framework.activity_decorator import activity, ActivityBase, ActivityResult
from skills.skill_chat import chat_skill

@activity(
    name="personalized_support_chatbot",
    energy_cost=0.7,
    cooldown=1800,
    required_skills=["openai_chat"]
)
class PersonalizedSupportChatbot(ActivityBase):
    """An empathetic chatbot providing personalized support to caregivers using OpenAI chat skill."""

    def __init__(self):
        super().__init__()

    async def execute(self, shared_data) -> ActivityResult:
        try:
            logger = logging.getLogger(__name__)
            logger.info("Executing PersonalizedSupportChatbot")

            # Initialize the OpenAI chat skill
            if not await chat_skill.initialize():
                return ActivityResult.error_result("Chat skill not available")
            
            # Example prompt simulating a caregiver inquiry
            prompt = ("I'm feeling overwhelmed with caregiving tasks. "
                      "Can you provide some stress management tips and resources?")

            # Get a chat completion from the OpenAI chat skill
            response = await chat_skill.get_chat_completion(prompt=prompt)

            # Check if a valid response was received
            if not response:
                return ActivityResult.error_result("Failed to get a valid response from the chat skill")

            # Log and return the response
            logger.info("Chat response received: %s", response)
            return ActivityResult.success_result({"response": response})
        
        except Exception as e:
            logger.error("Error occurred in PersonalizedSupportChatbot: %s", str(e))
            return ActivityResult.error_result(str(e))