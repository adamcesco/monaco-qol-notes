// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuEntry, MenuItem, Submenu};
use std::fs;
use std::path::Path;

#[tauri::command]
fn get_file_content(invoke_filepath: &str) -> String {
    let content = fs::read_to_string(invoke_filepath).expect("ERROR");
    content
}

#[tauri::command]
fn write_file(invoke_path: &str, invoke_content: &str) -> String {
    let file_path = Path::new(invoke_path);
    let result = match fs::write(file_path, invoke_content) {
        Ok(()) => String::from("OK"),
        Err(_err) => String::from("ERROR")
    };
    result
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![write_file, get_file_content])
        .menu(Menu::with_items([MenuEntry::Submenu(Submenu::new(
            "File",
            Menu::with_items([
                CustomMenuItem::new("file-open", "Open")
                    .accelerator("CommandOrControl+O")
                    .into(),
                CustomMenuItem::new("file-save", "Save")
                    .accelerator("CommandOrControl+S")
                    .into(),
                CustomMenuItem::new("file-save-as", "Save As...")
                    .accelerator("CommandOrControl+Shift+S")
                    .into(),
                MenuItem::Quit.into(),
            ]),
        ))]))
        .on_menu_event(|event| match event.menu_item_id() {
            "file-open" => {
                event.window().emit("file-menu-event", "open").unwrap();
            }
            "file-save" => {
                event.window().emit("file-menu-event", "save").unwrap();
            }
            "file-save-as" => {
                event.window().emit("file-menu-event", "save-as").unwrap();
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
