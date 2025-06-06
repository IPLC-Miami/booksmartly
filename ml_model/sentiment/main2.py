from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
import json
import pickle
import gdown
import os
from sentence_transformers import util, SentenceTransformer
from transformers import pipeline
import logging
import requests
from typing import Optional, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Global variables for models
model: Optional[SentenceTransformer] = None
sentiment_pipeline = None
tags: Optional[dict] = None
positive_embeddings: Optional[torch.Tensor] = None
negative_embeddings: Optional[torch.Tensor] = None
neutral_embeddings: Optional[torch.Tensor] = None

def download_file_with_fallback(url: str, output_path: str, file_id: str) -> bool:
    """Download file with multiple methods and proper error handling"""
    try:
        # Method 1: Direct gdown download
        logger.info(f"Attempting to download {output_path} using gdown...")
        gdown.download(url, output_path, quiet=False)
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info(f"Successfully downloaded {output_path}")
            return True
    except Exception as e:
        logger.warning(f"gdown failed for {output_path}: {e}")

    try:
        # Method 2: Direct requests download
        logger.info(f"Attempting to download {output_path} using requests...")
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info(f"Successfully downloaded {output_path} using requests")
            return True
    except Exception as e:
        logger.warning(f"requests download failed for {output_path}: {e}")

    try:
        # Method 3: Alternative Google Drive URL format
        alt_url = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
        logger.info(f"Attempting alternative download for {output_path}...")
        gdown.download(alt_url, output_path, quiet=False, fuzzy=True)
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info(f"Successfully downloaded {output_path} using alternative method")
            return True
    except Exception as e:
        logger.warning(f"Alternative download failed for {output_path}: {e}")

    logger.error(f"All download methods failed for {output_path}")
    return False

def load_custom_models() -> bool:
    """Load custom models with robust error handling"""
    global model, tags, positive_embeddings, negative_embeddings, neutral_embeddings
    
    try:
        # File IDs from Google Drive links
        MODEL_ID = "1p5ZWJ9I1j4yenHJMUt-EpGOqXiZImAtv"
        TAGS_ID = "1RjVrY91Zt7tRpb9MplE6fRJ5drSTFlf6"
        EMBEDDINGS_ID = "1OGWIhO7p5e7EwhVH3Ve3v5xT2Tpu1NRz"

        # Construct download URLs
        MODEL_URL = f"https://drive.google.com/uc?export=download&id={MODEL_ID}"
        TAGS_URL = f"https://drive.google.com/uc?export=download&id={TAGS_ID}"
        EMBEDDINGS_URL = f"https://drive.google.com/uc?export=download&id={EMBEDDINGS_ID}"

        # Local paths
        MODEL_PATH = "save_model.pkl"
        TAGS_PATH = "save_tags.json"
        EMBEDDINGS_PATH = "save_embeddings.json"

        # Download files if they don't exist or are corrupted
        files_to_download = [
            (MODEL_URL, MODEL_PATH, MODEL_ID),
            (TAGS_URL, TAGS_PATH, TAGS_ID),
            (EMBEDDINGS_URL, EMBEDDINGS_PATH, EMBEDDINGS_ID)
        ]

        for url, path, file_id in files_to_download:
            if not os.path.exists(path) or os.path.getsize(path) == 0:
                if not download_file_with_fallback(url, path, file_id):
                    logger.error(f"Failed to download {path}")
                    return False

        # Validate all files exist and have content
        for _, path, _ in files_to_download:
            if not os.path.exists(path) or os.path.getsize(path) == 0:
                logger.error(f"File {path} is missing or empty")
                return False

        # Load the saved model
        logger.info("Loading custom model...")
        with open(MODEL_PATH, "rb") as f:
            model = pickle.load(f)

        # Load saved tags
        logger.info("Loading tags...")
        with open(TAGS_PATH, "r") as f:
            tags = json.load(f)

        # Load embeddings
        logger.info("Loading embeddings...")
        with open(EMBEDDINGS_PATH, "r") as f:
            embeddings = json.load(f)

        # Convert embeddings to tensors
        positive_embeddings = torch.tensor(embeddings["positive"])
        negative_embeddings = torch.tensor(embeddings["negative"])
        neutral_embeddings = torch.tensor(embeddings["neutral"])
        
        logger.info("Custom models loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load custom models: {e}")
        return False

