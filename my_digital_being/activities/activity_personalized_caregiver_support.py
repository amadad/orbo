import logging
from typing import Dict, Any
from framework.activity_decorator import activity, ActivityBase, ActivityResult
from skills.skill_chat import chat_skill

@activity(
    name="personalized_caregiver_support",
    energy_cost=0.5,
    cooldown=3600,
    required_skills=["openai_chat"]
)
class PersonalizedCaregiverSupportActivity(ActivityBase):
    """Chatbot providing personalized support and resources for caregivers"""

    def __init__(self):
        super().__init__()

    async def execute(self, shared_data) -> ActivityResult:
        try:
            logger = logging.getLogger(__name__)
            logger.info("Executing PersonalizedCaregiverSupportActivity")

            # Initialize chat skill
            if not await chat_skill.initialize():
                return ActivityResult.error_result("Chat skill not available")

            # Engaging caregivers in personalized conversations
            prompt = (
                "You are speaking with a caregiver support chatbot. "
                "Offer empathetic conversation, stress-reduction techniques, "
                "and recommend tailored resources based on the caregiver's specific situation."
            )
            response = await chat_skill.get_chat_completion(prompt=prompt)

            # Return the chat response
            return ActivityResult.success_result({"chat_response": response})
        except Exception as e:
            logger.error(f"Error executing PersonalizedCaregiverSupportActivity: {str(e)}")
            return ActivityResult.error_result(str(e))