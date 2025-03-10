"""
Activity for generating caregiver-specific insights and storing them in memory.
These insights will be used by other activities to generate more relevant content.
"""

import logging
from typing import Dict, Any, List
from framework.activity_decorator import activity, ActivityBase, ActivityResult
from skills.skill_chat import chat_skill

logger = logging.getLogger(__name__)


@activity(
    name="generate_caregiver_insights",
    energy_cost=0.3,
    cooldown=3600,  # 1 hour
    required_skills=["openai_chat"],
)
class GenerateCaregiverInsightsActivity(ActivityBase):
    """
    Generates caregiver-specific insights and stores them in memory.
    These insights are used by tweet generation and other activities
    to create more relevant, supportive content.
    """

    def __init__(self):
        super().__init__()
        self.caregiver_topics = [
            "self-care strategies",
            "managing caregiver stress",
            "finding moments of peace",
            "setting healthy boundaries",
            "seeking support networks",
            "navigating healthcare systems",
            "balancing caregiving with personal life",
            "recognizing caregiver burnout signs"
        ]
        self.system_prompt = """You are an expert on caregiver support and wellbeing.
        Generate practical, empathetic insights that address real challenges caregivers face.
        Focus on emotional support, practical tips, and recognition of caregiver experiences.
        Keep insights concise (1-2 sentences each) and directly applicable."""

    async def execute(self, shared_data) -> ActivityResult:
        """Execute the caregiver insights generation activity."""
        try:
            logger.info("Starting caregiver insights generation")

            # 1) Initialize the chat skill
            if not await chat_skill.initialize():
                return ActivityResult(
                    success=False, error="Failed to initialize chat skill"
                )

            # 2) Select a topic for this round of insights
            import random
            topic = random.choice(self.caregiver_topics)
            
            # 3) Generate 3-5 insights on the selected topic
            prompt = f"""Generate 3-5 insightful observations about "{topic}" for caregivers.
            Each insight should be practical, empathetic, and address real challenges.
            Format as a simple list without numbering or bullet points.
            Keep each insight to 1-2 sentences."""

            response = await chat_skill.get_chat_completion(
                prompt=prompt,
                system_prompt=self.system_prompt,
                max_tokens=250,
            )

            if not response["success"]:
                return ActivityResult(
                    success=False, error=f"Failed to generate insights: {response.get('error')}"
                )

            # 4) Process and store insights in memory
            insights_text = response["data"]["content"].strip()
            insights_list = [line.strip() for line in insights_text.split("\n") if line.strip()]
            
            # Store in memory - first in a specific "caregiver_insights" category
            for insight in insights_list:
                shared_data.set("memory", f"caregiver_insight_{topic}", insight)
            
            # Also store in "recent_insights" for easy access by other activities
            existing_insights = shared_data.get("memory", "recent_insights", [])
            if not isinstance(existing_insights, list):
                existing_insights = []
                
            # Add new insights and keep only the 20 most recent
            all_insights = insights_list + existing_insights
            all_insights = all_insights[:20]  # Keep only the most recent 20
            shared_data.set("memory", "recent_insights", all_insights)
            
            logger.info(f"Generated {len(insights_list)} caregiver insights on '{topic}'")
            
            return ActivityResult(
                success=True,
                data={"topic": topic, "insights": insights_list},
                metadata={
                    "message": f"Generated {len(insights_list)} insights on {topic}",
                    "model": response["data"].get("model"),
                },
            )

        except Exception as e:
            logger.error(f"Failed to generate caregiver insights: {e}")
            return ActivityResult(success=False, error=str(e))
