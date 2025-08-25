function ChatListItem({ contact, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
          : "hover:bg-white/10 border border-transparent"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white relative ${
          isActive
            ? "bg-gradient-to-r from-purple-500 to-pink-500"
            : "bg-gradient-to-r from-blue-500 to-cyan-500"
        }`}
      >
        {contact.displayName ? contact.displayName[0].toUpperCase() : "?"}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`font-medium truncate ${
            isActive ? "text-white" : "text-slate-200"
          }`}
        >
          {contact.displayName}
        </div>
        <div className="text-sm text-slate-400 truncate">
          @{contact.username}
        </div>
      </div>
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
      )}
    </div>
  );
}

export default ChatListItem;
