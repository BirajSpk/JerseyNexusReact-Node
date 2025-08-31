import React from 'react';

// Simple icon component to replace lucide-react temporarily
const SimpleIcon = ({ name, size = 20, className = '', ...props }) => {
  const iconMap = {
    // Navigation & UI
    'Menu': '☰',
    'X': '✕',
    'Search': '🔍',
    'Home': '🏠',
    'Settings': '⚙️',
    'ChevronDown': '▼',
    'ChevronUp': '▲',
    'ChevronLeft': '◀',
    'ChevronRight': '▶',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'MoreHorizontal': '⋯',
    'MoreVertical': '⋮',
    
    // Shopping & E-commerce
    'ShoppingCart': '🛒',
    'ShoppingBag': '🛍️',
    'Package': '📦',
    'Truck': '🚚',
    'DollarSign': '$',
    
    // User & Authentication
    'User': '👤',
    'Users': '👥',
    'LogOut': '🚪',
    'Lock': '🔒',
    'Unlock': '🔓',
    'Shield': '🛡️',
    'Eye': '👁️',
    'EyeOff': '🙈',
    
    // Actions
    'Plus': '+',
    'Minus': '−',
    'Edit': '✏️',
    'Trash2': '🗑️',
    'Check': '✓',
    'Save': '💾',
    'Copy': '📋',
    'Upload': '⬆️',
    'Download': '⬇️',
    'RefreshCw': '🔄',
    
    // Content & Media
    'Heart': '❤️',
    'Star': '⭐',
    'Image': '🖼️',
    'Video': '🎥',
    'File': '📄',
    'Folder': '📁',
    'Camera': '📷',
    
    // Communication
    'Mail': '✉️',
    'Phone': '📞',
    'MapPin': '📍',
    'ExternalLink': '🔗',
    'Globe': '🌐',
    
    // Time & Calendar
    'Calendar': '📅',
    'Clock': '🕐',
    
    // Alerts & Status
    'AlertCircle': '⚠️',
    'Info': 'ℹ️',
    'CheckCircle': '✅',
    'XCircle': '❌',
    
    // Layout & Display
    'Filter': '🔽',
    'Grid': '⊞',
    'List': '☰',
    'Layout': '⊡',
    'Sidebar': '⊟',
    
    // Charts & Analytics
    'BarChart': '📊',
    'PieChart': '📈',
    'TrendingUp': '📈',
    
    // Technology
    'Database': '🗄️',
    'Server': '🖥️',
    'Monitor': '🖥️',
    'Smartphone': '📱',
    'Tablet': '📱',
    'Wifi': '📶',
    'Terminal': '⌨️',
    'Code': '💻',
    
    // Shapes & Misc
    'Square': '⬜',
    'Circle': '⚪',
    'Triangle': '🔺',
    'Bell': '🔔',
    'Bookmark': '🔖',
    'Tag': '🏷️',
    'Flag': '🚩',
    'Zap': '⚡',
    'Award': '🏆',
    'Gift': '🎁',

    // Social Media
    'Facebook': '📘',
    'Instagram': '📷',
    'Twitter': '🐦',

    // Additional Icons
    'Share2': '📤',
    'CreditCard': '💳',
    'Banknote': '💵',
    'Send': '📤',
    'Loader': '⏳',

    // Rich Text Editor Icons
    'Strikethrough': 'S',
    'ListOrdered': '1.',
    'Quote': '"',
    'Undo': '↶',
    'Redo': '↷',
    'Youtube': '📺',
    'Paperclip': '📎',
    'Link': '🔗',
    'Scissors': '✂️',
    'Printer': '🖨️',
    'Volume2': '🔊',
    'VolumeX': '🔇',
    'Play': '▶️',
    'Pause': '⏸️',
    'Stop': '⏹️',
    'SkipBack': '⏮️',
    'SkipForward': '⏭️',
    'Repeat': '🔁',
    'Shuffle': '🔀',
    'Maximize': '⛶',
    'Minimize': '⛷',
    'RotateCcw': '↺',
    'RotateCw': '↻',
    'ZoomIn': '🔍+',
    'ZoomOut': '🔍-',
    'Move': '✋',
    'Crop': '✂️',
    'PenTool': '✏️',
    'Type': 'T',
    'Bold': 'B',
    'Italic': 'I',
    'Underline': 'U',
    'AlignLeft': '⬅️',
    'AlignCenter': '↔️',
    'AlignRight': '➡️',
    'AlignJustify': '⬌',
    'Layers': '⧉',
    'GitBranch': '🌿',
    'GitCommit': '●',
    'GitMerge': '⧬',
    'GitPullRequest': '⤴️',
    'Book': '📖',
    'BookOpen': '📖',
    'Mic': '🎤'
  };

  const icon = iconMap[name] || '?';
  
  const style = {
    fontSize: `${size}px`,
    lineHeight: 1,
    display: 'inline-block',
    verticalAlign: 'middle'
  };

  return (
    <span 
      className={`simple-icon ${className}`} 
      style={style}
      {...props}
    >
      {icon}
    </span>
  );
};

