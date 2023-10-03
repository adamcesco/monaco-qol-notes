// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, MenuEntry, MenuItem, Submenu};

fn main() {
    tauri::Builder::default()
        .menu(Menu::with_items([MenuEntry::Submenu(Submenu::new(
            "File",
            Menu::with_items([
                CustomMenuItem::new("open-file", "Open")
                    .accelerator("CmdOrCtrl+O")
                    .into(),
                CustomMenuItem::new("save-file", "Save")
                    .accelerator("CmdOrCtrl+S")
                    .into(),
                CustomMenuItem::new("save-file-as", "Save As...")
                    .accelerator("CmdOrCtrl+Shift+S")
                    .into(),
                MenuItem::Quit.into(),
            ]),
        ))]))
        .on_menu_event(|event| match event.menu_item_id() {
            "open-file" => {
                println!("open-file clicked");
            }
            "save-file" => {
                println!("save-file clicked");
            }
            "save-file-as" => {
                println!("save-file-as clicked");
            }
            "quit" => {
                std::process::exit(0);
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
