"""API endpoint integration tests using FastAPI TestClient."""
import pytest
from starlette.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "DiffGuard AI"
    assert data["status"] == "online"

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "AST" in data["ast_engine"]

def test_presets_list():
    response = client.get("/api/presets")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) >= 3
    preset_ids = [p["id"] for p in presets]
    assert "stripe-charge-to-payment-intent" in preset_ids
    assert "openai-v0-to-v1" in preset_ids

def test_single_preset_found():
    response = client.get("/api/presets/stripe-charge-to-payment-intent")
    assert response.status_code == 200
    preset = response.json()
    assert preset["library"] == "Stripe"
    assert "stripe.Charge.create" in preset["sample_code"]

def test_single_preset_not_found():
    response = client.get("/api/presets/non-existent-preset")
    assert response.status_code == 404

def test_pipeline_run_endpoint():
    payload = {
        "changelog_text": "OpenAI v1.0.0 migration: Deprecate openai.ChatCompletion.create in favor of client.chat.completions.create.",
        "source_code": "import openai\nres = openai.ChatCompletion.create(model='gpt-4o', messages=[])\n",
        "file_path": "bot.py"
    }
    response = client.post("/api/pipeline/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["ast_nodes_scanned"] > 0
    assert len(data["detected_issues"]) > 0
    assert len(data["robot_steps"]) == 4
    assert data["patch_result"]["is_ast_valid"] is True
    assert "client.chat.completions.create" in data["patch_result"]["patched_code"]

def test_repo_scan_endpoint(tmp_path):
    # Create sample repo structure with one outdated file and one modern file
    file1 = tmp_path / "checkout.py"
    file1.write_text("import stripe\ndef pay(t, a):\n    return stripe.Charge.create(amount=a, source=t)\n", encoding="utf-8")
    
    file2 = tmp_path / "clean.py"
    file2.write_text("def add(a, b):\n    return a + b\n", encoding="utf-8")

    payload = {
        "repo_path": str(tmp_path),
        "changelog_text": "Stripe: Deprecated stripe.Charge.create in favor of stripe.PaymentIntent.create."
    }
    response = client.post("/api/repo/scan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scanned_files_count"] == 1
    assert data["total_issues"] == 1
    assert data["files"][0]["relative_path"] == "checkout.py"
    assert "stripe.PaymentIntent.create" in data["combined_patch"]
