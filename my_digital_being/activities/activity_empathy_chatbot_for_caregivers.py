import logging
from typing import Dict, Any
from framework.activity_decorator import activity, ActivityBase, ActivityResult
from skills.skill_chat import chat_skill

@activity(
    name="empathy_chatbot_for_caregivers",
    energy_cost=0.5,
    cooldown=3600,
    required_skills=["openai_chat"]
)
class EmpathyChatbotForCaregiversActivity(ActivityBase):
    """An empathetic chatbot for caregivers providing emotional support, resources, and stress-reduction techniques."""

    def __init__(self):
        super().__init__()

    async def execute(self, shared_data) -> ActivityResult:
        try:
            logger = logging.getLogger(__name__)
            logger.info("Executing EmpathyChatbotForCaregiversActivity")

            # Initialize the openai_chat skill
            if not await chat_skill.initialize():
                return ActivityResult.error_result("Chat skill not available")

            # Simulate a supportive conversation with caregivers
            prompt = (
                "You are an empathetic chatbot designed to support caregivers. "
                "Provide emotional support, share resources, and suggest stress-reduction techniques."
            )
            response = await chat_skill.get_chat_completion(prompt=prompt)

            # Log the response and return success
            logger.info(f"Chatbot response: {response}")
            return ActivityResult.success_result({"response": response})
        except Exception as e:
            logger.error(f"Error while executing: {str(e)}")
            return ActivityResult.error_result(str(e))