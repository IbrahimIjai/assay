use anyhow::{bail, Context, Result};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[async_trait]
pub trait Llm: Send + Sync {
    async fn complete_json(&self, system: &str, user: &str) -> Result<Value>;
    fn model_name(&self) -> &str;
}

#[derive(Clone)]
pub struct OpenAiCompatible {
    pub client: Client,
    pub base_url: String,
    pub api_key: String,
    pub model: String,
}

impl OpenAiCompatible {
    pub fn from_env() -> Result<Self> {
        let api_key = std::env::var("OPENAI_API_KEY")
            .context("OPENAI_API_KEY is required for live LLM mode")?;
        let base_url = std::env::var("OPENAI_BASE_URL")
            .unwrap_or_else(|_| "https://api.openai.com/v1".to_string());
        let model = std::env::var("OPENAI_MODEL")
            .unwrap_or_else(|_| "gpt-5-mini".to_string());
        Ok(Self { client: Client::new(), base_url, api_key, model })
    }
}

#[derive(Debug, Serialize)]
struct Message<'a> { role: &'a str, content: &'a str }
#[derive(Debug, Deserialize)]
struct ChatResponse { choices: Vec<Choice> }
#[derive(Debug, Deserialize)]
struct Choice { message: MessageOwned }
#[derive(Debug, Deserialize)]
struct MessageOwned { content: String }

#[async_trait]
impl Llm for OpenAiCompatible {
    async fn complete_json(&self, system: &str, user: &str) -> Result<Value> {
        let body = json!({
            "model": self.model,
            "response_format": { "type": "json_object" },
            "messages": [
                Message { role: "system", content: system },
                Message { role: "user", content: user },
            ]
        });
        let response = self.client
            .post(format!("{}/chat/completions", self.base_url.trim_end_matches('/')))
            .bearer_auth(&self.api_key)
            .json(&body)
            .send().await?
            .error_for_status()?;
        let parsed: ChatResponse = response.json().await?;
        let content = parsed.choices.first().context("LLM returned no choices")?.message.content.clone();
        Ok(serde_json::from_str(&content).context("LLM returned invalid JSON")?)
    }
    fn model_name(&self) -> &str { &self.model }
}

#[derive(Clone, Default)]
pub struct MockLlm;

#[async_trait]
impl Llm for MockLlm {
    async fn complete_json(&self, system: &str, user: &str) -> Result<Value> {
        if system.contains("evidence extraction") {
            let re = regex::Regex::new(r"(?m)Asset identifier\s+([A-Z0-9-]+).*?Vault/account reference\s+([A-Z0-9-]+).*?Quantity held\s+([0-9,]+)\s+([a-zA-Z]+).*?As of\s+([^\n]+)").unwrap();
            let caps = re.captures(user).context("mock parser could not find reserve fields")?;
            return Ok(json!({
                "asset_id": &caps[1],
                "custodian": "DEMO-CUSTODIAN",
                "quantity": &caps[3],
                "unit": &caps[4],
                "account_ref": &caps[2],
                "as_of": caps[5].trim(),
                "confidence": 0.99
            }));
        }
        if system.contains("anomaly analyst") {
            return Ok(json!({"findings": []}));
        }
        bail!("MockLlm does not implement this prompt")
    }
    fn model_name(&self) -> &str { "mock-fixture-extractor" }
}
