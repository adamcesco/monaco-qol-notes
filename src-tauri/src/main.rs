// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::Path;
use tauri::{CustomMenuItem, Menu, MenuEntry, MenuItem, Submenu};

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
        Err(_err) => String::from("ERROR"),
    };
    result
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![write_file, get_file_content])
        .menu(Menu::with_items([
            MenuEntry::Submenu(Submenu::new(
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
            )),
            MenuEntry::Submenu(Submenu::new(
                "View",
                Menu::with_items([
                    CustomMenuItem::new("tog-on-top", "Toggle Always On Top")
                    .accelerator("CommandOrControl+T")
                    .into(),
                    CustomMenuItem::new("zoom-in", "Zoom In")
                    .accelerator("CommandOrControl+=")
                    .into(),
                    CustomMenuItem::new("zoom-out", "Zoom Out")
                    .accelerator("CommandOrControl+-")
                    .into(),
                ]),
            )),
        ]))
        .on_menu_event(|event| match event.menu_item_id() {
            "file-open" => {
                event.window().emit("menu-event", "open").unwrap();
            }
            "file-save" => {
                event.window().emit("menu-event", "save").unwrap();
            }
            "file-save-as" => {
                event.window().emit("menu-event", "save-as").unwrap();
            }
            "quit" => {
                std::process::exit(0);
            }
            "tog-on-top" => {
                event.window().emit("menu-event", "tog-on-top").unwrap();
            }
            "zoom-in" => {
                event.window().emit("menu-event", "zoom-in").unwrap();
            }
            "zoom-out" => {
                event.window().emit("menu-event", "zoom-out").unwrap();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