def load_fallback_models():
    """Load fallback models when custom models fail"""
    global model, tags, positive_embeddings, negative_embeddings, neutral_embeddings
    
    try:
        logger.info("Loading fallback models...")
        
        # Use a reliable sentence transformer model
        model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Default tags for fallback
        tags = {
            "positive": ["excellent", "great", "good", "satisfied", "helpful", "professional", "amazing", "wonderful"],
            "negative": ["poor", "bad", "terrible", "unsatisfied", "rude", "unprofessional", "awful", "horrible"],
            "neutral": ["average", "okay", "normal", "standard", "basic", "fine", "decent", "regular"]
        }
        
        # Create embeddings for fallback tags
        positive_embeddings = model.encode(tags["positive"], convert_to_tensor=True)
        negative_embeddings = model.encode(tags["negative"], convert_to_tensor=True)
        neutral_embeddings = model.encode(tags["neutral"], convert_to_tensor=True)
        
        logger.info("Fallback models loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to load fallback models: {e}")
        return False

def load_sentiment_pipeline():
    """Load sentiment analysis pipeline with fallback"""
    global sentiment_pipeline
    
    try:
        logger.info("Loading sentiment analysis pipeline...")
        sentiment_pipeline = pipeline(
            "sentiment-analysis", 
            model="distilbert-base-uncased-finetuned-sst-2-english",
            return_all_scores=False
        )
        logger.info("Sentiment pipeline loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load sentiment pipeline: {e}")
        sentiment_pipeline = None
        return False

def initialize_models():
    """Initialize all models with proper fallback chain"""
    logger.info("Initializing sentiment analysis models...")
    
    # Try to load custom models first
    if load_custom_models():
        logger.info("Using custom models")
    else:
        logger.warning("Custom models failed, using fallback models")
        if not load_fallback_models():
            logger.error("Both custom and fallback models failed to load")
            raise RuntimeError("Failed to initialize any models")
    
    # Load sentiment pipeline
    load_sentiment_pipeline()
    
    logger.info("Model initialization complete")

def basic_sentiment_classification(feedback: str) -> Tuple[str, str]:
    """Basic keyword-based sentiment classification as last resort"""
    feedback_lower = feedback.lower()
    
    positive_keywords = ["good", "great", "excellent", "amazing", "wonderful", "fantastic", "love", "perfect", "satisfied", "happy", "helpful", "professional"]
    negative_keywords = ["bad", "terrible", "awful", "horrible", "hate", "worst", "disappointed", "angry", "frustrated", "poor", "rude", "unprofessional"]
    neutral_keywords = ["okay", "fine", "average", "normal", "standard", "basic", "decent", "regular"]
    
    positive_count = sum(1 for word in positive_keywords if word in feedback_lower)
    negative_count = sum(1 for word in negative_keywords if word in feedback_lower)
    neutral_count = sum(1 for word in neutral_keywords if word in feedback_lower)
    
    if neutral_count > 0 or (positive_count == negative_count):
        return "neutral", "average"
    elif positive_count > negative_count:
        return "positive", "satisfied"
    else:
        return "negative", "disappointed"

