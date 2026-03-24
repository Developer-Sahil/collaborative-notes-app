import axios, { AxiosInstance } from "axios";
import { auth } from "./firebase";
import { Note } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 10000,
    });

    // Add token to requests
    this.client.interceptors.request.use(async (config) => {
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Notes endpoints
  async createNote(title: string, content: string = ""): Promise<Note> {
    const response = await this.client.post("/notes", {
      title,
      content,
    });
    return response.data;
  }

  async getNotes(): Promise<Note[]> {
    const response = await this.client.get("/notes");
    return response.data.notes;
  }

  async getNote(noteId: string): Promise<Note> {
    const response = await this.client.get(`/notes/${noteId}`);
    return response.data;
  }

  async updateNote(
    noteId: string,
    updates: Partial<{ title: string; content: string }>
  ): Promise<Note> {
    const response = await this.client.patch(`/notes/${noteId}`, updates);
    return response.data;
  }

  async deleteNote(noteId: string): Promise<void> {
    await this.client.delete(`/notes/${noteId}`);
  }

  async addCollaborator(noteId: string, collaboratorUid: string): Promise<Note> {
    const response = await this.client.post(
      `/notes/${noteId}/collaborators/${collaboratorUid}`
    );
    return response.data;
  }

  // WebSocket connection URL
  getWebSocketUrl(noteId: string): string {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProtocol}//${window.location.host.replace("3000", "8000")}/api/v1/ws/${noteId}?token=TOKEN`;
  }
}

export const apiClient = new ApiClient();