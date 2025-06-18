// Global variables and functions (must be declared first)
let hexEditor;

// Global functions for button handlers
function saveFile() {
  if (hexEditor) hexEditor.saveFile();
}

function exportFile() {
  if (hexEditor) hexEditor.exportFile();
}

function searchHex() {
  if (hexEditor) hexEditor.searchHex();
}

function jumpToOffset() {
  if (hexEditor) hexEditor.jumpToOffset();
}

class HexEditor {
  constructor() {
    this.data = null;
    this.filename = '';
    this.modified = false;
    this.selectedBytes = new Set();
    this.currentOffset = 0;
    this.bytesPerRow = 16;
    this.searchResults = [];
    this.currentSearchIndex = -1;
    
    this.initEventListeners();
  }

  initEventListeners() {
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    
    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.searchHex();
    });

    // Goto input
    const gotoInput = document.getElementById('goto-input');
    gotoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.jumpToOffset();
    });
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    this.filename = file.name;
    this.setStatus('Loading file...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.data = new Uint8Array(e.target.result);
      this.modified = false;
      this.selectedBytes.clear();
      this.currentOffset = 0;
      this.updateDisplay();
      this.updateFileInfo();
      this.setStatus(`Loaded ${file.name} (${this.data.length} bytes)`);
      
      // Enable buttons
      document.getElementById('save-btn').disabled = false;
      document.getElementById('export-btn').disabled = false;
    };
    
    reader.onerror = () => {
      this.setStatus('Error loading file');
    };
    
    reader.readAsArrayBuffer(file);
  }

  updateDisplay() {
    const container = document.getElementById('hex-container');
    const noFileDiv = document.getElementById('no-file');
    const hexDisplay = document.getElementById('hex-display');

    if (!this.data) {
      noFileDiv.classList.remove('hidden');
      hexDisplay.classList.add('hidden');
      return;
    }

    noFileDiv.classList.add('hidden');
    hexDisplay.classList.remove('hidden');

    let html = '';
    const totalRows = Math.ceil(this.data.length / this.bytesPerRow);

    for (let row = 0; row < totalRows; row++) {
      const offset = row * this.bytesPerRow;
      html += this.renderRow(offset);
    }

    hexDisplay.innerHTML = html;
    this.attachByteEventListeners();
  }

  renderRow(offset) {
    const offsetHex = offset.toString(16).padStart(8, '0').toUpperCase();
    let html = `<div class="hex-row">`;
    
    // Offset column
    html += `<div class="hex-offset">${offsetHex}</div>`;
    
    // Hex bytes column
    html += `<div class="hex-bytes">`;
    for (let i = 0; i < this.bytesPerRow; i++) {
      const byteIndex = offset + i;
      if (byteIndex < this.data.length) {
        const byte = this.data[byteIndex];
        const hexValue = byte.toString(16).padStart(2, '0').toUpperCase();
        const isSelected = this.selectedBytes.has(byteIndex);
        const isHighlighted = this.searchResults.includes(byteIndex);
        
        let classes = 'hex-byte';
        if (isSelected) classes += ' selected';
        if (isHighlighted) classes += ' search-highlight';
        
        html += `<span class="${classes}" data-offset="${byteIndex}">${hexValue}</span>`;
      } else {
        html += `<span class="hex-byte"></span>`;
      }
      
      // Add spacer in the middle
      if (i === 7) html += `<div class="hex-spacer"></div>`;
    }
    html += `</div>`;
    
    // ASCII column
    html += `<div class="ascii-display">`;
    for (let i = 0; i < this.bytesPerRow && offset + i < this.data.length; i++) {
      const byte = this.data[offset + i];
      const char = (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
      const isSelected = this.selectedBytes.has(offset + i);
      
      let classes = 'ascii-char';
      if (isSelected) classes += ' selected';
      
      html += `<span class="${classes}" data-offset="${offset + i}">${char}</span>`;
    }
    html += `</div>`;
    
    html += `</div>`;
    return html;
  }

  attachByteEventListeners() {
    // Hex byte click handlers
    document.querySelectorAll('.hex-byte[data-offset]').forEach(el => {
      const offset = parseInt(el.dataset.offset);
      
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectByte(offset, e.ctrlKey || e.metaKey);
      });
      
      el.addEventListener('dblclick', (e) => {
        e.preventDefault();
        this.editByte(offset);
      });

      el.addEventListener('mouseenter', () => {
        this.updateCursorPosition(offset);
      });
    });

    // ASCII char click handlers
    document.querySelectorAll('.ascii-char[data-offset]').forEach(el => {
      const offset = parseInt(el.dataset.offset);
      
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.selectByte(offset, e.ctrlKey || e.metaKey);
      });
    });
  }

  selectByte(offset, multiSelect = false) {
    if (!multiSelect) {
      this.selectedBytes.clear();
    }
    
    if (this.selectedBytes.has(offset)) {
      this.selectedBytes.delete(offset);
    } else {
      this.selectedBytes.add(offset);
    }
    
    this.updateDisplay();
    this.updateSelectionInfo();
  }

  editByte(offset) {
    const currentValue = this.data[offset];
    const hexValue = currentValue.toString(16).padStart(2, '0').toUpperCase();
    
    const newValue = prompt(
      `Edit byte at offset 0x${offset.toString(16).padStart(8, '0').toUpperCase()}:\n` +
      `Current value: 0x${hexValue} (${currentValue})`,
      hexValue
    );
    
    if (newValue !== null) {
      const parsed = parseInt(newValue, 16);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) {
        this.data[offset] = parsed;
        this.modified = true;
        this.updateDisplay();
        this.updateModifiedIndicator();
        this.setStatus(`Modified byte at offset 0x${offset.toString(16).padStart(8, '0').toUpperCase()}`);
      } else {
        alert('Invalid hex value. Please enter a value between 00 and FF.');
      }
    }
  }

  searchHex() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (!query || !this.data) return;
    
    // Parse hex search query
    const hexBytes = query.split(/\s+/).map(hex => {
      const cleaned = hex.replace(/^0x/i, '');
      return parseInt(cleaned, 16);
    }).filter(byte => !isNaN(byte) && byte >= 0 && byte <= 255);
    
    if (hexBytes.length === 0) {
      alert('Invalid search query. Enter hex values separated by spaces (e.g., "FF 00 AB")');
      return;
    }
    
    this.searchResults = [];
    
    // Search for pattern
    for (let i = 0; i <= this.data.length - hexBytes.length; i++) {
      let match = true;
      for (let j = 0; j < hexBytes.length; j++) {
        if (this.data[i + j] !== hexBytes[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        for (let j = 0; j < hexBytes.length; j++) {
          this.searchResults.push(i + j);
        }
      }
    }
    
    this.updateDisplay();
    
    if (this.searchResults.length > 0) {
      this.setStatus(`Found ${this.searchResults.length / hexBytes.length} matches`);
      // Scroll to first result
      this.scrollToOffset(this.searchResults[0]);
    } else {
      this.setStatus('No matches found');
    }
  }

  jumpToOffset() {
    const gotoInput = document.getElementById('goto-input');
    const input = gotoInput.value.trim();
    
    if (!input || !this.data) return;
    
    let offset;
    if (input.startsWith('0x') || input.startsWith('0X')) {
      offset = parseInt(input, 16);
    } else {
      offset = parseInt(input, 10);
    }
    
    if (isNaN(offset) || offset < 0 || offset >= this.data.length) {
      alert(`Invalid offset. Enter a value between 0 and 0x${(this.data.length - 1).toString(16).toUpperCase()}`);
      return;
    }
    
    this.scrollToOffset(offset);
    this.selectByte(offset);
    gotoInput.value = '';
  }

  scrollToOffset(offset) {
    const row = Math.floor(offset / this.bytesPerRow);
    const hexDisplay = document.getElementById('hex-display');
    const rows = hexDisplay.querySelectorAll('.hex-row');
    
    if (rows[row]) {
      rows[row].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  updateCursorPosition(offset) {
    const cursorPos = document.getElementById('cursor-pos');
    cursorPos.textContent = `Position: 0x${offset.toString(16).padStart(8, '0').toUpperCase()} (${offset})`;
  }

  updateSelectionInfo() {
    const selectionInfo = document.getElementById('selection-info');
    if (this.selectedBytes.size > 0) {
      selectionInfo.textContent = `Selected: ${this.selectedBytes.size} bytes`;
      selectionInfo.classList.remove('hidden');
    } else {
      selectionInfo.classList.add('hidden');
    }
  }

  updateFileInfo() {
    const filenameEl = document.getElementById('filename');
    const filesizeEl = document.getElementById('filesize');
    const filetypeEl = document.getElementById('filetype');
    const fileInfo = document.getElementById('file-info');
    
    if (this.data) {
      filenameEl.textContent = this.filename;
      filesizeEl.textContent = `${this.data.length} bytes`;
      filetypeEl.textContent = this.getFileType();
      fileInfo.classList.remove('hidden');
    } else {
      fileInfo.classList.add('hidden');
    }
  }

  updateModifiedIndicator() {
    const indicator = document.getElementById('modified-indicator');
    if (this.modified) {
      indicator.classList.remove('hidden');
    } else {
      indicator.classList.add('hidden');
    }
  }

  getFileType() {
    if (!this.data || this.data.length < 4) return 'Unknown';
    
    // Check for common file signatures
    const signature = Array.from(this.data.slice(0, 4))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('').toUpperCase();
    
    const signatures = {
      '89504E47': 'PNG Image',
      'FFD8FFE0': 'JPEG Image',
      '47494638': 'GIF Image',
      '504B0304': 'ZIP Archive',
      '25504446': 'PDF Document',
      '4D5A9000': 'Executable (PE)',
      '7F454C46': 'ELF Executable',
      'CAFEBABE': 'Java Class',
    };
    
    for (const [sig, type] of Object.entries(signatures)) {
      if (signature.startsWith(sig)) return type;
    }
    
    return 'Binary';
  }

  setStatus(message) {
    document.getElementById('status-text').textContent = message;
  }

  handleKeyPress(event) {
    if (!this.data) return;
    
    // Ctrl+S or Cmd+S for save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.saveFile();
    }
    
    // Ctrl+F or Cmd+F for find
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault();
      document.getElementById('search-input').focus();
    }
    
    // Ctrl+G or Cmd+G for goto
    if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
      event.preventDefault();
      document.getElementById('goto-input').focus();
    }
  }
}