def classify_feedback(feedback: str) -> Tuple[str, str]:
    """Classify feedback with robust error handling and fallbacks"""
    
    if not feedback or not feedback.strip():
        return "neutral", "no_feedback"
    
    feedback = feedback.strip()
    
    # Check if models are loaded
    if not model or not tags:
        logger.warning("Models not loaded, using basic classification")
        return basic_sentiment_classification(feedback)
    
    try:
        # Neutral keyword-based classification first
        neutral_keywords = {
            "normal", "basic", "average", "fine", "okay", "decent",
            "standard", "ordinary", "regular", "common", "nothing",
            "usual", "necessary", "general", "typical", "neutral"
        }

        if any(word in feedback.lower() for word in neutral_keywords):
            try:
                feedback_embedding = model.encode(feedback, convert_to_tensor=True)
                similarity_scores = util.pytorch_cos_sim(feedback_embedding, neutral_embeddings)
                best_match_index = torch.argmax(similarity_scores).item()
                return "neutral", tags["neutral"][best_match_index]
            except Exception as e:
                logger.warning(f"Error in neutral keyword classification: {e}")
                return "neutral", "average"

        # Get feedback embedding
        try:
            feedback_embedding = model.encode(feedback, convert_to_tensor=True)
        except Exception as e:
            logger.error(f"Failed to encode feedback: {e}")
            return basic_sentiment_classification(feedback)

        # Check neutral similarity
        try:
            neutral_similarity_scores = util.pytorch_cos_sim(feedback_embedding, neutral_embeddings)
            best_neutral_score = torch.max(neutral_similarity_scores).item()
            
            if best_neutral_score > 0.7:
                best_match_index = torch.argmax(neutral_similarity_scores).item()
                return "neutral", tags["neutral"][best_match_index]
        except Exception as e:
            logger.warning(f"Error in neutral similarity check: {e}")

        # Use sentiment pipeline if available
        if sentiment_pipeline:
            try:
                sentiment_result = sentiment_pipeline(feedback)[0]
                sentiment_label = sentiment_result["label"]
                sentiment_score = sentiment_result["score"]

                # Determine category based on sentiment
                if sentiment_label == "POSITIVE" and sentiment_score >= 0.65:
                    tag_category = "positive"
                    tag_embeddings = positive_embeddings
                    tag_list = tags["positive"]
                elif sentiment_label == "NEGATIVE" and sentiment_score >= 0.65:
                    tag_category = "negative"
                    tag_embeddings = negative_embeddings
                    tag_list = tags["negative"]
                else:
                    tag_category = "neutral"
                    tag_embeddings = neutral_embeddings
                    tag_list = tags["neutral"]

                # Find the best matching tag
                similarity_scores = util.pytorch_cos_sim(feedback_embedding, tag_embeddings)
                best_match_index = torch.argmax(similarity_scores).item()
                best_tag = tag_list[best_match_index]

                return tag_category, best_tag
                
            except Exception as e:
                logger.warning(f"Error in sentiment pipeline: {e}")
        
        # Fallback to basic classification if sentiment pipeline fails
        return basic_sentiment_classification(feedback)
        
    except Exception as e:
        logger.error(f"Error in classify_feedback: {e}")
        return basic_sentiment_classification(feedback)

# Initialize models on startup
try:
    initialize_models()
except Exception as e:
    logger.error(f"Failed to initialize models: {e}")
    # Continue running with basic classification only

class FeedbackRequest(BaseModel):
    feedback: str

@app.post("/classify/")
async def classify(request: FeedbackRequest):
    """Classify feedback sentiment and return tag"""
    try:
        if not request.feedback:
            raise HTTPException(status_code=400, detail="Feedback text is required")
        
        sentiment, tag = classify_feedback(request.feedback)
        return {"sentiment": sentiment, "tag": tag}
    
    except Exception as e:
        logger.error(f"Error in classify endpoint: {e}")
        # Return basic classification as fallback
        sentiment, tag = basic_sentiment_classification(request.feedback)
        return {"sentiment": sentiment, "tag": tag}

@app.get("/")
async def home():
    """Health check endpoint"""
    model_status = "loaded" if model else "not_loaded"
    pipeline_status = "loaded" if sentiment_pipeline else "not_loaded"
    
    return {
        "message": "Doctor Feedback Sentiment Analysis API is running!",
        "model_status": model_status,
        "pipeline_status": pipeline_status
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "sentiment_pipeline_loaded": sentiment_pipeline is not None,
        "tags_loaded": tags is not None,
        "embeddings_loaded": all([
            positive_embeddings is not None,
            negative_embeddings is not None,
            neutral_embeddings is not None
        ])
    }

if __name__ == "__main__":
    import uvicorn    
    uvicorn.run(app, host="0.0.0.0", port=8000)
