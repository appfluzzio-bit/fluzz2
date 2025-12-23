"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  MoreVertical,
  Smile,
  Paperclip,
  Send,
  Phone,
  Video,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data para demonstração
const mockConversations = [
  {
    id: 1,
    name: "João Silva",
    lastMessage: "Obrigado pelo atendimento!",
    time: "14:32",
    unread: 2,
    avatar: "JS",
  },
  {
    id: 2,
    name: "Maria Santos",
    lastMessage: "Quando vai chegar o pedido?",
    time: "13:15",
    unread: 0,
    avatar: "MS",
  },
  {
    id: 3,
    name: "Pedro Costa",
    lastMessage: "Ok, perfeito!",
    time: "12:05",
    unread: 0,
    avatar: "PC",
  },
  {
    id: 4,
    name: "Ana Paula",
    lastMessage: "Vocês têm esse produto em estoque?",
    time: "11:48",
    unread: 1,
    avatar: "AP",
  },
  {
    id: 5,
    name: "Carlos Mendes",
    lastMessage: "Preciso de ajuda com meu pedido",
    time: "10:22",
    unread: 0,
    avatar: "CM",
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "contact",
    text: "Olá, gostaria de saber sobre os produtos",
    time: "14:30",
  },
  {
    id: 2,
    sender: "me",
    text: "Olá! Claro, posso te ajudar. Qual produto você está procurando?",
    time: "14:31",
  },
  {
    id: 3,
    sender: "contact",
    text: "Estou procurando informações sobre o plano premium",
    time: "14:31",
  },
  {
    id: 4,
    sender: "me",
    text: "O plano premium inclui todos os recursos avançados, suporte prioritário e integrações ilimitadas. Custa R$ 99/mês.",
    time: "14:32",
  },
  {
    id: 5,
    sender: "contact",
    text: "Obrigado pelo atendimento!",
    time: "14:32",
  },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(mockConversations[0]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Chat - Fluzz";
  }, []);

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // Aqui você implementará o envio real
      console.log("Enviando:", message);
      setMessage("");
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-background rounded-lg overflow-hidden border">
      {/* Lista de Conversas - Estilo WhatsApp */}
      <div className="w-[380px] border-r flex flex-col bg-card">
        {/* Header da lista */}
        <div className="p-4 bg-card border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Conversas</h2>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ou iniciar uma conversa"
              className="pl-10 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <ScrollArea className="flex-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedChat(conversation)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer border-b transition-colors hover:bg-accent/50",
                  selectedChat?.id === conversation.id && "bg-accent"
                )}
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {conversation.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {conversation.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-white text-xs font-semibold">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Nenhuma conversa encontrada
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Área do Chat */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {selectedChat.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedChat.name}</h3>
                  <p className="text-xs text-muted-foreground">Online</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4 bg-muted/20">
              <div className="space-y-4">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[65%] rounded-lg px-4 py-2 shadow-sm",
                        msg.sender === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.text}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] mt-1 block text-right",
                          msg.sender === "me"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-end gap-2">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <div className="flex-1">
                  <Input
                    placeholder="Digite uma mensagem"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="resize-none"
                  />
                </div>
                
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-sm text-muted-foreground">
                Escolha uma conversa da lista para começar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

