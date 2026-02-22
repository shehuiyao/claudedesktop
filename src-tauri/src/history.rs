use serde::{Deserialize, Serialize};
use std::fs;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HistoryEntry {
    pub display: Option<String>,
    pub timestamp: Option<String>,
    pub project: Option<String>,
    #[serde(rename = "sessionId")]
    pub session_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SessionMessage {
    pub role: Option<String>,
    pub content: Option<serde_json::Value>,
    #[serde(rename = "type")]
    pub msg_type: Option<String>,
}

fn claude_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(".claude"))
}

pub fn read_history() -> Result<Vec<HistoryEntry>, String> {
    let path = claude_dir()
        .ok_or("Cannot find home directory")?
        .join("history.jsonl");

    if !path.exists() {
        return Ok(vec![]);
    }

    let file = fs::File::open(&path).map_err(|e| format!("Failed to open history: {}", e))?;
    let reader = BufReader::new(file);
    let mut entries = Vec::new();

    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read line: {}", e))?;
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        match serde_json::from_str::<HistoryEntry>(trimmed) {
            Ok(entry) => entries.push(entry),
            Err(_) => continue,
        }
    }
    Ok(entries)
}

pub fn read_session(project_slug: &str, session_id: &str) -> Result<Vec<SessionMessage>, String> {
    let path = claude_dir()
        .ok_or("Cannot find home directory")?
        .join("projects")
        .join(project_slug)
        .join(format!("{}.jsonl", session_id));

    if !path.exists() {
        return Err(format!("Session file not found: {:?}", path));
    }

    let file = fs::File::open(&path).map_err(|e| format!("Failed to open session: {}", e))?;
    let reader = BufReader::new(file);
    let mut messages = Vec::new();

    for line in reader.lines() {
        let line = line.map_err(|e| format!("Failed to read line: {}", e))?;
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        match serde_json::from_str::<SessionMessage>(trimmed) {
            Ok(msg) => messages.push(msg),
            Err(_) => continue,
        }
    }
    Ok(messages)
}

pub fn list_projects() -> Result<Vec<String>, String> {
    let path = claude_dir()
        .ok_or("Cannot find home directory")?
        .join("projects");

    if !path.exists() {
        return Ok(vec![]);
    }

    let mut projects = Vec::new();
    let entries = fs::read_dir(&path).map_err(|e| format!("Failed to read projects: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        if entry.path().is_dir() {
            if let Some(name) = entry.file_name().to_str() {
                projects.push(name.to_string());
            }
        }
    }
    Ok(projects)
}
