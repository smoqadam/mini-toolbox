# Personal Toolkit - Browser-Style App Manager

A simple web-based application that works like a browser with tabs, where each tab can run different mini-apps. Everything is saved locally in your browser - no server needed!

## What is this?

This project creates a browser-like interface where you can:
- Open multiple tabs
- Run different apps in each tab
- Save your work automatically
- Keep everything even after closing the browser

## Features

### 🌟 Tab Management
- Create new tabs
- Switch between tabs
- Close tabs
- Tabs remember what you were doing

### 🎨 Built-in Apps
1. **Draw App** - Digital drawing canvas
   - Choose colors and brush sizes
   - Draw with your mouse
   - Drawings are saved automatically
   - Clear canvas when needed

2. **Notes App** - Simple text editor
   - Write and edit notes
   - Auto-saves as you type
   - Shows save status

3. **Todo App** - Task manager
   - Add new tasks
   - Mark tasks as complete
   - Delete tasks
   - All tasks are saved

### 💾 Auto-Save Everything
- Your drawings are saved automatically
- Notes save as you type
- Todo lists are always up to date
- Tab layout is remembered
- Everything works offline

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. You'll see the launcher with three app icons
3. Click any app to open it in the current tab

### Managing Tabs
- **New Tab**: Click the "+" button
- **Switch Tabs**: Click on any tab
- **Close Tab**: Click the "×" on any tab
- **Home**: Click "+" to create a new launcher tab

### Using the Apps

#### Drawing App
1. Click the "Draw" icon
2. Choose your color and brush size
3. Click and drag to draw
4. Your drawing saves automatically
5. Use "Clear" to start over

#### Notes App
1. Click the "Notes" icon
2. Start typing in the text area
3. Your notes save automatically
4. Green dot means saved, yellow means saving

#### Todo App
1. Click the "Todo" icon
2. Type a task and press Enter or click "Add"
3. Check boxes to mark tasks complete
4. Click "Delete" to remove tasks

## Technical Details

### What You Need
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No internet connection required after downloading
- No installation needed

### How It Works
- Uses HTML5 localStorage to save data
- Each tab gets its own storage space
- Canvas drawings are saved as images
- Text and todos are saved as JSON

### File Structure
```
ddraw/
├── index.html          # Main browser interface
├── script.js           # Tab management and storage
├── README.md          # This file
└── apps/
    ├── draw/
    │   └── index.html  # Drawing app
    ├── notes/
    │   └── index.html  # Notes app
    └── todos/
        └── index.html  # Todo app
```

### Storage
- All data is stored in your browser's localStorage
- Each tab has its own data space
- Data persists between browser sessions
- No data is sent to any server

## Browser Support

Works in all modern browsers:
- ✅ Chrome
- ✅ Firefox  
- ✅ Safari
- ✅ Edge

## Privacy

- Everything stays on your computer
- No data is sent anywhere
- No tracking or analytics
- No internet connection needed

## Limitations

- Storage is limited by your browser (usually 5-10MB)
- Data only exists on one computer/browser
- No sync between devices
- Clearing browser data will delete everything

## Tips

- Use different tabs for different projects
- Your work saves automatically, but you can also close tabs safely
- If you need more space, try clearing old drawings or notes
- Each tab works independently

## Troubleshooting

**Nothing saves**: Check if your browser allows localStorage
**Tabs don't work**: Make sure JavaScript is enabled
**Apps don't load**: Check that all files are in the right folders
**Drawing is slow**: Try using a smaller brush size

---

*This is a simple, offline-first productivity toolkit. Perfect for quick notes, sketches, and task management without needing any accounts or internet connection.*
