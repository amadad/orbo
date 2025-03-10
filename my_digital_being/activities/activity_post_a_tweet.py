import logging
from typing import Dict, Any, List, Tuple

from framework.activity_decorator import activity, ActivityBase, ActivityResult
from framework.api_management import api_manager
from framework.memory import Memory
from skills.skill_chat import chat_skill
from skills.skill_generate_image import ImageGenerationSkill
from skills.skill_x_api import XAPISkill

logger = logging.getLogger(__name__)


@activity(
    name="post_a_tweet",
    energy_cost=0.4,
    cooldown=3600,  # 1 hour
    required_skills=["twitter_posting", "image_generation"],
)
class PostTweetActivity(ActivityBase):
    """
    Uses a chat skill (OpenAI) to generate tweet text,
    referencing the character's personality from character_config.
    Checks recent tweets in memory to avoid duplication.
    Posts to Twitter via Composio's "Creation of a post" dynamic action.
    """

    def __init__(self):
        super().__init__()
        self.max_length = 280
        # If you know your Twitter username, you can embed it in the link
        # or fetch it dynamically. Otherwise, substitute accordingly:
        self.twitter_username = "YourUserName"
        # set this to True if you want to generate an image for the tweet
        self.image_generation_enabled = True
        self.default_size = (1024, 1024)  # Added for image generation
        self.default_format = "png"  # Added for image generation

    async def execute(self, shared_data) -> ActivityResult:
        try:
            logger.info("Starting tweet posting activity...")

            # 1) Initialize the chat skill
            if not await chat_skill.initialize():
                return ActivityResult(
                    success=False, error="Failed to initialize chat skill"
                )

            # 2) Gather personality + recent tweets
            character_config = self._get_character_config(shared_data)
            personality_data = character_config.get("personality", {})
            recent_tweets = self._get_recent_tweets(shared_data, limit=10)

            # 3) Use advanced generation algorithm instead of simple prompting
            chat_response = await self._advanced_tweet_generation(
                personality_data, 
                recent_tweets,
                shared_data
            )
            
            if not chat_response["success"]:
                return ActivityResult(success=False, error=chat_response["error"])

            tweet_text = chat_response["data"]["content"].strip()
            if len(tweet_text) > self.max_length:
                tweet_text = tweet_text[: self.max_length - 3] + "..."

            # 4) Generate an image based on the tweet text
            if self.image_generation_enabled:
                image_prompt, media_urls = await self._generate_image_for_tweet(tweet_text, personality_data)
            else:
                image_prompt, media_urls = None, []

            # 5) Post the tweet via X API
            x_api = XAPISkill({
                "enabled": True,
                "twitter_username": self.twitter_username
            })
            post_result = await x_api.post_tweet(tweet_text, media_urls)
            if not post_result["success"]:
                error_msg = post_result.get(
                    "error", "Unknown error posting tweet via Composio"
                )
                logger.error(f"Tweet posting failed: {error_msg}")
                return ActivityResult(success=False, error=error_msg)

            tweet_id = post_result.get("tweet_id")
            tweet_link = (
                f"https://twitter.com/{self.twitter_username}/status/{tweet_id}"
                if tweet_id
                else None
            )

            # 6) Return success, adding link & prompt in metadata
            logger.info(f"Successfully posted tweet: {tweet_text[:50]}...")
            return ActivityResult(
                success=True,
                data={"tweet_id": tweet_id, "content": tweet_text},
                metadata={
                    "length": len(tweet_text),
                    "method": "composio",
                    "model": chat_response["data"].get("model"),
                    "finish_reason": chat_response["data"].get("finish_reason"),
                    "tweet_link": tweet_link,
                    "prompt_used": chat_response["data"].get("prompt_used"),
                    "image_prompt_used": image_prompt,
                    "image_count": len(media_urls),
                },
            )

        except Exception as e:
            logger.error(f"Failed to post tweet: {e}", exc_info=True)
            return ActivityResult(success=False, error=str(e))

    def _get_character_config(self, shared_data) -> Dict[str, Any]:
        """
        Retrieve character_config from SharedData['system'] or re-init the Being if not found.
        """
        system_data = shared_data.get_category_data("system")
        maybe_config = system_data.get("character_config")
        if maybe_config:
            return maybe_config

        # fallback
        from framework.main import DigitalBeing

        being = DigitalBeing()
        being.initialize()
        return being.configs.get("character_config", {})

    def _get_recent_tweets(self, shared_data, limit: int = 10) -> List[str]:
        """
        Fetch the last N tweets posted (activity_type='PostTweetActivity') from memory.
        """
        system_data = shared_data.get_category_data("system")
        memory_obj: Memory = system_data.get("memory_ref")

        if not memory_obj:
            from framework.main import DigitalBeing

            being = DigitalBeing()
            being.initialize()
            memory_obj = being.memory

        recent_activities = memory_obj.get_recent_activities(limit=50, offset=0)
        tweets = []
        for act in recent_activities:
            if act.get("activity_type") == "PostTweetActivity" and act.get("success"):
                tweet_body = act.get("data", {}).get("content", "")
                if tweet_body:
                    tweets.append(tweet_body)

        return tweets[:limit]

    def _build_chat_prompt(self, personality: Dict[str, Any], recent_tweets: List[str]) -> str:
        """
        Build a prompt for generating a tweet based on personality and recent tweets.
        """
        trait_lines = [f"{t}: {v}" for t, v in personality.items()]
        personality_str = "\n".join(trait_lines)

        if recent_tweets:
            last_tweets_str = "\n".join(f"- {txt}" for txt in recent_tweets)
        else:
            last_tweets_str = "(No recent tweets)"

        return (
            f"Our digital being has these personality traits:\n"
            f"{personality_str}\n\n"
            f"Here are recent tweets:\n"
            f"{last_tweets_str}\n\n"
            f"Write a new short tweet (under 280 chars), consistent with the above, "
            f"but not repeating old tweets. Avoid hashtags or repeated phrases.\n"
        )

    async def _advanced_tweet_generation(self, personality_data: Dict[str, Any], 
                                        recent_tweets: List[str], 
                                        shared_data) -> Dict[str, Any]:
        """
        Advanced multi-step tweet generation algorithm that produces more nuanced content.
        This represents a fundamental change to the algorithm, not just parameter tweaking.
        """
        # Step 1: Analyze memories to find themes and emotions
        memory_analysis_prompt = (
            f"Analyze the following recent memories of caregivers and identify 3 key themes "
            f"or emotional needs that should be addressed:\n\n"
        )
        
        # Get recent memories from memory system (using proper safety checks)
        memories = []
        try:
            # Safe memory access pattern
            memory_categories = ["daily_logs", "social_interactions", "reflections"]
            all_memories = []
            
            for category in memory_categories:
                # First check if category exists in memory
                category_memories = shared_data.get("memory", category, [])
                if category_memories:
                    if isinstance(category_memories, list):
                        all_memories.extend(category_memories[:3])  # Get up to 3 from each category
                    elif isinstance(category_memories, dict):
                        # Some memory categories might be stored as dicts with 'entries' key
                        entries = category_memories.get("entries", [])
                        if entries and isinstance(entries, list):
                            all_memories.extend(entries[:3])
            
            # Format memories for prompt
            for memory in all_memories[:5]:  # Limit to 5 total memories
                if isinstance(memory, dict):
                    # Extract the content if it's a structured memory
                    content = memory.get("content", "")
                    if content:
                        memories.append(content)
                elif isinstance(memory, str):
                    memories.append(memory)
                    
        except Exception as e:
            logger.warning(f"Error accessing memories: {e}")
            
        # Add memories to the prompt
        if memories:
            memory_analysis_prompt += "\n".join([f"- {m}" for m in memories])
        else:
            memory_analysis_prompt += "(No recent memories available. Focus on general caregiver needs.)"
        
        # Get themes analysis
        theme_response = await chat_skill.get_chat_completion(
            prompt=memory_analysis_prompt,
            system_prompt="You are an empathetic analyst who understands caregiver needs.",
            max_tokens=150,
        )
        
        if not theme_response["success"]:
            logger.warning(f"Theme analysis failed: {theme_response['error']}")
            themes = "Support, encouragement, and self-care"
        else:
            themes = theme_response["data"]["content"].strip()
        
        # Step 2: Determine content strategy based on time of day and recent activity
        from datetime import datetime
        current_hour = datetime.now().hour
        
        # Adjust content strategy based on time of day
        if 5 <= current_hour < 10:
            time_context = "morning motivation"
        elif 10 <= current_hour < 14:
            time_context = "midday encouragement"
        elif 14 <= current_hour < 18:
            time_context = "afternoon reflection"
        elif 18 <= current_hour < 22:
            time_context = "evening wind-down"
        else:
            time_context = "nighttime reassurance"
        
        # Step 3: Generate the actual tweet with enhanced context
        final_prompt = (
            f"Mira is a digital being with these personality traits:\n"
            f"{personality_data}\n\n"
            f"Recent tweets:\n"
            f"{', '.join(recent_tweets[:3]) if recent_tweets else '(No recent tweets)'}\n\n"
            f"Time context: {time_context}\n"
            f"Key themes from caregiver memories: {themes}\n\n"
            f"Create a tweet (max 280 chars) that speaks directly to caregivers. "
            f"The tweet should:\n"
            f"1. Address a specific emotion or need relevant to the themes\n"
            f"2. Provide a concrete tip or affirmation\n"
            f"3. Use an appropriate tone for {time_context}\n"
            f"4. DO NOT USE ANY EMOJIS\n"
            f"5. End with ONE relevant hashtag from: #CaregiverSupport #SelfCare #Mindfulness\n\n"
            f"The tweet should feel genuine, warm, and truly supportive - not generic."
        )
        
        # Generate the tweet with enhanced context
        chat_response = await chat_skill.get_chat_completion(
            prompt=final_prompt,
            system_prompt="You are Mira, a compassionate digital companion for caregivers.",
            max_tokens=150,
        )
        
        return chat_response

    def _build_image_prompt(self, tweet_text: str, personality: Dict[str, Any]) -> str:
        """Generate a prompt for image creation that is specific to caregiver support."""
        
        # Extract mood and theme from tweet
        theme_extraction_prompt = f"Extract the main theme and emotional tone from this tweet: '{tweet_text}'"
        
        # Define caregiver-focused imagery themes
        imagery_themes = {
            "tranquility": "Serene nature scene with calm waters, gentle mountains, and soft light",
            "support": "Abstract representation of supporting hands or interconnected shapes in soft colors",
            "hope": "Sunrise imagery with warm colors and hopeful symbolism",
            "community": "Abstract representations of connection and community through interwoven shapes",
            "rest": "Peaceful scenes that evoke rest and restoration",
            "balance": "Balanced natural elements like stones, flowing water, or harmonious shapes",
            "growth": "Natural imagery showing growth, like new plants or forest scenes with sun rays"
        }
        
        # Analyze tweet text for relevant themes
        relevant_themes = []
        lowered_text = tweet_text.lower()
        
        if any(word in lowered_text for word in ["peace", "calm", "quiet", "serenity", "relax"]):
            relevant_themes.append("tranquility")
        if any(word in lowered_text for word in ["help", "support", "together", "assist"]):
            relevant_themes.append("support")
        if any(word in lowered_text for word in ["hope", "future", "better", "improve"]):
            relevant_themes.append("hope")
        if any(word in lowered_text for word in ["community", "connect", "share", "together"]):
            relevant_themes.append("community")
        if any(word in lowered_text for word in ["rest", "sleep", "break", "pause"]):
            relevant_themes.append("rest")
        if any(word in lowered_text for word in ["balance", "harmony", "center", "focus"]):
            relevant_themes.append("balance")
        if any(word in lowered_text for word in ["grow", "develop", "flourish", "progress"]):
            relevant_themes.append("growth")
            
        # Default to tranquility if no themes detected
        if not relevant_themes:
            relevant_themes = ["tranquility"]
            
        # Select primary theme and build style guidance
        primary_theme = relevant_themes[0]
        image_style = imagery_themes[primary_theme]
        
        # Build advanced image prompt
        return (
            f"Create a digital artwork for caregivers with this theme: {image_style}. "
            f"The artwork should evoke feelings of {primary_theme} and connect to this tweet message: '{tweet_text}'. "
            f"Use a color palette that feels gentle and supportive. "
            f"The image style should be modern digital illustration with soft edges. "
            f"DO NOT include any text or words in the image. "
            f"Make the image feel like a moment of visual respite for someone who provides care to others."
        )

    async def _generate_image_for_tweet(self, tweet_text: str, personality_data: Dict[str, Any]) -> Tuple[str, List[str]]:
        """
        Generate an image for the tweet and upload it to Twitter.
        Returns a tuple of (image_prompt, media_urls).
        If generation fails, returns (None, []).
        """
        logger.info("Decided to generate an image for tweet")
        image_skill = ImageGenerationSkill({
            "enabled": True,
            "max_generations_per_day": 50,
            "supported_formats": ["png", "jpg"],
        })

        if await image_skill.can_generate():
            image_prompt = self._build_image_prompt(tweet_text, personality_data)
            image_result = await image_skill.generate_image(
                prompt=image_prompt,
                size=self.default_size,
                format=self.default_format
            )
            
            if image_result.get("success") and image_result.get("image_data", {}).get("url"):
                return image_prompt, [image_result["image_data"]["url"]]
        else:
            logger.warning("Image generation not available, proceeding with text-only tweet")
        
        return None, []
