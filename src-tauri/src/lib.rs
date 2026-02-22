mod history;

#[tauri::command]
fn get_history() -> Result<Vec<history::HistoryEntry>, String> {
    history::read_history()
}

#[tauri::command]
fn get_session(project_slug: String, session_id: String) -> Result<Vec<history::SessionMessage>, String> {
    history::read_session(&project_slug, &session_id)
}

#[tauri::command]
fn get_projects() -> Result<Vec<String>, String> {
    history::list_projects()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_history,
            get_session,
            get_projects
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
