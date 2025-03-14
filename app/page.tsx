"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Chat } from "@/components/chat/Chat"
import { Dashboard } from "@/components/dashboard/Dashboard"
import { Header } from "@/components/Header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("chat")

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <div className="border-b border-border">
                <div className="container mx-auto px-4">
                  <TabsList className="mt-2">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <TabsContent value="chat" className="flex-1 overflow-hidden">
                <Chat />
              </TabsContent>
              <TabsContent value="dashboard" className="flex-1 overflow-auto">
                <Dashboard />
              </TabsContent>
            </Tabs>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}

