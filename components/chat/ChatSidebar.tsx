"use client"

import type React from "react"

import { useState } from "react"
import { useChatContext, type ChatMode } from "@/contexts/ChatContext"
import { Trash2, Plus, MessageSquare, TrendingUp, PiggyBank, DollarSign, Globe, ChevronDown, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatSidebarProps {
  onClose?: () => void
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const {
    conversations,
    currentConversation,
    createConversation,
    switchConversation,
    deleteConversation,
    chatMode,
    setChatMode,
  } = useChatContext()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null)

  const formatTimestamp = (timestamp: number) => {
    try {
      const date = new Date(timestamp)
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const handleCreateConversation = (mode: ChatMode) => {
    createConversation(mode)
  }

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversationToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (conversationToDelete) {
      deleteConversation(conversationToDelete)
      setIsDeleteModalOpen(false)
      setConversationToDelete(null)
    }
  }

  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case "trading":
        return <TrendingUp className="w-4 h-4" />
      case "staking":
        return <PiggyBank className="w-4 h-4" />
      case "lending":
        return <DollarSign className="w-4 h-4" />
      case "market":
        return <Globe className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-between gap-1">
                <span className="flex items-center gap-1">
                  {getModeIcon(chatMode)}
                  <span className="capitalize">{chatMode}</span>
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
              <DropdownMenuItem onClick={() => setChatMode("general")}>
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>General</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChatMode("trading")}>
                <TrendingUp className="w-4 h-4 mr-2" />
                <span>Trading</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChatMode("staking")}>
                <PiggyBank className="w-4 h-4 mr-2" />
                <span>Staking</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChatMode("lending")}>
                <DollarSign className="w-4 h-4 mr-2" />
                <span>Lending</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setChatMode("market")}>
                <Globe className="w-4 h-4 mr-2" />
                <span>Market</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button
          onClick={() => handleCreateConversation(chatMode)}
          className="w-full flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {conversations.length === 0 ? (
          <div className="p-4 text-muted-foreground text-sm text-center">No conversations yet</div>
        ) : (
          <ul className="divide-y divide-border">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                onClick={() => switchConversation(conversation.id)}
                className={`group p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  currentConversation?.id === conversation.id ? "bg-muted/50" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getModeIcon(conversation.mode)}
                      <div className="flex items-center gap-2 flex-1 min-w-0 group/name">
                        <p className="font-medium truncate flex-1">{conversation.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(conversation.lastUpdated)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(conversation.id, e)}
                    className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-sm w-full mx-auto border border-border">
            <h3 className="text-lg font-semibold mb-2">Delete Conversation</h3>
            <p className="text-card-foreground mb-4">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

