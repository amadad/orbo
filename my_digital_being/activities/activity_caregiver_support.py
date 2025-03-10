import logging
from typing import Dict, Any
from framework.activity_decorator import activity, ActivityBase, ActivityResult
from skills.skill_chat import chat_skill
from framework.api_management import api_manager

@activity(
    name="caregiver_support",
    energy_cost=0.7,
    cooldown=7200,
    required_skills=["openai_chat", "composio_twitter_create list", "image_generation"]
)
class CaregiverSupportActivity(ActivityBase):
    """Activity to provide personalized support and resources for caregivers using chat, Twitter lists, and image generation."""

    def __init__(self):
        super().__init__()

    async def execute(self, shared_data) -> ActivityResult:
        try:
            logger = logging.getLogger(__name__)
            logger.info("Executing CaregiverSupportActivity")

            # Initialize chat skill
            if not await chat_skill.initialize():
                return ActivityResult.error_result("Chat skill not available")
            
            # Personalized chat for caregivers
            chat_response = await chat_skill.get_chat_completion(
                prompt="Hello, how can I support you as a caregiver today?"
            )
            logger.info(f"Chat response: {chat_response}")

            # Create a Twitter list for caregiver support
            twitter_list_result = await api_manager.composio_manager.execute_action(
                action="Create list",
                params={"name": "Caregiver Support"},
                entity_id="MyDigitalBeing"
            )
            logger.info(f"Twitter list creation result: {twitter_list_result}")

            # Generate inspirational image
            # Assuming a method like image_generation.generate_image exists
            # Replace with actual method call if available
            image_result = await api_manager.composio_manager.execute_action(
                action="Generate image",
                params={"text": "You are doing great! Remember to take care of yourself too."},
                entity_id="MyDigitalBeing"
            )
            logger.info(f"Image generation result: {image_result}")

            return ActivityResult.success_result({
                "chatResponse": chat_response,
                "twitterList": twitter_list_result,
                "inspirationalImage": image_result
            })
        except Exception as e:
            logger.error(f"Error executing CaregiverSupportActivity: {e}")
            return ActivityResult.error_result(str(e))