// Extended HexEditor class methods
HexEditor.prototype.saveFile = function() {
  if (!this.data) return;
  
  const blob = new Blob([this.data], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = this.filename || 'modified_file.bin';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  this.modified = false;
  this.updateModifiedIndicator();
  this.setStatus('File saved successfully');
};

HexEditor.prototype.exportFile = function() {
  if (!this.data) return;
  
  // Export as hex dump text
  let hexDump = '';
  const bytesPerRow = this.bytesPerRow;
  
  for (let i = 0; i < this.data.length; i += bytesPerRow) {
    const offset = i.toString(16).padStart(8, '0').toUpperCase();
    let hexBytes = '';
    let asciiChars = '';
    
    for (let j = 0; j < bytesPerRow; j++) {
      if (i + j < this.data.length) {
        const byte = this.data[i + j];
        hexBytes += byte.toString(16).padStart(2, '0').toUpperCase() + ' ';
        asciiChars += (byte >= 32 && byte <= 126) ? String.fromCharCode(byte) : '.';
      } else {
        hexBytes += '   ';
        asciiChars += ' ';
      }
      
      if (j === 7) hexBytes += ' '; // Extra space in middle
    }
    
    hexDump += `${offset}  ${hexBytes} |${asciiChars}|\n`;
  }
  
  const blob = new Blob([hexDump], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${this.filename || 'hexdump'}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  this.setStatus('Hex dump exported successfully');
};

// Initialize the hex editor when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  hexEditor = new HexEditor();
});
