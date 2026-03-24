export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created_by: string;
  collaborators: string[];
  created_at: string;
  updated_at: string;
}

export interface WebSocketMessage {
  type: "sync" | "awareness" | "update" | "error";
  user_id?: string;
  data?: any;
  message?: string;
}

export interface EditorState {
  noteId: string;
  content: string;
  isConnected: boolean;
  lastSyncTime: number;
}