// Export individual icon components for compatibility
export const Menu = (props) => <SimpleIcon name="Menu" {...props} />;
export const X = (props) => <SimpleIcon name="X" {...props} />;
export const Search = (props) => <SimpleIcon name="Search" {...props} />;
export const ShoppingCart = (props) => <SimpleIcon name="ShoppingCart" {...props} />;
export const User = (props) => <SimpleIcon name="User" {...props} />;
export const Heart = (props) => <SimpleIcon name="Heart" {...props} />;
export const Star = (props) => <SimpleIcon name="Star" {...props} />;
export const Plus = (props) => <SimpleIcon name="Plus" {...props} />;
export const Minus = (props) => <SimpleIcon name="Minus" {...props} />;
export const Edit = (props) => <SimpleIcon name="Edit" {...props} />;
export const Trash2 = (props) => <SimpleIcon name="Trash2" {...props} />;
export const ChevronDown = (props) => <SimpleIcon name="ChevronDown" {...props} />;
export const ChevronUp = (props) => <SimpleIcon name="ChevronUp" {...props} />;
export const ChevronLeft = (props) => <SimpleIcon name="ChevronLeft" {...props} />;
export const ChevronRight = (props) => <SimpleIcon name="ChevronRight" {...props} />;
export const Filter = (props) => <SimpleIcon name="Filter" {...props} />;
export const Grid = (props) => <SimpleIcon name="Grid" {...props} />;
export const List = (props) => <SimpleIcon name="List" {...props} />;
export const Eye = (props) => <SimpleIcon name="Eye" {...props} />;
export const EyeOff = (props) => <SimpleIcon name="EyeOff" {...props} />;
export const Mail = (props) => <SimpleIcon name="Mail" {...props} />;
export const Phone = (props) => <SimpleIcon name="Phone" {...props} />;
export const MapPin = (props) => <SimpleIcon name="MapPin" {...props} />;
export const Calendar = (props) => <SimpleIcon name="Calendar" {...props} />;
export const Clock = (props) => <SimpleIcon name="Clock" {...props} />;
export const Package = (props) => <SimpleIcon name="Package" {...props} />;
export const Truck = (props) => <SimpleIcon name="Truck" {...props} />;
export const AlertCircle = (props) => <SimpleIcon name="AlertCircle" {...props} />;
export const CheckCircle = (props) => <SimpleIcon name="CheckCircle" {...props} />;
export const XCircle = (props) => <SimpleIcon name="XCircle" {...props} />;
export const Info = (props) => <SimpleIcon name="Info" {...props} />;
export const Settings = (props) => <SimpleIcon name="Settings" {...props} />;
export const LogOut = (props) => <SimpleIcon name="LogOut" {...props} />;
export const Home = (props) => <SimpleIcon name="Home" {...props} />;
export const Users = (props) => <SimpleIcon name="Users" {...props} />;
export const BarChart = (props) => <SimpleIcon name="BarChart" {...props} />;
export const PieChart = (props) => <SimpleIcon name="PieChart" {...props} />;
export const TrendingUp = (props) => <SimpleIcon name="TrendingUp" {...props} />;
export const Bell = (props) => <SimpleIcon name="Bell" {...props} />;
export const Database = (props) => <SimpleIcon name="Database" {...props} />;
export const Server = (props) => <SimpleIcon name="Server" {...props} />;
export const Monitor = (props) => <SimpleIcon name="Monitor" {...props} />;
export const RefreshCw = (props) => <SimpleIcon name="RefreshCw" {...props} />;
export const ExternalLink = (props) => <SimpleIcon name="ExternalLink" {...props} />;
export const Copy = (props) => <SimpleIcon name="Copy" {...props} />;
export const Download = (props) => <SimpleIcon name="Download" {...props} />;
export const Upload = (props) => <SimpleIcon name="Upload" {...props} />;
export const Save = (props) => <SimpleIcon name="Save" {...props} />;
export const Check = (props) => <SimpleIcon name="Check" {...props} />;
export const ArrowLeft = (props) => <SimpleIcon name="ArrowLeft" {...props} />;
export const ArrowRight = (props) => <SimpleIcon name="ArrowRight" {...props} />;
export const MoreHorizontal = (props) => <SimpleIcon name="MoreHorizontal" {...props} />;
export const MoreVertical = (props) => <SimpleIcon name="MoreVertical" {...props} />;
export const ShoppingBag = (props) => <SimpleIcon name="ShoppingBag" {...props} />;
export const Gift = (props) => <SimpleIcon name="Gift" {...props} />;
export const Shield = (props) => <SimpleIcon name="Shield" {...props} />;
export const Zap = (props) => <SimpleIcon name="Zap" {...props} />;
export const Lock = (props) => <SimpleIcon name="Lock" {...props} />;

// Social Media Icons
export const Facebook = (props) => <SimpleIcon name="Facebook" {...props} />;
export const Instagram = (props) => <SimpleIcon name="Instagram" {...props} />;
export const Twitter = (props) => <SimpleIcon name="Twitter" {...props} />;

// Additional Icons
export const Share2 = (props) => <SimpleIcon name="Share2" {...props} />;
export const CreditCard = (props) => <SimpleIcon name="CreditCard" {...props} />;
export const Banknote = (props) => <SimpleIcon name="Banknote" {...props} />;
export const RotateCcw = (props) => <SimpleIcon name="RotateCcw" {...props} />;
export const Send = (props) => <SimpleIcon name="Send" {...props} />;
export const Loader = (props) => <SimpleIcon name="Loader" {...props} />;
export const Camera = (props) => <SimpleIcon name="Camera" {...props} />;

// Rich Text Editor Icons
export const Strikethrough = (props) => <SimpleIcon name="Strikethrough" {...props} />;
export const ListOrdered = (props) => <SimpleIcon name="ListOrdered" {...props} />;
export const Quote = (props) => <SimpleIcon name="Quote" {...props} />;
export const Undo = (props) => <SimpleIcon name="Undo" {...props} />;
export const Redo = (props) => <SimpleIcon name="Redo" {...props} />;
export const Youtube = (props) => <SimpleIcon name="Youtube" {...props} />;

export default SimpleIcon;
