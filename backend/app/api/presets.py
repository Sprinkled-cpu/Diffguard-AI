"""Curated Real-World API Migration Presets for DiffGuard AI."""
from typing import List
from app.models.schemas import PresetScenario

PRESET_SCENARIOS: List[PresetScenario] = [
    PresetScenario(
        id="stripe-charge-to-payment-intent",
        title="Stripe: Charge.create to PaymentIntent.create",
        library="Stripe",
        tagline="SCA Compliance & Breaking API Revision",
        severity="RED",
        file_name="payment_service.py",
        description="Stripe deprecated direct Charge.create in favor of PaymentIntent.create to enforce European 3D Secure 2 and SCA authentication requirements. Legacy source parameters must now map to payment_method.",
        changelog_text="""# Stripe API Changelog: Major Migration from Charges to PaymentIntents

## Summary of Breaking Changes:
- **Deprecated Symbol**: `stripe.Charge.create()` is retired for new integrations.
- **Modern Replacement**: Use `stripe.PaymentIntent.create()`.
- **Parameter Mutation**: The legacy parameter `source` is renamed to `payment_method`.
- **Breaking Impact**: Invocations of Charge.create will result in declined card transactions and fail 3D Secure authentication challenges.
- **Migration Hint**: Refactor all Charge.create calls to PaymentIntent.create and pass payment_method instead of source.
""",
        sample_code="""import os
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def process_checkout(customer_id: str, card_token: str, amount_cents: int):
    # Process payment using legacy Stripe Charges API
    print(f"Authorizing charge for customer {customer_id}")
    charge = stripe.Charge.create(
        amount=amount_cents,
        currency="usd",
        source=card_token,
        description="Subscription renewal checkout"
    )
    return {
        "status": charge.status,
        "id": charge.id
    }
"""
    ),
    PresetScenario(
        id="openai-v0-to-v1",
        title="OpenAI SDK: v0.28 to v1.0.0 Refactor",
        library="OpenAI",
        tagline="Client-Instantiation & Endpoint Dropped",
        severity="RED",
        file_name="ai_assistant.py",
        description="OpenAI released v1.0.0 which completely dropped global static endpoints like openai.ChatCompletion.create and openai.api_key assignment in favor of a modern client instance (client = OpenAI()).",
        changelog_text="""# OpenAI Python SDK v1.0.0 Release Notes

## Major Breaking Changes:
- **Dropped Global Module Endpoints**: `openai.ChatCompletion.create()` was removed.
- **Modern Client Pattern**: Instantiate a client `client = OpenAI()` and invoke `client.chat.completions.create()`.
- **Deprecated Module Variable**: `openai.api_key = ...` is retired. Pass `api_key` directly to `OpenAI(api_key=...)` or rely on the `OPENAI_API_KEY` environment variable.
- **Crash Severity**: RED. Calling `openai.ChatCompletion.create` in v1.0+ raises `AttributeError: module 'openai' has no attribute 'ChatCompletion'`.
""",
        sample_code="""import openai

openai.api_key = "sk-proj-DEMO_KEY_DO_NOT_EXPOSE"

def ask_question(prompt: str) -> str:
    # Query GPT using legacy OpenAI v0.28 syntax
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful software engineering assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7
    )
    return response.choices[0].message.content
"""
    ),
    PresetScenario(
        id="pydantic-v1-to-v2",
        title="Pydantic: v1.x to v2.x Schema Overhaul",
        library="Pydantic",
        tagline="Method Deprecations & Config Overhaul",
        severity="YELLOW",
        file_name="user_dto.py",
        description="Pydantic v2 rebuilt the validation engine in Rust, deprecating .dict() in favor of .model_dump(), replacing inner class Config with model_config = ConfigDict(), and replacing @validator with @field_validator.",
        changelog_text="""# Pydantic v2 Migration Guide

## Deprecations and Schema Changes:
- **Deprecated Method**: `BaseModel.dict()` is deprecated. Replace with `BaseModel.model_dump()`.
- **Deprecated Config Class**: Inner `class Config:` is deprecated. Replace with `model_config = ConfigDict(...)`.
- **Deprecated Decorator**: `@validator` is deprecated. Replace with `@field_validator` and require classmethod.
- **Breaking Impact**: Raises PydanticDeprecatedSince20 warnings across the entire test suite and will fail in future v3.
""",
        sample_code="""from pydantic import BaseModel, validator

class UserProfile(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        populate_by_name = True

    @validator("username")
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v.lower()

def export_user(user: UserProfile) -> dict:
    # Export dictionary using deprecated Pydantic v1 method
    return user.dict()
"""
    )
]
