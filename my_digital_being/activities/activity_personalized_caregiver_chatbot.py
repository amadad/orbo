import logging
from typing import Dict, Any
from framework.activity_decorator import activity, ActivityBase, ActivityResult
from skills.skill_chat import chat_skill

@activity(
    name="personalized_caregiver_support_chatbot",
    energy_cost=0.7,
    cooldown=1800,
    required_skills=["openai_chat"]
)
class PersonalizedCaregiverSupportChatbot(ActivityBase):
    """Chatbot providing emotional and practical support to caregivers using the openai_chat skill."""

    def __init__(self):
        super().__init__()

    async def execute(self, shared_data) -> ActivityResult:
        try:
            logger = logging.getLogger(__name__)
            logger.info("Executing PersonalizedCaregiverSupportChatbot")

            # Initialize the openai_chat skill
            if not await chat_skill.initialize():
                return ActivityResult.error_result("Chat skill not available")

            # Example prompt for the chatbot to engage with caregivers
            prompt = (
                "Hello! I'm here to support you as a caregiver. "
                "Feel free to ask for stress management tips, caregiving advice, "
                "or just have a chat about your day."
            )

            # Get the chat completion from the openai_chat skill
            response = await chat_skill.get_chat_completion(prompt=prompt)

            return ActivityResult.success_result({"response": response})
        except Exception as e:
            return ActivityResult.error_result(str(e))